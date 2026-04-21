import { defineConfig } from "rolldown";
import { copyAssets } from "@m2c2kit/build-helpers";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";

export default defineConfig(() => {
  const port = process.env?.PORT || 3000;
  const openBrowser = process.env?.OPEN == "true";

  return [
    {
      input: "./src/runner.ts",
      platform: "browser",
      output: [{ file: "./build/index.js", format: "es", sourcemap: true }],
      plugins: [
        copyAssets({ id: "grid-memory", outputFolder: "./build" }),
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
          contentBase: ["./build"],
          historyApiFallback: true,
          host: "localhost",
          port: port,
        }),
        /**
         * Add a small delay, such as `delay: 250`, if the browser reloads
         * before the new build is fully ready.
         */
        livereload({ watch: "build" }),
      ],
    },
  ];
});
