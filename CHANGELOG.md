# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## `@m2c2kit/addons` [0.3.18] - 2024-07-19

### Fixed

- `CountdownTimer` works in event replay and correctly handles property changes.

### Added

- `CountdownTimer` now has a `reset()` method to reset the timer to its initial state so it can be started again.

## `@m2c2kit/addons` [0.3.17] - 2024-07-18

### Fixed

- `Grid` handles nesting properly again.

### Added

- `CountdownTimer` is a `Composite` that counts down to zero.

### Changed

- To align `CountdownSceneOptions` with `CountdownTimerOptions`, `timerShape.verticalBias` property in `CountdownSceneOptions` has been moved to `CountdownSceneOptions.shapeVerticalBias`. `CountdownSceneOptions.timerZeroString` is renamed to `CountdownSceneOptions.zeroString`.

## `@m2c2kit/core` [0.3.19] - 2024-07-18

### Changed

- Updated dependencies.
- in `SlideTransitionOptions`, the `easing` parameter now also accepts a string identifier of the easing function, in addition to an easing function.
- The global variables object is now named `m2c2Globals`, instead of `Globals`, to avoid potential naming conflicts. `M2Event` interface now has `timestamp`, `iso8601Timestamp` and `sequence` properties. The global object `m2c2Globals` has an `eventSequence` property that returns an auto-incrementing number (for internal use in event replay).
- `Game.presentScene()` now also accepts the scene UUID (for internal use in event replay).

### Added

- Begin to implement event recording and replay. This involves many internal changes, but they should not affect library users. These new classes include `EventStore`, `EventMaterializer`, and `M2NodeFactory`. `M2c2KitHelpers.registerM2NodeClass()` registers nodes so they can be instantiated from events. Nodes have been modified so that they now emit events for instantiation and property changes. Other game events are also emitted, e.g., scene present, i18n configuration, and image data being ready.
- `GameOptions` now has options for showing controls for replaying events from the event store and recording events to the event store. Default is `false` on both.
- For better checking of equality for property change events, a new `Equal` class was created, which has methods that check for deep equality. The `Equals` class is now marked as deprecated.

## `@m2c2kit/addons` [0.3.16] - 2024-07-18

### Changed

- Updated dependencies.
- A breaking change is that to remove a grid child or all grid children, new `Grid.removeGridChild()` and `Grid.removeAllGridChildren()` must now be used. A warning will go to the log if any of the base (`M2Node`) child methods are used on the `Grid`, since these are likely mistakes.
- A breaking change is that a `Grid` cannot be nested in another `Grid`. This will be fixed in a future release.
- A breaking change is that you can no longer add a grid child outside the bounds of the `Grid`, e.g., on a 2 x 2 grid, you cannot add a child at (4, 3). This was allowed in the past, but it is now an error.
- Composites become much more complicated in order to support the event store. These will be internal changes that are not exposed to the library user, but are necessary for the event store to work correctly. Specifically, if a composite has internal state that can be changed, these changes need to be serialized into events that the composite must now emit and ingest. This has been completed for `VirtualKeyboard` and `Grid`, but other composites will need to be updated to work with event replay.

### Added

- a `VirtualKeyboardOnKeyLeave` event to handle when a user press down on a key, but then moves the pointer outside the key bounds.
- For a `Composite` to support event replay, it must register itself with `M2c2KitHelpers.registerM2NodeClass()`.

## `@m2c2kit/session` [0.3.2] - 2024-07-18

### Changed

- Updated dependencies.

## `@m2c2kit/physics` [0.1.6] - 2024-07-18

### Changed

- Updated dependencies.

## `@m2c2kit/cli` [0.3.16] - 2024-07-18

### Changed

- Updated dependencies.

## `@m2c2kit/schematics` [0.1.16] - 2024-07-18

### Changed

- Updated dependencies.

## `@m2c2kit/embedding` [1.0.12] - 2024-07-18

### Changed

- Updated dependencies.

## `@m2c2kit/build-helpers` [0.3.16] - 2024-07-18

### Changed

- Updated dependencies.

## `@m2c2kit/db` [0.3.14] - 2024-07-18

### Changed

