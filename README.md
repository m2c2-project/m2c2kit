<div align="center">
<img style="margin-right: 16px;" src=".github/images/m2c2.svg" width="128" />
<h1>m2c2kit</h1>

_a library for cross-platform cognitive assessments_

[![TypeScript](https://img.shields.io/badge/-TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/m2c2-project/m2c2kit.svg?style=social)](https://GitHub.com/m2c2-project/m2c2kit/stargazers/)
[![GitHub watchers](https://img.shields.io/github/watchers/m2c2-project/m2c2kit.svg?style=social)](https://GitHub.com/m2c2-project/m2c2kit/watchers/)

</div>

m2c2kit is a library for creating cross-platform cognitive assessments. It is produced by the Mobile Monitoring of Cognitive Change (M2C2) research project, sponsored by the National Institute on Aging.

m2c2kit is written in Typescript and leverages Google's [canvaskit-wasm](https://www.npmjs.com/package/canvaskit-wasm) Skia-based graphics engine to present cognitive assessments using HTML5 and JavaScript. Users can take these assessments with a desktop or mobile browser, or the assessments can be programmed into native mobile apps using a webview.

<div align="center">

[No-install quickstart](#no-install-quickstart) •
[Local install](#local-install) •
[Packages](#packages) •
[Building](#building) •
[Testing](#testing) •
[Contributing](#contributing) •
[License](#license)

</div>

## No-install quickstart

Go to the m2c2kit [playground](https://m2c2kit.z13.web.core.windows.net/) to take assessments, view assessment source code (TypeScript), and modify assessments (or create new ones) in your web browser.

![m2c2kit-playground](.github/images/m2c2kit-playground.gif)

## Local install

Make sure you have installed [Node.js](https://nodejs.org) (version >=16). The CLI can quickly scaffold a demo app and serve it on your local machine.

```
npm install -g @m2c2kit/cli
m2 new myapp
cd myapp
npm run serve
```

You can now go to http://localhost:3000 to view the demo app.

See the [`@m2c2kit/cli`](packages/cli) package for more information on using the CLI.

## Packages

- [`@m2c2kit/core`](packages/core) - The m2c2kit core functionality.
- [`@m2c2kit/addons`](packages/addons) - Convenience elements, such as buttons, grids, and instructions, constructed out of the core primitives.
- [`@m2c2kit/survey`](packages/survey) - Survey functionality that can be added to m2c2kit apps, using the MIT-licensed [survey-js](https://www.npmjs.com/package/surveyjs) library.

- [`@m2c2kit/cli`](packages/cli) - Command line interface for scaffolding new m2c2kit apps.
- [`@m2c2kit/assessments-demo`](packages/assessments-demo) - Demonstration app that shows the assessments created by the m2c2kit team.
- [`@m2c2kit/assessment-color-dots`](packages/assessment-color-dots) - A cued-recall, item-location memory binding task, where after viewing 3 dots for a brief period of time, participants are to report: (1) the color at a cued location; (2) the location of a cued color.
- [`@m2c2kit/assessment-grid-memory`](packages/assessment-grid-memory) - A visuospatial working memory task, with delayed free recall. After a brief exposure, and a short distraction phase, participants are asked to report the location of dots on a grid.
- [`@m2c2kit/assessment-symbol-search`](packages/assessment-symbol-search) - A speeded continuous performance test of conjunctive feature search, where participants are asked to identify matching symbol pairs.
- [`@m2c2kit/assessment-cli-starter`](packages/assessment-cli-starter) - The assessment that is created when the CLI scaffolds a new app. It is a simple implementation of a [Stroop](https://en.wikipedia.org/wiki/Stroop_effect) assessment.
- [`@m2c2kit/playground`](packages/playground) - A playground to showcase existing m2c2kit assessments and develop new ones, in the browser. The playground has a simple IDE that shows the source code of the assessment, which users can modify. It will also transpile the source code from TypeScript to JavaScript.
- [`@m2c2kit/sage-research`](packages/sage-research) - Utility functions for embedding m2c2kit assessments in iOS and Android apps developed by [Sage Bionetworks](https://sagebionetworks.org/). End users will not need to install this.
- [`@m2c2kit/build-helpers`](packages/build-helpers) - Utility functions for building m2c2kit apps. End users will not need to install this explicitly. It is automatically installed as a dependency.

## Building

m2c2kit is a mono repository. Assuming you have installed [Node.js](https://nodejs.org), execute `npm install` then `npm run build` from the repository root. This will build all packages except for the m2c2kit playground. The playground is an Angular app that must be built separately, _after_ the other m2c2kit packages have been built. To build the playground, execute `npm install` then `npm run build` from the playground root (`packages/playground`).

## Testing

Using [Jest](https://jestjs.io/), some unit tests have been written to provide initial test coverage of the [`@m2c2kit/core`](packages/core) library. The [canvaskit-wasm](https://www.npmjs.com/package/canvaskit-wasm) dependency is mocked (with a combination of stubs, [node-canvas](https://www.npmjs.com/package/canvas), and [jsdom](https://www.npmjs.com/package/jsdom)) so tests can run without invoking this dependency. Within the `packages/core` folder, tests can be run with `npm run test` (provided that the core package has already been built with `npm run build`).

## Contributing

[Prettier](https://prettier.io/) has been configured to automatically run on each commit. It will format TypeScript, JavaScript, HTML, and JSON to [uniform coding styles](https://prettier.io/docs/en/why-prettier.html).

## License

MIT
