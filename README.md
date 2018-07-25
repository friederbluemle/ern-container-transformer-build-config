# iOS Build Configuration Container Transformer

This transformer can be used to update Build Configuration(s) of a generated iOS Container.

The official iOS Electrode Native Container currently exposes four build configurations :

- [`Project-Debug`](https://github.com/electrode-io/electrode-native/blob/master/ern-container-gen-ios/src/hull/Config/Project-Debug.xcconfig) _(Electrode Container project Debug)_
- [`Project-Release`](https://github.com/electrode-io/electrode-native/blob/master/ern-container-gen-ios/src/hull/Config/Project-Release.xcconfig) _(Electrode Container project Release)_
- [`ElectrodeContainer-Debug`](https://github.com/electrode-io/electrode-native/blob/master/ern-container-gen-ios/src/hull/Config/ElectrodeContainer-Debug.xcconfig) _(Electrode Container target Debug)_
- [`ElectrodeContainer-Release`](https://github.com/electrode-io/electrode-native/blob/master/ern-container-gen-ios/src/hull/Config/ElectrodeContainer-Release.xcconfig) _(Electrode Container target Release)_

Each of these build configurations are coming with some build settings that might not play well with your native application upon integration of the Container.

Using this transformer, you can update one or more of these build configurations with your desired build settings.

## Inputs

- `containerPath` : Path to the Container to transform
- `configurations` : Array of build configurations to update  
  For example:

```json
["ElectrodeContainer-Debug"]
```

- `settings`: Object containing the settings to add/update to/in the build configuration(s)  
  For example:

```json
{
  "ENABLE_BITCODE": "NO",
  "PRODUCT_BUNDLE_IDENTIFIER": "com.mycompany.ElectrodeContainer"
}
```

## Usage

### With `ern transform-container` CLI command

```bash
$ ern transform-container --containerPath [pathToContainer] -t build-config -e '{"configurations":[...], "settings":{...}}'
```

Instead of passing the whole configuration on the command line for `--extra/-e`, it is also possible to use a file path to a json file holding the configuration, or a path to a file stored in the Cauldron. Check out the [ern transform-container](https://native.electrode.io/cli-commands/transform-container) command documentation for more info.

The configuration object can also be an array holding multiple objects, such as `[{"configurations":[...], "settings":{...}}, {"configurations":[...], "settings":{...}}]`

### With Cauldron

To automatically transform the Cauldron generated Containers of a target native application and platform, you can add a transformer entry in the Cauldron in the Container generator configuration object as follow :

```json
"transformers": [
  {
    "name": "build-config",
    "extra": {
      "configurations": [...],
      "settings" : {...}
    }
  }
]
```

The extra object can also be an array holding multiple objects, such as `[{"configurations":[...], "settings":{...}}, {"configurations":[...], "settings":{...}}]`

### Programmatically

```js
import BuildConfigTransformer from 'ern-container-transformer-build-config'
const transformer = new BuildConfigTransformer()
transformer.transform(
  {
    /* Local file system path to the Container */
    containerPath: string
    /* Extra data specific to this publisher */
    extra?: {
      /* Array of build configurations to update */
      configurations: string[]
      /* Object containing the settings to add/update to/in the build configuration(s) */
      settings: object
    }
  }
})
```

The extra object can also be an array holding multiple objects, such as `[{"configurations":[...], "settings":{...}}, {"configurations":[...], "settings":{...}}]`
