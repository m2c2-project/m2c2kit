import * as url from "url";
import * as fs from "fs";
import * as path from "path";
import process from "process";
import child_process from "child_process";
import chalk from "chalk";
import Semver from "semver";

/**
 * The script sets a GitHub Actions environment variable called
 * PUBLISHED_UPDATED_PACKAGES to true if 1) there were updated packages,
 * and 2) all updated packages were successfully published to the registry.
 */

/**
 * In the GitHub action, set the environment variable REGISTRY_URL to the
 * registry you want to publish to.
 */
const REGISTRY_URL = process.env.REGISTRY_URL;

if (!REGISTRY_URL) {
  console.error("REGISTRY_URL environment variable not set.");
  process.exit(1);
}

const verbose = process.argv.includes("--verbose");

/**
 * These are the packages that will be published to the registry. We will
 * manually update these as needed.
 */
const packageNamesToPublish = [
  "@m2c2kit/core",
  "@m2c2kit/addons",
  "@m2c2kit/session",
  "@m2c2kit/physics",
  "@m2c2kit/embedding",
  "@m2c2kit/db",
  "@m2c2kit/cli",
  "@m2c2kit/schematics",
  "@m2c2kit/build-helpers",
  "@m2c2kit/schema-util",
  "@m2c2kit/survey",
  "@m2c2kit/assessment-color-dots",
  "@m2c2kit/assessment-color-shapes",
  "@m2c2kit/assessment-grid-memory",
  "@m2c2kit/assessment-symbol-search",
];

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const packagesPath = path.join(__dirname, "..", "packages");
/**
 * Inspect the packages folder and returns an object with the package
 * name as the key and the package path as the value
 */
function makePackageDictionary(folder) {
  const packageDictionary = {};
  const packageFolders = fs
    .readdirSync(folder)
    .filter((file) => fs.lstatSync(path.join(folder, file)).isDirectory());
  for (const packageFolder of packageFolders) {
    const packagePath = path.join(folder, packageFolder);
    const packageJsonPath = path.join(packagePath, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString());
    packageDictionary[packageJson.name] = {
      path: packageJsonPath,
      localVersion: packageJson.version,
    };
  }
  return packageDictionary;
}

const packageDictionary = makePackageDictionary(packagesPath);

// remove packages that are not in the array of packageNamesToPublish
for (const packageName of Object.keys(packageDictionary)) {
  if (!packageNamesToPublish.includes(packageName)) {
    delete packageDictionary[packageName];
  }
}

// check the registry using an api call to get the version of each package in packageDictionary
async function getPackageVersions(packageDictionary) {
  const packageNames = Object.keys(packageDictionary);

  const getVersionPromises = packageNames.map(async (packageName) => {
    const response = await fetch(`${REGISTRY_URL}/${packageName}/latest`);
    return response.json().then((data) => {
      packageDictionary[packageName].registryVersion = data.version ?? "0.0.0";
    });
  });

  await Promise.all(getVersionPromises);
  return packageDictionary;
}

function countNewPackages(packageDictionary) {
  const packageNames = Object.keys(packageDictionary);
  return packageNames.reduce((count, packageName) => {
    if (
      Semver.gt(
        packageDictionary[packageName].localVersion,
        packageDictionary[packageName].registryVersion,
      )
    ) {
      return count + 1;
    } else {
      return count;
    }
  }, 0);
}

async function publishPackagesIfNewer(packageDictionary) {
  const packageNames = Object.keys(packageDictionary);
  const publishPromises = packageNames
    .filter((packageName) =>
      Semver.gt(
        packageDictionary[packageName].localVersion,
        packageDictionary[packageName].registryVersion,
      ),
    )
    .map(async (packageName) => {
      return new Promise((resolve) => {
        child_process.exec(
          `npm publish -w ${packageName} --registry ${REGISTRY_URL} --access public`,
          (error) => {
            if (error) {
              resolve({
                packageName: packageName,
                message: `${packageName}@${packageDictionary[packageName].localVersion} failed: ${error}`,
                error: true,
              });
            } else {
              resolve({
                packageName: packageName,
                message: `${packageName}@${packageDictionary[packageName].localVersion} OK.`,
                error: false,
              });
            }
          },
        );
      });
    });
  return Promise.all(publishPromises);
}

if (verbose) {
  console.log(
    `Comparing local repository package versions to registry ${REGISTRY_URL}:`,
  );
}

await getPackageVersions(packageDictionary);

if (verbose) {
  const packageNames = Object.keys(packageDictionary);
  packageNames.forEach((packageName) => {
    let registryVersion;
    if (packageDictionary[packageName].registryVersion === "0.0.0") {
      registryVersion = chalk.cyanBright("not published yet");
    } else {
      registryVersion = `registry ${packageDictionary[packageName].registryVersion}`;
    }
    console.log(
      `  ${packageName}: local ${packageDictionary[packageName].localVersion}, ${registryVersion}`,
    );
  });
}

if (countNewPackages(packageDictionary) === 0) {
  console.log("No updated packages to publish.");
  // GitHub Actions syntax to set an environment variable for subsequent steps in this job
  child_process.execSync(
    'echo "PUBLISHED_UPDATED_PACKAGES=false" >> $GITHUB_ENV',
  );
  // GitHub Actions syntax to set an environment variable for subsequent jobs
  child_process.execSync(
    'echo "::set-env name=PUBLISHED_UPDATED_PACKAGES::false"',
  );
  process.exit(0);
} else {
  console.log(
    `Publishing ${countNewPackages(
      packageDictionary,
    )} updated packages to registry ${REGISTRY_URL}...`,
  );
}

const results = await publishPackagesIfNewer(packageDictionary);
results.forEach((result) => {
  console.log(
    chalk[result.error ? "red" : "reset"]("  " + result.message.trim()),
  );
});
const error = results.some((result) => result.error);
if (error) {
  child_process.execSync(
    'echo "PUBLISHED_UPDATED_PACKAGES=false" >> $GITHUB_ENV',
  );
  child_process.execSync(
    'echo "::set-env name=PUBLISHED_UPDATED_PACKAGES::false"',
  );
} else {
  child_process.execSync(
    'echo "PUBLISHED_UPDATED_PACKAGES=true" >> $GITHUB_ENV',
  );
  child_process.execSync(
    'echo "::set-env name=PUBLISHED_UPDATED_PACKAGES::true"',
  );
}
process.exit(error ? 1 : 0);
