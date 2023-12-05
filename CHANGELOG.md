# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## `@m2c2kit/core` [0.3.14] - 2023-12-05

### Added

- zRotation property for entities.
- Rotate Action.
- Path shape can be multi-colored if path is `M2ColorfulPath`.
- `ColorfulMutablePath` class for creating multi-colored paths that satisfy `M2ColorfulPath` interface.

### Changed

- Updated dependencies.
- For path shapes defined by a `SvgStringPath`, the `svgPathString` property is deprecated. Use `pathString` now.
- Unless it is a `M2ColorfulPath` or `M2Path`, specifying the `size` on other types of shapes will now throw an error. This is to avoid the expectation that setting `size` on these types of shapes will change their size.

## `@m2c2kit/addons` [0.3.11] - 2023-12-05

### Changed

- Updated dependencies.

## `@m2c2kit/physics` [0.1.1] - 2023-12-05

### Changed

- Updated dependencies.

## `@m2c2kit/cli` [0.3.11] - 2023-12-05

### Changed

- Updated dependencies.

## `@m2c2kit/schematics` [0.1.10] - 2023-12-05

### Changed

- Updated dependencies.
- Updated templates.

## `@m2c2kit/embedding` [1.0.7] - 2023-12-05

### Changed

- Updated dependencies.

## `@m2c2kit/build-helpers` [0.3.10] - 2023-12-05

### Changed

- Updated dependencies.

## `@m2c2kit/db` [0.3.9] - 2023-12-05

### Changed

- Updated dependencies.

## `@m2c2kit/survey` [0.3.9] - 2023-12-05

### Changed

- Updated dependencies.

## `@m2c2kit/schema-util` [0.1.4] - 2023-12-05

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-symbol-search` [0.8.11] - 2023-12-05

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-grid-memory` [0.8.11] - 2023-12-05

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-color-shapes` [0.8.11] - 2023-12-05

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-color-dots` [0.8.11] - 2023-12-05

### Changed

- Updated dependencies.

## `@m2c2kit/assessments-demo` [0.8.8] - 2023-12-05

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-cli-starter` [0.8.10] - 2023-12-05

### Changed

- Updated dependencies.

## `@m2c2kit/sage-research` [0.3.9] - 2023-12-05

### Changed

- Updated dependencies.

## `@m2c2kit/core` [0.3.13] - 2023-10-31

### Added

- Alpha property for entities.
- FadeAlpha Action.

## `@m2c2kit/schematics` [0.1.9] - 2023-10-31

### Changed

- Updated templates.

## `@m2c2kit/core` [0.3.12] - 2023-10-23

### Added

- Path shapes can be created from points.
- `PointerLeave` event added for entities.

### Fixed

- Scale action for path shapes is now correct.
- Pointer events for scaled circles is now correct.

## `@m2c2kit/addons` [0.3.10] - 2023-10-23

### Added

- `DrawPad` composite.

## `@m2c2kit/schematics` [0.1.8] - 2023-10-23

### Changed

- Updated templates.

## `@m2c2kit/embedding` [1.0.6] - 2023-08-02

### Fixed

- Could not stringify event in console warning message.

## `@m2c2kit/schematics` [0.1.7] - 2023-08-01

### Changed

- Updated templates.

## `@m2c2kit/addons` [0.3.9] - 2023-08-01

### Fixed

- Bug in `Grid` remove children methods.

## `@m2c2kit/core` [0.3.11] - 2023-06-29

### Added

- `onFrameDidSimulatePhysics` handler added to `Game` class.
- `dataStores` is option in `SessionOptions`

### Changed

- Rule that child entity can have only one parent entity more strictly enforced.
- On `Session` class, `dataStore` is now `dataStores`.
- Updated dependencies.

## `@m2c2kit/addons` [0.3.8] - 2023-06-29

### Changed

- Updated dependencies.

## `@m2c2kit/physics` [0.1.0] - 2023-06-29

### Added

- This is a new package to enable physics motion in games.

## `@m2c2kit/cli` [0.3.10] - 2023-06-29

### Changed

- Updated dependencies.

## `@m2c2kit/schematics` [0.1.6] - 2023-06-29

### Changed

- Updated dependencies.

## `@m2c2kit/embedding` [1.0.5] - 2023-06-29

### Changed

- Updated dependencies.

## `@m2c2kit/build-helpers` [0.3.9] - 2023-06-29

### Changed

- Updated dependencies.

## `@m2c2kit/db` [0.3.8] - 2023-06-29

### Changed

- Use esbuild.
- Updated dependencies.

## `@m2c2kit/survey` [0.3.8] - 2023-06-29

### Changed

- Updated dependencies.

## `@m2c2kit/schema-util` [0.1.3] - 2023-06-29

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-symbol-search` [0.8.10] - 2023-06-29

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-grid-memory` [0.8.10] - 2023-06-29

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-color-shapes` [0.8.10] - 2023-06-29

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-color-dots` [0.8.10] - 2023-06-29

### Changed

- Updated dependencies.

## `@m2c2kit/assessments-demo` [0.8.7] - 2023-06-29

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-cli-starter` [0.8.9] - 2023-06-29

