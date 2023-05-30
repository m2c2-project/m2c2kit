import esbuild from "rollup-plugin-esbuild";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import dts from "rollup-plugin-dts";
import copy from "rollup-plugin-copy";

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
    plugins: [nodeResolve(), commonjs(), esbuild()],
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
