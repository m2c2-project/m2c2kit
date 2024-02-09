import { Plugin } from "rollup";
import { readFile } from "fs/promises";
import MagicString from "magic-string";

/**
 * Adds module metadata to the assessment code.
 *
 * @remarks Use this plugin when creating an assessment that will be used
 * as a module and imported into other projects. This plugin reads metadata
 * from `package.json` and embeds it in the assessment code.
 *
 * This module metadata is important so that the m2c2kit library can locate
 * assessment resources that are not bundled. The module metadata contains the
 * assessment name, version, and m2c2kit dependencies.
 *
 * To use: add `moduleMetadata: Constants.MODULE_METADATA_PLACEHOLDER` to the
 * `GameOptions` object. At build time, this plugin will replace this
 * placeholder with the actual assessment metadata.
 */
export function addModuleMetadata(): Plugin {
  return {
    name: "add-module-metadata",
    transform: {
      async handler(code: string) {
        const pkg = JSON.parse(await readFile("./package.json", "utf8"));
        const magicString = new MagicString(code);
        magicString.replace(
          new RegExp(
            "moduleMetadata:\\s*Constants.MODULE_METADATA_PLACEHOLDER",
            "g",
          ),
          `moduleMetadata: { "name" : "${pkg.name}", "version" : "${
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
