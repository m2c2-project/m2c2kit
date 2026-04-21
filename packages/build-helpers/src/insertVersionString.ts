import { readFileSync } from "fs";
import { execSync } from "child_process";
import type { Plugin } from "rolldown";

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

  const shortCommitHash = execSync("git rev-parse HEAD")
    .toString()
    .trim()
    .slice(0, 8);

  const replacementValue = `${pkg.version} (${shortCommitHash})`;
  const targetTag = "__PACKAGE_JSON_VERSION__";

  return {
    name: "insert-version-string",
    transform(code) {
      if (!code.includes(targetTag)) {
        return null;
      }
      const transformedCode = code.replaceAll(targetTag, replacementValue);
      return {
        code: transformedCode,
        map: null,
      };
    },
  };
};
