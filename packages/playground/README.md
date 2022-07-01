# M2c2kitPlayground

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.12.

## Development notes

Although this is in a monorepo, it is not listed as one of the monorepo packages. This this project will have its own node_folders and these packages must be installed separately from this project root. It is important to be aware of where the node_modules/monaco-editor is installed, because it must be copied as part of the assets. Specifically, in angular.json, i.e., "input": "./node_modules/monaco-editor"

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