### Changed

- Updated dependencies.

## `@m2c2kit/sage-research` [0.3.8] - 2023-06-29

### Changed

- Updated dependencies.

## `@m2c2kit/core` [0.3.10] - 2023-06-20

### Changed

- `svgString` is now `svgPathString` to specify a shape from a SVG path.
- Updated dependencies.

## `@m2c2kit/addons` [0.3.7] - 2023-06-20

### Changed

- Updated dependencies.

## `@m2c2kit/cli` [0.3.9] - 2023-06-20

### Changed

- Updated dependencies.

## `@m2c2kit/schematics` [0.1.5] - 2023-06-20

### Changed

- Updated dependencies.

## `@m2c2kit/embedding` [1.0.4] - 2023-06-20

### Changed

- Updated dependencies.

## `@m2c2kit/build-helpers` [0.3.8] - 2023-06-20

### Changed

- Updated dependencies.

## `@m2c2kit/db` [0.3.7] - 2023-06-20

### Changed

- Updated dependencies.

## `@m2c2kit/survey` [0.3.7] - 2023-06-20

### Changed

- Updated dependencies.

## `@m2c2kit/schema-util` [0.1.2] - 2023-06-20

### Added

- JSON schema output option.
- For `TrialSchema`, automatic properties are now included.

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-symbol-search` [0.8.9] - 2023-06-20

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-grid-memory` [0.8.9] - 2023-06-20

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-color-shapes` [0.8.9] - 2023-06-20

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-color-dots` [0.8.9] - 2023-06-20

### Changed

- Updated dependencies.

## `@m2c2kit/assessments-demo` [0.8.6] - 2023-06-20

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-cli-starter` [0.8.8] - 2023-06-20

### Changed

- Updated dependencies.

## `@m2c2kit/sage-research` [0.3.7] - 2023-06-20

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-symbol-search` [0.8.8] - 2023-06-07

### Added

- `trial_end_iso8601_timestamp` added to trial schema.

## `@m2c2kit/assessment-grid-memory` [0.8.8] - 2023-06-07

### Added

- `trial_end_iso8601_timestamp` added to trial schema.

## `@m2c2kit/assessment-color-shapes` [0.8.8] - 2023-06-07

### Added

- `trial_end_iso8601_timestamp` added to trial schema.

## `@m2c2kit/assessment-color-dots` [0.8.8] - 2023-06-07

### Added

- `trial_end_iso8601_timestamp` added to trial schema.

## `@m2c2kit/core` [0.3.9] - 2023-06-06

### Added

- `SessionOptions` has `autoStartAfterInit`, `autoGoToNextActivity`, and `autoEndAfterLastActivity` to automatically handle game and session lifecycle.
- `Session` can set handler for session events using `onInitialize`, `onStart()`, `onCancel()`, and `onEnd()` and all activity data events using `onActivityData()`.
- `Activity` can set handler for activity events using `onStart()`, `onCancel()`, `onEnd()`, and `onData()`.
- Check for session initialization before starting session.

### Changed

