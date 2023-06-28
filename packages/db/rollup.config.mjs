import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import copy from "rollup-plugin-copy";
import del from "rollup-plugin-delete";
import dts from "rollup-plugin-dts";

export default [
  {
    input: ["./src/index.ts"],
    // the output is build because we need a later step to
    // combine all declaration files
    output: [{ dir: "./build", format: "es", sourcemap: true }],
    plugins: [
      nodeResolve(),
      del({
        targets: ["dist/*", "build/*", "build-nobundler/*"],
      }),
      typescript({
        // I was getting errors when defining include and exclude
        // only in tsconfig.json, thus defining them here.
        // note, however, because I specified rootDir below,
        // the include and exclude now are relative to src
        include: ["./**/*.[tj]s"],
        exclude: ["**/__tests__", "**/*.test.ts"],
        rootDir: "src",
        outputToFilesystem: true,
      }),
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
      typescript({
        // I was getting errors when defining include and exclude
        // only in tsconfig.json, thus defining them here.
        // note, however, because I specified rootDir below,
        // the include and exclude now are relative to src
        include: ["./**/*.[tj]s"],
        exclude: ["**/__tests__", "**/*.test.ts"],
        rootDir: "src",
        outputToFilesystem: true,
        sourceMap: false,
      }),
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
