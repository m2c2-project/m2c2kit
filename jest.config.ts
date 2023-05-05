import type { JestConfigWithTsJest } from "ts-jest";

const jestConfig: JestConfigWithTsJest = {
  extensionsToTreatAsEsm: [".ts"],
  collectCoverage: true,
  collectCoverageFrom: [
    "packages/core/src/**/*.{js,jsx,ts,tsx}",
    "packages/survey/src/**/*.{js,jsx,ts,tsx}",
    "!**/src/__tests__/**",
    "!**/*.d.ts",
  ],
  verbose: true,
  projects: [
    {
      displayName: { name: "@m2c2kit/core", color: "blue" },
      roots: ["<rootDir>/packages/core"],
      moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
      testMatch: [
        "<rootDir>/packages/core/src/__tests__/**/*.(spec|test).(ts|tsx|js)",
      ],
      testPathIgnorePatterns: [".rollup.cache", "build", "TestHelpers.ts"],
      transform: {
        "^.+\\.tsx?$": [
          "ts-jest",
          {
            useESM: true,
            testLocationInResults: false,
            tsconfig: "tsconfig.json",
          },
        ],
      },
      testEnvironment: "jsdom",
    },
    {
      displayName: { name: "@m2c2kit/survey", color: "cyan" },
      roots: ["<rootDir>/packages/survey"],
      moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
      testMatch: [
        "<rootDir>/packages/survey/src/__tests__/**/*.(spec|test).(ts|tsx|js)",
      ],
      testPathIgnorePatterns: [".rollup.cache", "build", "TestHelpers.ts"],
      transform: {
        "^.+\\.tsx?$": [
          "ts-jest",
          {
            useESM: true,
            testLocationInResults: false,
            tsconfig: "tsconfig.json",
          },
        ],
      },
      testEnvironment: "jsdom",
      moduleNameMapper: {
        "@m2c2kit/(.*)$": "<rootDir>/packages/$1/src",
      },
    },
  ],
};

export default jestConfig;
