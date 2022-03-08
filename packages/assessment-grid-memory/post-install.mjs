#!/usr/bin/env node
import fs from "fs";
import { resolve, basename, join } from "path";
import { env, exit } from "process";

/**
 * Note: our current working directory for this postinstall script is the
 * package's root folder, e.g., node_modules/@m2c2kiit/assessment-grid-memory.
 */

// the folder in which npm command was executed
const npmCwd = env.INIT_CWD;

/**
 * If the m2c2kit repo has been cloned and "npm install" is executed, when the
 * @m2c2kit/assessment-grid-memory package is installed it will run this
 * post-install script. But, we should run this only when the package is being
 * installed in an m2c2kit project, because it will copy assets to the
 * appropriate location in the project root. The below code will check if
 * npm install is being run on the m2c2kit codebase, and if so, exit this
 * script before copying any assets.
 * Note: this will cause problems if someone decides to name their m2c2kit
 * project "m2c2kit" -- perhaps we should disallow that in the cli?
 */
const { name } = JSON.parse(fs.readFileSync(join(npmCwd, "package.json")));
if (name === "m2c2kit") {
  exit(0);
}

/**
 * Creates the folder if it does not exist
 *
 * @param {string} folderPath - full path name of folder
 */
function createFolder(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, {
      recursive: true,
    });
  }
}

/**
 * Copies all files from source path to destination path, but does not recurse
 * folders
 *
 * @param {string} sourcePath
 * @param {string} destPath
 */
function copyFolder(sourcePath, destPath) {
  const sourceFiles = fs
    .readdirSync(sourcePath, {
      withFileTypes: true,
    })
    .filter((dirent) => !dirent.isDirectory())
    .map((dirent) => resolve(sourcePath, dirent.name));

  createFolder(destPath);

  sourceFiles.forEach((file) => {
    const sourceContents = fs.readFileSync(file);
    fs.writeFileSync(join(destPath, basename(file)), sourceContents);
  });
}

copyFolder("./img", join(npmCwd, "/assets/assessment-grid-memory/img"));
copyFolder(
  "./fonts/roboto",
  join(npmCwd, "/assets/assessment-grid-memory/fonts/roboto")
);
