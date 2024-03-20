import resolve from "resolve";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import cpy from "cpy";
import { Plugin } from "rollup";
import path from "node:path";
import c from "ansi-colors";
import { satisfies } from "semver";

interface PackageAndExtras {
  /** Package name */
  name: string;
  /** Extra files to copy from package */
  extras?: Array<ExtraFile>;
}

/**
 * Extra file to copy from package.
 */
interface ExtraFile {
  /** Source path, within the package folder structure, of extra file to copy. @remarks IMPORTANT: Add a wildcard * to the end of the source (`index.html*`), otherwise it will be interpreted as a folder. */
  source: string;
  /** Destination path, within the build output folder structure, of extra file to copy. Use the empty string (`""`) for the destination root. */
  dest: string;
}

export interface CopyAssetsOptions {
  /**
   * For assets in an external m2c2kit package, the name of the m2c2kit package
   * or array of names of m2c2kit packages that need assets copied, e.g.,
   * `@m2c2kit/assessment-symbol-search` or
   * `["@m2c2kit/assessment-symbol-search", "@m2c2kit/survey"]`, or a
   * `PackageAndExtras` object, e.g.,
   * `{name: "@m2c2kit/survey", extras: [{ source: "assets/index.html*", dest: "" }]}`
   */
  package?: string | PackageAndExtras | Array<string | PackageAndExtras>;
  /**
   * For assets within this package, the _id_ or _ids_ of the
   * assessment(s) to copy assets for. If the assessment is not within this
   * package, then the assessment _package name_ should be provided in the
   * `package` option.
   */
  id?: string | Array<string>;
  /**
   * Output folder, e.g. `dist` or `build`.
   */
  outputFolder: string;
  /**
   * Whether to log verbose output. Useful for debugging when assets can not
   * be found. Default is false.
   */
  verbose?: boolean;
}

/**
 * Copies m2c2kit assets to the bundle output folder.
 *
 * @remarks Assets such as images, fonts, CSS, and WebAssembly files are
 * needed by assessments. This plugin copies those assets from their
 * respective packages to the output folder.
 *
 * Packages and ids are assumed to be assessments (see exception below), and
 * their assets folders **and** the wasm file from the required version of
 * `@m2c2kit/core` are copied.
 *
 * At the end of the copy process, the `index.html` file from the `src` folder
 * is copied to the output folder. This `index.html` file will have been
 * created by the CLI or the user.
 *
 * A typical use case: Here, there is a new assessment with the id
 * `my-new-assessment` being developed in this package. In addition, two
 * existing assessments, `@m2c2kit/assessment-symbol-search` and
 * `@m2c2kit/assessment-grid-memory`, are being used.
 *
 * @example
 * ```
 * copyAssets({
 *   id: "my-new-assessment",
 *   package: [
 *     "@m2c2kit/assessment-symbol-search",
 *     "@m2c2kit/assessment-grid-memory"
 *   ],
 *  outputFolder: "dist",
 * })
 * ```
 *
 * Exception: if the `package` option is specified and it includes
 * `@m2c2kit/db`, `@m2c2kit/survey`, or `@m2c2kit/session`, then the following
 * assets are copied:
 * - `@m2c2kit/db`: `data.js` and `data.html`
 * - `@m2c2kit/survey`: assets css folder contents
 * - `@m2c2kit/session`: assets folder contents, except `index.html`
 *
 * A typical use case: Here, in addition to assessments, a survey will be
 * administered, and thus survey CSS assets are needed.
 *
 * @example
 * ```
 * copyAssets({
 *   id: "my-new-assessment",
 *   package: [
 *     "@m2c2kit/assessment-symbol-search",
 *     "@m2c2kit/assessment-grid-memory",
 *     "@m2c2kit/survey"
 *   ],
 *  outputFolder: "dist",
 * })
 * ```
 *
 * If the `index.html` from `@m2c2kit/session` or `@m2c2kit/survey` is needed, it
 * can be added as an extra file to copy, but this will be done only in special
 * cases, such as when creating library demos within this repository.
 *
 * This is a very atypical, unusual use case: Here, the `index.html` file from
 * `@m2c2kit/survey` is copied to the output folder on every build.
 *
 * @example
 * ```
 * copyAssets({
 *   package: [
 *     "@m2c2kit/assessment-symbol-search",
 *     {
 *       name: "@m2c2kit/survey",
 *       extras: [{
 *         source: "assets/index.html*",
 *         dest: "",
 *       }]
 *     }
 *   ],
 *  outputFolder: "dist",
 * })
 * ```
 *
 * Usually, the `index.html` **should not** be copied from `@m2c2kit/session` or
 * `@m2c2kit/survey` on every build with the `extras` option because the
 * `index.html` file in the `src` folder should be used. Thus, the `extras`
 * option is only for special cases, such as when creating library demos within
 * this repository (see `@m2c2kit/assessments-demo`).
 *
 * @param options - {@link CopyAssetsOptions}
 * @returns the copyAssets rollup plugin
 */
