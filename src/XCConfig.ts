import { readFile, writeFile, exists } from './fs-async'

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
  public async getBuildSettings(): Promise<object> {
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
  public async setBuildSettings(buildSettings: object): Promise<object> {
    const configFileContent = Object.keys(buildSettings)
      .map(k => `${k} = ${buildSettings[k]}`)
      .join('\n')
    await writeFile(this.filePath, configFileContent)
    return buildSettings
  }

  /**
   * Add or update existing build setting in the xcconfig file.
   * This method will only add new settings in the xcconfig file and
   * path existing ones. It will leave other settings untouched.
   * This is a non desctructing patching method.
   * If the xcconfig file does not exist, it will be created.
   * @param buildSettings The build settings to write to set in the xcconfig file
   * @returns The settings of the updated xcconfig file, as an object
   */
  public async addOrUpdateBuildSettings(
    newBuildSettings: object
  ): Promise<object> {
    if (!(await exists(this.filePath))) {
      return this.setBuildSettings(newBuildSettings)
    }
    let buildSettings = await this.getBuildSettings()
    for (const key of Object.keys(newBuildSettings)) {
      buildSettings[key] = newBuildSettings[key]
    }
    await this.setBuildSettings(buildSettings)
    return buildSettings
  }
}
