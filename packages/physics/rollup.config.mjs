import esbuild from "rollup-plugin-esbuild";
import { minify } from "rollup-plugin-esbuild";
import copy from "rollup-plugin-copy";
import dts from "rollup-plugin-dts";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
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
        file: "./build-nobundler/m2c2kit.physics.esm.js",
        format: "es",
        paths: {
          "@m2c2kit/core": "./m2c2kit.core.esm.js",
        },
        sourcemap: false,
      },
      {
        file: "./build-nobundler/m2c2kit.physics.esm.min.js",
        format: "es",
        paths: {
          "@m2c2kit/core": "./m2c2kit.core.esm.min.js",
        },
        sourcemap: false,
        plugins: [minify()],
      },
    ],
    plugins: [
      replace({
        __PACKAGE_JSON_VERSION__: `${pkg.version} (${shortCommitHash})`,
        preventAssignment: true,
      }),
      nodeResolve(),
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
            dest: "build-nobundler/",
            rename: () => "m2c2kit.physics.esm.d.ts",
          },
          {
            src: "dist/index.d.ts",
            dest: "build-nobundler/",
            rename: () => "m2c2kit.physics.esm.min.d.ts",
          },
        ],
      }),
    ],
  },
];