export function copyAssets(options: CopyAssetsOptions): Plugin {
  return {
    name: "copy-assets",
    writeBundle: {
      /**
       * Sequential is true because we will must call this copy assets
       * plugin before the hash plugin in the writeBundle phase and respect
       * the order.
       */
      sequential: true,
      async handler() {
        if (options.verbose) {
          console.log(c.blue("copyAssets plugin started."));
        }

        if (options.package === undefined && options.id === undefined) {
          throw new Error(
            `Invalid options. Either packageName or id must be specified.`,
          );
        }

        let ids: Array<string>;
        if (typeof options.id === "string") {
          ids = [options.id];
        } else if (Array.isArray(options.id)) {
          ids = options.id as Array<string>;
        } else if (options.id === undefined) {
          ids = [];
        } else {
          throw new Error(
            `Invalid option. id must be a string or array of strings referring to m2c2kit ids. id is ${JSON.stringify(
              options.package,
            )}`,
          );
        }

        const cwd = process.cwd();
        for (const assessmentId of ids) {
          /**
           * If an assessment id is specified, then the assets folder for the
           * assessment could either be in assets/<assessment id> if this is
           * a m2c2kit app OR it could be in assets, if this is a m2c2kit
           * module. An m2c2kit module can be determined by the presence of
           * a package.json file with a m2c2kit.assessmentId property.
           */
          let assetsFrom: string;
          const packageJson: AssessmentPackageJson = JSON.parse(
            await readFile(path.join(cwd, "package.json"), "utf-8"),
          );
          const packageJsonAssessmentId = packageJson.m2c2kit?.assessmentId;
          const isModule = packageJsonAssessmentId !== undefined;
          if (isModule) {
            assetsFrom = path.join(cwd, "assets", "**", "*");
          } else {
            assetsFrom = path.join(cwd, "assets", assessmentId, "**", "*");
          }
          const assetsTo = path.join(
            options.outputFolder,
            "assets",
            assessmentId,
          );
          if (options.verbose) {
            console.log(`assessment id ${c.bold(assessmentId)}:`);
            if (isModule) {
              console.log(`  ${assessmentId} is m2c2kit module`);
            }
            console.log(`  Copying assets from ${assetsFrom} to ${assetsTo}`);
          }
          await cpy(assetsFrom, assetsTo);

          const resolvedPackage: ResolvedPackage = {
            packageJsonPath: path.join(cwd, "package.json"),
            packageName: assessmentId,
            packageJsonDirectory: cwd,
            modulePath: "",
          };
          await copyCoreWasmAssets(resolvedPackage, assessmentId);
        }

        let packages: Array<string | PackageAndExtras>;
        if (typeof options.package === "string") {
          packages = [options.package];
        } else if (Array.isArray(options.package)) {
          packages = options.package;
        } else if (options.package === undefined) {
          packages = [];
        } else {
          throw new Error(
            `Invalid option. packageName must be a string or array of strings referring to m2c2kit packages. packageName is ${JSON.stringify(
              options.package,
            )}`,
          );
        }

        packages = sortSurveyPackageToEnd(packages);

        for (const pkg of packages) {
          let packageName: string;
          if (typeof pkg === "string") {
            packageName = pkg;
          } else {
            packageName = pkg.name;
          }
          if (options.verbose) {
            console.log(`package ${c.bold(packageName)}:`);
          }
          if (packageName === "@m2c2kit/core") {
            throw new Error(
              "Do not include @m2c2kit/core in the copyAssets plugin. @m2c2kit/core is an assessment dependency, and its assets are copied automatically.",
            );
          }

          const resolvedPackage = await resolvePackage({
            packageName,
            outputFolder: options.outputFolder,
            verbose: options.verbose,
          });
          if (resolvedPackage === undefined) {
            throw new Error(
              `  Could not find package ${packageName}. Has it been installed?`,
            );
          }
          if (options.verbose) {
            const version: string = JSON.parse(
              await readFile(resolvedPackage.packageJsonPath, "utf-8"),
            ).version;
            console.log(
              `  ${c.green("Found")} ${packageName} version ${version} at ${resolvedPackage.packageJsonPath}.`,
            );
          }

          switch (packageName) {
            case "@m2c2kit/session":
              /**
               * Copy the session assets folder contents **except** `index.html`.
               */
              await copySessionAssetsExceptIndexHtml(resolvedPackage);
              break;
            case "@m2c2kit/db":
              await copyDbAssets(resolvedPackage);
              break;
            case "@m2c2kit/survey":
              await copySurveyAssets(resolvedPackage);
              break;
            default:
              await copyPackageAssets(resolvedPackage);
          }

          if (typeof pkg === "object" && Array.isArray(pkg.extras)) {
            await copyExtraFiles(resolvedPackage, pkg.extras);
          }
        }

        await cpy(path.join("src", "index.html*"), options.outputFolder);
        if (!existsSync(path.join(options.outputFolder, "index.html"))) {
          console.warn(
            "WARNING: an index.html file does not exist in the output folder. Usually, there should be an index.html in the src folder.",
          );
        }
        if (options.verbose) {
          console.log(c.blue("copyAssets plugin finished."));
        }
      },
    },
  };

  async function copyExtraFiles(
    resolvedPackage: ResolvedPackage,
    extraFiles: Array<ExtraFile>,
  ) {
    if (extraFiles.length === 0) {
      return;
    }

    /**
     * Handle the case where the user has specified a single file to copy.
     * the cpy library interprets the source as a folder if it does not end
     * with a wildcard. Why is this?
     */
    extraFiles.forEach((extraFile) => {
      const regex = new RegExp(`[^\\/]+\\.[^\\.\\*]+(?! \\*)$`);
      if (extraFile.source.match(regex)) {
        console.warn(
          'WARNING: If copying a single file in the "extras" option, be sure to add a wildcard * to the end of the source, e.g., index.html*',
        );
        console.warn(
          "Otherwise, the source will be interpreted as a folder, and the file will not be copied.",
        );
      }
    });

    await Promise.all(
      extraFiles.map((extraFile) =>
        cpy(
          path.join(resolvedPackage.packageJsonDirectory, extraFile.source),
          path.join(options.outputFolder, extraFile.dest),
        ),
      ),
    );
  }

  async function copyDbAssets(resolvedPackage: ResolvedPackage) {
    if (options.verbose) {
      console.log(
        `  Copying assets from ${resolvedPackage.packageName} to ${options.outputFolder}/assets.`,
      );
    }
    await cpy(
      path.join(resolvedPackage.packageJsonDirectory, "dist", "data.js*"),
      options.outputFolder,
    );
    await cpy(
      path.join(resolvedPackage.packageJsonDirectory, "data.html*"),
      options.outputFolder,
    );
  }

  async function copySurveyAssets(resolvedPackage: ResolvedPackage) {
    if (options.verbose) {
      console.log(
        `  Copying assets from ${resolvedPackage.packageName} to ${options.outputFolder}/assets.`,
      );
    }
    await cpy(
      path.join(resolvedPackage.packageJsonDirectory, "assets", "css"),
      path.join(options.outputFolder, "assets"),
    );
  }

  async function copyPackageAssets(resolvedPackage: ResolvedPackage) {
    const assessmentId = await getAssessmentIdFromPackageJson(
      resolvedPackage.packageJsonPath,
    );
    if (assessmentId === undefined) {
      throw new Error(
        `Could not find assessment id for package ${resolvedPackage.packageName}.`,
      );
    }
    const assetsFrom = path.join(
      resolvedPackage.packageJsonDirectory,
      "assets",
      "**",
      "*",
    );
    const assetsTo = path.join(options.outputFolder, "assets", assessmentId);
    if (options.verbose) {
      console.log(`  Copying assets from ${assetsFrom} to ${assetsTo}`);
    }
    await cpy(assetsFrom, assetsTo);

    await copyCoreWasmAssets(resolvedPackage, assessmentId);
  }

  async function copyCoreWasmAssets(
    resolvedPackage: ResolvedPackage,
    assessmentId: string,
  ) {
    const wantedCoreVersion: string | undefined = (
      JSON.parse(
        await readFile(resolvedPackage.packageJsonPath, "utf-8"),
      ) as AssessmentPackageJson
    ).dependencies["@m2c2kit/core"];
    if (wantedCoreVersion === undefined) {
      throw new Error(
        `Could not determine version of @m2c2kit/core in the dependencies of ${resolvedPackage.packageName}. Is @m2c2kit/core a dependency in the package.json file of ${resolvedPackage.packageName}?`,
      );
    }

    if (options.verbose) {
      console.log(
        `  Resolving dependency @m2c2kit/core version ${wantedCoreVersion}, starting in ${resolvedPackage.packageJsonDirectory}`,
      );
    }

    const resolvedCorePackage = await resolvePackage({
      packageName: "@m2c2kit/core",
      packageVersion: wantedCoreVersion,
      basedir: resolvedPackage.packageJsonDirectory,
      verbose: options.verbose,
    });
    if (resolvedCorePackage === undefined) {
      throw new Error(
        `Could not find @m2c2kit/core version ${wantedCoreVersion}. Has it been installed?`,
      );
    }

    const resolvedCoreVersion: string | undefined = JSON.parse(
      await readFile(resolvedCorePackage.packageJsonPath, "utf-8"),
    ).version;

    if (options.verbose) {
      console.log(
        `  ${c.green("Found")} @m2c2kit/core version ${resolvedCoreVersion} at ${resolvedCorePackage.packageJsonDirectory}`,
      );
      console.log(
        `  Copying wasm file from @m2c2kit/core version ${resolvedCoreVersion} to ${options.outputFolder}/assets/${assessmentId}`,
      );
    }

    await cpy(
      path.join(
        resolvedCorePackage.packageJsonDirectory,
        "assets",
        "canvaskit-*.wasm",
      ),
      path.join(options.outputFolder, "assets", assessmentId),
    );
  }

  async function copySessionAssetsExceptIndexHtml(
    resolvedPackage: ResolvedPackage,
  ) {
    if (options.verbose) {
      console.log(
        `  Copying assets from ${resolvedPackage.packageName} to ${options.outputFolder}/assets.`,
      );
    }
    await cpy(
      [
        path.join(resolvedPackage.packageJsonDirectory, "assets", "**", "*"),
        "!" +
          path.join(
            resolvedPackage.packageJsonDirectory,
            "assets",
            "index.html",
          ),
      ],
      path.join(options.outputFolder, "assets"),
    );
  }
}

