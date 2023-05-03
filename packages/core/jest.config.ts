import type { JestConfigWithTsJest } from "ts-jest";

// see https://stackoverflow.com/a/57825692
const jestConfig: JestConfigWithTsJest = {
  preset: "ts-jest",
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/__tests__/TestHelpers.ts",
  ],
  // setupFilesAfterEnv: ["./jestSetupFilesAfterEnv.ts"],
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
      {
        useESM: true,
        /**
         * The below line was needed to get the tests working with the
         * vscode-jest extension. For some reason, when the extension ran,
         * the --testLocationInResults option was causing the test runner to
         * fail.
         */
        testLocationInResults: false,
        // required due to custom location of tsconfig.json configuration file
        // https://kulshekhar.github.io/ts-jest/docs/getting-started/options/tsconfig
        tsconfig: "./src/__tests__/tsconfig.json",
      },
    ],
  },
  testEnvironment: "jsdom",
  extensionsToTreatAsEsm: [".ts"],
};

export default jestConfig;
