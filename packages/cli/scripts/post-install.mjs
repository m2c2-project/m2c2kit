#!/usr/bin/env node
import fs from "fs";
import { resolve, basename } from "path";

const { dependencies } = JSON.parse(fs.readFileSync("./package.json"));

/** If this m2c2kit app uses surveys, then copy the required css
 * files from node_modules so they can be bundled */
if (Object.keys(dependencies).includes("@m2c2kit/survey")) {
  // does ./css folder exist? if not, create
  if (!fs.existsSync("./css")) {
    fs.mkdirSync("./css");
  }

  const cssDistDir = "./node_modules/@m2c2kit/survey/dist/css/";
  const cssFiles = fs
    .readdirSync(cssDistDir, {
      withFileTypes: true,
    })
    .filter((dirent) => !dirent.isDirectory())
    .map((dirent) => resolve(cssDistDir, dirent.name));

  cssFiles.forEach((file) => {
    const sourceContents = fs.readFileSync(file);
    fs.writeFileSync(`./css/${basename(file)}`, sourceContents);
  });
}