- Adding another callback for the same event on an entity no longer replaces the existing callback by default; `CallbackOptions` specifies this behavior.
- `Session.init()` is now `Session.initialize()`. Calling `Session.init()` will generate warning.
- `Activity.init()` is now `Activity.initialize()`. Calling `Session.init()` will generate warning.
- Updated dependencies.

## `@m2c2kit/addons` [0.3.6] - 2023-06-06

### Changed

- Updated dependencies.

## `@m2c2kit/cli` [0.3.8] - 2023-06-06

### Changed

- Updated dependencies.

## `@m2c2kit/schematics` [0.1.4] - 2023-06-06

### Changed

- Updated templates.
- Updated dependencies.

## `@m2c2kit/embedding` [1.0.3] - 2023-06-06

### Added

- `Embedding.initialize()` configures the m2c2kit session to be hosted.

### Changed

- Updated dependencies.

## `@m2c2kit/build-helpers` [0.3.7] - 2023-06-06

### Changed

- Updated dependencies.

## `@m2c2kit/db` [0.3.6] - 2023-06-06

### Changed

- Updated dependencies.

## `@m2c2kit/survey` [0.3.6] - 2023-06-06

### Changed

- Updated dependencies.

## `@m2c2kit/schema-util` [0.1.1] - 2023-06-06

### Added

- JSON output.

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-symbol-search` [0.8.7] - 2023-06-06

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-grid-memory` [0.8.7] - 2023-06-06

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-color-shapes` [0.8.7] - 2023-06-06

### Fixed

- Bug in shape positioning that was introduced when grid allowed children to be positioned.

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-color-dots` [0.8.7] - 2023-06-06

### Fixed

- Bug with event handler added multiple times.

### Changed

- Updated dependencies.

## `@m2c2kit/assessments-demo` [0.8.5] - 2023-06-06

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-cli-starter` [0.8.7] - 2023-06-06

### Changed

- Updated dependencies.

## `@m2c2kit/sage-research` [0.3.6] - 2023-06-06

### Changed

- Updated dependencies.

## `@m2c2kit/schematics` [0.1.3] - 2023-05-30

### Changed

- Updated templates.

## `@m2c2kit/build-helpers` [0.3.6] - 2023-05-30

### Fixed

- Asset hashing.

### Added

- Tests.

### Changed

- Use esbuild.
- Updated dependencies.

## `@m2c2kit/schematics` [0.1.2] - 2023-05-25

### Fixed

- Generated README missing schematics version.
- `launch.json` not copied.

## `@m2c2kit/embedding` [1.0.2] - 2023-05-25

### Changed

- Updated dependencies.

## `@m2c2kit/cli` [0.3.7] - 2023-05-24

### Changed

- Using Angular Schematics as underlying engine.
- Updated dependencies.

## `@m2c2kit/core` [0.3.8] - 2023-05-24

### Added

### Changed

- Updated dependencies.

## `@m2c2kit/schematics` [0.1.1] - 2023-05-24

### Added

- Made to work with `@m2c2kit/cli`

### Changed

- Updated dependencies.

## `@m2c2kit/embedding` [1.0.1] - 2023-05-24

### Changed

- Updated dependencies.

## `@m2c2kit/addons` [0.3.5] - 2023-05-24

### Fixed

- In Grid, grid children position is now respected.

### Added

- `VirtualKeyboardEvent` has `keyTapMetadata` property.

### Changed

- `KeyConfiguration` takes `keyIconShapeOptions` instead of `keyIconShape`.
- Updated dependencies.

## `@m2c2kit/assessment-cli-starter` [0.8.6] - 2023-05-24

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-grid-memory` [0.8.6] - 2023-05-24

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-symbol-search` [0.8.6] - 2023-05-24

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-color-dots` [0.8.6] - 2023-05-24

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-color-shapes` [0.8.6] - 2023-05-24

### Changed

- Updated dependencies.

## `@m2c2kit/build-helpers` [0.3.5] - 2023-05-24

### Changed

- Updated dependencies.

## `@m2c2kit/db` [0.3.5] - 2023-05-24

### Changed

- Updated dependencies.

## `@m2c2kit/sage-research` [0.3.5] - 2023-05-24

### Changed

- Updated dependencies.

## `@m2c2kit/survey` [0.3.5] - 2023-05-24

### Changed

- Updated dependencies.

## `@m2c2kit/cli` [0.3.6] - 2023-05-17

### Changed

- Updated dependencies.
- Updated templates.

## `@m2c2kit/core` [0.3.7] - 2023-05-17

### Added

- `addTrialSchema` adds Custom trial schema.
- `addStaticTrialData` adds static (shared across all trials) trial data.
- `GameOptions` has property `assetsUrl` to specify location of game assets.
- `SessionOptions` has property `assetsUrl` to specify location of session-wide assets.
- `Label` `fontNames` property allows use of multiple fonts.

### Changed

- `GameOptions` `fontUrls` property is now fonts with new different structure.
- Updated dependencies.

## `@m2c2kit/schematics` [0.1.0] - 2023-05-17

### Added

- This is a new package to help with templating and modifying code.

## `@m2c2kit/embedding` [1.0.0] - 2023-05-17

### Added

- This is a new package to help with embedding m2c2kit into different types of deployments (e.g., native mobile webview).

## `@m2c2kit/addons` [0.3.4] - 2023-05-17

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-cli-starter` [0.8.5] - 2023-05-17

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-grid-memory` [0.8.5] - 2023-05-17

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-symbol-search` [0.8.5] - 2023-05-17

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-color-dots` [0.8.5] - 2023-05-17

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-color-shapes` [0.8.5] - 2023-05-17

