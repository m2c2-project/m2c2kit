module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/strict",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 13,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {},
  // ignore some config js files and build artifacts
  ignorePatterns: [
    ".eslintrc.cjs",
    "jest*.js",
    "dist",
    "dist-webview",
    "build",
    "build-nobundler",
    "node_modules",
    ".rollup.cache",
    "examples/no-js-bundler-development/lib",
    "packages/build-helpers/src/__tests__/dist-test",
  ],
};
