import BuildConfigTransformer from '../src/BuildConfigTransformer'
import { expect } from 'chai'
import 'mocha'

describe('BuildConfigTransformer', () => {
  describe('name', () => {
    it('should be build-config', () => {
      const name = new BuildConfigTransformer().name
      expect(name).eql('build-config')
    })
  })

  describe('platforms', () => {
    it('should be iOS only', () => {
      const platforms = new BuildConfigTransformer().platforms
      expect(platforms)
        .to.be.an('array')
        .length(1)
        .include('ios')
    })
  })

  describe('validate', () => {
    it('should throw if extra object is undefined', () => {
      const sut = new BuildConfigTransformer()
      expect(() => sut.validate()).to.throw()
    })

    it('should throw if extra object is null', () => {
      const sut = new BuildConfigTransformer()
      expect(() => sut.validate(null)).to.throw()
    })

    it('should throw if extra.configurations is undefined', () => {
      const sut = new BuildConfigTransformer()
      expect(() =>
        sut.validate({
          settings: { CLANG_ENABLE_MODULES: 'YES' },
        })
      ).to.throw()
    })

    it('should throw if extra.configurations is null', () => {
      const sut = new BuildConfigTransformer()
      expect(() =>
        sut.validate({
          configurations: null,
          settings: { CLANG_ENABLE_MODULES: 'YES' },
        })
      ).to.throw()
    })

    it('should throw if extra.configurations is not an array', () => {
      const sut = new BuildConfigTransformer()
      expect(() =>
        sut.validate({
          configurations: {},
          settings: { CLANG_ENABLE_MODULES: 'YES' },
        })
      ).to.throw()
    })

    it('should throw if extra.configurations is an empty array', () => {
      const sut = new BuildConfigTransformer()
      expect(() =>
        sut.validate({
          configurations: [],
          settings: { CLANG_ENABLE_MODULES: 'YES' },
        })
      ).to.throw()
    })

    it('should throw if extra.settings is undefined', () => {
      const sut = new BuildConfigTransformer()
      expect(() =>
        sut.validate({
          configurations: ['ElectrodeContainer-Debug'],
        })
      ).to.throw()
    })

    it('should throw if extra.settings is an empty object', () => {
      const sut = new BuildConfigTransformer()
      expect(() =>
        sut.validate({
          configurations: ['ElectrodeContainer-Debug'],
          settings: {},
        })
      ).to.throw()
    })

    it('should not throw if extra object is valid', () => {
      const sut = new BuildConfigTransformer()
      expect(() =>
        sut.validate({
          configurations: ['ElectrodeContainer-Debug'],
          settings: { CLANG_ENABLE_MODULES: 'YES' },
        })
      ).to.not.throw()
    })
  })
})