### Changed

- Updated dependencies.

## `@m2c2kit/assessments-demo` [0.8.4] - 2023-05-17

### Changed

- Updated dependencies.

## `@m2c2kit/build-helpers` [0.3.4] - 2023-05-17

### Changed

- Updated dependencies.

## `@m2c2kit/db` [0.3.4] - 2023-05-17

### Changed

- Updated dependencies.

## `@m2c2kit/sage-research` [0.3.4] - 2023-05-17

### Changed

- Updated dependencies.

## `@m2c2kit/survey` [0.3.4] - 2023-05-17

### Changed

- Updated dependencies.

## `@m2c2kit/cli` [0.3.5] - 2023-04-20

### Changed

- Updated dependencies.
- Updated templates.

## `@m2c2kit/core` [0.3.6] - 2023-04-20

### Changed

- Updated dependencies.

### Fixed

- Fixed bug where image loading may crash on mobile devices.

## `@m2c2kit/addons` [0.3.3] - 2023-04-20

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-cli-starter` [0.8.4] - 2023-04-20

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-grid-memory` [0.8.4] - 2023-04-20

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-symbol-search` [0.8.4] - 2023-04-20

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-color-dots` [0.8.4] - 2023-04-20

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-color-shapes` [0.8.4] - 2023-04-20

### Changed

- Updated dependencies.

## `@m2c2kit/assessments-demo` [0.8.3] - 2023-04-20

### Changed

- Updated dependencies.

## `@m2c2kit/build-helpers` [0.3.3] - 2023-04-20

### Changed

- Updated dependencies.

## `@m2c2kit/db` [0.3.3] - 2023-04-20

### Changed

- Updated dependencies.

## `@m2c2kit/sage-research` [0.3.3] - 2023-04-20

### Changed

- Updated dependencies.

## `@m2c2kit/survey` [0.3.3] - 2023-04-20

### Changed

- Updated dependencies.

## `@m2c2kit/cli` [0.3.4] - 2023-04-19

### Changed

- Updated templates.

### Fixed

- Added `sourcemapExcludeSources: true` to rollup config to prevent debugger from crashing.

## `@m2c2kit/core` [0.3.5] - 2023-04-18

### Added

- Go go to any activity with `Session.goToActivity()`.
- Entities can be dragged; events fired are `Drag`, `DragStart`, `DragEnd`.
- `Activity.additionalParameters` returns parameters that were set.

### Changed

- `Session.start()` is now async.
- `Activity.start()` is now async.
- Updated dependencies.
- Use esbuild.

### Deprecated

- `Session.advanceToNextActivity()` is deprecated; use `Session.goToNextActivity()` instead.

## `@m2c2kit/addons` [0.3.2] - 2023-04-18

### Changed

- Updated dependencies.
- Use esbuild.

## `@m2c2kit/survey` [0.3.2] - 2023-04-18

### Added

- `Survey.additionalParameters` returns parameters that were set.
- Added internationalization for text shown when confirming skipped questions.

### Changed

- `Survey.start()` is now async.
- Updated dependencies.
- Use esbuild.

## `@m2c2kit/assessment-color-dots` [0.8.3] - 2023-04-18

### Added

- Drag/drop dot in placement phase.

### Changed

- Updated dependencies.
- Use esbuild.

## `@m2c2kit/assessment-cli-starter` [0.8.3] - 2023-04-18

### Changed

- Updated dependencies.
- Use esbuild.

## `@m2c2kit/assessment-color-shapes` [0.8.3] - 2023-04-18

### Changed

- Updated dependencies.
- Use esbuild.

## `@m2c2kit/assessment-grid-memory` [0.8.3] - 2023-04-18

### Changed

- Updated dependencies.
- Use esbuild.

## `@m2c2kit/assessment-symbol-search` [0.8.3] - 2023-04-18

### Changed

- Updated dependencies.
- Use esbuild.

## `@m2c2kit/assessments-demo` [0.8.2] - 2023-04-18

### Changed

- Changed code to work with most recent library changes.
- Updated dependencies.
- Use esbuild.

## `@m2c2kit/build-helpers` [0.3.2] - 2023-04-18

### Changed

- Updated dependencies.

## `@m2c2kit/sage-research` [0.3.2] - 2023-04-18

### Changed

- Updated dependencies.

## `@m2c2kit/cli` [0.3.3] - 2023-04-18

### Changed

- Updated templates.
- Updated dependencies.

### Deprecated

- Upload to demo server removed.

## `@m2c2kit/db` [0.3.2] - 2023-04-18

### Changed

- Updated dependencies.

## `@m2c2kit/playground` [0.5.0] - 2023-04-18

### Deprecated

- Entire package is deprecated and removed. Functionality will be moved to docs website.

## `@m2c2kit/core` [0.3.4] - 2023-01-17

### Added

- Get version string from `package.json` file.
- `document_uuid` is an automatic trial schema

### Changed

- Use `canvaskit-wasm` 0.38.0.
- `Game.init()` is now async.

### Fixed

- runDuringTransition option is now being respected.

## `@m2c2kit/addons` [0.3.1] - 2023-01-17

### Added

- Virtual keyboard composite.

## `@m2c2kit/build-helpers` [0.3.1] - 2023-01-17

### Added

- Create manifest of hashed assets.
- Option to create a service worker.

## `@m2c2kit/db` [0.3.1] - 2023-01-17

### Added

- Initial package for storing data locally on device.

## `website` [0.1.0] - 2023-01-17

### Added

- Initial Docusaurus website.

## `@m2c2kit/assessment-color-shapes` [0.8.2] - 2023-01-17

### Fixed

- Made rule so that all shapes cannot appear in one line or diagonal.

## `@m2c2kit/assessment-color-shapes` [0.8.1] - 2022-11-03

### Added

- Initial development of assessment.

## `@m2c2kit/core` [0.3.3] - 2022-11-03

### Added

- Path shapes can be created from SVG string.

### Removed

- Path shapes can no longer be created from points.

## `@m2c2kit/core` [0.3.2] - 2022-10-26

### Added

- Get version string from `package.json` file.

### Fixed

- Tests.

## `@m2c2kit/core` [0.3.1] - 2022-10-25

### Added

- `isAntialiased` property to `ShapeOptions`.
- `logWebGl` property to `GameOptions`.
- More comprehensive shader warmup.

### Changed

- Spinner/loader elements added to DOM and controlled automatically
  - `index.html` and CSS changed to support this.

## `@m2c2kit/cli` [0.3.1] - 2022-10-25

### Changed

- Templates and CSS updated.
