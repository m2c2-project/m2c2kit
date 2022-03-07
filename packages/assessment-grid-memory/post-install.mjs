#!/usr/bin/env node
import fs from "fs";
import { resolve, basename, join } from "path";
import { env } from "process";

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

/**
 * Note: our current working directory for this postinstall script is the
 * package's root folder, e.g., node_modules/@m2c2kiit/assessment-grid-memory.
 */

// the folder in which npm command was executed
const npmCwd = env.INIT_CWD;

copyFolder("./dist/img", join(npmCwd, "/assets/assessment-grid-memory/img"));
copyFolder(
  "./dist/fonts/roboto",
  join(npmCwd, "/assets/assessment-grid-memory/fonts/roboto")
);
