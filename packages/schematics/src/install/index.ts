import { Rule, SchematicContext, Tree } from "@angular-devkit/schematics";
import { NodePackageInstallTask } from "@angular-devkit/schematics/tasks";
import {
  NodeDependency,
  NodeDependencyType,
  getPackageJsonDependency,
  addPackageJsonDependency,
} from "@schematics/angular/utility/dependencies";
import * as path from "path";

export interface NpmInstallOptions {
  dependencies?: Array<NodeDependency>;
  packageJsonContents?: string;
  directory?: string;
}

export function npmInstall(options: NpmInstallOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (options.dependencies?.length) {
      console.log(
        `Installing ${options.dependencies.length} ${
          options.dependencies.length !== 1 ? "dependencies" : "dependency"
        }: ${options.dependencies
          .map((d) => d.name + ` (${d.version})`)
          .join(", ")}`
      );
    }

    const directory = options.directory || ".";

    if (options.packageJsonContents) {
      tree.create(
        path.join(directory, "package.json"),
        options.packageJsonContents
      );
    }

    options.dependencies?.forEach((d) => {
      addPackageJsonDependency(tree, d);
    });

    context.addTask(
      new NodePackageInstallTask({
        workingDirectory: options.directory,
        quiet: false,
        hideOutput: false,
      }),
      []
    );
    return tree;
  };
}
