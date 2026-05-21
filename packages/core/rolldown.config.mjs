import nodePolyfills from "rollup-plugin-polyfill-node";
import copy from "rollup-plugin-copy";
import { dts } from "rolldown-plugin-dts";
import findup from "findup-sync";
import { defineConfig } from "rolldown";
import { insertVersionString, resolveAsync } from "@m2c2kit/build-helpers";

const canvasKitWasmVersion = (await resolveAsync("canvaskit-wasm")).package
  .version;
if (!canvasKitWasmVersion) {
  throw new Error("canvaskit-wasm package not found");
}

export default defineConfig([
  {
    input: "./src/index.ts",
    transform: {
      target: "es2017",
    },
    platform: "browser",
    output: [
      { file: "./dist/index.js", format: "es", sourcemap: true },
      {
        file: "./dist/index.min.js",
        format: "es",
        minify: true,
      },
    ],
    plugins: [
      insertVersionString(),
      {
        name: "replace-canvaskit-version",
        renderChunk(code) {
          return code.replace(
            /__CANVASKITWASM_VERSION__/,
            canvasKitWasmVersion,
          );
        },
      },
      // nodePolyfills is needed because canvaskit-wasm references path and fs
      nodePolyfills(),
      // copy canvaskit wasm into `assets/` with the versioned name.
      copy({
        targets: [
          {
            // rollup-plugin-copy doesn't like windows backslashes
            src: findup(
              "node_modules/canvaskit-wasm/bin/canvaskit.wasm",
            ).replace(/\\/g, "/"),
            dest: "assets",
            rename: () => `canvaskit-${canvasKitWasmVersion}.wasm`,
          },
        ],
      }),
    ],
  },
  // Declaration bundling
  {
    input: "./build/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts()],
  },
]);
