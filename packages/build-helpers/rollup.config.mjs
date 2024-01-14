import esbuild from "rollup-plugin-esbuild";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import dts from "rollup-plugin-dts";
import copy from "rollup-plugin-copy";
import json from "@rollup/plugin-json";

export default [
  {
    input: ["./src/index.ts"],
    output: [
      { file: "./build/index.js", format: "es", sourcemap: true },
      {
        file: "./build/index.min.js",
        format: "es",
      },
    ],
    /**
     * Using "resolve" in copyAssessmentAssets.ts needs preferBuiltins: true
     * and the @rollup/plugin-json
     */
    plugins: [
      json(),
      nodeResolve({ preferBuiltins: true }),
      commonjs(),
      esbuild(),
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
        // copy the bundled esm module and sourcemap to dist
        targets: [
          {
            src: "build/index.*",
            dest: ["dist/"],
          },
        ],
      }),
    ],
  },
];
