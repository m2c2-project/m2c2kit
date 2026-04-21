import { defineConfig } from "rolldown";
import { dts } from "rolldown-plugin-dts";
import copy from "rollup-plugin-copy";
import findUp from "findup-sync";

export default defineConfig([
  {
    input: "./src/index.ts",
    external: ["@m2c2kit/core"],
    platform: "browser",
    output: [
      {
        file: "./dist/index.js",
        format: "es",
        sourcemap: true,
        // @m2c2kit/survey uses SurveyJS's react-based library. React uses
        // process.env.NODE_ENV to determine the production environment. This will not
        // be available in the browser, so shim it.
        banner: `let process={env:{NODE_ENV:'production'}};`,
      },
      {
        file: "./dist/index.min.js",
        format: "es",
        sourcemap: false,
        banner: `let process={env:{NODE_ENV:'production'}};`,
        minify: true,
      },
    ],
  },
  {
    input: "./build/index.d.ts",
    external: ["@m2c2kit/core", "survey-react"],
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [
      dts(),
      copy({
        targets: [
          {
            src: [
              /**
               * The node_modules folder for the packages from which we copy
               * the css assets may be in different locations if other packages
               * in this monorepo depend on other versions. Thus, we cannot
               * assume the location of the node_modules folder. Use findUp to
               * locate the node_modules folder containing the package.
               */
              findUp("node_modules/survey-react/modern.css").replace(
                /\\/g,
                "/",
              ),
              findUp("node_modules/survey-react/modern.min.css").replace(
                /\\/g,
                "/",
              ),
              findUp("node_modules/survey-react/survey.css").replace(
                /\\/g,
                "/",
              ),
              findUp("node_modules/survey-react/survey.min.css").replace(
                /\\/g,
                "/",
              ),
              findUp("node_modules/survey-react/defaultV2.css").replace(
                /\\/g,
                "/",
              ),
              findUp("node_modules/survey-react/defaultV2.min.css").replace(
                /\\/g,
                "/",
              ),
              findUp("node_modules/nouislider/dist/nouislider.css").replace(
                /\\/g,
                "/",
              ),
              findUp("node_modules/nouislider/dist/nouislider.min.css").replace(
                /\\/g,
                "/",
              ),
              findUp("node_modules/select2/dist/css/select2.css").replace(
                /\\/g,
                "/",
              ),
              findUp("node_modules/select2/dist/css/select2.min.css").replace(
                /\\/g,
                "/",
              ),
              findUp(
                "node_modules/bootstrap-datepicker/dist/css/bootstrap-datepicker.standalone.css",
              ).replace(/\\/g, "/"),
              findUp(
                "node_modules/bootstrap-datepicker/dist/css/bootstrap-datepicker.standalone.min.css",
              ).replace(/\\/g, "/"),
              findUp(
                "node_modules/bootstrap-slider/dist/css/bootstrap-slider.css",
              ).replace(/\\/g, "/"),
              findUp(
                "node_modules/bootstrap-slider/dist/css/bootstrap-slider.min.css",
              ).replace(/\\/g, "/"),
            ],
            dest: ["assets/css/"],
          },
        ],
      }),
    ],
  },
]);
