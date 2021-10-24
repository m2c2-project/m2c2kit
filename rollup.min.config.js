import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import shim from "rollup-plugin-shim";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "./src/m2c2kit.ts",
  output: [
    {
      file: "./dist/m2c2kit.min.js",
      format: "esm",
      sourcemap: false,
      plugins: [terser()],
    },
  ],
  plugins: [
    typescript({
      inlineSourceMap: false,
      inlineSources: false,
      declaration: false,
      target: "es6",
    }),
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
  ],
};
