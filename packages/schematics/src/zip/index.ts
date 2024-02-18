import { Rule, Tree } from "@angular-devkit/schematics";
import { Observable } from "rxjs";
import * as archiver from "archiver";
import * as path from "node:path";
import * as fs from "node:fs";
import { mkdtemp } from "node:fs/promises";

export function zip(): Rule {
  return (tree: Tree) => {
    const cwd = process.cwd().replace(/\\/g, "/");

    function getPathFragmentsRecursively(
      dir: string,
      filesArray: string[] = [],
    ) {
      const files = tree.getDir(dir).subfiles;
      const subdirs = tree.getDir(dir).subdirs;

      for (const file of files) {
        filesArray.push(path.join(dir, file));
      }

      for (const subdir of subdirs) {
        const subdirPath = path.join(dir, subdir);
        getPathFragmentsRecursively(subdirPath, filesArray);
      }
      return filesArray;
    }

    const assetsFolder = tree.root.subdirs
      .filter((d) => d == "assets")
      .find(Boolean);
    let assetsFiles: string[] = [];
    if (assetsFolder) {
      assetsFiles = getPathFragmentsRecursively(assetsFolder);
    }

    const distFolder = tree.root.subdirs
      .filter((d) => d == "dist")
      .find(Boolean);
    let distFiles: string[] = [];
    if (distFolder) {
      distFiles = getPathFragmentsRecursively(distFolder);
    }

    function pathFragmentInRoot(filename: string) {
      return tree.root.subfiles.filter((f) => f == filename).find(Boolean);
    }

    if (distFiles.length == 0) {
      throw new Error(
        "No dist files found. Did you forget to build the module before running the zip command?",
      );
    }

    const packageJsonPathFragment = pathFragmentInRoot("package.json");
    if (!packageJsonPathFragment) {
      throw new Error(
        "No package.json found. This is required in order to create a module zip.",
      );
    }

    const files = [
      ...assetsFiles,
      ...distFiles,
      pathFragmentInRoot("README.md"),
      pathFragmentInRoot("LICENSE"),
      pathFragmentInRoot("metadata.json"),
      packageJsonPathFragment,
    ].filter(Boolean) as string[];

    const rule = (tree: Tree) => {
      /**
       * How to make async rules, see:
       * https://medium.com/atlas/angular-schematics-asynchronous-schematics-dc998c0b6fba
       */
      const observer = new Observable<Tree>((observer) => {
        mkdtemp("m2-cli-temp-").then((tempDir) => {
          function cleanUpTempFiles() {
            if (fs.existsSync(tempZipFile)) {
              fs.rmSync(tempZipFile);
            }
            if (fs.existsSync(tempDir)) {
              fs.rmdirSync(tempDir);
            }
          }
          const tempZipFile = path.join(
            path.join(cwd, tempDir),
            `temp-${simpleUuid()}.zip`,
          );
          zipFiles(files, tempZipFile)
            .then(() => {
              const buf = fs.readFileSync(tempZipFile);
              if (tree.exists("module.zip")) {
                tree.overwrite("module.zip", buf);
              } else {
                tree.create("module.zip", buf);
              }
              cleanUpTempFiles();
              observer.next(tree);
              observer.complete();
            })
            .catch(function (err: Error) {
              cleanUpTempFiles();
              observer.error(err);
            });
        });
      });
      return observer;
    };

    return rule;
  };
}

function zipFiles(sourceFiles: string[], outFile: string): Promise<void> {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const stream = fs.createWriteStream(outFile);
  sourceFiles.forEach((file) => {
    archive.append(fs.createReadStream(file), { name: file });
  });

  return new Promise((resolve, reject) => {
    archive.on("error", (err: Error) => reject(err)).pipe(stream);
    stream.on("close", () => resolve());
    archive.finalize();
  });
}

function simpleUuid() {
  /**
   * attribution: https://stackoverflow.com/a/2117523
   * license: https://creativecommons.org/licenses/by-sa/4.0/
   */
  return ((1e7).toString() + -1e3 + -4e3 + -8e3 + -1e11).replace(
    /[018]/g,
    (c) =>
      (
        Number(c) ^
        (Math.floor(Math.random() * 256) & (15 >> (Number(c) / 4)))
      ).toString(16),
  );
}