/**
 * Moves the survey package to the end of the array of packages
 * whose assets will be copied.
 *
 * @remarks Both session and survey have an index.html file in their assets
 * that can be used as a template. But the survey index.html file has
 * additional CSS that is needed for the survey. If a user mistakenly requests
 * to copy both the session and survey index.html files, by placing survey at
 * the end of the array, the survey index.html file will be copied last and
 * overwrite the session index.html
 *
 * @param packages - array of package names or PackageAndExtras objects
 * @returns packages with survey moved to the end of the array
 */
function sortSurveyPackageToEnd(packages: Array<string | PackageAndExtras>) {
  const surveyPackageIndex = packages.findIndex((pkg) => {
    if (typeof pkg === "string") {
      return pkg === "@m2c2kit/survey";
    } else {
      return pkg.name === "@m2c2kit/survey";
    }
  });
  if (surveyPackageIndex === -1) {
    return packages;
  } else {
    const surveyPackage = packages.splice(surveyPackageIndex, 1);
    return [...packages, surveyPackage[0]];
  }
}

interface AssessmentPackageJson {
  m2c2kit: {
    assessmentId: string;
  };
  dependencies: {
    [key: string]: string;
  };
}

interface ResolvedPackage {
  packageJsonPath: string;
  packageName: string;
  packageJsonDirectory: string;
  modulePath: string;
}

