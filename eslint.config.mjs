// @ts-check
import globals from "globals";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  ...tseslint.config(eslint.configs.recommended, ...tseslint.configs.strict),
  eslintConfigPrettier,
  {
    files: ["**/*.mjs", "**/*.js", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            "*.mjs",
            ".*.mjs",
            "scripts/*.mjs",
            "packages/*/*.mjs",
            "packages/*/src/runner.ts",
          ],
          defaultProject: "./tsconfig.json",
        },
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
  },
  {
    ignores: [
      "**/dist/",
      "**/dist-webview/",
      "**/build/",
      "**/.rollup.cache",
      "examples/no-js-bundler-development/lib/",
      "packages/build-helpers/src/__tests__/dist-test",
      "website/static/m2c2kit/modules",
    ],
  },
];
