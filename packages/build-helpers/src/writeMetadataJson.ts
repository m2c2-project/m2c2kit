import { readFileSync, writeFileSync } from "fs";

/**
 * Adds dependencies to `metadata.json` file
 *
 * @remarks This function reads the m2c2kit dependencies (packages in the
 * m2c2kit scope) from `package.json` and adds them to the file
 * `metadata.json`. This is used to keep track of the dependencies of each
 * version (past and present).
 *
 * This is used only when creating assessments that are modules.
 */
export function writeMetadataJson() {
  const pkg = JSON.parse(readFileSync("./package.json", "utf8"));

  let metadata;
  try {
    metadata = JSON.parse(readFileSync("./metadata.json", "utf8"));
  } catch (e) {
    metadata = { versions: {} };
  }
  metadata.version = pkg.version;
  for (const dependency in pkg["dependencies"]) {
    if (dependency.startsWith("@m2c2kit/")) {
      if (!metadata.versions[pkg.version]) {
        metadata.versions[pkg.version] = { dependencies: {} };
      }
      metadata.versions[pkg.version].dependencies[dependency] =
        pkg["dependencies"][dependency];
    }
  }
  writeFileSync("./metadata.json", JSON.stringify(metadata));
}
