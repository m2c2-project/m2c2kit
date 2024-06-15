import {
  Rule,
  SchematicContext,
  Tree,
  url,
  strings,
  apply,
  mergeWith,
  move,
  SchematicsException,
  chain,
  Source,
  applyTemplates,
  template,
} from "@angular-devkit/schematics";
import { RepositoryInitializerTask } from "@angular-devkit/schematics/tasks";
import { CommitOptions } from "@angular-devkit/schematics/tasks/repo-init/init-task";
import findup = require("findup-sync");
import fs = require("fs");
import path = require("path");
import { NpmInstallOptions } from "../install";
import { lastValueFrom } from "rxjs";
import { Constants } from "../constants";

interface m2NewOptions {
  name?: string;
  module?: boolean;
  skipGit?: boolean;
}

export function m2New(options: m2NewOptions): Rule {
  return async (_tree: Tree, context: SchematicContext) => {
    if (!options.name) {
      throw new SchematicsException("name is required.");
    }

    const directory = strings.dasherize(options.name);

    /**
     * First, install the npm packages
     */

    const workflow = context.engine.workflow;
    if (!workflow) {
      throw new SchematicsException("Workflow is not available.");
    }

    // package.json differs for an app and a module.
    const packageJsonContents = options.module
      ? generateModulePackageJson(options.name)
      : generateAppPackageJson(options.name);
    const npmInstallOptions: NpmInstallOptions = {
      directory: directory,
      dependencies: [],
      packageJsonContents: packageJsonContents,
    };

    /**
     * npm install is executed immediately with workflow.execute() because we need
     * files from these packages in later rules. If we tried to add the below as
     * a rule, the npm package files would not exist in the tree before the rule
     * was executed, and thus the rule would fail.
     */
    await lastValueFrom(
      workflow.execute({
        /**
         * collection is workflow.context.collection because it is passed
         * in by the cli app, which has it hard-coded to "@m2c2kit/schematics".
         * When testing/exploring, we could hard-code it here to:
         *   collection: "@m2c2kit/schematics"
         * or even a file location, such as:
         *   collection: "c:/github/m2c2kit/packages/schematics"
         */
        collection: workflow.context.collection,
        schematic: "npm-install",
        options: npmInstallOptions,
      }),
    );

    const rules: Rule[] = [];

    /**
     * Second, copy the files from the schematics template. Use different
     * files for an app and a module.
     */
    const schematicsVersion = Constants.M2C2KIT_SCHEMATICS_PACKAGE_VERSION;
    const sourceTemplates: Source = options.module
      ? url("./files/module")
      : url("./files/app");
    const sourceParameterizedTemplates = apply(sourceTemplates, [
      applyTemplates({
        classify: strings.classify,
        dasherize: strings.dasherize,
        appName: options.name,
        schematicsVersion: schematicsVersion,
        publishUuid: generateUuidV4(),
      }),
      /**
       * For app, renames folder assets/__id__ to assets/<id of assessment
       * For module, there is no folder under assets with name of the
       * assessment id.
       */
      template({
        id: strings.dasherize(options.name),
      }),
      move(directory),
    ]);
    const mergeWithSourceTemplates = mergeWith(sourceParameterizedTemplates);
    rules.push(mergeWithSourceTemplates);

    /**
     * Third, copy index.html from @m2c2kit/session package.
     * Other assets, such as wasm and CSS files, will be copied during the
     * build process by rollup and the copyAssets plugin. We copy index.html
     * here, rather than in the build process, because we don't want it
     * overwritten every time we build (the user may have made changes to it).
     * Wasm and CSS, however, should be copied every time we build, in case
     * they have changed due to a package update of @m2c2kit/session or
     * @m2c2kit/core.
     */
    rules.push((tree: Tree) => {
      const findUps: FindUps[] = [
        {
          findUp: "node_modules/@m2c2kit/session/assets/index.html",
          dest: path.join(directory, "src/index.html"),
          cwd: directory,
        },
      ];
      copyFindUps(findUps, tree);
      return tree;
    });

    if (!options.skipGit) {
      const commit: CommitOptions = {
        message: "Initial commit",
      };
      rules.push((tree: Tree, context: SchematicContext) => {
        context.addTask(new RepositoryInitializerTask(directory, commit));
        return tree;
      });
    }

    process.on("exit", (exitCode) => {
      if (exitCode === 0) {
        console.log("");
        console.log(`Created app in directory ${directory}`);
        console.log("Inside that directory, you can run several commands:\n");
        console.log(`  npm run serve`);
        console.log("    Starts the development server.\n");
        console.log(`  npm run build`);
        console.log("    Bundles the app for production.\n");
        console.log("We suggest you begin by typing:\n");
        console.log(`  cd ${directory}`);
        console.log(`  npm run serve`);
      } else {
        console.log("");
        console.log("Error creating app.");
      }
    });

    return chain(rules);
  };
}

interface FindUps {
  findUp: string;
  dest: string;
  cwd: string;
}

function copyFindUps(findUps: FindUps[], tree: Tree) {
  findUps.forEach((fu) => {
    const filePath = findup(fu.findUp, { cwd: fu.cwd });
    if (!filePath) {
      throw new SchematicsException(`Could not find ${fu.findUp}`);
    }
    const buf = fs.readFileSync(filePath);
    tree.create(path.join(fu.dest), buf);
  });
}

