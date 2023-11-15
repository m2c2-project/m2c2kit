import { resolve, join, dirname } from "path";
import { existsSync } from "fs";
import { readdir, mkdir, readFile, writeFile } from "fs/promises";

/**
 * This Docusaurus plugin copies the m2c2kit assets needed for the interactive
 * code examples. Thus, "npm run build" must be run in the monorepo root
 * before building the website. Otherwise, the assets are not available.
 */
export default async function pluginM2c2kitCopyAssets(_context, options) {
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
}

async function copyFolderRecursive(options) {
  async function getFilePathsRecursive(dir) {
    const dirents = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      dirents.map((dirent) => {
        const res = resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFilePathsRecursive(res) : res;
      }),
    );
    return Array.prototype.concat(...files);
  }

  let filePaths = await getFilePathsRecursive(options.sourceFolder);
  if (options.extensions) {
    filePaths = filePaths.filter((f) =>
      options.extensions.some((ext) => f.endsWith(ext)),
    );
  }

  filePaths.forEach(async (filePath) => {
    const destinationFilePath = join(
      options.destinationFolder,
      filePath.replace(resolve(options.sourceFolder), options.baseFolder),
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
