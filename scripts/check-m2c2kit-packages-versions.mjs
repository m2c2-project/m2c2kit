import * as url from "url";
import * as fs from "fs";
import * as path from "path";
import process from "process";
import chalk from "chalk";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const packagesPath = path.join(__dirname, "..", "packages");

const brief = process.argv.includes("--brief");

if (!brief) {
  console.log(`monorepo packages path: ${packagesPath}`);
}

/**
 * Inspect the packages folder and returns an object with the package
 * name as the key and the package path as the value
 */
function makePackagePathDictionary(folder, templates = undefined) {
  const packagePaths = {};
  const packageFolders = fs
    .readdirSync(folder)
    .filter((file) => fs.lstatSync(path.join(folder, file)).isDirectory());
  for (const packageFolder of packageFolders) {
    const packagePath = path.join(folder, packageFolder);
    const packageJsonPath = path.join(packagePath, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString());
    packagePaths[packageJson.name] = packageJsonPath;
  }

  if (templates) {
    for (const template of templates) {
      packagePaths[template.name] = template.path;
    }
  }
  return packagePaths;
}

function getDependentNames(packagesFolder, dependencyName, templates) {
  const dependentNames = [];
  const packagePathDictionary = makePackagePathDictionary(
    packagesFolder,
    templates
  );
  for (const [key, value] of Object.entries(packagePathDictionary)) {
    const packageJson = JSON.parse(fs.readFileSync(value).toString());
    if (packageJson?.dependencies?.[dependencyName]) {
      dependentNames.push(key);
    }
    if (packageJson?.devDependencies?.[dependencyName]) {
      dependentNames.push(key);
    }
  }
  return dependentNames;
}

function checkDependentsVersion(packagesFolder, packageName, templates) {
  const packagePathDictionary = makePackagePathDictionary(
    packagesFolder,
    templates
  );
  const packageJson = JSON.parse(
    fs.readFileSync(packagePathDictionary[packageName]).toString()
  );
  const packageVersion = packageJson.version;

  let mismatch = false;

  const dependentNames = getDependentNames(
    packagesFolder,
    packageName,
    templates
  );
  if (dependentNames.length === 0) {
    if (!brief) {
      console.log(
        `${packageName} version: ${chalk.blueBright(
          packageVersion
        )} has no dependents in this monorepo`
      );
    }
    mismatch = false;
    return mismatch;
  }

  if (!brief) {
    console.log(`${packageName} version: ${chalk.blueBright(packageVersion)}`);
  }

  for (const dependentName of dependentNames) {
    const dependentPackageJsonPath =
      packagePathDictionary[dependentName].toString();
    const dependentPackageJson = JSON.parse(
      fs.readFileSync(dependentPackageJsonPath)
    );
    const dependentPackageVersion = dependentPackageJson.version;

    let dependencyVersion;
    let dependencyType;
    if (dependentPackageJson?.dependencies[packageName]) {
      dependencyVersion = dependentPackageJson.dependencies[packageName];
      dependencyType = "dependency";
    }
    if (dependentPackageJson?.devDependencies[packageName]) {
      dependencyVersion = dependentPackageJson.devDependencies[packageName];
      dependencyType = chalk.cyan("devDependency");
    }

    const templateNote = dependentPackageJsonPath.endsWith(".handlebars")
      ? chalk.yellowBright("template ")
      : "";

    if (packageVersion !== dependencyVersion) {
      mismatch = true;
      if (brief) {
        console.log(
          `${packageName} version: ${chalk.blueBright(packageVersion)}`
        );
      }
      console.error(
        chalk.red(
          `  ${templateNote}${dependentName} version ${dependentPackageVersion} has ${dependencyType} on version ${dependencyVersion}`
        )
      );
    } else {
      if (!brief) {
        console.log(
          `  ${templateNote}${dependentName} version ${dependentPackageVersion} has ${dependencyType} on version ${dependencyVersion}`
        );
      }
    }
  }
  return mismatch;
}

function checkAllDependents(packagesFolder, templates = undefined) {
  const packagePathDictionary = makePackagePathDictionary(
    packagesFolder,
    templates
  );
  const packageNames = Object.keys(packagePathDictionary);
  let returnErrorExitCode = false;
  for (const packageName of packageNames) {
    let mismatch = checkDependentsVersion(
      packagesFolder,
      packageName,
      templates
    );
    if (mismatch) {
      returnErrorExitCode = true;
    }
  }
  if (returnErrorExitCode) {
    console.error(chalk.red("ERROR: monorepo package version mismatch found."));
    process.exit(1);
  }
  console.log(chalk.green("All monorepo package version checks passed."));
}

checkAllDependents(path.join(__dirname, "..", "packages"), [
  {
    name: "packages/cli/templates/package.json.handlebars",
    path: path.join(
      __dirname,
      "..",
      "packages",
      "cli",
      "templates",
      "package.json.handlebars"
    ),
  },
]);
