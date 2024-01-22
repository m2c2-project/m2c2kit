import { Plugin } from "rollup";
import MagicString from "magic-string";

/**
 * Restores `import.meta` to the code after the bundler has removed it.
 *
 * @remarks esbuild removes usage of `import.meta` (by substituting an empty
 * object named `import_meta`) if it is not supported in the target environment.
 * However, we will polyfill it in the browser, so we need to restore it.
 * If not using esbuild, this plugin is not needed.
 *
 * @param pattern - the string to replace. Defaults to `import_meta = {};`
 * @param replacement - the string to replace with. Defaults to `import_meta = import.meta;`
 */
export function restoreImportMeta(
  pattern = "import_meta = {};",
  replacement = "import_meta = import.meta;",
): Plugin {
  return {
    name: "restore-import-meta",
    renderChunk: {
      handler(code: string) {
        /**
         * Rollup will complain #warning-sourcemap-is-likely-to-be-incorrect
         * unless we use magic-string to also return a map.
         */
        const magicString = new MagicString(code);
        magicString.replace(new RegExp(pattern, "g"), replacement);
        return {
          code: magicString.toString(),
          map: magicString.generateMap({ hires: true }),
        };
      },
    },
  };
}
