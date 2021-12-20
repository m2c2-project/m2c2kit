// this script checks that versions of m2c2kit/core and m2c2kit/addons
// referred to throughout the repo agree
//
// run this before publishing packages to npm

import * as fs from "fs";
import * as path from "path";
import process from "process";
import chalk from "chalk";

const coreVersion = JSON.parse(
  fs.readFileSync(path.join("packages", "core", "package.json")).toString()
).version;

const addonsVersion = JSON.parse(
  fs.readFileSync(path.join("packages", "core", "package.json")).toString()
).version;

const addonsCoreDependencyVersion = JSON.parse(
  fs.readFileSync(path.join("packages", "addons", "package.json")).toString()
).dependencies["@m2c2kit/core"];

const cliVersion = JSON.parse(
  fs.readFileSync(path.join("packages", "cli", "package.json")).toString()
).version;

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

console.log(`@m2c2kit/core version: ${chalk.green(coreVersion)}`);
console.log(`@m2c2kit/addons version: ${chalk.blue(addonsVersion)}`);
console.log(
  `  @m2c2kit/core dependency version: ${chalk.green(
    addonsCoreDependencyVersion
  )}`
);
console.log(`@m2c2kit/cli version ${chalk.magenta(cliVersion)}`);
console.log(
  `  package.json template @m2c2kit/core dependency version: ${chalk.green(
    cliTemplateCoreDependencyVersion
  )}`
);
console.log(
  `  package.json template @m2c2kit/addons dependency version: ${chalk.blue(
    cliTemplateAddonsDependencyVersion
  )}`
);

const matches = [
  coreVersion === addonsCoreDependencyVersion &&
    coreVersion === cliTemplateCoreDependencyVersion,
  addonsVersion === cliTemplateAddonsDependencyVersion,
];

console.log();
console.log(
  "@m2c2kit/core version should match version specified as dependency in @m2c2kit/addons"
);
console.log(
  "@m2c2kit/core version should match version specified as dependency in cli package.json template"
);
console.log(
  "@m2c2kit/addons version should match version specified as dependency in cli package.json template"
);
console.log(
  "@m2c2kit/cli is versioned indpendently of @m2c2kit/core and @m2c2kit/addons"
);

console.log();
if (matches.every(Boolean)) {
  console.log("all versions match");
} else {
  console.log(chalk.red("**** WARNING ***"));
  console.log(chalk.red("version mismatch!"));
  process.exit(1);
}
