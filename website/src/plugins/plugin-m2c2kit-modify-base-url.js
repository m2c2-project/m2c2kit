/* eslint-disable @typescript-eslint/no-var-requires */

// eslint-disable-next-line no-undef
const path = require("path");
// eslint-disable-next-line no-undef
const fsp = require("fs/promises");
// eslint-disable-next-line no-undef
const Buffer = require("buffer").Buffer;

/**
 * This Docusaurus plugin modifies the baseUrl that is used in the
 * iframe fetch proxy. This is needed if the Docusaurus site is not
 * being served from the root, which happens with GitHub pages.
 *
 * Static resources for m2c2kit are built into the Docusaurus site at
 * /m2c2kit. These include image/font assets and bundled js files.
 * The example and tutorial code is written as if the m2c2kit
 * resources are being served from the root, e.g., an image url is
 * listed as "assets/docs/img/blue-marble.jpg". The iframe fetch proxy
 * then fetches the image from "m2c2kit/assets/docs/img/blue-marble.jpg".
 *
 * When the docs site is not running at the root, however, the iframe
 * fetch proxy will need to fetch these assets from <BASE_URL>/m2c2kit,
 * not /m2c2kit. This plugin modifies the baseUrl that is used in the
 * iframe fetch proxy.
 *
 * This plugin goes through all the js files in the built site and
 * replaces the string "_-_BASE_URL_REPLACE_IN_DOCUSAURUS_BUILD_-_"
 * with the baseUrl. If the baseUrl is not defined (docs are being
 * served from the root), then the string is replaced with an empty
 * string.
 *
 * The string "_-_BASE_URL_REPLACE_IN_DOCUSAURUS_BUILD_-_" is a long
 * ugly string that is unlikely to be used in the codebase.
 */

// eslint-disable-next-line no-undef
module.exports = async function pluginM2c2kitModifyBaseUrl(_context, options) {
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

  return {
    name: "plugin-m2c2kit-modify-base-url",
    async postBuild(props) {
      const filesToModify = await getFilePathsRecursive(
        path.join(props.outDir, "assets", "js")
      );
      const modifyPromises = filesToModify.map(async (filePath) => {
        let contentBuffer = await fsp.readFile(filePath);
        let stringContent = contentBuffer.toString();
        const pattern = "_-_BASE_URL_REPLACE_IN_DOCUSAURUS_BUILD_-_";
        if (stringContent.includes(pattern)) {
          /**
           * If docs are being served from root, then the baseUrl replacement
           * is an empty string. Otherwise, ensure baseURL does not start
           * with a slash and ensure it ends with a slash.
           */
          const baseUrl =
            options.baseUrl === undefined ||
            options.baseUrl === null ||
            options.baseUrl === "/"
              ? ""
              : options.baseUrl.replace(/^\/+|\/+$/g, "") + `/`;
          const replacement = baseUrl;
          stringContent = stringContent.replaceAll(pattern, replacement);
          contentBuffer = Buffer.from(stringContent);
          return fsp.writeFile(filePath, contentBuffer);
        } else {
          return Promise.resolve();
        }
      });

      await Promise.all(modifyPromises);
    },
  };
};
