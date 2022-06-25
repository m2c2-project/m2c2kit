import { existsSync } from "fs";
import { readFile, rename, writeFile } from "fs/promises";
import path from "path";
import { getFileHash } from "./getFileHash";
import { parseDocument } from "htmlparser2";
import { selectAll } from "css-select";
import { render } from "dom-serializer";
import { Element } from "domhandler";

const addHashToUrl = (url: string, rootDir: string) => {
  const ext = path.extname(url);
  const hash = getFileHash(path.join(rootDir, url));
  if (ext) {
    url = url.replace(ext, `.${hash}${ext}`);
  } else {
    url = url + `.${hash}`;
  }
  return url;
};

export function copyM2c2IndexHtml(
  sourceHtmlFile: string,
  destHtmlFile: string,
  jsBundleFile = "",
  renameWithHash = false
) {
  return {
    name: "copy-m2c2-indexhtml",
    writeBundle: async () => {
      if (!existsSync(sourceHtmlFile)) {
        return;
      }

      const rawHtml = await readFile(sourceHtmlFile, "utf-8");
      const dom = parseDocument(rawHtml);
      let newJsBundleFile = "";

      if (renameWithHash) {
        const links = selectAll("link", dom);
        links
          .map((link) => link as unknown as Element)
          .forEach((link) => {
            if (
              link.attribs["href"].endsWith(".css") &&
              !(link.attribs["hash"]?.toLowerCase() === "false")
            ) {
              link.attribs["href"] = addHashToUrl(link.attribs["href"], "src");
            }
          });

        const scripts = selectAll("script", dom);
        scripts
          .map((script) => script as unknown as Element)
          .forEach((script) => {
            if (
              script.attribs["src"] === "./index.js" &&
              !(script.attribs["hash"]?.toLowerCase() === "false")
            ) {
              script.attribs["src"] =
                "./" + path.basename(addHashToUrl(jsBundleFile, ""));
              newJsBundleFile = script.attribs["src"];
            }
          });
      }

      if (newJsBundleFile) {
        const folder = path.dirname(jsBundleFile);
        newJsBundleFile = path.join(folder, newJsBundleFile);
        await rename(jsBundleFile.replace(/\//g, path.sep), newJsBundleFile);
      }

      await writeFile(destHtmlFile, render(dom));
    },
  };
}