function generateAppPackageJson(name: string) {
  return `{
  "name": "${strings.dasherize(name)}",
  "version": "1.0.0",
  "scripts": {
    "serve": "concurrently \\"rollup -c --watch --configServe\\" \\"tsc --watch\\" --names rollup,typescript --prefix-colors auto,red",
    "build": "npm run clean && tsc --noEmit --emitDeclarationOnly false && rollup -c --configProd",
    "build:no-hash": "npm run clean && tsc --noEmit --emitDeclarationOnly false && rollup -c --configProd --configNoHash",
    "clean": "rimraf build dist .rollup.cache tsconfig.tsbuildinfo"
  },
  "private": true,
  "dependencies": {
    "@m2c2kit/core": "${Constants.M2C2KIT_CORE_PACKAGE_VERSION}",
    "@m2c2kit/addons": "${Constants.M2C2KIT_ADDONS_PACKAGE_VERSION}",
    "@m2c2kit/session": "^${Constants.M2C2KIT_SESSION_PACKAGE_VERSION}"
  },
  "devDependencies": {
    "@m2c2kit/build-helpers": "${Constants.M2C2KIT_BUILD_HELPERS_PACKAGE_VERSION}",
    "@rollup/plugin-node-resolve": "${Constants.ROLLUP_PLUGIN_NODE_RESOLVE_VERSION}",
    "concurrently": "${Constants.CONCURRENTLY_VERSION}",
    "esbuild": "${Constants.ESBUILD_VERSION}",
    "rimraf": "${Constants.RIMRAF_VERSION}",
    "rollup": "${Constants.ROLLUP_VERSION}",
    "rollup-plugin-esbuild": "${Constants.ROLLUP_PLUGIN_ESBUILD_VERSION}",
    "rollup-plugin-livereload": "${Constants.ROLLUP_PLUGIN_LIVERELOAD_VERSION}",
    "rollup-plugin-serve": "${Constants.ROLLUP_PLUGIN_SERVE_VERSION}",
    "typescript": "${Constants.TYPESCRIPT_VERSION}"
  }
}
`;
}

function generateModulePackageJson(name: string) {
  return `{
  "name": "${strings.dasherize(name)}",
  "version": "1.0.0",
  "m2c2kit": {
    "assessmentId": "${strings.dasherize(name)}"
  },
  "private": true,
  "scripts": {
    "serve": "concurrently \\"rollup -c rollup.config.runner.mjs --watch --configServe\\" \\"tsc --project tsconfig.runner.json --watch\\" --names rollup,typescript --prefix-colors auto,red",
    "build": "npm run clean && tsc && rollup -c --configProd --configNoHash",
    "clean": "rimraf runner-build dist .rollup.cache tsconfig.tsbuildinfo"
  },
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "type": "module",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist/**",
    "assets/**"
  ],
  "dependencies": {
    "@m2c2kit/core": "${Constants.M2C2KIT_CORE_PACKAGE_VERSION}",
    "@m2c2kit/addons": "${Constants.M2C2KIT_ADDONS_PACKAGE_VERSION}",
    "@m2c2kit/session": "^${Constants.M2C2KIT_SESSION_PACKAGE_VERSION}"
  },
  "devDependencies": {
    "@m2c2kit/build-helpers": "${Constants.M2C2KIT_BUILD_HELPERS_PACKAGE_VERSION}",
    "@rollup/plugin-node-resolve": "${Constants.ROLLUP_PLUGIN_NODE_RESOLVE_VERSION}",
    "concurrently": "${Constants.CONCURRENTLY_VERSION}",
    "esbuild": "${Constants.ESBUILD_VERSION}",
    "rimraf": "${Constants.RIMRAF_VERSION}",
    "rollup": "${Constants.ROLLUP_VERSION}",
    "rollup-plugin-esbuild": "${Constants.ROLLUP_PLUGIN_ESBUILD_VERSION}",
    "rollup-plugin-livereload": "${Constants.ROLLUP_PLUGIN_LIVERELOAD_VERSION}",
    "rollup-plugin-serve": "${Constants.ROLLUP_PLUGIN_SERVE_VERSION}",
    "typescript": "${Constants.TYPESCRIPT_VERSION}"
  }
}
`;
}

function generateUuidV4(): string {
  /**
   * Use try-catch, rather than check for the existence of crypto, e.g.,
   * typeof crypto && typeof crypto.randomUUID, because the latter will
   * always be true for our target build and the compiler will remove
   * the alternate paths. BUT, when we run automated tests in a container,
   * the crypto module may not be present.
   */
  try {
    return crypto.randomUUID();
  } catch {
    // polyfill if randomUUID() or getRandomValues() are not available

    let randomValue: () => number;
    try {
      randomValue = () => crypto.getRandomValues(new Uint8Array(1))[0];
    } catch {
      randomValue = () => Math.floor(Math.random() * 256);
    }

    /**
     * attribution: https://stackoverflow.com/a/2117523
     * license: https://creativecommons.org/licenses/by-sa/4.0/
     * modifications: to work with TypeScript and polyfill
     */
    return ((1e7).toString() + -1e3 + -4e3 + -8e3 + -1e11).replace(
      /[018]/g,
      (c) =>
        (Number(c) ^ (randomValue() & (15 >> (Number(c) / 4)))).toString(16),
    );
  }
}
