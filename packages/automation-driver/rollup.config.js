import typescript from "@rollup/plugin-typescript";
import shim from "rollup-plugin-shim";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import copy from "rollup-plugin-copy";
import babel from "@rollup/plugin-babel";
import del from "rollup-plugin-delete";
import dts from "rollup-plugin-dts";
import terser from "@rollup/plugin-terser";
import sourcemaps from "rollup-plugin-sourcemaps";
import path from "path";

let sharedPlugins = [
  // canvaskit-wasm references these node.js functions
  // shim them to empty functions for browser usage
  shim({
    fs: `export function fs_empty_shim() { }`,
    path: `export function path_empty_shim() { }`,
  }),
  nodeResolve(),
  commonjs(),
];

export default [
  {
    input: ["./src/index.ts"],
    // the output is build because we need a later step to
    // combine all declaration files
    output: [{ dir: "./build", format: "es", sourcemap: true }],
    plugins: [
      del({ targets: ["dist/*", "build/*", "build-umd/*"] }),
      ...sharedPlugins,
      typescript({
        // I was getting errors when defining include and exclude
        // only in tsconfig.json, thus defining them here.
        // note, however, because I specified rootDir below,
        // the include and exclude now are relative to src
        include: ["./**/*.[tj]s"],
        exclude: ["**/__tests__", "**/*.test.ts"],
        rootDir: "src",
      }),
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
        sourcemapPathTransform:
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          (relativeSourcePath, sourcemapPath) => {
            // modify sourcemap paths to point to the correct folder in the repo
            return relativeSourcePath.replace(path.join("..", "src"), "src");
          },
      },
    ],
    plugins: [
      ...sharedPlugins,
      typescript({
        // tsconfig.json defined the outDir as build, so we must
        // use a different one for this umd build
        outDir: "./build-umd",
        // I was getting errors when defining include and exclude
        // only in tsconfig.json, thus defining them here.
        include: ["./src/**/*.[tj]s"],
        exclude: ["**/__tests__", "**/*.test.ts"],
      }),
      sourcemaps(),
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
];