- Updated dependencies.

## `@m2c2kit/survey` [0.3.14] - 2024-07-18

### Changed

- Updated dependencies.

## `@m2c2kit/schema-util` [0.1.9] - 2024-07-18

### Changed

- Updated dependencies.

### Added

- For output format `json-schema`, the `schema-util` can now output all schemas (`GameParameters` and `TrialSchema`) into a single JSON Schema with option `--schema=all`

## `@m2c2kit/assessment-symbol-search` [0.8.17] - 2024-07-18

### Changed

- Updated dependencies.
- Updated de-DE instruction images and translation.

### Added

- `instructions` game parameter to allow for custom instructions.
- Build script will extract all game schemas and place them in `schemas.json`.

## `@m2c2kit/assessment-grid-memory` [0.8.17] - 2024-07-18

### Changed

- Updated dependencies.

### Added

- `instructions` game parameter to allow for custom instructions.
- Build script will extract all game schemas and place them in `schemas.json`.

## `@m2c2kit/assessment-color-shapes` [0.8.17] - 2024-07-18

### Changed

- Updated dependencies.

### Added

- `instructions` game parameter to allow for custom instructions.
- Build script will extract all game schemas and place them in `schemas.json`.

## `@m2c2kit/assessment-color-dots` [0.8.17] - 2024-07-18

### Changed

- Updated dependencies.

### Added

- `instructions` game parameter to allow for custom instructions.
- Build script will extract all game schemas and place them in `schemas.json`.

## `@m2c2kit/assessments-demo` [0.8.14] - 2024-07-18

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-cli-starter` [0.8.16] - 2024-07-18

### Changed

- Updated dependencies.

## `@m2c2kit/sage-research` [0.3.14] - 2024-07-18

### Changed

- Updated dependencies.

## `@m2c2kit/core` [0.3.18] - 2024-06-18

### Added

- `SoundPlayer` node for playing sounds.
- `PlayAction` to play sounds.
- `SoundRecorder` node for recording sounds.
- `SoundManager` class to manage sounds.
- `Repeat` and `RepeatForever` actions.
- `sounds` property in `GameOptions` to specify sounds.
- `publishUuid` property in `GameOptions` is now required.
- `locale`, `study_id`, `study_uuid`, and `activity_publish_uuid` are now part of automatic trial schema that will be automatically saved.
- Internationalization supports different fonts.
- Internationalization supports images.
- Internationalization supports string interpolation.
- Internationalization saves locale preferences, if an `IDataStore` is configured for the session.
- When saving key-value pairs in `IDataStore`, the key is prefixed with additional study and activity information.

### Changed

- Internationalization configuration in the `Translation` interface has changed
- Updated dependencies.

## `@m2c2kit/addons` [0.3.15] - 2024-06-18

### Fixed

- `VirtualKeyboard` respects `isUserInteractionEnabled` property.
- `Button` text supports internationalization.

### Added

- `LocalePicker` to switch locales.

### Changed

- Updated dependencies.

## `@m2c2kit/session` [0.3.1] - 2024-06-18

### Added

- Optional `studyId` and `studyUuid` properties in `SessionOptions`.

### Changed

- Updated dependencies.

## `@m2c2kit/physics` [0.1.5] - 2024-06-18

### Changed

- Updated dependencies.

## `@m2c2kit/cli` [0.3.15] - 2024-06-18

### Changed

- Updated dependencies.

## `@m2c2kit/schematics` [0.1.15] - 2024-06-18

### Changed

- Updated dependencies.

## `@m2c2kit/embedding` [1.0.11] - 2024-06-18

### Changed

- Updated dependencies.

## `@m2c2kit/build-helpers` [0.3.15] - 2024-06-18

### Changed

- Updated dependencies.

## `@m2c2kit/db` [0.3.13] - 2024-06-18

### Changed

- Updated dependencies.

## `@m2c2kit/survey` [0.3.13] - 2024-06-18

### Changed

- Updated dependencies.

## `@m2c2kit/schema-util` [0.1.8] - 2024-06-18

### Changed

- Will now be published to npm.
- Updated dependencies.

## `@m2c2kit/assessment-symbol-search` [0.8.16] - 2024-06-18

### Added

- Internationalization text and images for Spanish, French, and German.
- `show_locale_picker` parameter, which currently defaults to `false`.

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-grid-memory` [0.8.16] - 2024-06-18

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-color-shapes` [0.8.16] - 2024-06-18

### Fixed

- Wording in instructions.

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-color-dots` [0.8.16] - 2024-06-18

