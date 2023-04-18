# no-js-bundler-development

## Running the example

It is **highly** recommended to use `npm` and the full TypeScript/JavaScript toolchains to develop your application. You get a richer development experience: type checking, step-by-step debugging in the IDE, and optimized builds (tree shaking, cache-busting, etc.). The demo in [`@m2c2kit/assessments-demo`](../../packages/assessments-demo) shows how to do this.

If, however, you cannot do that, this example shows how to use `m2c2kit` without TypeScript or a JavaScript bundler. This is not an optimal development approach. Nevertheless, to run this example:

1. You _must_ build the repository first (`npm install` then `npm run build` from the repository root), because it will copy required static assets to the `assets` and `lib` folder.
2. Run `npx http-server` from this folder to start a local web server on port 8080. Open http://localhost:8080 in your browser. Alternatively, this folder (`examples/no-js-bundler-development`) can be directly copied and served from a web server.

## Explanation

Unlike the other packages in this repository, this example does not use TypeScript and Rollup (a JavaScript bundler). It uses JavaScript modules specially built for directly importing into JavaScript code.

For example, instead of a TypeScript file with this:

```
import { Game } from "@m2c2kit/core";
```

It uses a JavaScript file with this:

```
import { Game } from "./lib/m2c2kit.core.esm.js";
```

The import path is relative to the current file (`index.js`). The `lib` folder is where the ES modules were copied to by the build script (they came from the packages' `build-nobundler` folders).

**Important**: In addition to these ES modules, you must copy the supporting static assets (CSS, images, fonts, etc.) from the packages _and_ preserve the proper folder structure. The repository-level build script did this for you, but you will have to do it yourself for other assessments.

For development of new assessments, use the `@m2c2kit/core`, `@m2c2kit/addons`, and `@m2c2kit/survey` library files that are not minified, because stepping through the code may be helpful. For production, use the minified files:

```
import { Game } from "./lib/m2c2kit.core.esm.min.js";
```
