# m2c2kit

## Build process

Make sure you have git and node installed (16.13.0); Visual Studio Code is highly recommended (https://code.visualstudio.com/download). Then from the command line:

```
git clone git@github.com:syabiku/m2c2kit-draft.git
cd m2c2kit-draft
chmod +x .husky/pre-commit
chmod +x m2c2kit-new.sh
npm install
npm run build
```

## Run the examples

### Command line

- `npm run examples-start`
- Wait for `waiting for changes...`
- Open your web browser at http://localhost:3000

### Visual Studio Code

- Open the workspace (`code m2c2kit.code-workspace`)
- Under **NPM SCRIPTS**, run `examples-start` by clicking the triangle (play) icon. This transpiles the code and starts a local webserver.
- Wait for `waiting for changes...`
- Select the debug icon on the left
- Select "Examples Chrome port 3000" next to **RUN AND DEBUG** and click the triangle (play) icon. This opens Chrome in debug mode.
- VS Code supports interactive debugging and breakpoints

## Create and run a new task

The below procedures will run a simple script to set up a starter template. The `serve.sh` script will transpile the TypeScript, serve it on localhost, and watch for source file changes. If you edit and save source code, it will retranspile and reload the page.

### Command line

- `npm run new`
- Choose a name (e.g., `task1`) and press return
- `cd task1`
- `./serve.sh`
- Wait for `waiting for changes...`
- Open your web browser at http://localhost:3000.

### Visual Studio Code

- Open the workspace (`code m2c2kit.code-workspace`)
- Under **NPM SCRIPTS**, run `new` by clicking the triangle (play) icon. This transpiles the code and starts a local webserver.
- Choose a name (e.g., `task1`) and press return
- Open a a new terminal in VS Code under the Terminal menu item, and choose the newly created task (e.g, `task1`)
- `./serve.sh`
- Wait for `waiting for changes...`
- Select the debug icon on the left
- Select "task1 Chrome port 3000" next to **RUN AND DEBUG** and click the triangle (play) icon. This opens Chrome in debug mode.
- VS Code supports interactive debugging and breakpoints

## Demo Server

The above procedures allow cognitive tasks to be developed, run, and debugged locally (localhost), but they cannot be shared with others or easily run on mobile device browsers. The `demo-server` code, under `tools`, is a simple API backed by an Azure Function that allows us to upload files, persist them in Blob Storage, and serve them to clients. This server is currently running at `https://m2c2-demo-server.azurewebsites.net`. Note that a valid username and password (Basic Auth) is required to upload using the following procedures.

### Upload to the demo-server via command line

- `cd tools/file-uploader`
- `npm run upload`
- Enter the full path to the folder (e.g., `/home/scott/github/m2c2kit/task1`)
- Enter the demo-server URL (currently `https://m2c2-demo-server.azurewebsites.net`)
- Enter username and password (ask for these secrets)
- If upload is successful, it will tell you the public URL (e.g., `https://m2c2-demo-server.azurewebsites.net/studies/5JADR`)
- To upload again, `npm run upload` and it will use the previously entered information
- To upload a different folder, first do `npm run upload-reset` to clear saved information

### Upload to the demo-server via Visual Studio Code

- Open the workspace (`code m2c2kit.code-workspace`)
- Under **NPM SCRIPTS**, run `upload` by clicking the triangle (play) icon
- Enter the full path to the folder (e.g., `/home/scott/github/m2c2kit/task1`)
- Enter the demo-server URL (currently `https://m2c2-demo-server.azurewebsites.net`)
- Enter username and password (ask for these secrets
- If upload is successful, it will tell you the public URL (e.g., `https://m2c2-demo-server.azurewebsites.net/studies/5JADR`)
- To upload again, click the play icon again for `upload`, and it will use the previously entered information
- To upload a different folder, first run `upload-reset` to clear saved information

## Testing

Using [Jest](https://jestjs.io/), some unit tests have been written to provide initial test coverage of the m2c2kit library. The [canvaskit-wasm](https://www.npmjs.com/package/canvaskit-wasm) dependency is mocked (with a combination of stubs, [node-canvas](https://github.com/Automattic/node-canvas), and [jsdom](https://github.com/jsdom/jsdom)) so tests can run without invoking this dependency. Tests can be run with `npm run test`.

## Contributing

[Prettier](https://prettier.io/) has been configured to automatically run on each commit. It will format TypeScript, JavaScript, HTML, and JSON to [uniform coding styles](https://prettier.io/docs/en/why-prettier.html).

## License

m2c2kit is licensed under the MIT license.
