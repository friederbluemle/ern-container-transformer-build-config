import XCConfig from '../src/XCConfig'
import fs from 'fs'
import path from 'path'
import { expect } from 'chai'
import shell from 'shelljs'
import 'mocha'

const dummyDebugXCconfigFileName = 'Dummy-Debug.xcconfig'
const dummyDebugXcconfigPath = path.resolve(
  __dirname,
  'fixtures',
  dummyDebugXCconfigFileName
)

const tmpPath = path.resolve(__dirname, 'tmp')

const buildSettingsObject = {
  CLANG_ENABLE_MODULES: 'YES',
  IPHONEOS_DEPLOYMENT_TARGET: '9.0',
  SWIFT_OPTIMIZATION_LEVEL: '-Onone',
}

describe('XCConfig', () => {
  describe('getBuildSettings', () => {
    it('should return the build settings', async () => {
      const sut = new XCConfig(dummyDebugXcconfigPath)
      const result = await sut.getBuildSettings()
      expect(result).eql(buildSettingsObject)
    })
  })

  describe('setBuildSettings', () => {
    before(() => {
      shell.mkdir('-p', tmpPath)
    })

    after(() => {
      shell.rm('-rf', tmpPath)
    })

    it('should create the xcconfig file with the build settings if it does not exists', async () => {
      const pathToXCConfigFile = path.join(tmpPath, 'test-set.xcconfig')
      const sut = new XCConfig(pathToXCConfigFile)
      await sut.setBuildSettings(buildSettingsObject)
      const writtenFileContent = fs.readFileSync(pathToXCConfigFile).toString()
      expect(writtenFileContent).eql(
        'CLANG_ENABLE_MODULES = YES\n\
IPHONEOS_DEPLOYMENT_TARGET = 9.0\n\
SWIFT_OPTIMIZATION_LEVEL = -Onone\n'
      )
    })

    it('should update the build settings in an existing xcconfig file', async () => {
      shell.cp(dummyDebugXcconfigPath, tmpPath)
      const pathToXCConfigFile = path.join(tmpPath, dummyDebugXCconfigFileName)
      const sut = new XCConfig(pathToXCConfigFile)
      await sut.setBuildSettings({ CLANG_ENABLE_MODULES: 'NO', SWIFT_OPTIMIZATION_LEVEL: '-Ofull' })
      const writtenFileContent = fs.readFileSync(pathToXCConfigFile).toString()
      expect(writtenFileContent).eql(`//
// Dummy-Debug.xcconfig
//

CLANG_ENABLE_MODULES = NO
IPHONEOS_DEPLOYMENT_TARGET = 9.0
SWIFT_OPTIMIZATION_LEVEL = -Ofull
`)
    })

    it('should add the build settings in an existing xcconfig file', async () => {
      shell.cp(dummyDebugXcconfigPath, tmpPath)
      const pathToXCConfigFile = path.join(tmpPath, dummyDebugXCconfigFileName)
      const sut = new XCConfig(pathToXCConfigFile)
      await sut.setBuildSettings({ FOO: 'YES', BAR: 'NO' })
      const writtenFileContent = fs.readFileSync(pathToXCConfigFile).toString()
      expect(writtenFileContent).eql(`//
// Dummy-Debug.xcconfig
//

CLANG_ENABLE_MODULES = YES
IPHONEOS_DEPLOYMENT_TARGET = 9.0
SWIFT_OPTIMIZATION_LEVEL = -Onone
FOO = YES
BAR = NO
`)
    })

    it('should return the build settings object', async () => {
      const pathToXCConfigFile = path.join(tmpPath, 'test-set-return.xcconfig')
      const sut = new XCConfig(pathToXCConfigFile)
      const result = await sut.setBuildSettings(buildSettingsObject)
      expect(result).eql(buildSettingsObject)
    })
  })
})
