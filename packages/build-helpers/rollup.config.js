import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import dts from "rollup-plugin-dts";
import copy from "rollup-plugin-copy";

const outputFolder = "build";

/**
 * In the file sys.ts in typescript compiler, as of 4.7.4, there are
 * references to __filename and __dirname. E.g., see:
 * https://github.com/microsoft/TypeScript/blob/93f2d2b9a1b2f8861b49d76bb5e58f6e9f2b56ee/src/compiler/sys.ts#L1681
 * These are not supported in ESM. We need to shim them to the appropriate
 * ESM functions. Howevever, Rollup will rename these symbols (__filename
 * and __dirname) if we use them in code that will be bundled. Instead, we
 * add the shims using the below plugin after Rollup has finished bundling.
 */
export function prependToBundle(filename, content) {
  return {
    name: "prepend-to-bundle",
    generateBundle: (_options, bundle) => {
      if (bundle[filename]?.type === "chunk") {
        bundle[filename].code = content + bundle[filename].code;
      } else {
        throw new Error(`bundle named ${filename} not found.`);
      }
    },
  };
}

const codeToPrepend = `import { dirname as dirname_m2c2kit_build_helpers } from 'path';
import { fileURLToPath as fileURLToPath_m2c2kit_build_helpers} from 'url';
const __filename = fileURLToPath_m2c2kit_build_helpers(import.meta.url);
const __dirname = dirname_m2c2kit_build_helpers(__filename);
`;

export default [
  {
    input: ["./src/index.ts"],
    output: [{ dir: outputFolder, format: "es", sourcemap: true }],
    plugins: [
      nodeResolve({ preferBuiltins: true }),
      commonjs(),
      typescript(),
      prependToBundle("index.js", codeToPrepend),
    ],
    external: ["fs/promises"],
  },
  {
    // bundle all declaration files and place the declaration
    // bundle in dist
    input: "./build/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [
      dts(),
      copy({
        // copy the bundled esm module and sourcemap to dist
        targets: [
          {
            src: "build/index.*",
            dest: ["dist/"],
          },
        ],
      }),
    ],
  },
];

// see https://github.com/isaacs/node-glob/issues/365
