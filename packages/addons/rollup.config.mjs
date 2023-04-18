import esbuild from "rollup-plugin-esbuild";
import { minify } from "rollup-plugin-esbuild";
import copy from "rollup-plugin-copy";
import { getBabelOutputPlugin } from "@rollup/plugin-babel";
import dts from "rollup-plugin-dts";

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
        file: "./build-nobundler/m2c2kit.addons.esm.js",
        format: "es",
        paths: {
          "@m2c2kit/core": "./m2c2kit.core.esm.js",
        },
        sourcemap: false,
      },
      {
        file: "./build-nobundler/m2c2kit.addons.esm.min.js",
        format: "es",
        paths: {
          "@m2c2kit/core": "./m2c2kit.core.esm.min.js",
        },
        sourcemap: false,
        plugins: [minify()],
      },
      // Make a UMD bundle only to use for testing (jest), because jest support
      // for esm modules is still incomplete
      {
        file: "./build-umd/index.js",
        format: "umd",
        name: "m2c2kit",
        globals: {
          "@m2c2kit/core": "core",
        },
        plugins: [
          getBabelOutputPlugin({
            allowAllFormats: true,
            presets: ["@babel/preset-env"],
          }),
        ],
        sourcemap: true,
      },
    ],
    plugins: [esbuild()],
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
            src: "dist/index.d.ts",
            dest: "build-umd/",
          },
          {
            src: "dist/index.d.ts",
            dest: "build-nobundler/",
            rename: () => "m2c2kit.addons.esm.d.ts",
          },
          {
            src: "dist/index.d.ts",
            dest: "build-nobundler/",
            rename: () => "m2c2kit.addons.esm.min.d.ts",
          },
        ],
      }),
    ],
  },
];
