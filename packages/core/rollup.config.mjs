import esbuild from "rollup-plugin-esbuild";
import { minify } from "rollup-plugin-esbuild";
import nodeResolve from "@rollup/plugin-node-resolve";
import nodePolyfills from "rollup-plugin-polyfill-node";
import commonjs from "@rollup/plugin-commonjs";
import copy from "rollup-plugin-copy";
import dts from "rollup-plugin-dts";
import findup from "findup-sync";
import replace from "@rollup/plugin-replace";
import {
  insertVersionString,
  restoreImportMeta,
  resolveAsync,
} from "@m2c2kit/build-helpers";

const canvasKitWasmVersion = (await resolveAsync("canvaskit-wasm")).package
  .version;
if (!canvasKitWasmVersion) {
  throw new Error("canvaskit-wasm package not found");
}

export default [
  {
    input: ["./src/index.ts"],
    output: [
      { file: "./build/index.js", format: "es", sourcemap: true },
      {
        file: "./build/index.min.js",
        format: "es",
        plugins: [minify()],
      },
    ],
    plugins: [
      insertVersionString(),
      replace({
        __CANVASKITWASM_VERSION__: canvasKitWasmVersion,
        preventAssignment: true,
      }),
      nodeResolve(),
      commonjs(),
      // nodePolyfills is needed because canvaskit-wasm references path and fs
      nodePolyfills(),
      esbuild(),
      restoreImportMeta(),
    ],
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
          {
            // rollup-plugin-copy doesn't like windows backslashes
            src: findup(
              "node_modules/canvaskit-wasm/bin/canvaskit.wasm",
            ).replace(/\\/g, "/"),
            dest: "assets",
            rename: () => `canvaskit-${canvasKitWasmVersion}.wasm`,
          },
        ],
      }),
    ],
  },
];
