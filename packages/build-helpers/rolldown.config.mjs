import { defineConfig } from "rolldown";
import { dts } from "rolldown-plugin-dts";
import { isAbsolute } from "node:path";

export default defineConfig([
  {
    input: "./src/index.ts",
    platform: "node",
    output: [
      { file: "./dist/index.js", format: "es", sourcemap: true },
      {
        file: "./dist/index.min.js",
        format: "es",
        minify: true,
      },
    ],
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
    // Silence a false-positive during the dts plugin phase.
    // The plugin feeds .d.ts files to Rolldown, which misinterprets a virtual
    // TS augmentation for `estree.Decorator` in the type space as missing
    // executable JS.
    onwarn(warning, defaultHandler) {
      if (
        warning.code === "IMPORT_IS_UNDEFINED" &&
        warning.message.includes("estree")
      ) {
        return; // swallow only this specific false-positive
      }
      defaultHandler(warning);
    },
  },
]);
