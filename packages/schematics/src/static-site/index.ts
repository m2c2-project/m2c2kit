import { Rule, Tree } from "@angular-devkit/schematics";
import * as path from "node:path";
import * as fs from "node:fs";
import { pathToFileURL } from "url";
import { satisfies } from "semver";
import * as beautify from "js-beautify";
import { decompressTgzArchive, ExtractedFile } from "./decompressTgzArchive";
import { fetchPackage } from "./fetchPackage";
import { getNpmPackageMetadata } from "./getNpmPackageMetadata";
import { extractMethodBodyFromArrowFunctionString } from "./extractMethodBodyFromArrowFunctionString";
import { loadEsmModule } from "./loadEsmModule";
import { getFilesRecursive } from "./getFilesRecursive";
import { Configure, Entry, Setup, StaticSiteConfig } from "./StaticSiteConfig";
/**
 * @m2c2kit/core and @m2c2kit/session are included only for their type
 * definitions. Thus, these are devDependencies in the package.json file.
 */
import { Game } from "@m2c2kit/core";

const DEFAULT_REGISTRY_URL = "https://registry.npmjs.org";

interface m2StaticSiteOptions {
  config?: string;
  dockerfile?: boolean;
  init?: boolean;
}

interface AssessmentConfiguration {
  name: string;
  extends?: {
    name: string;
    version: string;
  };
  version: string;
  requiredPackages: {
    [name: string]: string;
  };
  parameters?: {
    [key: string]: string | number | boolean | object | null;
  };
  setup?: Setup;
  configure?: Configure;
  entry?: Entry;
}

interface PackageToDownload {
  name: string;
  version: string;
  url: string;
  tokenEnvironmentVariable?: string;
}

interface DependencyTree {
  [name: string]: {
    [version: string]: {
      [dependency: string]: string;
    };
  };
}

// This is the original code, but it is included as string to avoid TypeScript
// altering the import statement
//
// export async function loadModules(moduleNames: string[]) {
//   const modules = await Promise.all(
//      moduleNames.map((moduleName) => import(moduleName))
//    );
//    return modules;
// }
const loadModulesFunction = `async function loadModules(moduleNames) {
  const modules = await Promise.all(
    moduleNames.map((moduleName) => import(moduleName))
  );
  return modules;
}`;

// This will be converted to string and included in the index.js for the
// assessment
function setGameParametersFromUrlParams(
  game: Game,
  urlParams: URLSearchParams,
) {
  const gameParameters = Object.fromEntries(urlParams.entries());
  game.setParameters(gameParameters);
}
const setGameParametersFromUrlFunction =
  setGameParametersFromUrlParams.toString();

// This will be converted to string and included in the index.js for the
// assessment
// module could be any type, so we use any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAssessmentClassNameFromModule(assessmentModule: any) {
  const assessments = Object.keys(assessmentModule).filter((key) => {
    const obj = assessmentModule[key];
    if (
      typeof obj === "function" &&
      obj.prototype &&
      obj.prototype.constructor === obj
    ) {
      // assessments should always inherit from Game
      const parentClass = Object.getPrototypeOf(obj.prototype).constructor;
      const parentProps = Object.getOwnPropertyNames(parentClass.prototype);
      // if the parent is Game, it should have the following properties
      return (
        parentProps.includes("loop") &&
        parentProps.includes("update") &&
        parentProps.includes("draw")
      );
    }
    return false;
  });

  if (assessments.length === 0) {
    throw new Error("could not determine assessment in module");
  }

  if (assessments.length > 1) {
    throw new Error("there is more than one assessment exported in the module");
  }

  return assessments[0];
}
const getAssessmentClassNameFromModuleFunction =
  getAssessmentClassNameFromModule.toString();

function getFilePathWithoutFilename(filename: string) {
  return filename.substring(0, filename.lastIndexOf("/"));
}

function deleteDirectory(tree: Tree, dirPath: string) {
  const dir = tree.getDir(dirPath);
  dir.subfiles.forEach((file) => tree.delete(`${dirPath}/${file}`));
  dir.subdirs.forEach((subDir) =>
    deleteDirectory(tree, `${dirPath}/${subDir}`),
  );
  tree.delete(dirPath);
}

