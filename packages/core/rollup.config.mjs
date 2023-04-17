import esbuild from "rollup-plugin-esbuild";
import { minify } from "rollup-plugin-esbuild";
import nodeResolve from "@rollup/plugin-node-resolve";
import nodePolyfills from "rollup-plugin-polyfill-node";
import commonjs from "@rollup/plugin-commonjs";
import copy from "rollup-plugin-copy";
import { getBabelOutputPlugin } from "@rollup/plugin-babel";
import dts from "rollup-plugin-dts";
import findup from "findup-sync";
import replace from "@rollup/plugin-replace";
import { readFileSync } from "fs";
import child_process from "child_process";

const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8")
);

const shortCommitHash = child_process
  .execSync("git rev-parse HEAD")
  .toString()
  .trim()
  .slice(0, 8);

// rollup-plugin-copy doesn't like windows backslashes
const canvaskitWasmPath = findup(
  "node_modules/canvaskit-wasm/bin/canvaskit.wasm"
).replace(/\\/g, "/");

// I could not get @rollup/plugin-typescript to work with the
// emitDeclarationOnly option. Thus, as part of the build script in
// package.json, before rollup is run, tsc is run to generate the
// declaration files used by rollup-plugin-dts.

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
      // Make a UMD bundle only to use for testing (jest), because jest support
      // for esm modules is still incomplete
      {
        file: "./build-umd/index.js",
        format: "umd",
        name: "m2c2kit",
        plugins: [
          getBabelOutputPlugin({
            allowAllFormats: true,
            presets: ["@babel/preset-env"],
          }),
        ],
        sourcemap: true,
      },
    ],
    plugins: [
      replace({
        __PACKAGE_JSON_VERSION__: `${pkg.version} (${shortCommitHash})`,
        preventAssignment: true,
      }),
      nodeResolve(),
      commonjs(),
      nodePolyfills(),
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
        // hook must be 'closeBundle' because we need dist/index.d.ts to
        // be created before we can copy it
        hook: "closeBundle",
        targets: [
          {
            src: "build/index.js*",
            dest: "dist",
          },
          {
            src: canvaskitWasmPath,
            dest: "assets",
          },
          {
            src: "dist/index.d.ts",
            dest: "build-umd/",
          },
          {
            src: "build/index.js",
            dest: "build-nobundler/",
            rename: () => "m2c2kit.core.esm.js",
            transform: (contents) =>
              contents
                .toString()
                .replace("//# sourceMappingURL=index.js.map\n", ""),
          },
          {
            src: "dist/index.d.ts",
            dest: "build-nobundler/",
            rename: () => "m2c2kit.core.esm.d.ts",
          },
          {
            src: "build/index.min.js",
            dest: "build-nobundler/",
            rename: () => "m2c2kit.core.esm.min.js",
          },
          {
            src: "dist/index.d.ts",
            dest: "build-nobundler/",
            rename: () => "m2c2kit.core.esm.min.d.ts",
          },
        ],
      }),
    ],
  },
];
