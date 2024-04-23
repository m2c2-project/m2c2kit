import nodeResolve from "@rollup/plugin-node-resolve";
import esbuild from "rollup-plugin-esbuild";
import { minify } from "rollup-plugin-esbuild";
import copy from "rollup-plugin-copy";
import dts from "rollup-plugin-dts";
import commonjs from "@rollup/plugin-commonjs";

// I could not get @rollup/plugin-typescript to work with the
// emitDeclarationOnly option. Thus, as part of the build script in
// package.json, before rollup is run, tsc is run to generate the
// declaration files used by rollup-plugin-dts.

export default [
  {
    input: ["./src/index.ts"],
    external: ["@m2c2kit/core"],
    output: [
      { file: "./build/index.js", format: "es", sourcemap: true },
      {
        file: "./build/index.min.js",
        format: "es",
        plugins: [minify()],
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
        // hook must be 'closeBundle' because we need dist/index.d.ts to
        // be created before we can copy it
        hook: "closeBundle",
        targets: [
          {
            src: "build/index.js*",
            dest: "dist",
          },
          {
            src: "build/index.min.js",
            dest: "dist",
          },
        ],
      }),
    ],
  },
  {
    input: ["./src/data.ts"],
    output: [{ file: "./build/data.js", format: "es" }],
    plugins: [
      nodeResolve(),
      commonjs(),
      esbuild(),
      copy({
        targets: [
          {
            src: "build/data.js",
            dest: "dist",
          },
        ],
        hook: "writeBundle",
      }),
    ],
  },
];
