import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import copy from "rollup-plugin-copy";
import del from "rollup-plugin-delete";
import dts from "rollup-plugin-dts";
import terser from "@rollup/plugin-terser";

export default [
  {
    input: ["./src/index.ts"],
    // the output is build because we need a later step to
    // combine all declaration files
    output: [{ dir: "./build", format: "es", sourcemap: true }],
    external: ["@m2c2kit/core"],
    plugins: [
      del({ targets: ["dist/*", "build/*"] }),
      nodeResolve(),
      typescript({
        outputToFilesystem: true,
      }),
      terser(),
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
        targets: [
          {
            // copy the bundled esm module and sourcemap to dist
            src: "build/index.*",
            dest: ["dist/"],
          },
        ],
      }),
    ],
  },
];
