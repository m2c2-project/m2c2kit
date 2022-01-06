import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import shim from "rollup-plugin-shim";
import copy from "rollup-plugin-copy";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import del from "rollup-plugin-delete";
import sourcemaps from "rollup-plugin-sourcemaps";
import path from "path";

let sharedPlugins = [
  // canvaskit-wasm references these node.js functions
  // shim them to empty functions for browser usage
  shim({
    fs: `export function fs_empty_shim() { }`,
    path: `export function path_empty_shim() { }`,
  }),
  nodeResolve(),
  commonjs({
    include: "node_modules/canvaskit-wasm/**",
  }),
];

export default (commandLineArgs) => {
  let outputFolder = "build";
  if (commandLineArgs.configProd) {
    outputFolder = "dist";
  }

  const finalConfig = [
    {
      input: "./src/dot-memory.ts",
      output: [
        {
          file: `./${outputFolder}/dot-memory.bundle.js`,
          format: "esm",
          sourcemap: commandLineArgs.configServe && true,
          sourcemapPathTransform:
            commandLineArgs.configServe &&
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ((relativeSourcePath, sourcemapPath) => {
              // for sourcemaps of our m2c2kit packages, we need to modify
              // sourcemap paths to point to the correct folder in the repo
              return relativeSourcePath.replace(
                "packages",
                path.join("..", "packages")
              );
            }),
        },
      ],
      plugins: [
        // del({ targets: [`${outputFolder}/*`] }),
        ...sharedPlugins,
        typescript({
          sourceMap: commandLineArgs.configServe && true,
        }),
        sourcemaps(),
        copy({
          targets: [
            // copy the wasm bundle out of node_modules so it can be served
            {
              src: "../../node_modules/canvaskit-wasm/bin/canvaskit.wasm",
              dest: outputFolder,
            },
            {
              src: "fonts/*",
              dest: `${outputFolder}/fonts`,
            },
            {
              src: "img/*",
              dest: `${outputFolder}/img`,
            },
          ],
          copyOnce: false,
          hook: "writeBundle",
        }),
        copy({
          targets: [
            {
              src: "src/index.html",
              dest: outputFolder,
            },
          ],
          copyOnce: false,
          hook: "writeBundle",
        }),
        commandLineArgs.configServe &&
          serve({
            // we can start development server and automatically open browser by running
            // npm run serve -- --configOpen
            open: commandLineArgs.configOpen && true,
            verbose: true,
            contentBase: [`./${outputFolder}`],
            historyApiFallback: true,
            host: "localhost",
            port: 3000,
          }),
        commandLineArgs.configServe && livereload({ watch: "build", delay: 0 }),
      ],
    },
  ];
  return finalConfig;
};
