import { defineConfig } from "rolldown";

export default defineConfig([
  {
    input: "./src/index.ts",
    platform: "node",
    output: [
      {
        file: "./dist/index.js",
        format: "es",
        sourcemap: true,

        // CommonJS files get `__dirname` and `__filename` magically
        // injected into them by Node.js. ES Modules do not (they rely on
        // `import.meta.url` instead). The ts-morph library relies on these.
        // This banner injects the ESM-equivalent polyfills at the very top of our
        // final bundle so the original CJS code works in an ESM environment.
        banner: `
import { fileURLToPath as __fileURLToPath } from 'url';
import { dirname as __dirnamePath } from 'path';
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnamePath(__filename);
    `.trim(),
      },
    ],
  },
]);
