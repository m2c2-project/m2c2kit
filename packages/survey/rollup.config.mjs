import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import copy from "rollup-plugin-copy";
import babel from "@rollup/plugin-babel";
import del from "rollup-plugin-delete";
import dts from "rollup-plugin-dts";
import terser from "@rollup/plugin-terser";
import sourcemaps from "rollup-plugin-sourcemaps";

/**
 * @m2c2kit/survey uses SurveyJS's react-based library. React uses
 * process.env.NODE_ENV to determine the production environment. This will not
 * be available in the browser, so shim it.
 * see https://github.com/rollup/rollup/issues/487
 */
function prependToBundle(filename, content) {
  return {
    name: "prepend-to-bundle",
    generateBundle: (_options, bundle) => {
      if (bundle[filename]?.type === "chunk") {
        bundle[filename].code = content + bundle[filename].code;
      } else {
        throw new Error(`bundle named ${filename} not found.`);
      }
    },
  };
}
const codeToPrepend = `let process={env:{NODE_ENV:'production'}};`;

export default [
  {
    input: ["./src/index.ts"],
    // the output is build because we need a later step to
    // combine all declaration files
    output: [{ dir: "./build", format: "es", sourcemap: true }],
    external: ["@m2c2kit/core"],
    plugins: [
      del({
        targets: ["dist/*", "build/*", "build-umd/*", "build-nobundler/*"],
      }),
      nodeResolve(),
      commonjs(),
      typescript({
        outputToFilesystem: true,
      }),
      sourcemaps(),
      terser(),
      prependToBundle("index.js", codeToPrepend),
    ],
  },
  {
    // bundle all declaration files and place the declaration
    // bundle in dist
    input: "./build/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [
      dts(),
      copy({
        targets: [
          {
            // copy the bundled esm module and sourcemap to dist
            src: "build/index.*",
            dest: ["dist/"],
          },
          {
            src: [
              "../../node_modules/survey-react/modern.css",
              "../../node_modules/survey-react/modern.min.css",
              "../../node_modules/survey-react/survey.css",
              "../../node_modules/survey-react/survey.min.css",
              "../../node_modules/survey-react/defaultV2.css",
              "../../node_modules/survey-react/defaultV2.min.css",
              "../../node_modules/surveyjs-widgets/node_modules/nouislider/distribute/nouislider.css",
              "../../node_modules/surveyjs-widgets/node_modules/nouislider/distribute/nouislider.min.css",
              "../../node_modules/select2/dist/css/select2.css",
              "../../node_modules/select2/dist/css/select2.min.css",
              "../../node_modules/bootstrap-datepicker/dist/css/bootstrap-datepicker.standalone.css",
              "../../node_modules/bootstrap-datepicker/dist/css/bootstrap-datepicker.standalone.css.map",
              "../../node_modules/bootstrap-datepicker/dist/css/bootstrap-datepicker.standalone.min.css",
            ],
            dest: ["dist/css/"],
          },
        ],
      }),
    ],
  },

  // Make a UMD bundle only to use for testing (jest), because jest support
  // for esm modules is still incomplete
  {
    input: "./src/index.ts",
    output: [
      {
        dir: "./build-umd",
        format: "umd",
        name: "m2c2kit",
        esModule: false,
        exports: "named",
        sourcemap: true,
        globals: {
          "@m2c2kit/core": "core",
        },
      },
    ],
    external: ["@m2c2kit/core"],
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        outputToFilesystem: true,
        outDir: "./build-umd",
      }),
      babel({
        // compact: false to supress minor warning note
        // see https://stackoverflow.com/a/29857361
        babelHelpers: "bundled",
        compact: false,
      }),
      copy({
        targets: [
          {
            // copy the bundled declarations to build-umd
            src: "dist/index.d.ts",
            dest: ["build-umd/"],
          },
        ],
      }),
    ],
  },

  // Make esm bundle for development without a bundler
  {
    input: "./src/index.ts",
    output: [
      {
        file: "./build-nobundler/m2c2kit.survey.esm.js",
        format: "es",
        paths: {
          "@m2c2kit/core": "./m2c2kit.core.esm.js",
        },
      },
    ],
    external: ["@m2c2kit/core"],
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        outputToFilesystem: true,
        outDir: "./build-nobundler",
        sourceMap: false,
      }),
      babel({
        // compact: false to supress minor warning note
        // see https://stackoverflow.com/a/29857361
        babelHelpers: "bundled",
        compact: false,
      }),
      prependToBundle("m2c2kit.survey.esm.js", codeToPrepend),
      copy({
        targets: [
          {
            // copy the bundled declarations to build-nobundler
            src: "dist/index.d.ts",
            dest: "build-nobundler/",
            rename: () => "m2c2kit.survey.esm.d.ts",
          },
        ],
      }),
    ],
  },

  // Make minified esm bundle for development without a bundler
  {
    input: "./src/index.ts",
    output: [
      {
        file: "./build-nobundler/m2c2kit.survey.esm.min.js",
        format: "es",
        paths: {
          "@m2c2kit/core": "./m2c2kit.core.esm.min.js",
        },
      },
    ],
    external: ["@m2c2kit/core"],
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        outputToFilesystem: true,
        outDir: "./build-nobundler",
        sourceMap: false,
      }),
      babel({
        // compact: false to supress minor warning note
        // see https://stackoverflow.com/a/29857361
        babelHelpers: "bundled",
        compact: false,
      }),
      terser(),
      prependToBundle("m2c2kit.survey.esm.min.js", codeToPrepend),
      copy({
        targets: [
          {
            // copy the bundled declarations to build-nobundler
            src: "dist/index.d.ts",
            dest: "build-nobundler/",
            rename: () => "m2c2kit.survey.esm.min.d.ts",
          },
        ],
      }),
    ],
  },
];
