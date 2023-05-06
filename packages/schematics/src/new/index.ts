import {
  Rule,
  SchematicContext,
  Tree,
  url,
  template,
  strings,
  apply,
  mergeWith,
  move,
  SchematicsException,
  chain,
  schematic,
  callRule,
} from "@angular-devkit/schematics";
import {
  NodePackageInstallTask,
  RunSchematicTask,
} from "@angular-devkit/schematics/tasks";
import {
  buildDefaultPath,
  getWorkspace,
} from "@schematics/angular/utility/workspace";
import { relativePathToWorkspaceRoot } from "@schematics/angular/utility/paths";
import findup = require("findup-sync");
import fs = require("fs");
import path = require("path");
import { NodeDependencyType } from "@schematics/angular/utility/dependencies";
import { npmInstallOptions } from "../install";

export function m2New(options: any): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    console.log(`executing m2New schematic. The name is ${options.name}`);

    const sourceTemplates = url("./files");
    const sourceParameterizedTemplates = apply(sourceTemplates, [
      template({
        ...strings,
        ...options,
      }),
      move("."),
    ]);

    const workflow = context.engine.workflow;
    if (!workflow) {
      throw new SchematicsException("Workflow is not available.");
    }

    // execute the package install right now, so we have access to the package files
    // TODO: scan the package.json file and install the packages we need.
    await workflow
      .execute({
        // collection: "@m2c2kit/schematics",
        // collection: "c:\\github\\m2c2kit\\packages\\schematics",
        collection: workflow.context.collection,
        schematic: "npm-install",
        options: <npmInstallOptions>{
          dependencies: [
            {
              type: NodeDependencyType.Default,
              name: "@m2c2kit/core",
              version: "^0.3.5",
              overwrite: true,
            },
            {
              type: NodeDependencyType.Default,
              name: "@m2c2kit/addons",
              version: "^0.3.3",
              overwrite: true,
            },
          ],
        },
      })
      .toPromise();

    const rules: Rule[] = [];

    // below is another way to call the install schematic. we use
    // callRule, and it returns a tree.
    // const installRule = schematic("install", {});
    // const t = await callRule(installRule, tree, context).toPromise()
    // examine the tree.
    // t.visit((path, entry) => {
    //   console.log(`path: ${path}, entry: ${entry}`)
    // });
    // rules.push(installRule);
    // question: should we do this above code, which returns a new tree
    // and then provide THAT tree to the below rules?  or do the below
    // rules already receive the updated tree?

    rules.push(mergeWith(sourceParameterizedTemplates));
    rules.push((tree: Tree) => {
      const findUps: FindUps[] = [
        {
          findUp: "node_modules/@m2c2kit/core/assets/canvaskit.wasm",
          dest: "src/assets/canvaskit.wasm",
        },
        {
          findUp: "node_modules/@m2c2kit/core/index.html",
          dest: "src/index.html",
        },
      ];
      copyFindUps(findUps, tree);
      // see question above...
      // copyFindUps(findups, t);
      // return t;
      return tree;
    });
    return chain(rules);
  };
}

interface FindUps {
  findUp: string;
  dest: string;
}

function copyFindUps(findUps: FindUps[], tree: Tree): void {
  findUps.forEach((fu) => {
    const filePath = findup(fu.findUp);
    if (!filePath) {
      throw new SchematicsException(`Could not find ${fu.findUp}`);
    }
    console.log("found " + filePath);
    const buf = fs.readFileSync(filePath);
    tree.create(path.join(fu.dest), buf);
  });
}

// how to run the above
// (do this in another folder, because it changes the files in the current folder)
// schematics c:\github\m2c2kit\packages\schematics:new --name=hello

// build our CLI from this: https://github.com/angular/angular-cli/blob/main/packages/angular_devkit/schematics_cli/bin/schematics.ts
