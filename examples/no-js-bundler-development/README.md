# no-js-bundler-development

## Running the example

It is **highly** recommended to use `npm` and the full TypeScript/JavaScript toolchains to develop your application. You get a richer development experience: type checking, step-by-step debugging in the IDE, and optimized builds (tree shaking, cache-busting, etc.). The demo in [`@m2c2kit/assessments-demo`](../../packages/assessments-demo) shows how to do this.

As an alternative, this example shows how to use m2c2kit without TypeScript or a JavaScript bundler. To run this example:

1. You _must_ build the repository first (`npm install` then `npm run build` from the repository root), because it will build the m2c2kit modules and copy them to the `modules` folder.
2. Run a local development server from this folder. Alternatively, this folder can be copied and served from a web server.

`live-server` is convenient for development because it will automatically reload the page when you make changes to the files. To install and use `live-server`:

```
npm install -g live-server
live-server
```

## Short explanation

Follow the folder structure in this example:

```
/
├─ index.html
├─ index.js
├─ assets/
│  ├─ <id-of-your-assessment>/
│  │  ├─ images/
│  │  ├─ fonts/
├─ modules/
│  ├─ @m2c2kit/
│  │  ├─ core/
│  │  ├─ session/
│  │  ├─ addons/
│  │  ├─ .../
...
```

Whatever id you gave to your assessment, use that name for the folder under `assets`.

In the provided example, the file `index.js` has a game options object with `id: "no-bundler-example"`. Thus, there is a corresponding folder called `no-bundler-example` under `assets` with the fonts for the example.

## Long explanation

Unlike the other packages in this repository, this example does not use TypeScript and Rollup (a JavaScript bundler). It uses JavaScript modules (specifically, ECMAScript modules or "ESM").

To load the ESM files, the `index.html` file uses [import maps](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap). This tells the browser where the modules for the m2c2kit packages are located. The import maps for the example look like this:

```
<script type="importmap">
  {
    "imports": {
      "@m2c2kit/core" : "./modules/@m2c2kit/core/dist/index.js",
      "@m2c2kit/session": "./modules/@m2c2kit/session/dist/index.js",
      "@m2c2kit/addons": "./modules/@m2c2kit/addons/dist/index.js",
      ...
    }
  }
</script>
```

As long as you do not modify the folder structure, you do not need to modify the import maps and can use the provided `index.html` file as-is.

### Old browsers and import maps

Import maps are a newer feature of the web platform. They are not supported by some older browsers. To support import maps on older browsers, you can use a [polyfill](https://developer.mozilla.org/en-US/docs/Glossary/Polyfill). Before the import maps, the `index.html` file has a script tag that loads the polyfill:

```
<script async src="https://ga.jspm.io/npm:es-module-shims@1.8.2/dist/es-module-shims.js"></script>
```

It is recommended to keep this polyfill. If the code runs on a browser that supports import maps, it will be ignored.

You could also download the `es-module-shims.js` script and serve it locally, rather than using the [CDN](https://developer.mozilla.org/en-US/docs/Glossary/CDN).

### Minified files

When you deploy your assessment to production, you can edit the import maps in `index.html` to use the [minified](https://developer.mozilla.org/en-US/docs/Glossary/Minification) versions of the m2c2kit modules, which can slightly improve loading times. The minified files have the `.min.js` extension.

```
<script type="importmap">
  {
    "imports": {
      "@m2c2kit/core" : "./modules/@m2c2kit/core/dist/index.min.js",
      "@m2c2kit/session" : "./modules/@m2c2kit/session/dist/index.min.js",
      "@m2c2kit/addons": "./modules/@m2c2kit/addons/dist/index.min.js",
      ...
    }
  }
</script>
```

### VS Code and IntelliSense

If you use [Visual Studio Code](https://code.visualstudio.com/), you can get IntelliSense (code completion and documentation) for the m2c2kit modules. Keep the provided `jsconfig.json` in the root of your project -- and do not modify the module folder structure!
