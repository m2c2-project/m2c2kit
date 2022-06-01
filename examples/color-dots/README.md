# dot-memory

Dot memory is an example of a cognitive task.

> _Do not_ copy this folder to use as a template to start a new cognitive task. Use the m2c2kit cli to generate a new task.
>
> _Why?_ Because this folder is part of the home repo of m2c2kit, this folder's build configuration files have been specially modified:
>
> 1. this example will use this repo's local packages rather than the ones on npm (due to the references in `tsconfig.json`).
> 2. this example supports source code debugging into the m2c2kit packages (due to use of `rollup-plugin-sourcemaps` in `rollup.config.js`).
>
> In most cases, you don't want these modifications.

## Development server

Run `npm run serve` from the command line for a development server. Browse to `http://localhost:3000/`. The app will automatically compile and reload when you change source files. If you get an error on the reload, edit `rollup.config.js` and increase the delay parameter (unit is milliseconds) in this line:

    livereload({ watch: "build", delay: 0 })

## Debugging

With the file `.vscode/launch.json`, the project has been configured for debugging with Visual Studio Code and Chrome. If the development server is running, debugging in Visual Studio Code is available by pressing `F5` or selecting Run --> Start Debugging

## Build

Run `npm run build` from the command line to build the project. Build artifacts will be stored in the `dist/` directory.
