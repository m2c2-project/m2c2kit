import { defineConfig } from "rolldown";
import { addModuleMetadata, insertVersionString } from "@m2c2kit/build-helpers";

export default defineConfig([
  {
    input: "./src/index.ts",
    external: ["@m2c2kit/core", "@m2c2kit/addons"],
    platform: "browser",
    output: [
      { file: "./dist/index.js", format: "es", sourcemap: true },
      {
        file: "./dist/index.min.js",
        format: "es",
        minify: true,
      },
    ],
    plugins: [insertVersionString(), addModuleMetadata()],
  },
]);
