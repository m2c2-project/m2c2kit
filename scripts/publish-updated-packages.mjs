// @ts-check

import * as url from "url";
import * as fs from "fs";
import * as path from "path";
import process from "process";
import child_process from "child_process";
import Semver from "semver";

/**
 * These are the packages that will be published to the registries. We will
 * manually update these as needed. If the package is to be published somewhere
 * other than the public registry, then its `package.json` file must:
 * 1. Have a `publishConfig` field with the registry URL.
 * 2. Have a `name` starting with the organization scope, e.g. `@org-name/`.
 */
const packagesToPublish = [
  "@m2c2kit/core",
  "@m2c2kit/addons",
  "@m2c2kit/session",
  "@m2c2kit/physics",
  "@m2c2kit/data-calc",
  "@m2c2kit/embedding",
  "@m2c2kit/db",
  "@m2c2kit/cli",
  "@m2c2kit/schematics",
  "@m2c2kit/build-helpers",
  "@m2c2kit/schema-util",
  "@m2c2kit/survey",
  "@m2c2kit/assessments-registry",
  "@m2c2kit/assessment-color-dots",
  "@m2c2kit/assessment-color-shapes",
  "@m2c2kit/assessment-grid-memory",
  "@m2c2kit/assessment-symbol-search",
];

/**
 * A "public package" is a package that will be published to the public
 * registry, which is typically the npm registry.
 *
 * The script sets a GitHub Actions environment variable called
 * PUBLIC_PACKAGES_OK to true if:
 * 1. There were updated public packages and all were successfully built and
 * published to the public registry, or
 * 2. There were no updated public packages.
 *
 * Errors in building or publishing other packages will not affect the value
 * of PUBLIC_PACKAGES_OK.
 */

/**
 * In the GitHub action, set the environment variable PUBLIC_REGISTRY_URL to the
 * public registry. This is typically the npm registry, and it is the default
 * value if PUBLIC_REGISTRY_URL is not set.
 */
const PUBLIC_REGISTRY_URL =
  process.env.PUBLIC_REGISTRY_URL ?? "https://registry.npmjs.org";
/**
 * In the GitHub action, set the environment variable ORG_NPM_TOKEN to the
 * secret that is the token to publish to the organization's registry.
 */
const ORG_NPM_TOKEN = process.env.ORG_NPM_TOKEN;
const verbose = process.argv.includes("--verbose");

/**
 * The GitHub Action (.yml file in .github/workflows) would be similar to:
 *
 * ```yaml
 * env:
 *   PUBLIC_REGISTRY_URL: https://registry.npmjs.org
 *   ORG_NPM_TOKEN: ${{ secrets.ORG_NPM_TOKEN }}
 *   <other environment variables needed by the action>
 * ```
 *
 * The `ORG_NPM_TOKEN` is a GitHub secret that you create in the GitHub
 * repository settings. The value of this secret is the token that has access
 * to your organization's registries. This is typically a GitHub Personal
 * Access Token (PAT) with the `read:packages` and `write:packages` scopes.
 */

/**
 * Returns paths to `package.json` files in directories immediately below
 * specified directory.
 *
 * @param {string} dir - directory containing directories of npm projects
 * @returns filepaths to `package.json` files
 */
function getPackageJsonPaths(dir) {
  /** @type {Array<string>} */
  const results = [];

  const subfolders = fs.readdirSync(dir).filter((subfolder) => {
    const fullPath = path.join(dir, subfolder);
    return fs.statSync(fullPath).isDirectory();
  });

  subfolders.forEach((subfolder) => {
    const packageJsonPath = path.join(dir, subfolder, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      results.push(packageJsonPath);
    }
  });

  return results;
}

/**
 * Fetches the latest version number of a package from a registry.
 *
 * @remarks A token will be needed if the registry does not allow anonymous
 * public access.
 *
 * @param {string} packageName - name of the package
 * @param {string} registryUrl - URL of the registry
 * @param {string | undefined} token - token to access the registry
 * @returns {Promise<string>} latest version number
 */
async function getRegistryLatestVersion(
  packageName,
  registryUrl,
  token = undefined,
) {
  const auth = token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : undefined;

  const response = await fetch(`${registryUrl}/${packageName}`, {
    headers: auth,
  });
  if (response.status === 404) {
    console.log(
      `${packageName} not found at ${registryUrl}/${packageName}. assuming it is a new package.`,
    );
    return "0.0.0";
  }
  if (response.status >= 400) {
    console.error(
      `failed to fetch ${registryUrl}/${packageName}, error: ${response.status}.`,
    );
    if (response.status === 401 || response.status === 403) {
      console.error(
        `check your token, GitHub Action environment variables, or repository secrets.`,
      );
    }
    process.exit(1);
  }
  return response.json().then((data) => data["dist-tags"].latest ?? "0.0.0");
}

/**
 * @typedef PublishPackageResult
 * @type {object}
 * @property {string} message - message about the result of the publish
 * @property {boolean} error - was there an error?
 */

/**
 * Publishes a package to a registry.
 *
 * @param {"public" | "restricted"} access - access level of the package
 * @param {string | undefined} [workspace] - workspace of the package
 * @returns {Promise<PublishPackageResult>} result of the publish
 */
