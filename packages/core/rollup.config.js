import typescript from "@rollup/plugin-typescript";
import shim from "rollup-plugin-shim";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import copy from "rollup-plugin-copy";
import babel from "@rollup/plugin-babel";
import del from "rollup-plugin-delete";
import dts from "rollup-plugin-dts";

let sharedPlugins = [
  // canvaskit-wasm references these node.js functions
  // shim them to empty functions for browser usage
  shim({
    fs: `export function fs_empty_shim() { }`,
    path: `export function path_empty_shim() { }`,
  }),
  nodeResolve(),
  commonjs(),
  //   {
  //   include: "node_modules/canvaskit-wasm/**",
  // }
];

export default [
  {
    input: ["./src/index.ts"],
    // the output is build/esm because we need a later step to
    // combine all declaration files
    output: [{ file: "./build/esm/index.mjs", format: "esm", sourcemap: true }],
    plugins: [
      del({ targets: ["dist/*", "build/*"] }),
      ...sharedPlugins,
      typescript({
        outputToFilesystem: false,
        tsconfig: "./tsconfig.json",
        // outDir will be relative to the "output" set above, i.e., ./build/esm
        outDir: ".",
        declaration: true,
        rootDir: "src",
        include: ["./**/*.ts", "./**/*.js"],
        sourceMap: true,
        //include: ["./src/**/*.ts"],
        //exclude: ["**/__tests__", "**/*.test.ts"],
      }),
    ],
  },

  {
    // bundle all declaration files and place the declaration
    // bundle in dist
    input: "./build/esm/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [
      dts(),
      copy({
        targets: [
          {
            // copy the bundled esm module to dist
            src: "build/esm/index.mjs",
            dest: ["dist/"],
          },
        ],
      }),
    ],
  },

  // Make a UMD bundle only to use for testing (jest), because jest support
  // for esm modules is still incomplete
  // the UMD bundle for testing is in build, but the one for distribution
  // will be in dist
  {
    input: "./src/index.ts",
    output: [
      {
        file: "./build/umd/index.js",
        format: "umd",
        name: "m2c2kit",
        esModule: false,
        exports: "named",
        sourcemap: true,
      },
    ],
    plugins: [
      ...sharedPlugins,
      typescript({
        outputToFilesystem: false,
        tsconfig: "./tsconfig.json",
        outDir: "./build/umd",
        //declaration: false,
        include: ["./src/**/*.ts", "./src/**/*.js"],
        //exclude: ["**/__tests__", "**/*.test.ts"],
      }),
      babel({
        babelHelpers: "bundled",
      }),
      // copy only index.js from build/umd to dist
      // because we don't distribute the sourcemap
      copy({
        targets: [
          {
            src: "build/umd/index.js",
            dest: "dist/",
          },
        ],
        copyOnce: false,
        hook: "closeBundle",
      }),
    ],
  },
];
