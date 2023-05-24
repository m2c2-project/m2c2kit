import { Rule, SchematicContext, Tree } from "@angular-devkit/schematics";
import { NodePackageInstallTask } from "@angular-devkit/schematics/tasks";
import {
  NodeDependency,
  NodeDependencyType,
  getPackageJsonDependency,
  addPackageJsonDependency,
} from "@schematics/angular/utility/dependencies";

export function add(options: any): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info("in the add schematic");

    return tree;

    console.log(`in the add schematic. The package is ${options.package}`);
    console.log(JSON.stringify(tree));

    const dep: NodeDependency = {
      type: NodeDependencyType.Dev,
      name: "@m2c2kit/assessment-symbol-search",
      version: "^0.8.4",
      overwrite: true,
    };

    addPackageJsonDependency(tree, dep);
    console.log(
      getPackageJsonDependency(tree, "@m2c2kit/assessment-symbol-search")
    );
    //context.addTask(new NodePackageInstallTask(), []);

    return tree;
  };
}
