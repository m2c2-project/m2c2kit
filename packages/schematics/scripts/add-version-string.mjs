import * as fs from "fs";
import * as path from "path";
import * as url from "url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

let constantsFileContents = fs
  .readFileSync(path.join(__dirname, "..", "src", "constants.js"))
  .toString();

constantsFileContents = constantsFileContents.replace(
  "__M2C2KIT_SCHEMATICS_PACKAGE_VERSION__",
  getPackageJsonVersion(path.join(__dirname, "../package.json")),
);
constantsFileContents = constantsFileContents.replace(
  "__M2C2KIT_CORE_PACKAGE_VERSION__",
  getPackageJsonVersion(path.join(__dirname, "../../core/package.json")),
);
constantsFileContents = constantsFileContents.replace(
  "__M2C2KIT_ADDONS_PACKAGE_VERSION__",
  getPackageJsonVersion(path.join(__dirname, "../../addons/package.json")),
);
constantsFileContents = constantsFileContents.replace(
  "__M2C2KIT_SESSION_PACKAGE_VERSION__",
  getPackageJsonVersion(path.join(__dirname, "../../session/package.json")),
);
constantsFileContents = constantsFileContents.replace(
  "__M2C2KIT_BUILD_HELPERS_PACKAGE_VERSION__",
  getPackageJsonVersion(
    path.join(__dirname, "../../build-helpers/package.json"),
  ),
);

fs.writeFileSync(
  path.join(__dirname, "..", "src", "constants.js"),
  constantsFileContents,
);

function getPackageJsonVersion(filePath) {
  const pkgJson = JSON.parse(fs.readFileSync(filePath).toString());
  return pkgJson.version;
}
