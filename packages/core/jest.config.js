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
  testPathIgnorePatterns: [".rollup.cache", "build"],
  /**
   * I added a separate tsconfig for jest because typescript was also adding
   * types for jasmine. see tsconfig.jest.json, where I explicitly include
   * types only for jest and node
   */
  globals: {
    "ts-jest": {
      tsconfig: `tsconfig.jest.json`,
    },
  },
};
