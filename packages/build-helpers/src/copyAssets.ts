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
   * `["@m2c2kit/assessment-symbol-search", "@m2c2kit/core"]`, or a
   * PackageAndExtras object, e.g.,
   * {name: "@m2c2kit/core", extras: [{ source: "assets/index.html*", dest: "" }]}
   */
  package: string | Array<string | PackageAndExtras>;
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
 * - `@m2c2kit/core`: assets folder contents **except** wasm and `index.html`
 * - `@m2c2kit/db`: `data.js` and `data.html`
 * - `@m2c2kit/survey`: assets folder contents
 *
 * All other packages are assumed to be assessments, and their assets folder
 * **and** the wasm file from the required version of `@m2c2kit/core` are
 * copied. Note that the assessments's package name must be used, not its
 * m2c2kit game `id`.
 *
 * At the end of the copy process, the `index.html` file from the `src` folder
 * is copied to the output folder.
 *
 * If the `index.html` from `@m2c2kit/core` or `@m2c2kit/survey` is needed, it
 * can be added as an extra file to copy.
 *
 * @example
 * ```
 * copyAssets({
 *   package: [
 *     "@m2c2kit/core",
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
 * Usually, the `index.html` **should not** be copied from `@m2c2kit/core` or
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

        for (const pkg of packages) {
          let packageName: string;
          if (typeof pkg === "string") {
            packageName = pkg;
          } else {
            packageName = pkg.name;
          }

          const resolvedPackage = await resolvePackage(
            packageName,
            options.outputFolder,
          );
          if (resolvedPackage === undefined) {
            throw new Error(
              `Could not find package ${pkg}. Has it been installed?`,
            );
          }
          if (options.verbose) {
            console.log(`Found ${pkg} at ${resolvedPackage.packageJsonPath}.`);
          }

          switch (packageName) {
            case "@m2c2kit/core":
              await copyCoreAssetsExceptWasmIndexHtml(resolvedPackage);
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
            "WARNING: an index.html file was not copied to the output folder. Usually, there should be an index.html in the src folder.",
          );
        }
      },
    },
  };

  async function copyExtraFiles(
    resolvedPackage: resolvedPackage,
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

  async function copyDbAssets(resolvedPackage: resolvedPackage) {
    await cpy(
      path.join(resolvedPackage.packageJsonDirectory, "dist", "data.js*"),
      options.outputFolder,
    );
    await cpy(
      path.join(resolvedPackage.packageJsonDirectory, "data.html*"),
      options.outputFolder,
    );
  }

  async function copySurveyAssets(resolvedPackage: resolvedPackage) {
    await cpy(
      path.join(resolvedPackage.packageJsonDirectory, "assets", "css"),
      path.join(options.outputFolder, "assets"),
    );
  }

  async function copyPackageAssets(
    resolvedPackage: resolvedPackage,
    copyWasm = true,
  ) {
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
    if (!copyWasm) {
      return;
    }
    const resolvedCorePackage = await resolvePackage("@m2c2kit/core");
    if (resolvedCorePackage === undefined) {
      throw new Error(
        `Could not find package @m2c2kit/core. Has it been installed?`,
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

  async function copyCoreAssetsExceptWasmIndexHtml(
    resolvedPackage: resolvedPackage,
  ) {
    await cpy(
      [
        path.join(resolvedPackage.packageJsonDirectory, "assets", "**", "*"),
        "!" +
          path.join(
            resolvedPackage.packageJsonDirectory,
            "assets",
            "index.html",
          ),
        "!" +
          path.join(
            resolvedPackage.packageJsonDirectory,
            "assets",
            "canvaskit-*.wasm",
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
 * @remarks Both core and survey have an index.html file that can be used as
 * a template. But the survey index.html file has additional CSS that is
 * needed for the survey. If a user mistakenly requests to copy both the core
 * and survey index.html files, by placing survey at the end of the array, the
 * survey index.html file will be copied last and overwrite the core
 * index.html
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

interface resolvedPackage {
  packageJsonPath: string;
  packageName: string;
  packageJsonDirectory: string;
  modulePath: string;
}

async function resolvePackage(
  packageName: string,
  outputFolder?: string,
): Promise<resolvedPackage | undefined> {
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
    if (pkgName !== packageName) {
      resolvedDirectory = undefined;
    }
  }
  if (resolvedDirectory !== undefined) {
    /**
     * package.json is in current working directory. By convention (how the
     * m2c2 cli sets up a new project), the module is in the output folder,
     * e.g., `dist` or `build`, and it called `index.js`.
     */
    if (outputFolder === undefined) {
      throw new Error(
        `outputFolder must be specified when package.json is in current working directory.`,
      );
    }
    return {
      packageJsonPath: path.join(resolvedDirectory, "package.json"),
      packageName,
      packageJsonDirectory: resolvedDirectory,
      modulePath: path.join(resolvedDirectory, outputFolder, "index.js"),
    };
  }

  let modulePath: string;
  try {
    modulePath = resolve.sync(packageName).replace(/\\/g, "/");
  } catch (error) {
    return undefined;
  }
  const regex = new RegExp(`^.*${packageName}`);
  const matches = modulePath.match(regex);
  if (!matches || matches.length === 0) {
    return undefined;
  }
  const packageJsonDirectory = matches[0];
  return {
    packageJsonPath: path.join(packageJsonDirectory, "package.json"),
    packageName,
    packageJsonDirectory,
    modulePath,
  };
}

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