export function staticSite(options: m2StaticSiteOptions): Rule {
  return async (tree: Tree) => {
    const cwd = process.cwd().replace(/\\/g, "/");

    if (options.init && options.config) {
      throw new Error(
        "Cannot specify both --init and --config options at the same time.",
      );
    }

    if (options.init) {
      tree.create("site-config.mjs", newConfig);
      return;
    }

    if (!options.config) {
      throw new Error(
        "No configuration file specified. Use --config option, e.g., --config=site-config.mjs",
      );
    }

    const configFileURL = pathToFileURL(path.join(cwd, options.config));
    /**
     * see https://github.com/angular/angular-cli/issues/22786 for why the
     * loadEsmModule() method is used, instead of a direct import statement.
     */
    const config: StaticSiteConfig = await loadEsmModule(configFileURL);

    // Ensure the outDir is empty
    const outDir = tree.getDir(config.outDir);
    outDir.subfiles.forEach((file) => tree.delete(`${config.outDir}/${file}`));
    outDir.subdirs.forEach((dir) =>
      deleteDirectory(tree, `${config.outDir}/${dir}`),
    );

    const assessments = config.assessments;
    if (!assessments || !Array.isArray(assessments)) {
      throw new Error(
        `Error reading assessments from configuration file ${options.config}.`,
      );
    }

    if (assessments.length === 0) {
      throw new Error(
        `No assessments found in configuration file ${options.config}.`,
      );
    }

    const importMaps: { [key: string]: string } = {};

    if (config.dependencies) {
      // currently only ESM packages are supported
      // transitive dependencies are not resolved
      // TODO: add support for CJS packages via rollup
      // TODO: add support for transitive dependencies?
      const esmDependencies = Object.entries(config.dependencies);
      for (const [name, version] of esmDependencies) {
        const packageData = await getNpmPackageMetadata(
          DEFAULT_REGISTRY_URL,
          name,
        );

        const url = packageData.versions[version].dist.tarball;
        const buffer = await fetchPackage(url);
        console.log(
          `downloaded ${name}@${version} (${buffer.byteLength} bytes) from ${url}`,
        );

        const files = await decompressTgzArchive(buffer);
        for (const file of files) {
          const filepath = file.filepath.replace("package/", "");
          tree.create(
            config.outDir + `/modules/${name}@${version}/${filepath}`,
            file.buffer,
          );
        }

        let entry = packageData.versions[version].module;
        if (!entry) {
          console.log(
            `No module entry found for ${name}@${version} in package.json`,
          );
          console.log(
            "Remember that currently only ESM packages are supported.",
          );
          if (packageData.versions[version].main) {
            entry = packageData.versions[version].main;
            console.log(`Using main entry: ${entry}, but this may not work.`);
          } else {
            console.log(
              `No main entry found for ${name}@${version} in package.json`,
            );
            entry = "dist/index.js";
            console.log(
              `Using default entry: ${entry}, but this may not work.`,
            );
          }
        }
        importMaps[name] = `../../../modules/${name}@${version}/${entry}`;
      }
    }

    const packagesToDownload: PackageToDownload[] = [];
    const dependencyTree: DependencyTree = {};
    const assessmentConfigurations = new Array<AssessmentConfiguration>();

    /**
     * Go through the RegistryAssessment objects and get their metadata
     * to determine the versions to download and what their dependencies
     * are.
     */
    for (const assessment of assessments.filter((p) => "versions" in p)) {
      const registryUrl = assessment.registryUrl ?? DEFAULT_REGISTRY_URL;
      const packageMetadata = await getNpmPackageMetadata(
        registryUrl,
        assessment.name,
        assessment.tokenEnvironmentVariable,
      );

      const versions = Object.keys(packageMetadata.versions);
      for (const version of versions) {
        if (satisfies(version, assessment.versions)) {
          const dependencies = packageMetadata.versions[version].dependencies;
          if (!dependencyTree[assessment.name]) {
            dependencyTree[assessment.name] = {};
          }
          dependencyTree[assessment.name][version] = dependencies;

          // TODO: this is a temporary fix to add @m2c2kit/session as a dependency
          // we should scan the assessment's package.json dependencies and
          // devDependencies for @m2c2kit/session and add the appropriate version
          if (!dependencyTree[assessment.name][version]["@mc2kit/session"]) {
            dependencyTree[assessment.name][version]["@m2c2kit/session"] =
              "0.3.3";
          }
          const url = packageMetadata.versions[version].dist.tarball;
          packagesToDownload.push({
            name: assessment.name,
            version,
            url,
            tokenEnvironmentVariable: assessment.tokenEnvironmentVariable,
          });
          assessmentConfigurations.push({
            name: assessment.name,
            version,
            requiredPackages: {
              [assessment.name]: version,
              ...dependencies,
            },
            parameters: assessment.parameters,
            /**
             * Use the setup and configure functions for this specific
             * assessment, if they exist. Otherwise, use the functions
             * from the configuration.
             */
            setup: assessment.setup ?? config.setup,
            configure: assessment.configure ?? config.configure,
            entry: assessment.entry ?? config.entry,
          });

          for (const dependency in dependencies) {
            const dependencyVersion = dependencies[dependency];

            // if packagesToDownload already has the dependency with the same name and version
            // we don't need to download it again
            if (
              packagesToDownload.find(
                (p) => p.name === dependency && p.version === dependencyVersion,
              )
            ) {
              continue;
            }
            const packageData = await getNpmPackageMetadata(
              // dependencies are always retrieved from the default registry
              DEFAULT_REGISTRY_URL,
              dependency,
              assessment.tokenEnvironmentVariable,
            );
            const dependencyUrl =
              packageData.versions[dependencyVersion].dist.tarball;
            packagesToDownload.push({
              name: dependency,
              version: dependencyVersion,
              url: dependencyUrl,
              tokenEnvironmentVariable: assessment.tokenEnvironmentVariable,
            });
          }
        }
      }
    }

    /**
     * Go through the ExtendedAssessment objects and check that they extend an
     * included RegistryAssessment. If they do, add the required packages to the
     * assessment configurations.
     */
    for (const assessment of assessments.filter((p) => "extends" in p)) {
      if (
        !dependencyTree[assessment.extends.name][assessment.extends.version]
      ) {
        throw new Error(
          `Assessment ${assessment.name} extends ${assessment.extends.name}@${assessment.extends.version}, but it is not included in the configuration.`,
        );
      }
      const dependencies =
        dependencyTree[assessment.extends.name][assessment.extends.version];
      assessmentConfigurations.push({
        name: assessment.name,
        extends: assessment.extends,
        version: assessment.version,
        requiredPackages: {
          [assessment.extends.name]: assessment.extends.version,
          ...dependencies,
        },
        parameters: assessment.parameters,
        /**
         * Use the setup and configure functions for this specific
         * assessment, if they exist. Otherwise, use the functions
         * from the configuration.
         */
        setup: assessment.setup ?? config.setup,
        configure: assessment.configure ?? config.configure,
        entry: assessment.entry ?? config.entry,
      });
    }

    const decompressedTgzFiles: { [key: string]: ExtractedFile[] } = {};
    for (const assessment of assessments.filter((p) => "tarball" in p)) {
      const tgzBuffer = fs.readFileSync(assessment.tarball);
      const tgzFiles = await decompressTgzArchive(tgzBuffer);
      const packageJsonBuffer = tgzFiles.find(
        (f) => f.filepath === "package/package.json",
      );
      if (!packageJsonBuffer) {
        throw new Error(`No package.json found in ${assessment.tarball}`);
      }
      const packageJson = JSON.parse(packageJsonBuffer.buffer.toString());
      const name = packageJson.name as string;
      const version = packageJson.version as string;

      if (!decompressedTgzFiles[name]) {
        decompressedTgzFiles[`${name}@${version}`] = [];
      }
      decompressedTgzFiles[`${name}@${version}`].push(...tgzFiles);
      console.log(
        `extracted ${name}@${version} (${tgzBuffer.byteLength} bytes) from ${assessment.tarball}`,
      );

      const dependencies = packageJson.dependencies as {
        [key: string]: string;
      };
      if (!dependencyTree[name]) {
        dependencyTree[name] = {};
      }
      dependencyTree[name][version] = dependencies;

      // TODO: this is a temporary fix to add @m2c2kit/session as a dependency
      // we should scan the assessment's package.json dependencies and
      // devDependencies for @m2c2kit/session and add the appropriate version
      if (!dependencyTree[name][version]["@mc2kit/session"]) {
        dependencyTree[name][version]["@m2c2kit/session"] = "0.3.3";
      }

      assessmentConfigurations.push({
        name: name,
        version,
        requiredPackages: {
          [name]: version,
          ...dependencies,
        },
        parameters: assessment.parameters,
        /**
         * Use the setup and configure functions for this specific
         * assessment, if they exist. Otherwise, use the functions
         * from the configuration.
         */
        setup: assessment.setup ?? config.setup,
        configure: assessment.configure ?? config.configure,
        entry: assessment.entry ?? config.entry,
      });

      // currently, transitive dependencies are not resolved
      // TODO: add support for transitive dependencies?
      for (const dependency in dependencies) {
        const dependencyVersion = dependencies[dependency];

        // if packagesToDownload already has the dependency with the same name and version
        // we don't need to download it again
        if (
          packagesToDownload.find(
            (p) => p.name === dependency && p.version === dependencyVersion,
          )
        ) {
          continue;
        }
        const packageData = await getNpmPackageMetadata(
          // dependencies are always retrieved from the default registry
          DEFAULT_REGISTRY_URL,
          dependency,
          //assessment.tokenEnvironmentVariable,
        );
        const dependencyUrl =
          packageData.versions[dependencyVersion].dist.tarball;
        packagesToDownload.push({
          name: dependency,
          version: dependencyVersion,
          url: dependencyUrl,
          //tokenEnvironmentVariable: assessment.tokenEnvironmentVariable,
        });
      }
    }

    if (assessmentConfigurations.length === 0) {
      throw new Error("No assessments found in configuration file.");
    }

    const exampleAssessment = assessmentConfigurations[0];
    const exampleQueryString = `/index.html?assessment=${exampleAssessment.name}@${exampleAssessment.version}&number_of_trials=6`;
    const hostedAssessmentPaths = new Array<string>();

    /**
     * assessmentConfigurations now has all the information needed to create
     * the index.js and index.html files for each specific assessment.
     */
    for (const assessmentConfiguration of assessmentConfigurations) {
      let moduleName: string;
      if (assessmentConfiguration.extends) {
        moduleName = assessmentConfiguration.extends.name;
      } else {
        moduleName = assessmentConfiguration.name;
      }

      let configureParametersCode = "";
      if (assessmentConfiguration.parameters) {
        configureParametersCode = `assessment.setParameters(${JSON.stringify(
          assessmentConfiguration.parameters,
        )});`;
      }

      let setupCode = "";
      if (assessmentConfiguration.setup) {
        if (assessmentConfiguration.setup instanceof Function) {
          setupCode = extractMethodBodyFromArrowFunctionString(
            assessmentConfiguration.setup.toString(),
          );
        } else {
          // read file
          setupCode = fs.readFileSync(assessmentConfiguration.setup, "utf8");
        }
      }

      let configureCode = "";
      if (assessmentConfiguration.configure) {
        if (assessmentConfiguration.configure instanceof Function) {
          configureCode = extractMethodBodyFromArrowFunctionString(
            assessmentConfiguration.configure.toString(),
          );
        } else {
          // read file
          configureCode = fs.readFileSync(
            assessmentConfiguration.configure,
            "utf8",
          );
        }
      }

      let indexJs: string;

      if (assessmentConfiguration.entry) {
        let entryCode = "";
        if (assessmentConfiguration.entry instanceof Function) {
          entryCode = extractMethodBodyFromArrowFunctionString(
            assessmentConfiguration.entry.toString(),
          );
        } else {
          // read file
          entryCode = fs.readFileSync(assessmentConfiguration.entry, "utf8");
        }

        indexJs = `const context = {
  urlParams: new URLSearchParams(window.location.search),
  assessment: {
    name: "${assessmentConfiguration.name}",
    version: "${assessmentConfiguration.version}"
  }
};
${loadModulesFunction}
${getAssessmentClassNameFromModuleFunction}
${setGameParametersFromUrlFunction}
${entryCode}`;
      } else {
        /**
         * note: the configureCode goes before setGameParametersFromUrl() because
         * there may be custom variables in the URL parameters. The configureCode
         * should handle and remove these from the URL parameters before the URL
         * parameters are passed to setGameParametersFromUrl().
         */

        indexJs = `const context = {
  urlParams: new URLSearchParams(window.location.search),
  assessment: {
    name: "${assessmentConfiguration.name}",
    version: "${assessmentConfiguration.version}"
  }
};
${loadModulesFunction}
${getAssessmentClassNameFromModuleFunction}
${setGameParametersFromUrlFunction}
${setupCode}
const [sessionModule, assessmentModule] = await loadModules(["@m2c2kit/session", "${moduleName}"]);
const assessmentClassName = getAssessmentClassNameFromModule(assessmentModule);
const assessment = new assessmentModule[assessmentClassName]();
const session = new sessionModule.Session({
  activities: [assessment]
});
${configureParametersCode}
${configureCode}    
setGameParametersFromUrlParams(assessment, context.urlParams);
session.initialize();`;
      }

      indexJs = beautify(indexJs, {
        indent_size: 2,
      });
      const indexJsFilename = `${config.outDir}/assessments/${assessmentConfiguration.name}@${assessmentConfiguration.version}/index.js`;
      if (!fs.existsSync(getFilePathWithoutFilename(indexJsFilename))) {
        fs.mkdirSync(getFilePathWithoutFilename(indexJsFilename), {
          recursive: true,
        });
      }
      tree.create(
        config.outDir +
          `/assessments/${assessmentConfiguration.name}@${assessmentConfiguration.version}/index.js`,
        indexJs,
      );

      for (const [dep, ver] of Object.entries(
        assessmentConfiguration.requiredPackages,
      )) {
        /**
         * TODO: currently we remove the "^" from the version, but we should
         * do real semver resolution.
         */
        importMaps[dep] =
          `../../../modules/${dep}@${(ver as string).replace("^", "")}/dist/index.min.js`;
      }
      let indexHtml = assessmentIndexHtmlTemplate.replace(
        "<%- importMaps %>",
        JSON.stringify(importMaps, null, 2),
      );
      if (config.esModuleShims !== false) {
        const schematicDir = __dirname.replace(/\\/g, "/");
        const filenames = getFilesRecursive(
          schematicDir + "/files/es-module-shims",
        );
        for (const filename of filenames) {
          const buffer = fs.readFileSync(filename);
          const treeFilename =
            config.outDir +
            "/modules/" +
            filename.replace(schematicDir + "/files/", "");
          tree.create(treeFilename, buffer);
        }
        /**
         * below integrity is for es-module-shims 1.10.0. It will have to be
         * updated when a new version is released.
         */
        indexHtml = indexHtml.replace(
          "<%- esModuleShims %>",
          '\n  <script async src="../../../modules/es-module-shims/dist/es-module-shims.js" integrity="sha384-BTO8nLHukFlPxTSib9wgQyLgd2oYLxp24Goxje82QeHp7cwyUtgx4Z32PCEb3Q09"></script>',
        );
      } else {
        indexHtml = indexHtml.replace("<%- esModuleShims %>", "");
      }
      tree.create(
        config.outDir +
          `/assessments/${assessmentConfiguration.name}@${assessmentConfiguration.version}/index.html`,
        indexHtml,
      );

      hostedAssessmentPaths.push(
        `/assessments/${assessmentConfiguration.name}@${assessmentConfiguration.version}/index.html`,
      );
    }

    /**
     * Download all the RegistryAssessment packages and create the modules
     * directory where they are stored.
     */
    for (const pkg of packagesToDownload) {
      const buffer = await fetchPackage(pkg.url, pkg.tokenEnvironmentVariable);
      console.log(
        `downloaded ${pkg.name}@${pkg.version} (${buffer.byteLength} bytes) from ${pkg.url}`,
      );

      const files = await decompressTgzArchive(buffer);
      for (const file of files) {
        /**
         * filepath is file.path, but with the leading "package/" removed from
         * it. Packed npm packages have a "package/" prefix in the file path.
         */
        const filepath = file.filepath.replace("package/", "");
        tree.create(
          config.outDir + `/modules/${pkg.name}@${pkg.version}/${filepath}`,
          file.buffer,
        );
      }
    }

    /**
     * Copy the files from the `TarballAssessment` to the modules directory
     */
    for (const [assessment, files] of Object.entries(decompressedTgzFiles)) {
      for (const file of files) {
        const filepath = file.filepath.replace("package/", "");
        // assessment already has the version in the name
        tree.create(
          config.outDir + `/modules/${assessment}/${filepath}`,
          file.buffer,
        );
      }
    }

    /**
     * Create the root index.html and index.js files. This is the entry point
     * for the static site and will redirect to the assessment specified in the
     * URL query string "assessment"
     */
    tree.create(config.outDir + "/index.html", rootIndexHtml);
    tree.create(
      config.outDir + "/index.js",
      rootIndexJs
        .replace(
          "<%- assessmentPaths %>",
          `[` +
            hostedAssessmentPaths.map((path) => `"${path}"`).join(",") +
            `];`,
        )
        .replace("<%- exampleQueryString %>", `"${exampleQueryString}"`),
    );

    if (options.dockerfile) {
      const f = tree.get("Dockerfile");
      if (f) {
        tree.delete("Dockerfile");
      }
      tree.create(
        "Dockerfile",
        dockerfileTemplate.replace("<%- outDir %>", config.outDir),
      );
    }

    process.on("exit", (exitCode) => {
      if (exitCode === 0) {
        console.log("m2c2kit static site created successfully.");
        console.log(
          `You may now serve the site using the files in ${config.outDir}`,
        );
        console.log(
          "If you requested a Dockerfile (--dockerfile), the following commands build a Docker image and serve the site using NGINX on local port 8080, mapping to port 80 in the container:",
        );
        console.log("  docker build -t m2c2kit-static-site .");
        console.log("  docker run -p 8080:80 m2c2kit-static-site");
      } else {
        console.log("");
        console.log("Error generating static site.");
      }
    });
  };
}