### Changed

- Updated dependencies.

## `@m2c2kit/assessments-demo` [0.8.13] - 2024-06-18

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-cli-starter` [0.8.15] - 2024-06-18

### Changed

- Updated dependencies.

## `@m2c2kit/sage-research` [0.3.13] - 2024-06-18

### Changed

- Updated dependencies.

## `@m2c2kit/schematics` [0.1.14] - 2024-03-20

### Fixed

- Filename casing typo.

### Changed

- Change templates to work with changed `copyAssets` rollup plugin.

## `@m2c2kit/build-helpers` [0.3.14] - 2024-03-20

### Fixed

- Errors in `copyAssets` rollup plugin.

### Changed

- `CopyAssetsOptions` has `id` property to specify the id of local assessments.

## `@m2c2kit/assessment-symbol-search` [0.8.15] - 2024-03-20

### Added

- Added `m2c2kit.assessmentId` to `package.json`.

## `@m2c2kit/assessment-grid-memory` [0.8.15] - 2024-03-20

### Added

- Added `m2c2kit.assessmentId` to `package.json`.

## `@m2c2kit/assessment-color-shapes` [0.8.15] - 2024-03-20

### Added

- Added `m2c2kit.assessmentId` to `package.json`.

## `@m2c2kit/assessment-color-dots` [0.8.15] - 2024-03-20

### Added

- Added `m2c2kit.assessmentId` to `package.json`.

## `@m2c2kit/assessments-demo` [0.8.12] - 2024-03-20

### Changed

- Updated dependencies on assessment packages.

## `@m2c2kit/assessment-cli-starter` [0.8.14] - 2024-03-20

### Added

- Added `m2c2kit.assessmentId` to `package.json`.

## `@m2c2kit/core` [0.3.17] - 2024-03-17

### Added

- Images can be lazy loaded. Set `lazy` to `true` when defining a `BrowserImage` in `GameOptions`. Default is `lazy: false`.
- Images can be loaded on demand with a call to `ImageManager.loadImages()`.
- Fonts can be lazy loaded. Set `lazy` to `true` when defining a `FontAsset` in `GameOptions`. Default is `lazy: false`.
- Embed module metadata in code to support importing as ES module.
- Game code will use `manifest.json` to load hashed filenames for assets, if applicable.
- `PluginEvent` to support plugins that raise events.

### Changed

- In `Timer` class, `startNew()` should be used in most places wherever `start()` was previously used to start a new timer. `LegacyTimer` class can be used if the old behavior is required.
- `Entity` class is renamed to `M2Node`. m2c2kit has an object-oriented structure, not an entity component system (ECS). Related classes are also renamed (e.g., `EntityEvent` to `M2NodeEvent`).
- A `Scene` will now raise events the same way other nodes do.
- `Session` class and functionality is now in `@m2c2kit/session` package.
- `FontManager` and `ImageManager` are now called from the `Game` class.
- The wasm binary for canvaskit is now loaded by `Game`, which allows each game to have its own wasm binary version.
- The wasm binary for canvaskit has its version embedded in the filename.
- Rename `EventBase` to `M2Event`.
- Use generics with event-related classes, methods, and interfaces.
- `DomHelpers` class is now in `@m2c2kit/session` package.
- `canvasKitWasmUrl` is no longer required in `GameOptions` or `SessionOptions`.
- Updated dependencies.

## `@m2c2kit/addons` [0.3.14] - 2024-03-17

### Added

- `CountdownScene` to display a countdown timer.

### Changed

- Updated dependencies.

### Deprecated

- `Instructions.Create()` is deprecated. Use `Instructions.create()` instead.

## `@m2c2kit/session` [0.3.0] - 2024-03-17

### Added

- This is a new package to separate the `Session` class, which is the session runner, from core functionality in `@m2c2kit/core`.
- To reduce bandwidth, the session will, by default, share common canvaskit wasm binaries, fonts, and images across games, if the filenames are identical. A game can override this behavior by setting `shareAssets: false` in `GameOptions`.
- The `index.html` file now requires a single element with the id `m2c2kit`. This is where the session's activities will be rendered. If a different element for rendering is required, the `rootElementId` property in `SessionOptions` can be set to the id of the element.
- The `Session` class will automatically generate CSS for that was previously in `m2c2kit.css`. If custom CSS is required, it can be added to the `styleSheet` property in `SessionOptions`.

## `@m2c2kit/physics` [0.1.4] - 2024-03-17

### Changed

- Updated dependencies.

## `@m2c2kit/cli` [0.3.14] - 2024-03-17

### Changed

- Updated dependencies.

## `@m2c2kit/schematics` [0.1.13] - 2024-03-17

### Added

- When creating a m2c2kit project with the new CLI command, the option `--module` will scaffold it to be a reusable assessment module, rather than a standalone assessment (default).
- When creating a m2c2kit module project, the scaffolded module is a simple even-odd assessment.
- When creating a m2c2kit module project, add the assessment id as `m2c2kit.assessmentId` in generated `package.json`.
- When creating a m2c2kit project with the new CLI command, it will, by default, create a git repo with an initial commit unless the option `--skipGit` is added.
- When creating a m2c2kit project with the new CLI command, `esbuild` will be used to build the project. TypeScript will be run concurrently with the build process to check for type errors.
- `zip` CLI command to create a zip file of the module.

### Changed

- Updated dependencies.

## `@m2c2kit/embedding` [1.0.10] - 2024-03-17

### Changed

- The assumed m2c2kit session on `window` is now the more specific `m2c2kitSession`, instead of `session`, to avoid name conflicts.
- Updated dependencies.

## `@m2c2kit/build-helpers` [0.3.13] - 2024-03-17

### Added

- `copyAssets` rollup plugin to copy assets to appropriate output folder in during build. These include images, fonts, and wasm files, as well as CSS and optionally other files (HTML).

### Changed

- When building with hashed assets, a `manifest.json` file is created to map original asset names to hashed asset names (instead of parsing the JavaScript bundle and replacing asset names in the bundle).
- Updated dependencies.

## `@m2c2kit/db` [0.3.12] - 2024-03-17

### Changed

- Updated dependencies.

## `@m2c2kit/survey` [0.3.12] - 2024-03-17

### Changed

- Updated dependencies.

## `@m2c2kit/schema-util` [0.1.7] - 2024-03-17

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-symbol-search` [0.8.14] - 2024-03-17