interface ResolvePackageOptions {
  packageName: string;
  packageVersion?: string;
  basedir?: string;
  outputFolder?: string;
  verbose?: boolean;
}

async function resolvePackage(
  options: ResolvePackageOptions,
): Promise<ResolvedPackage | undefined> {
  let modulePath: string;

  try {
    modulePath = resolve
      .sync(options.packageName, {
        basedir: options.basedir,
        packageFilter: (pkg) => {
          if (options.packageVersion === undefined) {
            return pkg;
          }
          if (satisfies(pkg.version as string, options.packageVersion)) {
            return pkg;
          }
          /**
           * Returning an empty object will cause the currently tested package
           * to be skipped.
           */
          return {};
        },
      })
      .replace(/\\/g, "/");
  } catch (error) {
    return undefined;
  }
  const regex = new RegExp(`^.*${options.packageName}`);
  const matches = modulePath.match(regex);
  if (!matches || matches.length === 0) {
    return undefined;
  }
  const packageJsonDirectory = matches[0];
  return {
    packageJsonPath: path.join(packageJsonDirectory, "package.json"),
    packageName: options.packageName,
    packageJsonDirectory,
    modulePath,
  };
}

async function getAssessmentIdFromPackageJson(
  filePath: string,
): Promise<string | undefined> {
  const packageJson: AssessmentPackageJson = JSON.parse(
    await readFile(filePath, "utf-8"),
  );
  const assessmentId = packageJson.m2c2kit.assessmentId;
  if (assessmentId === undefined) {
    throw new Error(
      `Could not find property m2c2kit.assessmentId in package.json at ${filePath}.`,
    );
  }
  return assessmentId;
}