const dockerfileTemplate = `FROM nginx:alpine

# Copy the static website files to the Nginx document root
COPY <%- outDir %> /usr/share/nginx/html
`;

const assessmentIndexHtmlTemplate = `
<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Cache-Control" content="no-store, max-age=0" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />
  <meta name="viewport" content="width=device-width, initial-scale=1" /><%- esModuleShims %>
  <script type="importmap"> {
    "imports": <%- importMaps %>
    }
  </script>
  <script type="module" src="index.js" defer></script>
</head>

<body class="m2c2kit-background-color m2c2kit-no-margin">
  <div id="m2c2kit"></div>
</body>

</html>
`;

const rootIndexHtml = `<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Cache-Control" content="no-store, max-age=0" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script type="module" src="index.js" defer></script>
</head>

<body>
</body>

</html>`;

export const rootIndexJs = `const urlParams = new URLSearchParams(window.location.search);
let assessment = urlParams.get("assessment");
if (!assessment) {
  const url = new URL(window.location.href);
  const hostedAssessmentPaths = <%- assessmentPaths %>;
  console.error("No assessment specified. In the URL query string, specify an assessment (and other parameters, optionally), e.g., " + url.origin + <%- exampleQueryString %>);
  console.log("Assessment URLs in this static site:\\n" + hostedAssessmentPaths.map((path) => url.origin + path).join("\\n"));
} else {
  urlParams.delete("assessment");
  const forwardedParams = urlParams.toString();
  window.location.href = "/assessments/" + assessment + "/index.html?" + forwardedParams;
}`;

