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
];

export default [
  {
    input: ["./src/index.ts"],
    // the output is build/esm because we need a later step to
    // combine all declaration files
    output: [{ file: "./build/index.mjs", format: "esm", sourcemap: true }],
    plugins: [
      del({ targets: ["dist/*", "build/*", "build-umd/*"] }),
      ...sharedPlugins,
      typescript({
        tsconfig: "./tsconfig.json",
        // outDir will be relative to the "output" set above, i.e., ./build
        outDir: ".",
        declaration: true,
        sourceMap: true,
        include: ["./src/**/*.ts"],
        exclude: ["**/__tests__", "**/*.test.ts"],
      }),
    ],
  },

  {
    // bundle all declaration files and place the declaration
    // bundle in dist
    input: "./build/src/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [
      dts(),
      copy({
        targets: [
          {
            // copy the bundled esm module to dist
            // and build-umd
            src: "build/index.mjs*",
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
      },
    ],
    plugins: [
      ...sharedPlugins,
      typescript({
        tsconfig: "./tsconfig.json",
        outDir: "./build-umd",
        declaration: true,
        include: ["./**/*.ts", "./**/*.js"],
        exclude: [
          "rollup.config*",
          "jest.config*",
          "jestSetup*",
          "**/__tests__/**/*",
          "build-umd/**/*",
        ],
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
];
