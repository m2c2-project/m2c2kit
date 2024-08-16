// @ts-check
import * as fs from "node:fs";
import path from "node:path";
import url from "node:url";

/**
 * Assessment packages from this repo to list as part of this registry package. This must be manually updated.
 */
const pkgs = [
  "@m2c2kit/assessment-symbol-search",
  "@m2c2kit/assessment-color-shapes",
  "@m2c2kit/assessment-grid-memory",
  "@m2c2kit/assessment-color-dots",
];

/** Registry URL where these assessment packages are located. */
const REGISTRY_URL = "https://registry.npmjs.org";

/**
 * @typedef {Object} NpmPackageMetadata
 * @property {string} name
 * @property {Object} dist-tags
 * @property {string} dist-tags.latest
 * @property {Object.<string, VersionInfo>} versions
 * @property {Object.<string, string>} time
 */

/**
 * @typedef {Object} VersionInfo
 * @property {string} name
 * @property {string} version
 * @property {string} description
 */

/**
 * @typedef RegistryAssessmentPackage - Metadata for an assessment package in the registry
 * @type {object}
 * @property {string} name - name of the assessment package from its `package.json`
 * @property {string} [registryUrl] - URL of the registry where the assessment package is published.
 * @property {string} latest - latest version of the assessment package available in the registry
 * @property {string} latestTime - ISO 8601 timestamp of the latest version of the assessment package available in the registry
 * @property {Array<string>} versions - versions of the assessment package available in the registry
 * @property {string} description - description of the assessment package, from the latest version's `package.json`
 */

/**
 * @typedef {Object} AssessmentsRegistry - A listing of assessments available in the registry
 * @property {string} version - version of the assessment registry file
 * @property {string} time - ISO 8601 timestamp of the assessment registry file
 * @property {Array<RegistryAssessmentPackage>} assessments - assessment packages available in the registry
 */

/**
 * Fetches metadata for an NPM package from the registry.
 *
 * @param {string} registryUrl
 * @param {string} packageName
 * @returns metadata for the package
 */
async function getNpmPackageMetadata(registryUrl, packageName) {
  const url = `${registryUrl}/${packageName}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          `Metadata download failed for ${packageName} from ${url} with status: ${response.status}\n` +
            `This is likely an authentication/authorization problem.\n- Does the registry need an authentication token?`,
        );
      } else {
        throw new Error(
          `Metadata download failed for ${packageName} from ${url} with status: ${response.status}`,
        );
      }
    }
    try {
      /** @type {NpmPackageMetadata} */
      const data = await response.json();
      if (!data.name && !data["dist-tags"] && !data.versions && !data.time) {
        throw new Error(
          `Error in metadata for ${packageName} from ${url}. It does not contain expected fields. Got: ${JSON.stringify(data)}`,
        );
      }
      return data;
    } catch (error) {
      throw new Error(
        `Error parsing metadata for ${packageName} from ${url}: ${error.message}. Got: ${await response.text()}`,
      );
    }
  } catch (error) {
    throw new Error(
      `Error fetching metadata for ${packageName} from ${url}: ${error.message}`,
    );
  }
}

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

/** @type {Array<RegistryAssessmentPackage>} */
const assessments = [];

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

await Promise.all(
  pkgs.map(async (pkg) => {
    const metadata = await getNpmPackageMetadata(REGISTRY_URL, pkg);

    /**
     * It is assumed that all assessment packages directories are located in
     * parent directory of this script
     */
    const packagesPath = path.join(__dirname, "..");

    const packageJsonPath = getPackageJsonPaths(packagesPath)
      .filter((p) => {
        const packageJson = JSON.parse(fs.readFileSync(p).toString());
        return pkg.includes(packageJson.name);
      })
      .find(Boolean);

    if (!packageJsonPath) {
      throw new Error(`Could not find package.json for ${pkg}`);
    }
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString());

    const latestVersion = packageJson.version;
    /**
     * Use the current time as the latest time, since we don't have access to
     * the actual publish time of the latest version in the registry: that will
     * happen in a later step of the GitHub Actions workflow.
     */
    const latestTime = new Date().toISOString();
    const description = packageJson.description;
    /**
     * It's possible that the latest version in this repo is already in the
     * registry, so use Set to remove duplicates.
     */
    const versions = [
      ...new Set([...Object.keys(metadata.versions), latestVersion]),
    ];

    const assessment = {
      name: pkg,
      registryUrl: REGISTRY_URL,
      description: description,
      latest: latestVersion,
      latestTime: latestTime,
      versions: versions,
    };

    assessments.push(assessment);
  }),
);

// get package.json version of this repo
const version = JSON.parse(fs.readFileSync("package.json", "utf-8")).version;

/** @type {AssessmentsRegistry} */
const assessmentsRegistry = {
  version: version,
  time: new Date().toISOString(),
  assessments: assessments,
};

if (!fs.existsSync("dist")) {
  fs.mkdirSync("dist");
}

// write JSON to file in dist
fs.writeFileSync(
  "dist/assessments-registry.json",
  JSON.stringify(assessmentsRegistry, null, 2),
);

// write an importable JS file in dist
const tsDoc = `/**
 * @typedef RegistryAssessmentPackage - Metadata for an assessment package in the registry
 * @type {object}
 * @property {string} name - name of the assessment package from its \`package.json\`
 * @property {string} [registryUrl] - URL of the registry where the assessment package is published.
 * @property {string} latest - latest version of the assessment package available in the registry
 * @property {string} latestTime - ISO 8601 timestamp of the latest version of the assessment package available in the registry
 * @property {Array<string>} versions - versions of the assessment package available in the registry
 * @property {string} description - description of the assessment package, from the latest version's \`package.json\`
 */

/**
 * @typedef {Object} AssessmentsRegistry - A listing of assessments available in the registry
 * @property {string} version - version of the assessment registry file
 * @property {string} time - ISO 8601 timestamp of the assessment registry file
 * @property {Array<RegistryAssessmentPackage>} assessments - assessment packages available in the registry
 */

/** @type {AssessmentsRegistry} */
`;
const indexJs =
  tsDoc +
  "\n" +
  `const assessmentsRegistry = ${JSON.stringify(assessmentsRegistry, null, 2)};
export { assessmentsRegistry };
`;
fs.writeFileSync("dist/index.js", indexJs);
