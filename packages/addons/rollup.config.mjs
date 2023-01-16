import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import copy from "rollup-plugin-copy";
import babel from "@rollup/plugin-babel";
import del from "rollup-plugin-delete";
import dts from "rollup-plugin-dts";
import terser from "@rollup/plugin-terser";
import sourcemaps from "rollup-plugin-sourcemaps";

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
      typescript({
        outputToFilesystem: true,
      }),
      sourcemaps(),
      terser(),
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
      typescript({
        outputToFilesystem: true,
        // tsconfig.json defined the outDir as build, so we must
        // use a different one for this umd build
        outDir: "./build-umd",
      }),
      babel({
        babelHelpers: "bundled",
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
        file: "./build-nobundler/m2c2kit.addons.esm.js",
        format: "es",
        paths: {
          "@m2c2kit/core": "./m2c2kit.core.esm.js",
        },
      },
    ],
    external: ["@m2c2kit/core"],
    plugins: [
      nodeResolve(),
      typescript({
        outputToFilesystem: true,
        // tsconfig.json defined the outDir as build, so we must
        // use a different one for this umd build
        outDir: "./build-nobundler",
        sourceMap: false,
      }),
      babel({
        babelHelpers: "bundled",
      }),
      copy({
        targets: [
          {
            // copy the bundled declarations to build-nobundler
            src: "dist/index.d.ts",
            dest: "build-nobundler/",
            rename: () => "m2c2kit.addons.esm.d.ts",
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
        file: "./build-nobundler/m2c2kit.addons.esm.min.js",
        format: "es",
        paths: {
          "@m2c2kit/core": "./m2c2kit.core.esm.min.js",
        },
      },
    ],
    external: ["@m2c2kit/core"],
    plugins: [
      typescript({
        outputToFilesystem: true,
        // tsconfig.json defined the outDir as build, so we must
        // use a different one for this build
        outDir: "./build-nobundler",
        sourceMap: false,
      }),
      babel({
        babelHelpers: "bundled",
      }),
      terser(),
      copy({
        targets: [
          {
            // copy the bundled declarations to build-nobundler
            src: "dist/index.d.ts",
            dest: "build-nobundler/",
            rename: () => "m2c2kit.addons.esm.min.d.ts",
          },
        ],
      }),
    ],
  },
];