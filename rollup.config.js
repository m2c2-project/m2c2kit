import typescript from "@rollup/plugin-typescript";
import shim from "rollup-plugin-shim";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import copy from "rollup-plugin-copy";
import babel from "@rollup/plugin-babel";
import multiInput from "rollup-plugin-multi-input";
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
  commonjs({
    include: "node_modules/canvaskit-wasm/**",
  }),
];

export default [
  {
    input: [
      "./lib/src/index.ts",
      // "./lib/src/addons/composites/button.ts",
      // "./lib/src/addons/composites/grid.ts",
      // "./lib/src/addons/stories/instructions.ts",
    ],
    //output: [{ dir: "./build/esm", format: "esm", name: "m2c2kit" }],
    output: [{ file: "./build/esm/index.mjs", format: "esm" }],
    plugins: [
      del({ targets: ["dist/esm/*", "examples/src/javascript/esm/*"] }),
      ...sharedPlugins,
      //multiInput({ relative: "lib/src/" }),
      typescript({
        tsconfig: "./tsconfig.json",
        // outdir will be relative to the "output" set above, i.e., ./build/esm
        outDir: ".",
        declaration: true,
        include: ["./lib/src/**/*.ts"],
        exclude: ["**/__tests__", "**/*.test.ts"],
      }),
      // copy({
      //   targets: [
      //     // copy the wasm bundle out of node_modules so it can be served
      //     {
      //       src: "node_modules/canvaskit-wasm/bin/canvaskit.wasm",
      //       dest: ["dist/esm", "examples/src/javascript"],
      //     },
      //   ],
      //   copyOnce: true,
      //   hook: "writeBundle",
      // }),
      copy({
        targets: [
          // the javascript example is not using bundling, so copy over
          // the m2c2 dist modules
          {
            src: "dist/esm/**/*",
            dest: "examples/src/javascript",
          },
        ],
        copyOnce: false,
        // I was getting intermittent file permission errors when the
        // hook was writeBundle
        hook: "closeBundle",
        flatten: false,
      }),
    ],
  },

  {
    input: "./build/esm/index.d.ts",
    output: [{ file: "dist/esm/index.d.ts", format: "es" }],
    plugins: [
      dts(),
      copy({
        targets: [
          {
            src: "build/esm/index.mjs",
            dest: ["dist/esm/"],
          },
        ],
      }),
    ],
  },

  // Make a UMD bundle only to use for testing (jest), because jest support
  // for esm modules is still incomplete

  {
    input: "./lib/src/index.ts",
    output: [
      {
        file: "./dist/umd/index.js",
        //dir: "./dist/umd",
        format: "umd",
        name: "m2c2kit",
        esModule: false,
        exports: "named",
        sourcemap: true,
      },
    ],
    plugins: [
      del({ targets: "dist/umd/*" }),
      ...sharedPlugins,
      typescript({
        tsconfig: "./tsconfig.json",
        outDir: "./dist/umd",
        declaration: false,
        include: ["./lib/src/**/*.ts"],
        exclude: ["**/__tests__", "**/*.test.ts"],
      }),
      babel({
        babelHelpers: "bundled",
      }),
    ],
  },

  // {
  //   input: "./examples/cognitive-tests/dot-memory.ts",
  //   output: [
  //     {
  //       file: "./examples/cognitive-tests/cognitive-tests.bundle.js",
  //       format: "esm",
  //       sourcemap: true,
  //     },
  //   ],
  //   plugins: [
  //     ...sharedPlugins,
  //     typescript({
  //       inlineSourceMap: true,
  //       inlineSources: true,
  //       target: "es6",
  //       include: ["./examples/cognitive-tests/*.ts", "./src/**/*.[tj]s"],
  //       exclude: ["**/__tests__", "**/*.test.ts"],
  //       outDir: "../tmp",
  //     }),
  //     copy({
  //       targets: [
  //         // copy the wasm binary out of node_modules so it can be served
  //         {
  //           src: "node_modules/canvaskit-wasm/bin/canvaskit.wasm",
  //           dest: "./examples/cognitive-tests",
  //         },
  //       ],
  //       copyOnce: true,
  //       hook: "writeBundle",
  //     }),
  //     serve({
  //       open: false,
  //       verbose: true,
  //       contentBase: ["examples", "assets"],
  //       historyApiFallback: true,
  //       host: "localhost",
  //       port: 3000,
  //     }),
  //     livereload(),
  //   ],
  // },

  // {
  //   input: "./examples/typescript/typescript-example.ts",
  //   output: [
  //     {
  //       file: "./examples/typescript/typescript-example.bundle.js",
  //       format: "esm",
  //       sourcemap: true,
  //     },
  //   ],
  //   plugins: [
  //     ...sharedPlugins,
  //     typescript({
  //       inlineSourceMap: true,
  //       inlineSources: true,
  //       target: "es6",
  //       include: ["./examples/typescript/*.ts", "./src/**/*.[tj]s"],
  //       exclude: ["**/__tests__", "**/*.test.ts"],
  //       outDir: "../tmp",
  //     }),
  //     copy({
  //       targets: [
  //         // copy the wasm binary out of node_modules so it can be served
  //         {
  //           src: "node_modules/canvaskit-wasm/bin/canvaskit.wasm",
  //           dest: "./examples/typescript",
  //         },
  //       ],
  //       copyOnce: true,
  //       hook: "writeBundle",
  //     }),
  //     livereload(),
  //   ],
  // },
];
