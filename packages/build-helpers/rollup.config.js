import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import dts from "rollup-plugin-dts";
import copy from "rollup-plugin-copy";

const outputFolder = "build";

export default [
  {
    input: ["./src/index.ts"],
    output: [{ dir: outputFolder, format: "es", sourcemap: true }],
    plugins: [nodeResolve(), commonjs(), typescript()],
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

// see https://github.com/isaacs/node-glob/issues/365
