// this script checks that versions of m2c2kit/core and m2c2kit/addons
// referred to throughout the repo agree
//
// run this before publishing packages to npm

/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const fs = require("fs");
const path = require("path");

const coreVersion = JSON.parse(
  fs.readFileSync(path.join("packages", "core", "package.json")).toString()
).version;

const addonsVersion = JSON.parse(
  fs.readFileSync(path.join("packages", "core", "package.json")).toString()
).version;

const addonsCoreDependencyVersion = JSON.parse(
  fs.readFileSync(path.join("packages", "addons", "package.json")).toString()
).dependencies["@m2c2kit/core"];

const cliTemplateCoreDependencyVersion = JSON.parse(
  fs
    .readFileSync(
      path.join("packages", "cli", "templates", "package.json.handlebars")
    )
    .toString()
).dependencies["@m2c2kit/core"];

const cliTemplateAddonsDependencyVersion = JSON.parse(
  fs
    .readFileSync(
      path.join("packages", "cli", "templates", "package.json.handlebars")
    )
    .toString()
).dependencies["@m2c2kit/addons"];

console.log(`@m2c2kit/core version: ${coreVersion}`);
console.log(`@m2c2kit/addons version: ${addonsVersion}`);
console.log(
  `  @m2c2kit/core dependency version: ${addonsCoreDependencyVersion}`
);
console.log(`@m2c2kit/cli`);
console.log(
  `  package.json template @m2c2kit/core dependency version: ${cliTemplateCoreDependencyVersion}`
);
console.log(
  `  package.json template @m2c2kig/addons dependency version: ${cliTemplateAddonsDependencyVersion}`
);

const matches = [
  // @m2c2kit/core version should match version specified as dependency in @m2c2kit/addons
  coreVersion === addonsCoreDependencyVersion &&
    // @m2c2kit/core version should match version specified as dependency in cli package.json template
    coreVersion === cliTemplateCoreDependencyVersion,
  // @m2c2kit/addons version should match version specified as dependency in cli package.json template
  addonsVersion === cliTemplateAddonsDependencyVersion,
];

console.log();
if (matches.every(Boolean)) {
  console.log("all versions match");
  return 0;
} else {
  console.log("**** WARNING ***");
  console.log("version mismatch!");
  return 1;
}
