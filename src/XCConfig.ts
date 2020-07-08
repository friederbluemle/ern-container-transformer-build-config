import { readFile, writeFile, exists } from './fs-async'

export type BuildSettings = { [key: string]: string }

/**
 * Helper class dealing with XCConfig files
 */
export default class XCConfig {
  public static readonly settingRe = /^(.*)\s=\s(.*)$/
  public readonly filePath: string

  /**
   * Creates a new instance of the XCConfig class
   * @param filePath Path to the xcconfig file
   */
  constructor(filePath: string) {
    this.filePath = filePath
  }

  /**
   * Gets the build settings from the xcconfig file, as an object.
   * For example, if the xcconfig file contains the following :
   *
   *   IPHONEOS_DEPLOYMENT_TARGET = 9.0
   *   SWIFT_ACTIVE_COMPILATION_CONDITIONS = DEBUG
   *   SWIFT_OPTIMIZATION_LEVEL = -Onone
   *
   * Then this method will return the following object :
   *
   *   {
   *     "IPHONEOS_DEPLOYMENT_TARGET":"9.0",
   *     "SWIFT_ACTIVE_COMPILATION_CONDITIONS":"DEBUG",
   *     "SWIFT_OPTIMIZATION_LEVEL":"-Onone"
   *   }
   */
  public async getBuildSettings(): Promise<BuildSettings> {
    if (!(await exists(this.filePath))) {
      throw new Error(
        `Cannot get build settings from unexisting file : ${this.filePath}`
      )
    }
    const configFileContent = (await readFile(this.filePath)).toString()
    return configFileContent
      .split('\n')
      .filter(l => XCConfig.settingRe.test(l))
      .map(e => [
        XCConfig.settingRe.exec(e)![1],
        XCConfig.settingRe.exec(e)![2],
      ])
      .reduce((obj, e) => Object.assign(obj, { [e[0]]: e[1] }), {})
  }

  /**
   * Sets the given build settings in the xcconfig file.
   * This method will overwite the whole content of the xcconfig file
   * it it exist (destructive). It will create the xcconfig file if
   * it does not exist.
   * @param buildSettings The build settings to write to set in the xcconfig file
   * @returns The buildSettings object that was provided to the method
   */
  public async setBuildSettings(
    buildSettings: BuildSettings
  ): Promise<BuildSettings> {
    let configFileContent = (await exists(this.filePath))
      ? (await readFile(this.filePath)).toString()
      : ''
    if (
      configFileContent.length !== 0 &&
      configFileContent[configFileContent.length - 1] !== '\n'
    ) {
      // Make sure that we have a new line at end of file for proper appending
      configFileContent += '\n'
    }
    for (const [k, v] of Object.entries(buildSettings)) {
      console.log(`dealing with ${k}`)
      if (configFileContent.includes(`${k} =`)) {
        console.log('here')
        // Build setting already present in config file
        // Update with new value
        console.log(`${configFileContent}`)
        const re = new RegExp(`(${k} = ).*`, 'g')
        console.log(`test: ${re.test(configFileContent)}`)
        configFileContent = configFileContent.replace(
          new RegExp(`(${k} = ).*`, 'g'),
          `$1${v}`
        )
        console.log(`${configFileContent}`)
      } else {
        // Build setting not present in config file
        // Append it to file
        configFileContent += `${k} = ${v}\n`
      }
    }
    await writeFile(this.filePath, configFileContent)
    return buildSettings
  }
}
