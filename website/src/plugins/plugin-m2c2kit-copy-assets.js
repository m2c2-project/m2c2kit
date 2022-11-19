/* eslint-disable @typescript-eslint/no-var-requires */

// eslint-disable-next-line no-undef
const path = require("path");
// eslint-disable-next-line no-undef
const fs = require("fs");
// eslint-disable-next-line no-undef
const fsp = require("fs/promises");

/**
 * This Docusarus plugin copys the m2c2kit assets needed for the interactive
 * code examples. Thus, "npm run build" must be run in the monorepo root
 * before building the website. Otherwise, the assets are not available.
 */
// eslint-disable-next-line no-undef
module.exports = async function pluginM2c2kitCopyAssets(_context, options) {
  return {
    name: "plugin-m2c2kit-copy-assets",
    async loadContent() {
      if (options?.folders) {
        for (const folder of options.folders) {
          await copyFolderRecursive({
            sourceFolder: folder.source,
            destinationFolder: folder.destination,
            baseFolder: "",
            overwrite: true,
            extensions: folder.extensions,
          });
        }
      }
    },
  };
};

async function copyFolderRecursive(options) {
  async function getFilePathsRecursive(dir) {
    const dirents = await fsp.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      dirents.map((dirent) => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFilePathsRecursive(res) : res;
      })
    );
    return Array.prototype.concat(...files);
  }

  let filePaths = await getFilePathsRecursive(options.sourceFolder);
  if (options.extensions) {
    filePaths = filePaths.filter((f) =>
      options.extensions.some((ext) => f.endsWith(ext))
    );
  }

  filePaths.forEach(async (filePath) => {
    const destinationFilePath = path.join(
      options.destinationFolder,
      filePath.replace(path.resolve(options.sourceFolder), options.baseFolder)
    );
    if (!options.overwrite && fs.existsSync(destinationFilePath)) {
      return;
    }

    const folder = path.dirname(destinationFilePath);
    if (!fs.existsSync(folder)) {
      await fsp.mkdir(folder, { recursive: true });
    }

    const content = await fsp.readFile(filePath);
    await fsp.writeFile(destinationFilePath, content);
  });
}