async function publishPackage(access, workspace = undefined) {
  let workspaceOption = "";
  if (workspace) {
    workspaceOption = ` --workspace ${workspace}`;
  }
  let accessOption = "";
  if (access) {
    accessOption = ` --access ${access}`;
  }

  return new Promise((resolve) => {
    child_process.exec(
      `npm publish ${workspaceOption}${accessOption}`,
      (error) => {
        if (error) {
          resolve({
            message: error.message,
            error: true,
          });
        } else {
          resolve({
            message: "OK",
            error: false,
          });
        }
      },
    );
  });
}

/**
 * Summarizes the results of publishing packages to the console.
 *
 * @param {number} publicPublishCount
 * @param {number} publicPublishErrors
 * @param {number} orgPublishCount
 * @param {number} orgPublishErrors
 */
function logResultsToConsole(
  publicPublishCount,
  publicPublishErrors,
  orgPublishCount,
  orgPublishErrors,
) {
  console.log();
  console.log(
    `published ${publicPublishCount} public ${publicPublishCount == 1 ? "package" : "packages"}.`,
  );
  console.log(
    `published ${orgPublishCount} organization ${orgPublishCount == 1 ? "package" : "packages"}.`,
  );
  if (publicPublishErrors > 0) {
    console.error(
      `FAILED to publish ${publicPublishErrors} public ${publicPublishErrors == 1 ? "package" : "packages"}.`,
    );
  }
  if (orgPublishErrors > 0) {
    console.error(
      `FAILED to publish ${orgPublishErrors} organization ${orgPublishErrors == 1 ? "package" : "packages"}.`,
    );
  }
}

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
/**
 * It is assumed that this is a monorepo: multiple packages are in directories
 * under a `packages` directory, and this script is executed from a directory
 * parallel to the `packages` directory.
 */
const packagesPath = path.join(__dirname, "..", "packages");
const packageJsonPaths = getPackageJsonPaths(packagesPath).filter((p) => {
  const packageJson = JSON.parse(fs.readFileSync(p).toString());
  return packagesToPublish.includes(packageJson.name);
});

let publicPublishErrors = 0;
let publicPublishCount = 0;
let orgPublishErrors = 0;
let orgPublishCount = 0;

for (const packageJsonPath of packageJsonPaths) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString());
  const packageName = packageJson.name;
  if (typeof packageName !== "string") {
    console.error(`package.json name is not a string in ${packageJsonPath}`);
    process.exit(1);
  }
  const repoVersion = packageJson.version;
  if (typeof repoVersion !== "string") {
    console.error(`package.json version is not a string in ${packageJsonPath}`);
    process.exit(1);
  }

  /**
   * If the package.json file does not have a publishConfig.registry field, the
   * package will be published to the public registry.
   */
  const registryUrl =
    packageJson.publishConfig?.registry ?? PUBLIC_REGISTRY_URL;
  const isPublicPackage = registryUrl === PUBLIC_REGISTRY_URL;
  let token = isPublicPackage ? undefined : ORG_NPM_TOKEN;
  const registryVersion = await getRegistryLatestVersion(
    packageName,
    registryUrl,
    token,
  );

  if (Semver.gt(repoVersion, registryVersion)) {
    if (verbose) {
      console.log(
        `repository package ${packageName} version ${repoVersion} is newer than registry version ${registryVersion}`,
      );
    }

    const access = isPublicPackage ? "public" : "restricted";
    /**
     * We assume that the package is in a workspace (this is a monorepo), and
     * the workspace name is the same as the package name.
     */
    const result = await publishPackage(access, packageName);
    if (result.error) {
      console.error(
        `ERROR. failed to publish ${packageName} to ${registryUrl}. error: ${result.message}`,
      );
      if (isPublicPackage) {
        publicPublishErrors++;
      } else {
        orgPublishErrors++;
      }
      continue;
    }
    console.log(
      `OK. published ${packageName} version ${repoVersion} to ${registryUrl}`,
    );
    if (isPublicPackage) {
      publicPublishCount++;
    } else {
      orgPublishCount++;
    }
  } else {
    if (verbose) {
      console.log(
        `repository package ${packageName} version ${repoVersion} is not newer than registry version ${registryVersion}. skipping publish.`,
      );
    }
  }
}

logResultsToConsole(
  publicPublishCount,
  publicPublishErrors,
  orgPublishCount,
  orgPublishErrors,
);

if (publicPublishErrors > 0) {
  // GitHub Actions syntax to set an environment variable for subsequent steps in this job
  child_process.execSync('echo "PUBLIC_PACKAGES_OK=false" >> $GITHUB_ENV');
  // GitHub Actions syntax to set an environment variable for subsequent jobs
  child_process.execSync('echo "::set-env name=PUBLIC_PACKAGES_OK::false"');
  process.exit(1);
}

if (orgPublishErrors > 0) {
  process.exit(1);
}

child_process.execSync('echo "PUBLIC_PACKAGES_OK=true" >> $GITHUB_ENV');
child_process.execSync('echo "::set-env name=PUBLIC_PACKAGES_OK::true"');
process.exit(0);