### Changed

- Use `CountdownScene` from `@m2c2kit/addons`.
- Updated dependencies.

## `@m2c2kit/assessment-grid-memory` [0.8.14] - 2024-03-17

### Changed

- Use `CountdownScene` from `@m2c2kit/addons`.
- Updated dependencies.

## `@m2c2kit/assessment-color-shapes` [0.8.14] - 2024-03-17

### Changed

- Use `CountdownScene` from `@m2c2kit/addons`.
- Updated dependencies.

## `@m2c2kit/assessment-color-dots` [0.8.14] - 2024-03-17

### Changed

- Use `CountdownScene` from `@m2c2kit/addons`.
- Updated dependencies.

## `@m2c2kit/assessments-demo` [0.8.11] - 2024-03-17

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-cli-starter` [0.8.13] - 2024-03-17

### Changed

- Use `CountdownScene` from `@m2c2kit/addons`.
- Updated dependencies.

## `@m2c2kit/sage-research` [0.3.12] - 2024-03-17

### Changed

- Updated dependencies.

## `@m2c2kit/core` [0.3.16] - 2024-01-07

### Added

- Plugin system.

### Changed

- Updated dependencies.

## `@m2c2kit/addons` [0.3.13] - 2024-01-07

### Fixed

- `DrawPad` no longer draws incomplete lines when pointer is moved quickly.
- `Button` text changes after button is created are respected.

### Changed

- Updated dependencies.

## `@m2c2kit/physics` [0.1.3] - 2024-01-07

### Fixed

- `EdgeLoop` rectangles overlap to avoid tunneling.
- Rotation and scale in physics engine are linked to `zRotation` and `scale` of m2c2kit `Entity`.

### Added

- Bodies can rotate.
- Bodies have additional properties for mass, density, speed, angular velocity.
- Bodies have `applyForce()` method.
- `Physics` class has `onContactBegin()` and `onContactEnd()` methods to attach handlers for contact events.

### Changed

- Updated dependencies.
- Physics engine uses fixed time step to ensure consistent simulation across different frame rates.
- `Physics` class is not a singleton.
- Physics engine uses plugin system and must be added to the game with the asynchronous `registerPlugin()` method.

## `@m2c2kit/cli` [0.3.13] - 2024-01-07

### Changed

- Updated dependencies.

## `@m2c2kit/schematics` [0.1.12] - 2024-01-07

### Changed

- Updated dependencies.

## `@m2c2kit/embedding` [1.0.9] - 2024-01-07

### Changed

- Updated dependencies.

## `@m2c2kit/build-helpers` [0.3.12] - 2024-01-07

### Changed

- Updated dependencies.

## `@m2c2kit/db` [0.3.11] - 2024-01-07

### Changed

- Updated dependencies.

## `@m2c2kit/survey` [0.3.11] - 2024-01-07

### Changed

- Updated dependencies.

## `@m2c2kit/schema-util` [0.1.6] - 2024-01-07

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-symbol-search` [0.8.13] - 2024-01-07

