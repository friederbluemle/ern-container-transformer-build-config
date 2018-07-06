import path from 'path'
import { exists, readFile } from './fs-async'
import XCConfig from './XCConfig'

export default class BuildConfigTransformer {
  /**
   * Name of the iOS Container directory holding all of the .xcconfig files
   */
  static readonly configDirectory = 'Config'

  /**
   * Name of this transformer
   */
  get name(): string {
    return 'build-config'
  }

  /**
   * Supported platforms
   */
  get platforms(): string[] {
    return ['ios']
  }

  /**
   * Transform the container
   */
  public async transform({
    containerPath,
    extra,
  }: {
    containerPath: string
    extra?: {
      /**
       * Build configuration(s) to mutate.
       * One to one mapping to a xcconfig file.
       * Ex : [ 'Project-Debug', 'ElectrodeContainer-Debug' ]
       */
      configurations: string[]
      /**
       * Settings to add or update in the build configuration(s)
       * Ex : {
       *  ENABLE_BITCODE: "NO",
       *  PRODUCT_BUNDLE_IDENTIFIER = "com.mycompany.ElectrodeContainer"
       * }
       */
      settings: object
    }
  }) {
    //
    // Validate extra object (throw if invalid)
    this.validate(extra)

    //
    // Construct absolute path to the iOS Container directory containing the
    // .xcconfig files and ensure that it exists
    const pathToXCodeConfigFiles = path.join(
      containerPath,
      BuildConfigTransformer.configDirectory
    )
    if (!(await exists(pathToXCodeConfigFiles))) {
      this.throwError(
        `Path to xcconfig files does not exist ${pathToXCodeConfigFiles}`
      )
    }

    //
    // Construct paths to all .xcconfig files to transform
    const xcconfigFilesToTransform = extra!.configurations
      .map(c => `${c}.xcconfig`)
      .map(f => path.join(pathToXCodeConfigFiles, f))

    //
    // For each .xcconfig file to transform
    for (const xcconfigFileToTransform of xcconfigFilesToTransform) {
      //
      // Ensure existence
      if (!(await exists(xcconfigFileToTransform))) {
        this.throwError(`Cannot find xcconfig file ${xcconfigFileToTransform}`)
      }
      //
      // Transform settings (add or update settings) in the .xconfig file
      const xcconfig = new XCConfig(xcconfigFileToTransform)
      await xcconfig.addOrUpdateBuildSettings(extra!.settings)
    }
  }

  public validate(extra: any) {
    if (!extra) {
      this.throwError('Missing extra property')
    }
    if (!extra.configurations) {
      this.throwError('Missing extra.configurations property')
    }
    if (!(extra.configurations instanceof Array)) {
      this.throwError('extra.configurations must be an array')
    }
    if (extra.configurations.length === 0) {
      this.throwError('extra.configuration cannot be an empty array')
    }
    if (!extra.settings) {
      this.throwError('Missing extra.settings property')
    }
    if (Object.keys(extra.settings).length === 0) {
      this.throwError('extra.settings cannot be an empty object')
    }
  }

  public throwError(msg: string) {
    throw new Error(`[BuildConfigurationTransformer] ${msg}`)
  }
}
