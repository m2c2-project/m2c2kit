import { defineConfig } from "rolldown";
import { replacePlugin } from "rolldown/plugins";

export default defineConfig({
  input: "./src/index.ts",
  platform: "node",
  // Mark these dependencies as external so they don't get bundled. This is
  // necessary because the Angular CLI source code and some dependencies are
  // written for CommonJS and use Node.js-specific features that don't work
  // when bundled into an ES Module. By marking them as external, Rolldown
  // will leave the import statements as-is and not try to bundle them.
  external: (id) =>
    id.startsWith("@angular-devkit") ||
    id.startsWith("@inquirer") ||
    id.startsWith("ansi-colors") ||
    id.startsWith("yargs-parser"),
  plugins: [
    // The Angular CLI source code was written for CommonJS and uses
    // `if (require.main === module)` to detect if the file is being run directly
    // from the terminal (e.g., `node cli.js`). Because we are compiling to an
    // ES Module, the `require` object does not exist and this would crash or
    // fail silently. This plugin hardcodes that check to `true` so the CLI
    // boots up automatically when our bundled .js file is executed.
    replacePlugin({
      "require.main === module": "true",
    }),
  ],
  output: {
    file: "./dist/index.js",
    format: "es",
    // CommonJS files get `__dirname` and `__filename` magically
    // injected into them by Node.js. ES Modules do not (they rely on
    // `import.meta.url` instead). Because the Angular source code relies
    // heavily on `__dirname`, compiling it straight to ESM would cause
    // `ReferenceError: __dirname is not defined` at runtime. This banner
    // injects the ESM-equivalent polyfills at the very top of our final
    // bundle so the original CJS code works in an ESM environment.
    banner: `
import { fileURLToPath as __fileURLToPath } from 'url';
import { dirname as __dirnamePath } from 'path';
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnamePath(__filename);
    `.trim(),
  },
});