### Added

- `lure_position_on_card` parameter to control lure symbol positioning on card.

### Changed

- Updated dependencies.
- By default, lure symbol will appear randomly on top or bottom card position, if a lure trial.

## `@m2c2kit/assessment-grid-memory` [0.8.13] - 2024-01-07

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-color-shapes` [0.8.13] - 2024-01-07

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-color-dots` [0.8.13] - 2024-01-07

### Changed

- Updated dependencies.

## `@m2c2kit/assessments-demo` [0.8.10] - 2024-01-07

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-cli-starter` [0.8.12] - 2024-01-07

### Changed

- Updated dependencies.

## `@m2c2kit/sage-research` [0.3.11] - 2024-01-07

### Changed

- Updated dependencies.

## `@m2c2kit/core` [0.3.15] - 2023-12-12

### Fixed

- Pointer/tap event position on entity was incorrect in raised event if entity was rotated.

### Changed

- Updated dependencies.

## `@m2c2kit/addons` [0.3.12] - 2023-12-12

### Changed

- Updated dependencies.

## `@m2c2kit/physics` [0.1.2] - 2023-12-12

### Changed

- Updated dependencies.

## `@m2c2kit/cli` [0.3.12] - 2023-12-12

### Changed

- Updated dependencies.

## `@m2c2kit/schematics` [0.1.11] - 2023-12-12

### Changed

- Updated dependencies.
- Updated templates.

## `@m2c2kit/embedding` [1.0.8] - 2023-12-12

### Changed

- Updated dependencies.

## `@m2c2kit/build-helpers` [0.3.11] - 2023-12-12

### Changed

- Updated dependencies.

## `@m2c2kit/db` [0.3.10] - 2023-12-12

### Changed

- Updated dependencies.

## `@m2c2kit/survey` [0.3.10] - 2023-12-12

### Changed

- Updated dependencies.

## `@m2c2kit/schema-util` [0.1.5] - 2023-12-12

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-symbol-search` [0.8.12] - 2023-12-12

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-grid-memory` [0.8.12] - 2023-12-12

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-color-shapes` [0.8.12] - 2023-12-12

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-color-dots` [0.8.12] - 2023-12-12

### Changed

- Updated dependencies.

## `@m2c2kit/assessments-demo` [0.8.9] - 2023-12-12

### Changed

- Updated dependencies.

## `@m2c2kit/assessment-cli-starter` [0.8.11] - 2023-12-12

### Changed

- Updated dependencies.

## `@m2c2kit/sage-research` [0.3.10] - 2023-12-12

### Changed

- Updated dependencies.

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
