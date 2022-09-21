// see https://stackoverflow.com/a/57825692
module.exports = {
  preset: "ts-jest",
  setupFilesAfterEnv: ["./jestSetupFilesAfterEnv.js"],
  watchPathIgnorePatterns: [
    "/examples/",
    "/dist/",
    "/node_modules/",
    "/__tests__/",
  ],
  testPathIgnorePatterns: [".rollup.cache", "build", "TestHelpers.ts"],
  /**
   * I added a separate tsconfig for jest because typescript was also adding
   * types for jasmine. see tsconfig.jest.json, where I explicitly include
   * types only for jest and node
   */
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      // required due to custom location of tsconfig.json configuration file
      // https://kulshekhar.github.io/ts-jest/docs/getting-started/options/tsconfig
      { tsconfig: "./src/__tests__/tsconfig.json" },
    ],
  },
  testEnvironment: "jsdom",
};
