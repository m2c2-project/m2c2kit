import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import shim from "rollup-plugin-shim";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
// import del from "rollup-plugin-delete";
import sourcemaps from "rollup-plugin-sourcemaps";
import path from "path";
import {
  copyM2c2Assets,
  addHashesM2c2Transformer,
  copyM2c2IndexHtml,
} from "@m2c2kit/build-helpers";

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
  const isDebug = commandLineArgs.configServe ? true : false;
  const isProd = commandLineArgs.configProd ? true : false;

  let outputFolder = "build";
  if (commandLineArgs.configProd) {
    outputFolder = "dist";
  }

  const finalConfig = [
    {
      input: "./src/index.ts",
      output: [
        {
          file: `./${outputFolder}/index.js`,
          format: "esm",
          sourcemap: isDebug, // commandLineArgs.configServe && true,
          /**
           * In the tsconfig.json, we have "rootDir": "../.." to fix an issue
           * where sourcemaps for @m2c2kit/core and addons were not getting
           * the correct path. However, that made the sourcemap for the main
           * entry typescript file not have the correct path.
           * The below fixes it.
           */
          sourcemapPathTransform:
            commandLineArgs.configServe &&
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ((relativeSourcePath, sourcemapPath) => {
              return relativeSourcePath.replace(
                ".." +
                  path.sep +
                  ".." +
                  path.sep +
                  ".." +
                  path.sep +
                  "src" +
                  path.sep +
                  "index.ts",
                "src" + path.sep + "index.ts"
              );
            }),
        },
      ],
      plugins: [
        ...sharedPlugins,
        typescript({
          sourceMap: commandLineArgs.configServe && true,
          transformers: {
            before: isProd ? [addHashesM2c2Transformer()] : undefined,
          },
        }),
        sourcemaps(),
        copyM2c2IndexHtml(
          "src/index.html",
          `${outputFolder}/index.html`,
          `${outputFolder}/index.js`,
          isProd
        ),
        copyM2c2Assets("src/assets", `${outputFolder}/assets`, isProd),
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
