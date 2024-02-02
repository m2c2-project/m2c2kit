import { Dirent, existsSync, renameSync } from "fs";
import { resolve } from "path";
import { readdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { createHash } from "crypto";
import { parseDocument } from "htmlparser2";
import { selectAll } from "css-select";
import { render } from "dom-serializer";
import { Element } from "domhandler";
import { Plugin } from "rollup";
import MagicString from "magic-string";

/** We use MD5 for hashing, but keep only the first 16 characters. */
const HASH_CHARACTER_LENGTH = 16;

/** Key value pairs of file URLs and hashed file URLs */
type Manifest = { [originalUrl: string]: string };

/**
 * Defines a rename operation to be done, with its original and new name.
 */
interface FileRename {
  original: string;
  new: string;
  skip: boolean;
}

/**
 * rollup plugin to hash m2c2kit assets and enable cache busting.
 *
 * @remarks On repeated deployments, a file with the same name may be
 * cached by browsers. Thus, the old file will be used, not the updated
 * one. To enable cache busting, this rollup plugin adds hashes to filenames
 * for files except .html and .htm files, and javascript files that are not
 * index.js (index.js is the main entry point bundle file we have created
 * and is referenced in index.html).
 *
 * In the renderChunk plugin hook, this is done by:
 * 1) Replacing the string __NO_M2C2KIT_MANIFEST_JSON_URL__ with manifest.json
 * in the bundled index.js file. This is done so that the game knows it must
 * look up hashed filenames.
 *
 * In the writeBundle plugin hook, this is done by:
 * 1) Creating an MD5 hash of the file contents of each file and adding the
 * hash of the first 16 digits to the filename.
 *
 * 2) Creating a manifest.json file that maps the original filename to the
 * hashed filename. This manifest will be used by the game to look up and
 * load the hashed filenames.
 *
 * 3) Parsing index.html to find the links to css and index.js files and
 * updating the links with the hashed filenames.
 *
 * @param rootDir - root directory of build, usually "dist" because you
 * usually hash only production builds
 * @param cwd - current working directory; used only for testing.
 * @returns a rollup Plugin
 */
export function hashM2c2kitAssets(rootDir: string, cwd = ""): Plugin {
  const indexHtmlFile = path.join(cwd, rootDir, "index.html");

  return {
    name: "hash-m2c2kit-assets",
    renderChunk: {
      handler(code: string) {
        /**
         * Rollup will complain #warning-sourcemap-is-likely-to-be-incorrect
         * unless we use magic-string to also return a map.
         */
        const magicString = new MagicString(code);
        magicString.replace(
          new RegExp("__NO_M2C2KIT_MANIFEST_JSON_URL__", "g"),
          "manifest.json",
        );
        return {
          code: magicString.toString(),
          map: magicString.generateMap({ hires: true }),
        };
      },
    },
    writeBundle: {
      /**
       * Sequential is true because we will must call the copy assets
       * plugin before this hash plugin in the writeBundle phase and respect
       * the order.
       */
      sequential: true,
      async handler() {
        const fileRenames = new Array<FileRename>();
        const filePaths = await getFilePathsRecursive(path.join(cwd, rootDir));
        for (const filePath of filePaths) {
          let skipRename = false;
          if (filePath.endsWith(".html") || filePath.endsWith(".html")) {
            skipRename = true;
          }
          // skip js files that are not index.js
          if (
            filePath.endsWith(".js") &&
            path.basename(filePath) !== "index.js"
          ) {
            skipRename = true;
          }
          const hashedFilepath = await addHashToFilepath(filePath);
          fileRenames.push({
            original: filePath,
            new: hashedFilepath,
            skip: skipRename,
          });
        }

        /**
         * Check for file with existsSync because a file may have been included
         * twice, and it may have been renamed already.
         * Use sync versions to avoid a race condition.
         */
        fileRenames
          .filter((fileRename) => !fileRename.skip)
          .forEach((fileRename) => {
            if (existsSync(fileRename.original)) {
              renameSync(fileRename.original, fileRename.new);
            }
          });

        //const rootDirFullPath = path.resolve(rootDir);
        const rootDirFullPath = path.resolve(path.join(cwd, rootDir));
        const manifest = await writeManifest(rootDirFullPath, fileRenames);

        /**
         * Parse links in index.html using htmlparser2
         * If link has attribute hash="false", then hashing is skipped on
         * that link.
         */
        const rawHtml = await readFile(indexHtmlFile, "utf-8");
        const dom = parseDocument(rawHtml);

        // handle the css links
        const links = selectAll("link", dom);
        links
          .map((link) => link as unknown as Element)
          .forEach((link) => {
            if (
              link.attribs["href"].endsWith(".css") &&
              !(link.attribs["hash"]?.toLowerCase() === "false")
            ) {
              const originalUrl = link.attribs["href"];
              try {
                link.attribs["href"] = manifest[originalUrl];
              } catch {
                console.warn(
                  `warning: could not hash css resource because it was not found at ${link.attribs["href"]}`,
                );
              }
            }
          });

        // handle the script tag's src reference to index.js
        const scripts = selectAll("script", dom);
        scripts
          .map((script) => script as unknown as Element)
          .forEach((script) => {
            if (
              removeLeadingDotSlash(script.attribs["src"]) === "index.js" &&
              !(script.attribs["hash"]?.toLowerCase() === "false")
            ) {
              const originalUrl = removeLeadingDotSlash(script.attribs["src"]);
              try {
                script.attribs["src"] = manifest[originalUrl];
              } catch {
                console.warn(
                  `warning: could not hash index.js because it was not found in the manifest.json file`,
                );
              }
            }
          });

        await writeFile(indexHtmlFile, render(dom));
      },
    },
  };
}

// create a type alias for the regular expression
//type Regex = RegExp;

function removeLeadingDotSlash(str: string): string {
  const regex = /^\.\//;
  return str.replace(regex, "");
}

async function addHashToFilepath(filePath: string) {
  const fileContent = await readFile(filePath);
  const hash = createHash("md5")
    .update(fileContent)
    .digest("hex")
    .slice(0, HASH_CHARACTER_LENGTH);
  let hashedFilepath = filePath;
  const ext = path.extname(filePath);
  if (ext) {
    hashedFilepath = hashedFilepath.replace(ext, `.${hash}${ext}`);
  } else {
    hashedFilepath = hashedFilepath + `.${hash}`;
  }
  return hashedFilepath;
}

async function writeManifest(rootDir: string, fileRenames: FileRename[]) {
  const manifestFilename = path.join(rootDir, "manifest.json");
  const manifest: Manifest = {};

  fileRenames.forEach((fileRename) => {
    let originalName = fileRename.original.replace(rootDir + path.sep, "");
    let hashedName = fileRename.new.replace(rootDir + path.sep, "");
    if (fileRename.skip) {
      hashedName = originalName;
    }
    if (path.sep === "\\") {
      originalName = originalName.replace(/\\/g, "/");
      hashedName = hashedName.replace(/\\/g, "/");
    }
    manifest[originalName] = hashedName;
  });

  const manifestString = JSON.stringify(manifest, null, 2);
  await writeFile(manifestFilename, manifestString);
  return manifest;
}

async function getFilePathsRecursive(dir: string): Promise<string[]> {
  const entries: Dirent[] = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((dirent) => {
      const res: string = resolve(dir, dirent.name);
      return dirent.isDirectory()
        ? getFilePathsRecursive(res)
        : Promise.resolve(res);
    }),
  );
  return ([] as string[]).concat(...(await Promise.all(files)));
}
