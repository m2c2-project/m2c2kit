# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## `@m2c2kit/core` [0.3.4] - 2023-01-17

### Added

- Get version string from `package.json` file.
- `document_uuid` is an automatic trial schema

### Changed

- Use `canvaskit-wasm` 0.38.0.
- `Game.init()` is now async.

### Fixed

- runDuringTransition option is now being respected .

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
