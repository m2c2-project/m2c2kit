import { defineConfig } from "rolldown";
import { dts } from "rolldown-plugin-dts";
import { isAbsolute } from "node:path";

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
  },
  {
    input: "./src/data.ts",
    transform: {
      target: "es2017",
    },
    platform: "browser",
    output: [{ file: "./dist/data.js", format: "es", sourcemap: true }],
  },
  // Declaration bundling
  {
    input: "./build/index.d.ts",
    // Only bundle our own types, not external dependencies.
    external: (id) => {
      // If it's a relative path or an absolute path (C:\, D:\, /Users/...), bundle it.
      if (id.startsWith(".") || isAbsolute(id)) {
        return false;
      }
      // Otherwise, it's a bare import from node_modules. Externalize it.
      return true;
    },
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts()],
  },
]);
