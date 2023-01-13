import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import replace from "@rollup/plugin-replace";
import { readFileSync } from "fs";

const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8")
);

const sharedPlugins = [
  replace({
    __M2C2KIT_PACKAGE_JSON_VERSION__: pkg.version,
    preventAssignment: true,
  }),
];

export default [
  {
    input: ["./src/index.ts"],
    output: [{ dir: "./dist", format: "es", sourcemap: true }],
    external: ["@m2c2kit/core", "@m2c2kit/addons"],
    plugins: [...sharedPlugins, typescript({ outputToFilesystem: true })],
  },

  // Make minified esm bundle for development without a bundler
  {
    input: "./src/index.ts",
    output: [
      {
        file: "./build-nobundler/m2c2kit.assessment-grid-memory.esm.min.js",
        format: "es",
      },
    ],
    plugins: [
      ...sharedPlugins,
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
