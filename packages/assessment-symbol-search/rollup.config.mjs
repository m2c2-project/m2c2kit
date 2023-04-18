import esbuild from "rollup-plugin-esbuild";
import { minify } from "rollup-plugin-esbuild";
import nodeResolve from "@rollup/plugin-node-resolve";
import copy from "rollup-plugin-copy";
import replace from "@rollup/plugin-replace";
import { readFileSync } from "fs";

const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8")
);
const insertVersionString = replace({
  __PACKAGE_JSON_VERSION__: pkg.version,
  preventAssignment: true,
});

export default [
  {
    input: ["./src/index.ts"],
    external: ["@m2c2kit/core", "@m2c2kit/addons"],
    output: [
      {
        file: "./dist/index.js",
        format: "es",
        sourcemap: true,
      },
    ],
    plugins: [
      insertVersionString,
      esbuild(),
      copy({
        targets: [
          {
            src: "build/index.d.ts",
            dest: "dist",
          },
        ],
      }),
    ],
  },
  {
    input: ["./src/index.ts"],
    output: [
      {
        file: "./build-nobundler/m2c2kit.assessment-symbol-search.esm.min.js",
        format: "es",
        sourcemap: false,
        plugins: [minify()],
      },
    ],
    plugins: [
      insertVersionString,
      nodeResolve(),
      esbuild(),
      copy({
        targets: [
          {
            src: "build/index.d.ts",
            dest: "build-nobundler",
            rename: () => "m2c2kit.assessment-symbol-search.esm.min.d.ts",
          },
        ],
      }),
    ],
  },
];
