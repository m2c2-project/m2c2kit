import resolve from "resolve";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import cpy from "cpy";
import * as acorn from "acorn";
import * as walk from "acorn-walk";
import * as estree from "estree";
import { Plugin } from "rollup";
import path from "node:path";
import { packageDirectory } from "pkg-dir";
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
   * Name of m2c2kit package or array of names of m2c2kit packages that need
   * assets copied, e.g., `@m2c2kit/assessment-symbol-search` or
   * `["@m2c2kit/assessment-symbol-search", "@m2c2kit/session"]`, or a
   * PackageAndExtras object, e.g.,
   * {name: "@m2c2kit/session", extras: [{ source: "assets/index.html*", dest: "" }]}
   */
  package: string | PackageAndExtras | Array<string | PackageAndExtras>;
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
 * Copies assets from an m2c2kit package to the bundle output folder.
 *
 * @remarks Assets such as images, fonts, CSS, and WebAssembly files are
 * needed by assessments. This plugin copies those assets from their
 * respective packages to the output folder. What is copied depends on the
 * package that is specified.
 * - `@m2c2kit/session`: assets folder contents **except** `index.html`
 * - `@m2c2kit/db`: `data.js` and `data.html`
 * - `@m2c2kit/survey`: assets folder contents
 * - All other packages are assumed to be assessments, and their assets folder
 * **and** the wasm file from the required version of `@m2c2kit/core` are
 * copied. Note that the assessment's package name must be used, not its
 * m2c2kit game `id`.
 *
 * At the end of the copy process, the `index.html` file from the `src` folder
 * is copied to the output folder. This `index.html` file will have been created
 * by the CLI or the user.
 *
 * If the `index.html` from `@m2c2kit/session` or `@m2c2kit/survey` is needed, it
 * can be added as an extra file to copy, but this will be done only in special
 * cases, such as when creating library demos within this repository.
 *
 * @example
 * ```
 * copyAssets({
 *   package: [
 *     "@m2c2kit/session",
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
 * `@m2c2kit/survey` on every build with the `extras` options because the
 * `index.html` file in the `src` folder should be used. Thus, the `extras`
 * option is only for special cases, such as when creating library demos within
 * this repository (see `@m2c2kit/assessments-demo`).
 *
 * @param options - {@link CopyAssetsOptions}
 * @returns
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
        let packages: Array<string | PackageAndExtras>;
        if (typeof options.package === "string") {
          packages = [options.package];
        } else if (Array.isArray(options.package)) {
          packages = options.package;
        } else {
          throw new Error(
            `Invalid option. packageName must be a string of array of strings referring to m2c2kit packages. packageName is ${JSON.stringify(
              options.package,
            )}`,
          );
        }

        packages = sortSurveyPackageToEnd(packages);
        if (options.verbose) {
          console.log(c.blue("copyAssets plugin started."));
        }

        for (const pkg of packages) {
          let packageName: string;
          if (typeof pkg === "string") {
            packageName = pkg;
          } else {
            packageName = pkg.name;
          }
          if (options.verbose) {
            console.log(`${c.bold(packageName)}:`);
          }
          if (packageName === "@m2c2kit/core") {
            throw new Error(
              "Do not include @m2c2kit/core in the copyAssets plugin. @m2c2kit/core an assessment dependency, and its assets are copied automatically.",
            );
          }

          const resolvedPackage = await resolvePackage({
            packageName,
            outputFolder: options.outputFolder,
          });
          if (resolvedPackage === undefined) {
            throw new Error(
              `  Could not find package ${packageName}. Has it been installed?`,
            );
          }
          if (options.verbose) {
            console.log(
              `  ${c.green("Found")} ${packageName} at ${resolvedPackage.packageJsonPath}.`,
            );
          }

          switch (packageName) {
            /**
             * session package has the css for m2c2kit.
             * Copy the assets folder contents **except** `index.html`.
             */
            case "@m2c2kit/session":
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
    const assessmentId = await getAssessmentId(resolvedPackage.modulePath);
    if (assessmentId === undefined) {
      throw new Error(
        `Could not find assessment id for package ${resolvedPackage.packageName}.`,
      );
    }
    await cpy(
      path.join(resolvedPackage.packageJsonDirectory, "assets", "**", "*"),
      path.join(options.outputFolder, "assets", assessmentId),
    );

    const wantedCoreVersion: string | undefined = JSON.parse(
      await readFile(resolvedPackage.packageJsonPath, "utf-8"),
    ).dependencies["@m2c2kit/core"];
    if (wantedCoreVersion === undefined) {
      throw new Error(
        `Could not determine version of @m2c2kit/core in the dependencies of ${resolvedPackage.packageName}. Is @m2c2kit/core a dependency in the package.json file of ${resolvedPackage.packageName}?`,
      );
    }

    if (options.verbose) {
      console.log(
        `  Resolving dependency @m2c2kit/core version ${wantedCoreVersion}, starting in ${resolvedPackage.packageJsonDirectory}.`,
      );
    }

    const resolvedCorePackage = await resolvePackage({
      packageName: "@m2c2kit/core",
      packageVersion: wantedCoreVersion,
      basedir: resolvedPackage.packageJsonDirectory,
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
        `  Copying wasm file from @m2c2kit/core version ${resolvedCoreVersion}to ${options.outputFolder}/assets/${assessmentId}.`,
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
}

async function resolvePackage(
  options: ResolvePackageOptions,
): Promise<ResolvedPackage | undefined> {
  let resolvedDirectory: string | undefined;

  /**
   * The package.json for an assessment may be in the current working
   * directory and not in a node_modules folder. That is the case when
   * an assessment is being developed within this folder. In that case,
   * the resolve.sync() method will not find it. So, we need to
   * check for that possibility with another approach -- the `pkg-dir`
   * library's `packageDirectory()` method.
   */
  resolvedDirectory = await packageDirectory();
  if (resolvedDirectory !== undefined) {
    resolvedDirectory = resolvedDirectory.replace(/\\/g, "/");
    const pkgName: string | undefined = JSON.parse(
      await readFile(path.join(resolvedDirectory, "package.json"), "utf-8"),
    ).name;
    if (pkgName !== options.packageName) {
      resolvedDirectory = undefined;
    }
  }
  if (resolvedDirectory !== undefined) {
    /**
     * package.json is in current working directory. By convention (how the
     * m2c2 cli sets up a new project), the module is in the output folder,
     * e.g., `dist` or `build`, and it called `index.js`.
     */
    if (options.outputFolder === undefined) {
      throw new Error(
        `outputFolder must be specified when package.json is in current working directory.`,
      );
    }
    return {
      packageJsonPath: path.join(resolvedDirectory, "package.json"),
      packageName: options.packageName,
      packageJsonDirectory: resolvedDirectory,
      modulePath: path.join(
        resolvedDirectory,
        options.outputFolder,
        "index.js",
      ),
    };
  }

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

/**
 * Parses the JavaScript file to find the assessment id.
 *
 * @remarks The assessment id, **not** its package name, is needed to copy the
 * assets from the assessment package to the output folder. The folder
 * structure in the output folder is `outputFolder/assets/<assessment id>`.
 *
 * @param filePath - path to the JavaScript file
 * @returns assessment id
 */
async function getAssessmentId(filePath: string): Promise<string | undefined> {
  const jsFileContents = await readFile(filePath, "utf-8");
  let ast: acorn.Node;
  try {
    /**
     * Why not ecma 6? ecma 8 is needed for async/await, and ecma 9 is needed
     * for spread operator in object literals, and ecma 11 is needed for
     * nullish coalescing operator.
     */
    ast = acorn.parse(jsFileContents, {
      ecmaVersion: 11,
      sourceType: "module",
    });
  } catch (error) {
    throw new Error(
      `Could not parse JavaScript in assessment package ${filePath}. Parser error at ${JSON.stringify(
        error,
      )}}`,
    );
  }

  let id: string | undefined = undefined;

  try {
    walk.ancestor(ast, {
      // this code will be run each time the walker visits a literal
      Literal(node, ancestors: Array<acorn.Node>) {
        if (ancestors.length >= 3) {
          const maybeProperty = ancestors.slice(-2)[0];

          if (maybeProperty.type === "Property") {
            const property = maybeProperty as unknown as estree.Property;

            if (
              property.key.type === "Identifier" &&
              (property.key as estree.Identifier).name == "id"
            ) {
              // property is id
              const literal = node as unknown as estree.Literal;
              const assessmentId = literal.value as string;
              const objectExpression = ancestors.slice(
                -3,
              )[0] as unknown as estree.ObjectExpression;
              const properties =
                objectExpression.properties as unknown as Array<estree.Property>;
              const propertyNames = properties.map(
                (prop) => (prop.key as estree.Identifier).name,
              );

              /**
               * We will assume that the assessment id is the correct one if
               * the object has the following properties: name, id, version,
               * width, and height.
               */
              const gameOptionsRequiredProperties = [
                "name",
                "id",
                "version",
                "width",
                "height",
              ];
              const propCount = propertyNames.filter(
                (i) => gameOptionsRequiredProperties.indexOf(i) !== -1,
              ).length;
              if (propCount === gameOptionsRequiredProperties.length) {
                id = assessmentId;
                // Throwing an error is the only way to break out of the walker
                // see https://github.com/acornjs/acorn/issues/625
                throw new Error("breakout");
              }
            }
          }
        }
      },
    });
  } catch (err) {
    /**
     * If the error is not the one we threw to break out of the walker, then
     * rethrow it.
     */
    if (!(err instanceof Error && err.message === "breakout")) {
      throw err;
    }
  }
  return id;
}
