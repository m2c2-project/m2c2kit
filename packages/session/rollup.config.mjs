import esbuild from "rollup-plugin-esbuild";
import { minify } from "rollup-plugin-esbuild";
import nodeResolve from "@rollup/plugin-node-resolve";
import copy from "rollup-plugin-copy";
import dts from "rollup-plugin-dts";
import { insertVersionString } from "@m2c2kit/build-helpers";

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
    plugins: [insertVersionString(), nodeResolve(), esbuild()],
  },
  /**
   * Bundle all declaration files in build and place the declaration bundles
   * in dist; copy output files from build to dist.
   *
   * I could not get @rollup/plugin-typescript to work with the
   * emitDeclarationOnly option. Thus, as part of the build script in
   * package.json, before rollup is run, tsc is run to generate the
   * declaration files used by rollup-plugin-dts.
   */
  {
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
];
