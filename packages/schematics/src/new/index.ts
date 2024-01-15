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
} from "@angular-devkit/schematics";
import { NpmInstallOptions } from "../install";
import { lastValueFrom } from "rxjs";
import { Constants } from "../constants";

interface m2NewOptions {
  name?: string;
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

    const npmInstallOptions: NpmInstallOptions = {
      directory: directory,
      dependencies: [],
      packageJsonContents: `{
  "name": "${strings.dasherize(options.name)}",
  "version": "1.0.0",
  "scripts": {
    "serve": "rollup -c rollup.config.mjs --watch --configServe",
    "build": "npm run clean && rollup -c rollup.config.mjs --configProd",
    "clean": "rimraf build dist .rollup.cache tsconfig.tsbuildinfo"
  },
  "private": true,
  "dependencies": {
    "@m2c2kit/addons": "0.3.13",
    "@m2c2kit/core": "0.3.16"
  },
  "devDependencies": {
    "@m2c2kit/build-helpers": "0.3.12",
    "@rollup/plugin-node-resolve": "15.2.3",
    "@rollup/plugin-typescript": "11.1.6",
    "rimraf": "5.0.5",
    "rollup": "4.9.5",
    "rollup-plugin-copy": "3.5.0",
    "rollup-plugin-livereload": "2.0.5",
    "rollup-plugin-serve": "3.0.0",
    "tslib": "2.6.2",
    "typescript": "5.3.3"
  }
}`,
    };

    /**
     * npm install is executed immediately with workflow.execute() because we need
     * files from these packages in later rules. If we tried to add the below as
     * a rule, the npm package files would not exist in the tree before the rule
     * was executed, and thus the rule would fail.
     */
    await lastValueFrom(
      workflow.execute({
        // collection: "@m2c2kit/schematics",
        // collection: "c:\\github\\m2c2kit\\packages\\schematics",
        collection: workflow.context.collection,
        schematic: "npm-install",
        options: npmInstallOptions,
      }),
    );

    const rules: Rule[] = [];

    /**
     * Second, copy the files from the schematics template
     */
    const schematicsVersion = Constants.M2C2KIT_SCHEMATICS_PACKAGE_VERSION;
    const sourceTemplates: Source = url("./files");
    const sourceParameterizedTemplates = apply(sourceTemplates, [
      applyTemplates({
        classify: strings.classify,
        dasherize: strings.dasherize,
        appName: options.name,
        schematicsVersion: schematicsVersion,
      }),
      move(directory),
    ]);
    const mergeWithSourceTemplates = mergeWith(sourceParameterizedTemplates);
    rules.push(mergeWithSourceTemplates);

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
