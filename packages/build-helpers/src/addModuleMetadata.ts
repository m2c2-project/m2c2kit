import { Plugin } from "rollup";
import { readFile } from "fs/promises";
import MagicString from "magic-string";

/**
 * Adds metadata about the module to the assessment code.
 *
 * @remarks This plugin reads metadata from package.json and adds
 * it to the code. To use: in the GameOptions object, add
 * "moduleMetadata: Constants.EMPTY_MODULE_METADATA". This empty
 * data will be replaced with the actual metadata at build time.
 */
export function addModuleMetadata(): Plugin {
  return {
    name: "add-module-metadata",
    transform: {
      async handler(code: string) {
        const pkg = JSON.parse(await readFile("./package.json", "utf8"));
        const magicString = new MagicString(code);
        magicString.replace(
          new RegExp("Constants.EMPTY_MODULE_METADATA", "g"),
          `{ "name" : "${pkg.name}", "version" : "${
            pkg.version
          }", "dependencies" : ${JSON.stringify(pkg.dependencies)} }`,
        );

        return {
          code: magicString.toString(),
          map: magicString.generateMap({ hires: true }),
        };
      },
    },
  };
}
