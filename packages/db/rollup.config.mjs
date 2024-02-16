import nodeResolve from "@rollup/plugin-node-resolve";
import esbuild from "rollup-plugin-esbuild";
import { minify } from "rollup-plugin-esbuild";
import copy from "rollup-plugin-copy";
import dts from "rollup-plugin-dts";
import { writeMetadataJson } from "@m2c2kit/build-helpers";

writeMetadataJson();

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
        file: "./build-nobundler/m2c2kit.db.esm.js",
        format: "es",
        paths: {
          "@m2c2kit/core": "./m2c2kit.core.esm.js",
        },
        sourcemap: false,
      },
      {
        file: "./build-nobundler/m2c2kit.db.esm.min.js",
        format: "es",
        paths: {
          "@m2c2kit/core": "./m2c2kit.core.esm.min.js",
        },
        sourcemap: false,
        plugins: [minify()],
      },
    ],
    plugins: [nodeResolve(), esbuild()],
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
            rename: () => "m2c2kit.db.esm.d.ts",
          },
          {
            src: "dist/index.d.ts",
            dest: "build-nobundler/",
            rename: () => "m2c2kit.db.esm.min.d.ts",
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

// export default [
//   {
//     input: ["./src/index.ts"],
//     // the output is build because we need a later step to
//     // combine all declaration files
//     output: [{ dir: "./build", format: "es", sourcemap: true }],
//     plugins: [
//       nodeResolve(),
//       del({
//         targets: ["dist/*", "build/*", "build-nobundler/*"],
//       }),
//       typescript({
//         // I was getting errors when defining include and exclude
//         // only in tsconfig.json, thus defining them here.
//         // note, however, because I specified rootDir below,
//         // the include and exclude now are relative to src
//         include: ["./**/*.[tj]s"],
//         exclude: ["**/__tests__", "**/*.test.ts"],
//         rootDir: "src",
//         outputToFilesystem: true,
//       }),
//     ],
//   },

//   {
//     // bundle all declaration files and place the declaration
//     // bundle in dist
//     input: "./build/index.d.ts",
//     output: [{ file: "dist/index.d.ts", format: "es" }],
//     plugins: [
//       dts(),
//       copy({
//         targets: [
//           {
//             // copy the bundled esm module and sourcemap to dist
//             src: "build/index.*",
//             dest: "dist",
//           },
//         ],
//       }),
//     ],
//   },

//   {
//     input: ["./src/data.ts"],
//     output: [{ file: "./build/data.js", format: "es" }],
//     plugins: [
//       nodeResolve(),
//       typescript({
//         // I was getting errors when defining include and exclude
//         // only in tsconfig.json, thus defining them here.
//         // note, however, because I specified rootDir below,
//         // the include and exclude now are relative to src
//         include: ["./**/*.[tj]s"],
//         exclude: ["**/__tests__", "**/*.test.ts"],
//         rootDir: "src",
//         outputToFilesystem: true,
//         sourceMap: false,
//       }),
//       copy({
//         targets: [
//           {
//             src: "build/data.js",
//             dest: "dist",
//           },
//         ],
//         hook: "writeBundle",
//       }),
//     ],
//   },
// ];
