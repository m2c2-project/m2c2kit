#!/usr/bin/env node
import { readFileSync, existsSync } from "fs";
import { resolve, join, dirname, basename } from "path";
import { env, exit } from "process";
import { readdir, readFile, mkdir, writeFile } from "fs/promises";

/**
 * Our current working directory for this postinstall script is the
 * package's root folder in node_modules, e.g., node_modules/{packageName}
 */

/**
 * The folder in which npm command was executed -- this differs from the
 * current working directory.
 */
const npmCwd = env.INIT_CWD;

/**
 * If the full m2c2kit repo has been cloned and "npm install" is executed,
 * when this package is installed it will run this post-install script.
 * But, we should run this only when the package is being installed in a
 * new m2c2kit project, because it will copy assets to the
 * appropriate location in the project root. The below code will check if
 * npm install is being run on the entire m2c2kit repo, and if so, exit this
 * script before copying any assets.
 * Note: this will cause problems if someone decides to name their m2c2kit
 * project "m2c2kit".
 */
const { name } = JSON.parse(readFileSync(join(npmCwd, "package.json")));
if (name === "m2c2kit") {
  exit(0);
}

async function copyFolderRecursive(options) {
  async function getFilePathsRecursive(dir) {
    const dirents = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      dirents.map((dirent) => {
        const res = resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFilePathsRecursive(res) : res;
      })
    );
    return Array.prototype.concat(...files);
  }

  const filePaths = await getFilePathsRecursive(options.sourceFolder);

  filePaths.forEach(async (filePath) => {
    const destinationFilePath = join(
      options.destinationFolder,
      filePath.replace(resolve(options.sourceFolder), options.baseFolder)
    );
    if (!options.overwrite && existsSync(destinationFilePath)) {
      return;
    }

    const folder = dirname(destinationFilePath);
    if (!existsSync(folder)) {
      await mkdir(folder, { recursive: true });
    }

    const content = await readFile(filePath);
    await writeFile(destinationFilePath, content);
  });
}

async function copyFile(options) {
  if (
    !options.overwrite &&
    existsSync(
      join(options.destinationFolder, basename(options.sourceFilePath))
    )
  ) {
    return;
  }

  const content = await readFile(options.sourceFilePath);

  if (!existsSync(options.destinationFolder)) {
    await mkdir(options.destinationFolder, { recursive: true });
  }
  await writeFile(
    join(options.destinationFolder, basename(options.sourceFilePath)),
    content
  );
}

copyFolderRecursive({
  sourceFolder: "assets",
  destinationFolder: join(npmCwd, "src"),
  baseFolder: "assets",
  overwrite: false,
});
copyFile({
  sourceFilePath: "index.html",
  destinationFolder: join(npmCwd, "src"),
  overwrite: false,
});
