import esbuild from "rollup-plugin-esbuild";
import nodeResolve from "@rollup/plugin-node-resolve";
import copy from "rollup-plugin-copy";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
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
          format: "es",
          sourcemap: isDebug,
        },
      ],
      plugins: [
        nodeResolve(),
        esbuild(),
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
              src: "../assessment-cli-starter/assets/*",
              dest: `${outputFolder}/assets/cli-starter`,
            },
            {
              src: "../assessment-color-dots/assets/*",
              dest: `${outputFolder}/assets/color-dots`,
            },
            {
              src: "../assessment-grid-memory/assets/*",
              dest: `${outputFolder}/assets/grid-memory`,
            },
            {
              src: "../assessment-symbol-search/assets/*",
              dest: `${outputFolder}/assets/symbol-search`,
            },
            {
              src: "../assessment-color-shapes/assets/*",
              dest: `${outputFolder}/assets/color-shapes`,
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
