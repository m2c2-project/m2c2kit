import copy from "recursive-copy";
import { lstatSync, existsSync, renameSync } from "fs";
import path from "path";
import { getFileHash } from "./getFileHash";

export function copyM2c2Resources(
  from: string,
  to: string,
  renameWithHash = false,
  options = {}
) {
  return {
    name: "copy-m2c2-resources",
    buildEnd: async () => {
      if (!existsSync(from)) {
        return;
      }

      options = { ...options, overwrite: true };
      const results = await copy(from, to, options);

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
