import { existsSync, renameSync, readFileSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { createHash } from "crypto";
import { parseDocument } from "htmlparser2";
import { selectAll } from "css-select";
import { render } from "dom-serializer";
import { Element } from "domhandler";
import * as acorn from "acorn";
import * as walk from "acorn-walk";
import * as estree from "estree";
import { generate } from "astring";

/** We use MD5 for hashing, but keep only the first 16 characters. */
const HASH_CHARACTER_LENGTH = 16;

/**
 * Defines a rename operation to be done, with its original and new name.
 */
interface FileRename {
  original: string;
  new: string;
}

/**
 * rollup plugin to hash m2c2kit assets and enable cache busting.
 *
 * @remarks On repeated deployments, a file with the same name may be
 * cached by browsers. Thus, the old file will be used, not the updated
 * one. To enable cache busting, this rollup plugin adds hashes to filenames
 * for m2c2kit assets: index.js, canvaskit.wasm, images, and fonts. This is
 * done by: 1) parsing index.html and finding the links to css and index.js,
 * calculating a hash of these assets, adding a hash to the asset filenames,
 * and updating the links in index.html to reflect the hash. 2) parsing
 * index.js into an AST, finding string literals that are the urls of fonts,
 * images, and canvaskit.wam, calculating a hash of these assets, adding a
 * hash to the asset filenames, and updating the urls to reflect the hash.
 *
 * Note: index.js is transpiled from TypeScript and no longer has types, so
 * finding the asset urls in the AST assumes that there will be no
 * user code with the same structure as the asset urls. In other words:
 * Don't use a define a property named "canvasKitWasmUrl" that refers to
 * a string literal, don't define a property named "fonts" that that refers
 * to an array expression of object expressions with properties named
 * "fontName" and "url", and don't define a property called "images" that
 * refers to an array expression of object expressions with properties named
 * "imageName", "height", "width", and "url". Otherwise, this plugin may alter
 * your code in unexpected ways (although most likely it will simply give
 * warnings, because it's unlikely there will be valid file assets that will
 * be found and hashed).
 *
 * @param rootDir - root directory of build, usually "dist" because you
 * usually hash only production builds
 * @returns
 */
export function hashM2c2kitAssets(rootDir: string) {
  const indexHtmlFile = path.join(rootDir, "index.html");
  const indexJsFile = path.join(rootDir, "index.js");

  return {
    name: "hash-m2c2kit-assets",
    closeBundle: {
      sequential: true,
      async handler() {
        const fileRenames = new Array<FileRename>();

        // Parse index.js using acorn and acorn-walk
        let indexjs: string;
        try {
          indexjs = await readFile(indexJsFile, "utf-8");
        } catch {
          throw new Error(
            "could not hash m2c2 assets because there was an error reading index.js. This is a fatal problem because index.js is required."
          );
        }

        let ast: acorn.Node;
        try {
          ast = acorn.parse(indexjs, { ecmaVersion: 2020 });
        } catch {
          throw new Error(
            "could not hash m2c2 assets because there was an error parsing index.js. This is a fatal problem because index.js is not valid JavaScript."
          );
        }

        // it was helpful to use https://astexplorer.net/ to understand the AST

        walk.ancestor(ast, {
          // this code will be run each time the walker visits a literal
          Literal(node, ancestors: Array<acorn.Node>) {
            if (ancestors.length >= 2) {
              const maybeProperty = ancestors.slice(-2)[0];

              if (maybeProperty.type === "Property") {
                const property = maybeProperty as unknown as estree.Property;

                if (
                  property.key.type === "Identifier" &&
                  (property.key as estree.Identifier).name == "canvasKitWasmUrl"
                ) {
                  // property is canvasKitWasmUrl
                  const literal = node as unknown as estree.Literal;
                  const originalUrlValue = literal.value as string;

                  try {
                    const hashedUrlValue = addHashToUrl(
                      originalUrlValue,
                      rootDir
                    );

                    literal.value = (literal.value as string).replace(
                      originalUrlValue,
                      hashedUrlValue
                    );
                    literal.raw = (literal.raw as string).replace(
                      originalUrlValue,
                      hashedUrlValue
                    );

                    addFileToFilesToBeRenamed(
                      rootDir,
                      originalUrlValue,
                      hashedUrlValue,
                      fileRenames
                    );
                  } catch {
                    console.log(
                      `warning: could not hash canvaskit.wasm resource because it was not found at ${originalUrlValue}`
                    );
                  }
                }
              }
            }

            // we'll be looking back 5 levels
            if (ancestors.length >= 5) {
              const maybeProperty = ancestors.slice(-2)[0];

              if (maybeProperty.type === "Property") {
                const property = maybeProperty as unknown as estree.Property;

                if (
                  property.key.type === "Identifier" &&
                  (property.key as estree.Identifier).name == "url"
                ) {
                  // property is url
                  const maybeObjExpression = ancestors.slice(-3)[0];
                  if (maybeObjExpression.type === "ObjectExpression") {
                    const objExpression =
                      maybeObjExpression as unknown as estree.ObjectExpression;

                    const properties = objExpression.properties
                      .filter((p) => p.type === "Property")
                      .map((p) => p as estree.Property);

                    const identifiers = properties
                      .filter((p) => p.key.type === "Identifier")
                      .map((p) => (p.key as estree.Identifier).name);

                    const urlFontAssetProperties = ["fontName", "url"];

                    const propCount = identifiers.filter(
                      (i) => urlFontAssetProperties.indexOf(i) !== -1
                    ).length;
                    if (propCount === 2) {
                      // the object expression has the 2 properties
                      const maybeArrayExpression = ancestors.slice(-4)[0];
                      if (maybeArrayExpression.type === "ArrayExpression") {
                        const maybeProperty = ancestors.slice(-5)[0];
                        if (maybeProperty.type === "Property") {
                          const property =
                            maybeProperty as unknown as estree.Property;
                          if (
                            property.key.type === "Identifier" &&
                            (property.key as estree.Identifier).name == "fonts"
                          ) {
                            // property is fonts
                            const literal = node as unknown as estree.Literal;
                            const originalUrlValue = literal.value as string;

                            try {
                              const hashedUrlValue = addHashToUrl(
                                originalUrlValue,
                                rootDir
                              );

                              literal.value = (literal.value as string).replace(
                                originalUrlValue,
                                hashedUrlValue
                              );
                              literal.raw = (literal.raw as string).replace(
                                originalUrlValue,
                                hashedUrlValue
                              );
                              addFileToFilesToBeRenamed(
                                rootDir,
                                originalUrlValue,
                                hashedUrlValue,
                                fileRenames
                              );
                            } catch {
                              `warning: could not hash a font resource because it was not found at ${originalUrlValue} `;
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }

            // we'll be looking back 5 levels
            if (ancestors.length >= 5) {
              const maybeProperty = ancestors.slice(-2)[0];

              if (maybeProperty.type === "Property") {
                const property = maybeProperty as unknown as estree.Property;

                if (
                  property.key.type === "Identifier" &&
                  (property.key as estree.Identifier).name == "url"
                ) {
                  // property is url
                  const maybeObjExpression = ancestors.slice(-3)[0];
                  if (maybeObjExpression.type === "ObjectExpression") {
                    const objExpression =
                      maybeObjExpression as unknown as estree.ObjectExpression;

                    const properties = objExpression.properties
                      .filter((p) => p.type === "Property")
                      .map((p) => p as estree.Property);

                    const identifiers = properties
                      .filter((p) => p.key.type === "Identifier")
                      .map((p) => (p.key as estree.Identifier).name);

                    const urlBrowserImageProperties = [
                      "imageName",
                      "height",
                      "width",
                      "url",
                    ];

                    const propCount = identifiers.filter(
                      (i) => urlBrowserImageProperties.indexOf(i) !== -1
                    ).length;
                    if (propCount === 4) {
                      // the object expression has the 4 properties
                      const maybeArrayExpression = ancestors.slice(-4)[0];
                      if (maybeArrayExpression.type === "ArrayExpression") {
                        const maybeProperty = ancestors.slice(-5)[0];
                        if (maybeProperty.type === "Property") {
                          const property =
                            maybeProperty as unknown as estree.Property;
                          if (
                            property.key.type === "Identifier" &&
                            (property.key as estree.Identifier).name == "images"
                          ) {
                            // property is images
                            const literal = node as unknown as estree.Literal;
                            const originalUrlValue = literal.value as string;

                            try {
                              const hashedUrlValue = addHashToUrl(
                                originalUrlValue,
                                rootDir
                              );

                              literal.value = (literal.value as string).replace(
                                originalUrlValue,
                                hashedUrlValue
                              );
                              literal.raw = (literal.raw as string).replace(
                                originalUrlValue,
                                hashedUrlValue
                              );
                              addFileToFilesToBeRenamed(
                                rootDir,
                                originalUrlValue,
                                hashedUrlValue,
                                fileRenames
                              );
                            } catch {
                              `warning: could not hash an image resource because it was not found at ${originalUrlValue} `;
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
        });

        const indexJsCode = generate(ast);
        await writeFile(indexJsFile, indexJsCode);

        // Parse links in index.html using htmlparser2
        // note: if link has attribute hash="false", then hashing
        // is skipped for that link
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
                link.attribs["href"] = addHashToUrl(
                  link.attribs["href"],
                  rootDir
                );
                addFileToFilesToBeRenamed(
                  rootDir,
                  originalUrl,
                  link.attribs["href"],
                  fileRenames
                );
              } catch {
                console.log(
                  `warning: could not hash css resource because it was not found at ${link.attribs["href"]}`
                );
              }
            }
          });

        // handle the script link to index.js
        const scripts = selectAll("script", dom);
        scripts
          .map((script) => script as unknown as Element)
          .forEach((script) => {
            if (
              script.attribs["src"] === "./index.js" &&
              !(script.attribs["hash"]?.toLowerCase() === "false")
            ) {
              try {
                const hashedFilename = addHashToUrl("index.js", rootDir);
                script.attribs["src"] = "./" + path.basename(hashedFilename);
                addFileToFilesToBeRenamed(
                  rootDir,
                  "index.js",
                  hashedFilename,
                  fileRenames
                );
              } catch {
                console.log(
                  `warning: could not hash index.js because it was not found at ${indexJsFile}`
                );
              }
            }
          });

        await writeFile(indexHtmlFile, render(dom));

        fileRenames.forEach((fr) => {
          // we must check existsSync because a file may be included twice
          if (existsSync(fr.original)) {
            renameSync(fr.original, fr.new);
          }
        });

        await writeHashManifest(rootDir, fileRenames);
      },
    },
  };
}

const getFileHash = (filePath: string): string => {
  const buffer = readFileSync(filePath);
  const hash = createHash("md5").update(buffer).digest("hex");
  return hash.slice(0, HASH_CHARACTER_LENGTH);
};

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

async function writeHashManifest(rootDir: string, fileRenames: FileRename[]) {
  const manifestFilename = path.join(rootDir, "hash-manifest.json");
  const manifest: { [originalName: string]: string } = {};

  fileRenames.forEach((fr) => {
    let originalName = fr.original.replace(rootDir + path.sep, "");
    let hashedName = fr.new.replace(rootDir + path.sep, "");
    if (process.platform === "win32") {
      originalName = originalName.replace(/\\/g, "/");
      hashedName = hashedName.replace(/\\/g, "/");
    }
    manifest[originalName] = hashedName;
  });

  const manifestString = JSON.stringify(manifest, null, 2);
  await writeFile(manifestFilename, manifestString);
}

function addFileToFilesToBeRenamed(
  rootDir: string,
  originalUrlValue: string,
  hashedUrlValue: string,
  fileRenames: FileRename[]
) {
  const filename = path.join(rootDir, originalUrlValue);
  const hashedFilename = path.join(rootDir, hashedUrlValue);
  fileRenames.push({
    original: filename,
    new: hashedFilename,
  });
}
