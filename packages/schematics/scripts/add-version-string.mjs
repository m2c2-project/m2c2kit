import * as fs from "fs";
import * as path from "path";
import * as url from "url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

let constantsFileContents = fs
  .readFileSync(path.join(__dirname, "..", "src", "constants.js"))
  .toString();

function getPackageJsonVersion(filePath) {
  const pkgJson = JSON.parse(fs.readFileSync(filePath).toString());
  return pkgJson.version;
}

function replacePatternWithPackageJsonVersion(s, pattern, packageJsonPath) {
  const version = getPackageJsonVersion(packageJsonPath);
  return s.replace(pattern, version);
}

const m2c2kitReplacePatterns = [
  {
    pattern: "__M2C2KIT_SCHEMATICS_PACKAGE_VERSION__",
    packageJsonPath: path.join(__dirname, "../package.json"),
  },
  {
    pattern: "__M2C2KIT_CORE_PACKAGE_VERSION__",
    packageJsonPath: path.join(__dirname, "../../core/package.json"),
  },
  {
    pattern: "__M2C2KIT_ADDONS_PACKAGE_VERSION__",
    packageJsonPath: path.join(__dirname, "../../addons/package.json"),
  },
  {
    pattern: "__M2C2KIT_SESSION_PACKAGE_VERSION__",
    packageJsonPath: path.join(__dirname, "../../session/package.json"),
  },
  {
    pattern: "__M2C2KIT_BUILD_HELPERS_PACKAGE_VERSION__",
    packageJsonPath: path.join(__dirname, "../../build-helpers/package.json"),
  },
];

m2c2kitReplacePatterns.forEach(({ pattern, packageJsonPath }) => {
  constantsFileContents = replacePatternWithPackageJsonVersion(
    constantsFileContents,
    pattern,
    packageJsonPath,
  );
});

function getDependencyVersion(packageJsonFilePath, dependencyName) {
  const pkgJson = JSON.parse(fs.readFileSync(packageJsonFilePath).toString());
  return pkgJson.devDependencies[dependencyName];
}

function replacePatternWithDependencyVersion(
  s,
  pattern,
  packageJsonPath,
  dependencyName,
) {
  const version = getDependencyVersion(packageJsonPath, dependencyName);

  return s.replace(pattern, version);
}

const dependencyReplacePatterns = [
  {
    pattern: "__ROLLUP_PLUGIN_NODE_RESOLVE_VERSION__",
    dependencyName: "@rollup/plugin-node-resolve",
  },
  {
    pattern: "__CONCURRENTLY_VERSION__",
    dependencyName: "concurrently",
  },
  {
    pattern: "__ESBUILD_VERSION__",
    dependencyName: "esbuild",
  },
  {
    pattern: "__RIMRAF_VERSION__",
    dependencyName: "rimraf",
  },
  {
    pattern: "__ROLLUP_VERSION__",
    dependencyName: "rollup",
  },
  {
    pattern: "__ROLLUP_PLUGIN_ESBUILD_VERSION__",
    dependencyName: "rollup-plugin-esbuild",
  },
  {
    pattern: "__ROLLUP_PLUGIN_LIVERELOAD_VERSION__",
    dependencyName: "rollup-plugin-livereload",
  },
  {
    pattern: "__ROLLUP_PLUGIN_SERVE_VERSION__",
    dependencyName: "rollup-plugin-serve",
  },
  {
    pattern: "__TYPESCRIPT_VERSION__",
    dependencyName: "typescript",
  },
];

dependencyReplacePatterns.forEach(({ pattern, dependencyName }) => {
  constantsFileContents = replacePatternWithDependencyVersion(
    constantsFileContents,
    pattern,
    path.join(__dirname, "../../assessments-demo/package.json"),
    dependencyName,
  );
});

fs.writeFileSync(
  path.join(__dirname, "..", "src", "constants.js"),
  constantsFileContents,
);
