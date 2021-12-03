import typescript from "@rollup/plugin-typescript";
import shim from "rollup-plugin-shim";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import copy from "rollup-plugin-copy";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";

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
    input: "./examples/src/cognitive-tests/dot-memory.ts",
    output: [
      {
        file: "./examples/src/cognitive-tests/cognitive-tests.bundle.js",
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      ...sharedPlugins,
      typescript({
        inlineSourceMap: true,
        inlineSources: true,
        target: "es6",
        include: ["./examples/src/cognitive-tests/*.ts"],
        exclude: ["**/__tests__", "**/*.test.ts"],
        outDir: "../tmp",
      }),
      copy({
        targets: [
          // copy the wasm binary out of node_modules so it can be served
          {
            src: "node_modules/canvaskit-wasm/bin/canvaskit.wasm",
            dest: "./examples/src/cognitive-tests",
          },
        ],
        copyOnce: true,
        hook: "writeBundle",
      }),
      serve({
        open: false,
        verbose: true,
        contentBase: ["examples/src", "assets"],
        historyApiFallback: true,
        host: "localhost",
        port: 3000,
      }),
      livereload(),
    ],
  },

  {
    input: "./examples/src/typescript/typescript-example.ts",
    output: [
      {
        file: "./examples/src/typescript/typescript-example.bundle.js",
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      ...sharedPlugins,
      typescript({
        inlineSourceMap: true,
        inlineSources: true,
        target: "es6",
        include: ["./examples/src/typescript/*.ts"],
        exclude: ["**/__tests__", "**/*.test.ts"],
        outDir: "../tmp",
      }),
      copy({
        targets: [
          // copy the wasm binary out of node_modules so it can be served
          {
            src: "node_modules/canvaskit-wasm/bin/canvaskit.wasm",
            dest: "./examples/src/typescript",
          },
        ],
        copyOnce: true,
        hook: "writeBundle",
      }),
      livereload(),
    ],
  },
];
