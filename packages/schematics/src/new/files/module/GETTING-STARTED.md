# Getting Started

## m2c2kit module development

This repository has been set up to develop an assessment for m2c2kit in the form of a module. A module is meant to be reused in m2c2kit applications.

## Development server

Run `npm run serve` from the command line for a development server. Browse to `http://localhost:3000/`. The app will automatically compile and reload when you change source files. If you get an error on the reload, edit `rollup.config.runner.mjs` and increase the delay parameter (unit is milliseconds) in this line:

    livereload({ watch: "build", delay: 250 })

## Debugging

With the file `.vscode/launch.json`, the project has been configured for debugging with Visual Studio Code and Chrome. If the development server is running, debugging in Visual Studio Code is available by pressing `F5` or selecting Run --> Start Debugging

## Production build

Run `npm run build` from the command line to build the assessment. JavaScript build artifacts will be stored in the `dist/` directory. Assessment assets remain in the `assets/` directory. Because the assessment is meant to be a module used in other m2c2kit applications, the output in the `dist/` directory is not a complete, runnable application. It lacks the necessary HTML and supporting files to run as a standalone application.

## Publishing to npm

The `package.json` file has the property `"private": true`, which prevents accidental publishing to npm. If the assessment is to be published to npm, remove this property.
