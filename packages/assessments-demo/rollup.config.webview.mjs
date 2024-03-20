import esbuild from "rollup-plugin-esbuild";
import nodeResolve from "@rollup/plugin-node-resolve";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import {
  hashM2c2kitAssets,
  makeM2c2kitServiceWorker,
  copyAssets,
} from "@m2c2kit/build-helpers";

export default (commandLineArgs) => {
  const isDebug = commandLineArgs.configServe ? true : false;
  const port = commandLineArgs.configPort || 3000;

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
        copyAssets({
          package: [
            "@m2c2kit/assessment-color-dots",
            "@m2c2kit/assessment-grid-memory",
            "@m2c2kit/assessment-color-shapes",
            "@m2c2kit/assessment-symbol-search",
            "@m2c2kit/assessment-cli-starter",
            "@m2c2kit/db",
            {
              name: "@m2c2kit/survey",
              /**
               * Copy index.html from survey, rather than session, because the
               * index.html in survey has additional links to the CSS needed
               * for surveys.
               * If we did not use survey functionality, we would copy the
               * index.html from session instead.
               * Note: The asterisk after index.html is important because
               * otherwise the source will be interpreted as a folder rather
               * than a file.
               */
              extras: [
                {
                  source: "assets/index.html*",
                  dest: "",
                },
              ],
            },
          ],
          outputFolder,
        }),
        commandLineArgs.configProd &&
          !commandLineArgs.configNoHash &&
          hashM2c2kitAssets(outputFolder),
        commandLineArgs.configProd &&
          !commandLineArgs.configNoHash &&
          commandLineArgs.configServiceWorker &&
          makeM2c2kitServiceWorker(outputFolder, ["data.html", "data.js"]),
        commandLineArgs.configServe &&
          serve({
            /**
             * Start development server and automatically open browser with
             *   npm run serve -- --configOpen
             * However, to debug and hit breakpoints, you must launch
             * the browser through vs code.
             */
            open: commandLineArgs.configOpen && true,
            verbose: true,
            contentBase: [`./${outputFolder}`],
            historyApiFallback: true,
            host: "localhost",
            port: port,
          }),
        commandLineArgs.configServe &&
          /**
           * Try a shorter delay for quicker reloads, but increase it if
           * the browser reloads before the new build is fully ready.
           */
          livereload({ watch: "build", delay: 250 }),
      ],
    },
  ];

  return finalConfig;
};
