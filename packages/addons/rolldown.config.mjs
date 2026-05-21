import { dts } from "rolldown-plugin-dts";
import { defineConfig } from "rolldown";
import { insertVersionString } from "@m2c2kit/build-helpers";

export default defineConfig([
  {
    input: "./src/index.ts",
    transform: {
      target: "es2017",
    },
    external: ["@m2c2kit/core"],
    platform: "browser",
    output: [
      { file: "./dist/index.js", format: "es", sourcemap: true },
      {
        file: "./dist/index.min.js",
        format: "es",
        minify: true,
      },
    ],
    plugins: [insertVersionString()],
  },
  // Declaration bundling
  {
    input: "./build/index.d.ts",
    // Keep core types external so they are imported rather than inlined
    // Was not needed in rollup-plugin-dts but is for rolldown-plugin-dts
    external: ["@m2c2kit/core"],
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts()],
  },
]);
