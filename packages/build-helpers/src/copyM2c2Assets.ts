import copy from "recursive-copy";
import { lstatSync, existsSync, renameSync } from "fs";
import path from "path";
import { getFileHash } from "./getFileHash";
import { getCanvasKitWasmPath } from "./getCanvasKitWasmPath";

export function copyM2c2Assets(
  from: string,
  to: string,
  renameWithHash = false,
  options = {}
) {
  return {
    name: "copy-m2c2-assets",
    writeBundle: async () => {
      if (!existsSync(from)) {
        return;
      }

      options = { ...options, overwrite: true };
      const results = await copy(from, to, options);

      const canvasKitPath = getCanvasKitWasmPath();
      if (canvasKitPath) {
        const ckResults = await copy(path.dirname(canvasKitPath), to, {
          ...options,
          filter: ["canvaskit.wasm"],
        });
        results.push(...ckResults);
      }

      if (!renameWithHash) {
        return;
      }

      for (const result of results) {
        if (lstatSync(result.dest).isDirectory()) {
          continue;
        }
        let filepath = result.dest;
        const hash = getFileHash(filepath);
        const ext = path.extname(filepath);

        if (ext) {
          filepath = filepath.replace(ext, `.${hash}${ext}`);
        } else {
          filepath = filepath + `.${hash}`;
        }
        renameSync(result.dest, filepath);
      }
    },
  };
}