// TODO: insert the schematics package.json version into the config file
/** created when the --init option is specified */
const newConfig = `/**
 * To get intellisense hints for this configuration file, create an NPM project
 * in the same folder as this file and install the @m2c2kit/schematics package:
 *   npm init -y
 *   npm install -D @m2c2kit/schematics
 */

/**
 * @typedef {import("@m2c2kit/schematics").StaticSiteConfig} StaticSiteConfig
 * @type {StaticSiteConfig}
 */
export default {
  configVersion: "0.1.17",
  outDir: "./site",
  assessments: [
    {
      name: "@m2c2kit/assessment-symbol-search",
      versions: ">=0.8.18",
      parameters: {
        // for configurable game parameters,
        // see https://m2c2-project.github.io/m2c2kit/docs/schemas/what-is-schema/
        number_of_trials: 2,
        show_quit_button: false,
      },
      configure: (context, session, assessment) => {
        console.log(\`configuring assessment \${assessment.options.name} version \${assessment.options.version}\`)
        session.onActivityData((ev) => {
          console.log("  newData: " + JSON.stringify(ev.newData));
          // place code here to post data to a server, e.g.,
          // fetch("https://www.example.com", {
          //   method: "POST",
          //   headers: {
          //     "Content-Type": "application/json",
          //   },
          //   body: JSON.stringify(ev.newData),
          // });
        });
        // place code here to redirect when session ends, e.g.,
        // session.onEnd(() => {
        //   window.location.href = "https://www.example.com";
        // });
      }
    }
  ]
};
`;
