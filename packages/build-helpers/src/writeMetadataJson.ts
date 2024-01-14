import { readFileSync, writeFileSync } from "fs";

/**
 * Adds dependencies to `metadata.json` file
 *
 * @remarks This function reads the dependencies from `package.json` and adds
 * them to the file `metadata.json`. This is used to keep track of the
 * dependencies of each version (past and present). This is used when building
 * `@m2c2kit/core` and `@m2c2kit/addons` packages. End users will not need
 * to use this function.
 */
export function writeMetadataJson() {
  const pkg = JSON.parse(readFileSync("./package.json", "utf8"));
  const metadata = JSON.parse(readFileSync("./metadata.json", "utf8"));
  metadata.versions[pkg.version] = { dependencies: pkg["dependencies"] ?? {} };
  writeFileSync("./metadata.json", JSON.stringify(metadata));
}
