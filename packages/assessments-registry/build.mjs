// @ts-check
import * as fs from "node:fs";

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
 * @typedef RegistryAssessmentPackage
 * @type {object}
 * @property {string} name - name of the assessment package. must match the package name in `package.json`
 * @property {string} [registryUrl] - URL of the registry where the assessment package is published. defaults to `https://registry.npmjs.org`
 * @property {string} latest - latest version of the assessment package available in the registry
 * @property {Array<string>} versions - versions of the assessment package available in the registry
 * @property {string} description - description of the assessment package, from the latest version's `package.json`
 */

/**
 * @typedef {Object} AssessmentsRegistry
 * @property {string} version - version of the assessment registry file
 * @property {string} time - timestamp of the assessment registry file
 * @property {Array<RegistryAssessmentPackage>} assessments
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

/** @type {Array<RegistryAssessmentPackage>} */
const assessments = [];

await Promise.all(
  pkgs.map(async (pkg) => {
    const metadata = await getNpmPackageMetadata(REGISTRY_URL, pkg);

    const latestVersion = metadata["dist-tags"].latest;
    const latestTime = metadata.time[latestVersion];

    const assessment = {
      name: pkg,
      registryUrl: REGISTRY_URL,
      description: metadata.versions[latestVersion].description,
      latest: latestVersion,
      latestTime: latestTime,
      versions: Object.keys(metadata.versions),
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
  "dist/assessment-registry.json",
  JSON.stringify(assessmentsRegistry, null, 2),
);

// write an importable JS file in dist
const indexJs = `export default ${JSON.stringify(assessmentsRegistry, null, 2)};`;
fs.writeFileSync("dist/index.js", indexJs);
