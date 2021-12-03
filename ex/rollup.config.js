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
    input: "./typescript-example.ts",
    output: [
      {
        file: "./typescript-example.bundle.js",
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
        include: ["./*.ts"],
        outDir: "../tmp",
      }),
      serve({
        open: false,
        verbose: true,
        contentBase: [".", "assets"],
        historyApiFallback: true,
        host: "localhost",
        port: 3000,
      }),
      livereload(),
    ],
  },
];
