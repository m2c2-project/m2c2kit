import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import sourcemaps from "rollup-plugin-sourcemaps";
import copy from "rollup-plugin-copy";
import { hashM2c2kitAssets } from "@m2c2kit/build-helpers";

export default (commandLineArgs) => {
  const isDebug = commandLineArgs.configServe ? true : false;

  let outputFolder = "build";
  if (commandLineArgs.configProd) {
    outputFolder = "dist-webview";
  }

  const finalConfig = [
    {
      input: "./src/index-webview.ts",
      output: [
        {
          file: `./${outputFolder}/index.js`,
          format: "esm",
          sourcemap: isDebug,
        },
      ],
      plugins: [
        nodeResolve(),
        typescript({
          sourceMap: commandLineArgs.configServe && true,
        }),
        sourcemaps(),
        copy({
          targets: [
            {
              src: "../core/assets/",
              dest: `${outputFolder}`,
            },
            {
              src: "../core/index.html",
              dest: `${outputFolder}`,
            },
            {
              src: "../assessment-cli-starter/assets/cli-starter",
              dest: `${outputFolder}/assets`,
            },
            {
              src: "../assessment-color-shapes/assets/color-shapes",
              dest: `${outputFolder}/assets`,
            },
            {
              src: "../assessment-color-dots/assets/color-dots",
              dest: `${outputFolder}/assets`,
            },
            {
              src: "../assessment-grid-memory/assets/grid-memory",
              dest: `${outputFolder}/assets`,
            },
            {
              src: "../assessment-symbol-search/assets/symbol-search",
              dest: `${outputFolder}/assets`,
            },
          ],
        }),
        commandLineArgs.configProd &&
          !commandLineArgs.configNoHash &&
          hashM2c2kitAssets(outputFolder),
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
