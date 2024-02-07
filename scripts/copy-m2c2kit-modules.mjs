/**
 * Copies the dist and assets folders of each package, plus other relevant
 * files, to the examples/no-js-bundler-development/modules/@m2c2kit folder.
 *
 * This script must be run from the root of the repository.
 */
import cpy from "cpy";

const packages = [
  "core",
  "session",
  "addons",
  "physics",
  "survey",
  "embedding",
  "db",
  "assessment-color-dots",
  "assessment-color-shapes",
  "assessment-grid-memory",
  "assessment-symbol-search",
];

await Promise.all(
  packages
    .map(async (pkg) => {
      return [
        cpy(
          [`packages/${pkg}/dist/**/*`],
          `examples/no-js-bundler-development/modules/@m2c2kit/${pkg}/dist`,
        ),
        cpy(
          [`packages/${pkg}/assets/**/*`],
          `examples/no-js-bundler-development/modules/@m2c2kit/${pkg}/assets`,
        ),
        cpy(
          [
            `packages/${pkg}/README.md*`,
            `packages/${pkg}/LICENSE*`,
            `packages/${pkg}/metadata.json*`,
          ],
          `examples/no-js-bundler-development/modules/@m2c2kit/${pkg}`,
        ),
      ];
    })
    .flat(),
);
