/**
 * This script scaffolds typical content for updating the changelog.
 */

import * as fs from "fs";
import * as path from "path";

function getFilePathsRecursive(folder) {
  let files = [];
  const contents = fs.readdirSync(folder);
  for (const item of contents) {
    // Get the full path of the item
    const itemPath = path.join(folder, item.toString());
    const stats = fs.statSync(itemPath);
    if (stats.isFile()) {
      // If it is a file, push it to the array
      files.push(itemPath);
    } else if (stats.isDirectory()) {
      // If it is a directory, recursively call the function on it and concatenate the result to the array
      files = files.concat(getFilePathsRecursive(itemPath));
    }
  }
  return files;
}

const filePaths = getFilePathsRecursive("packages");
const pkgJsonFilePaths = filePaths.filter(
  (file) => file.endsWith("package.json") && !file.includes("node_modules"),
);

let pkgJsonFiles = pkgJsonFilePaths.map((file) => {
  const contents = fs.readFileSync(file, "utf-8");
  const json = JSON.parse(contents);
  const name = json.name;
  return {
    name,
    contents,
  };
});

const packageOrder = [
  "@m2c2kit/core",
  "@m2c2kit/addons",
  "@m2c2kit/session",
  "@m2c2kit/physics",
  "@m2c2kit/cli",
  "@m2c2kit/schematics",
  "@m2c2kit/embedding",
  "@m2c2kit/build-helpers",
  "@m2c2kit/db",
  "@m2c2kit/survey",
  "@m2c2kit/schema-util",
  "@m2c2kit/assessment-symbol-search",
  "@m2c2kit/assessment-grid-memory",
  "@m2c2kit/assessment-color-shapes",
  "@m2c2kit/assessment-color-dots",
  "@m2c2kit/assessments-demo",
  "@m2c2kit/assessment-cli-starter",
  "@m2c2kit/sage-research",
];

pkgJsonFiles = pkgJsonFiles.sort((a, b) => {
  const aIndex = packageOrder.indexOf(a.name);
  const bIndex = packageOrder.indexOf(b.name);
  if (aIndex === -1 && bIndex === -1) {
    return a.name.localeCompare(b.name);
  }
  if (aIndex === -1) {
    return 1;
  }
  if (bIndex === -1) {
    return -1;
  }
  return aIndex - bIndex;
});

const currentDate = new Date().toISOString().split("T")[0];
const packagesToExclude = [
  "@m2c2kit/automation-controller",
  "@m2c2kit/automation-driver",
];

pkgJsonFiles.forEach((pkg) => {
  const json = JSON.parse(pkg.contents);
  if (packagesToExclude.includes(json.name)) {
    return;
  }
  console.log(`## \`${json.name}\` [${json.version}] - ${currentDate}`);
  console.log();
  console.log("### Changed");
  console.log();
  console.log("- Updated dependencies.");
  console.log();
});
