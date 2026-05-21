import { defineConfig } from "rolldown";
import { dts } from "rolldown-plugin-dts";
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
    external: ["@m2c2kit/core", "matter-js"],
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts()],
  },
]);
