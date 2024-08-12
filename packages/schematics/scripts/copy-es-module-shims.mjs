import * as path from "path";
import * as fs from "fs";
import findupSync from "findup-sync";

// copy es-module-shims module to src/static-site/files/es-module-shims

const esModuleShimsPackageJsonPath = findupSync(
  "node_modules/es-module-shims/package.json",
);

if (!esModuleShimsPackageJsonPath) {
  throw new Error("Could not find es-module-shims package.json");
}

const esModuleShimsFolder = path.dirname(esModuleShimsPackageJsonPath);
const dest = path.join("src", "static-site", "files", "es-module-shims");
if (!fs.existsSync(dest)) {
  fs.mkdirSync(dest, { recursive: true });
}

fs.cpSync(esModuleShimsFolder, dest, { recursive: true });
