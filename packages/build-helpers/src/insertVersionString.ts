import replace from "@rollup/plugin-replace";
import { readFileSync } from "fs";
import child_process from "child_process";
import { Plugin } from "rollup";

/**
 * Replaces the string `__PACKAGE_JSON_VERSION__` with version information.
 *
 * @remarks This plugin gets the version string from the `package.json` file
 * and the short commit hash from git. It finds the string
 * `__PACKAGE_JSON_VERSION__` and replaces it with the version string and the
 * short commit hash in the form of `version (shortCommitHash)`.
 */
export const insertVersionString = (): Plugin => {
  const pkg = JSON.parse(readFileSync("./package.json", "utf8"));

  const shortCommitHash = child_process
    .execSync("git rev-parse HEAD")
    .toString()
    .trim()
    .slice(0, 8);

  return replace({
    __PACKAGE_JSON_VERSION__: `${pkg.version} (${shortCommitHash})`,
    preventAssignment: true,
  });
};
