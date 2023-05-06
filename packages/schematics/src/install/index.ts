import { Rule, SchematicContext, Tree } from "@angular-devkit/schematics";
import { NodePackageInstallTask } from "@angular-devkit/schematics/tasks";
import {
  NodeDependency,
  NodeDependencyType,
  getPackageJsonDependency,
  addPackageJsonDependency,
} from "@schematics/angular/utility/dependencies";

export interface npmInstallOptions {
  dependencies: Array<NodeDependency>;
}

export function npmInstall(options: npmInstallOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    console.log(
      `Installing ${options.dependencies.length} ${
        options.dependencies.length !== 1 ? "dependencies" : "dependency"
      }: ${options.dependencies
        .map((d) => d.name + ` (${d.version})`)
        .join(", ")}`
    );

    options.dependencies.forEach((d) => {
      addPackageJsonDependency(tree, d);
    });

    context.addTask(
      new NodePackageInstallTask({
        quiet: false,
        hideOutput: false,
      }),
      []
    );
    return tree;
  };
}
