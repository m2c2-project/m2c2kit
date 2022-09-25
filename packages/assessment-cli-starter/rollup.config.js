import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

export default [
  {
    input: ["./src/index.ts"],
    output: [{ dir: "./dist", format: "es", sourcemap: true }],
    external: ["@m2c2kit/core", "@m2c2kit/addons"],
    plugins: [typescript({ outputToFilesystem: true })],
  },

  // Make minified esm bundle for development without a bundler
  {
    input: "./src/index.ts",
    output: [
      {
        file: "./build-nobundler/m2c2kit.assessment-cli-starter.esm.min.js",
        format: "es",
      },
    ],
    plugins: [
      nodeResolve(),
      typescript({
        outputToFilesystem: true,
        // tsconfig.json defined the outDir as build, so we must
        // use a different one for this build
        outDir: "./build-nobundler",
        sourceMap: false,
      }),
      terser(),
    ],
  },
];
