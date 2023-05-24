import * as fs from "fs";
import * as path from "path";
import * as url from "url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

let fileContents = fs
  .readFileSync(path.join(__dirname, "..", "src", "constants.js"))
  .toString();
const pkgJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "package.json")).toString()
);
fileContents = fileContents.replace(
  "__PACKAGE_JSON_VERSION__",
  pkgJson.version
);
fs.writeFileSync(
  path.join(__dirname, "..", "src", "Constants.js"),
  fileContents
);
