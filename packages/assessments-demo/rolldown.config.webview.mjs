import { defineConfig } from "rolldown";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import {
  hashM2c2kitAssets,
  makeM2c2kitServiceWorker,
  copyAssets,
} from "@m2c2kit/build-helpers";

export default defineConfig(() => {
  const port = process.env?.PORT || 3000;
  const openBrowser = process.env?.OPEN == "true";
  const isDebug = process.env?.SERVE == "true";
  const isProd = process.env?.PROD == "true";
  const noHash = process.env?.NO_HASH == "true";
  const useServiceWorker = process.env?.SERVICE_WORKER == "true";
  const minify = process.env?.MINIFY == "true";

  let outputFolder = "build";
  if (isProd) {
    outputFolder = "dist-webview";
  }

  return [
    {
      input: "./src/index.ts",
      platform: "browser",
      output: [
        {
          file: `./${outputFolder}/index.js`,
          format: "es",
          sourcemap: isDebug,
          minify: minify,
        },
      ],
      plugins: [
        copyAssets({
          verbose: false,
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
        isProd && !noHash && hashM2c2kitAssets(outputFolder),
        isProd &&
          !noHash &&
          useServiceWorker &&
          makeM2c2kitServiceWorker(outputFolder),
        isDebug &&
          serve({
            /**
             * Default is 3000, but to start development server on 8080 and
             * automatically open browser:
             *   npx cross-env PORT=8080 OPEN=true npm run serve
             * However, to debug and hit breakpoints, you must launch
             * the browser through vs code.
             */
            open: openBrowser,
            verbose: true,
            contentBase: [`./${outputFolder}`],
            historyApiFallback: true,
            host: "localhost",
            port: port,
          }),
        isDebug &&
          /**
           * Add a small delay, such as `delay: 250`, if the browser reloads
           * before the new build is fully ready.
           */
          livereload({ watch: `./${outputFolder}` }),
      ],
    },
  ];
});
