import resolve from "resolve";
import { readFile } from "fs/promises";
import cpy from "cpy";
import * as acorn from "acorn";
import * as walk from "acorn-walk";
import * as estree from "estree";
import { Plugin } from "rollup";
import path from "node:path";
import { packageDirectory } from "pkg-dir";

export interface CopyAssetsOptions {
  /**
   * Name of m2c2kit package or array of names of m2c2kit packages that need
   * assets copied, e.g., `@m2c2kit/assessment-symbol-search` or
   * `["@m2c2kit/assessment-symbol-search", "@m2c2kit/core"]`.
   */
  packageName: string | Array<string>;
  /**
   * Output folder, e.g. `dist` or `build`.
   */
  outputFolder: string;
  /**
   * Whether to log verbose output. Useful for debugging when assets can not
   * be found. Default is false.
   */
  verbose?: boolean;
  /**
   * Current working directory. Default is `process.cwd()`.
   */
  cwd?: string;
}

/**
 * Copies assets from an m2c2kit package to the bundle output folder.
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
        let packageNames: Array<string>;
        if (typeof options.packageName === "string") {
          packageNames = [options.packageName];
        } else if (Array.isArray(options.packageName)) {
          packageNames = options.packageName;
        } else {
          throw new Error(
            `Invalid option. packageName must be a string of array of strings referring to m2c2kit packages. packageName is ${JSON.stringify(
              options.packageName,
            )}`,
          );
        }

        for (const packageName of packageNames) {
          const resolvedPackage = await resolvePackage(
            packageName,
            options.outputFolder,
          );
          if (resolvedPackage === undefined) {
            throw new Error(
              `Could not find package ${packageName}. Has it been installed?`,
            );
          }
          if (options.verbose) {
            console.log(
              `Found ${packageName} at ${resolvedPackage.packageJsonPath}.`,
            );
          }

          if (packageName === "@m2c2kit/core") {
            await copyCoreAssetsExceptWasmIndexHtml(resolvedPackage);
            continue;
          }

          if (packageName === "@m2c2kit/db") {
            await copyDbAssets(resolvedPackage);
            continue;
          }

          await copyAssessmentAssetsAndWasm(resolvedPackage);
        }
      },
    },
  };

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

  async function copyAssessmentAssetsAndWasm(resolvedPackage: resolvedPackage) {
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
    await cpy(
      path.join(resolvedPackage.packageJsonDirectory, "assets", "index.html*"),
      options.outputFolder,
    );
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
