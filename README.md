# m2c2kit

## Quick start

Make sure you have node installed (version >=16); Visual Studio Code is highly recommended (https://code.visualstudio.com/download).

The `m2` cli can quickly scaffold a demo app and serve it on your local machine on localhost, port 3000:

```
npm install -g @m2c2kit/cli
m2 new myapp
cd myapp
npm run serve
```

To install the cli from source rather than npm, clone this repo, then:

```
npm install
npm run build -w @m2c2kit/cli
npm install -g ./packages/cli
```

## Visual Studio Code

When creating a project with `m2 new`, the cli will configure the project for debugging with Visual Studio Code and Chrome. When the app is served locally, (`npm run serve`), debugging in Visual Studio Code is available by pressing `F5` or selecting Run, Start Debugging.

## Demo Server

The cli allows cognitive tasks to be developed, run, and debugged locally (localhost), but tasks cannot be shared with others or easily run on mobile device browsers. The `demo-server` code, under `tools`, is a simple API backed by an Azure Function that receives files, persists them in Blob Storage, and serves them to clients. This server is currently running at `https://m2c2-demo-server.azurewebsites.net`. Note that a valid username and password (Basic Auth) is required to upload:

```
npm run build  # bundles a production build in dist/
m2 upload      # uploads content from dist/
```

## Testing

Using [Jest](https://jestjs.io/), some unit tests have been written to provide initial test coverage of the @m2c2kit/core library. The [canvaskit-wasm](https://www.npmjs.com/package/canvaskit-wasm) dependency is mocked (with a combination of stubs, [node-canvas](https://github.com/Automattic/node-canvas), and [jsdom](https://github.com/jsdom/jsdom)) so tests can run without invoking this dependency. Within the `packages/core` folder, tests can be run with `npm run test` (provided that the core package has already been built with `npm run build`).

## Contributing

[Prettier](https://prettier.io/) has been configured to automatically run on each commit. It will format TypeScript, JavaScript, HTML, and JSON to [uniform coding styles](https://prettier.io/docs/en/why-prettier.html).

## License

m2c2kit is licensed under the MIT license.
