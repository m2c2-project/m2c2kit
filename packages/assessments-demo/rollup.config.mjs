import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import sourcemaps from "rollup-plugin-sourcemaps";
import copy from "rollup-plugin-copy";
import {
  copyM2c2Assets,
  addHashesM2c2Transformer,
  copyM2c2IndexHtml,
} from "@m2c2kit/build-helpers";

let sharedPlugins = [nodeResolve()];

export default (commandLineArgs) => {
  const isDebug = commandLineArgs.configServe ? true : false;
  const isProd = commandLineArgs.configProd ? true : false;
  const noHash = commandLineArgs.configNoHash ? true : false;

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
          sourcemap: isDebug,
        },
      ],
      plugins: [
        ...sharedPlugins,
        typescript({
          sourceMap: commandLineArgs.configServe && true,
          transformers: {
            before:
              isProd && !noHash ? [addHashesM2c2Transformer()] : undefined,
          },
        }),
        sourcemaps(),
        copyM2c2IndexHtml(
          "../core/index.html",
          `${outputFolder}/index.html`,
          `${outputFolder}/index.js`,
          isProd && !noHash
        ),
        copyM2c2Assets(
          "../core/assets",
          `${outputFolder}/assets`,
          isProd && !noHash
        ),
        copy({
          targets: [
            {
              src: "../assessment-cli-starter/assets/cli-starter",
              dest: `${outputFolder}/assets`,
            },
          ],
        }),
        copy({
          targets: [
            {
              src: "../assessment-color-dots/assets/color-dots",
              dest: `${outputFolder}/assets`,
            },
          ],
        }),
        copy({
          targets: [
            {
              src: "../assessment-grid-memory/assets/grid-memory",
              dest: `${outputFolder}/assets`,
            },
          ],
        }),
        copy({
          targets: [
            {
              src: "../assessment-symbol-search/assets/symbol-search",
              dest: `${outputFolder}/assets`,
            },
          ],
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
        commandLineArgs.configServe &&
          livereload({ watch: "build", delay: 250 }),
      ],
    },
  ];
  return finalConfig;
};
