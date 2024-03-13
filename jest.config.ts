import type { JestConfigWithTsJest } from "ts-jest";
import { jsWithTsESM } from "ts-jest/presets";

const jestConfig: JestConfigWithTsJest = {
  extensionsToTreatAsEsm: [".ts"],
  collectCoverage: true,
  collectCoverageFrom: [
    "packages/core/src/**/*.{js,jsx,ts,tsx}",
    "packages/session/src/**/*.{js,jsx,ts,tsx}",
    "packages/survey/src/**/*.{js,jsx,ts,tsx}",
    "packages/physics/src/**/*.{js,jsx,ts,tsx}",
    /**
     * The next two files are excluded from coverage because they are
     * related to how the physics package does module augmentation of
     * the @m2c2kit/core package. This was causing Jest failures when
     * these two files were included in the coverage report.
     */
    "!packages/physics/src/index.ts",
    "!packages/physics/src/M2NodeExtended.ts",
    "packages/build-helpers/src/**/*.{js,jsx,ts,tsx}",
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
            /**
             * @m2c2kit/core uses import.meta, and this is not supported
             * easily in jest. To avoid errors, we use the
             * ts-jest-mock-import-meta package, which will transform usage
             * of import.meta to a predefined mocked value. TS1343 is the
             * warning that is generated when import.meta is used in an
             * unsupported environment, and we suppress that.
             *
             * We do the same for @m2c2kit/session, @m2c2kit/survey,
             * and @m2c2kit/physics because they import @m2c2kit/core.
             */
            diagnostics: {
              ignoreCodes: [1343],
            },
            astTransformers: {
              before: [
                {
                  path: "ts-jest-mock-import-meta",
                  options: {
                    metaObjectReplacement: { url: "https://www.url.com" },
                  },
                },
              ],
            },
          },
        ],
      },
      testEnvironment: "jsdom",
      moduleNameMapper: {
        "@m2c2kit/(.*)$": "<rootDir>/packages/$1/src",
      },
    },
    {
      displayName: { name: "@m2c2kit/session", color: "yellow" },
      roots: ["<rootDir>/packages/session"],
      moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
      testMatch: [
        "<rootDir>/packages/session/src/__tests__/**/*.(spec|test).(ts|tsx|js)",
      ],
      testPathIgnorePatterns: [".rollup.cache", "build", "TestHelpers.ts"],
      transform: {
        "^.+\\.tsx?$": [
          "ts-jest",
          {
            useESM: true,
            testLocationInResults: false,
            tsconfig: "tsconfig.json",
            diagnostics: {
              ignoreCodes: [1343],
            },
            astTransformers: {
              before: [
                {
                  path: "ts-jest-mock-import-meta",
                  options: {
                    metaObjectReplacement: { url: "https://www.url.com" },
                  },
                },
              ],
            },
          },
        ],
      },
      testEnvironment: "jsdom",
      moduleNameMapper: {
        "@m2c2kit/(.*)$": "<rootDir>/packages/$1/src",
      },
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
            diagnostics: {
              ignoreCodes: [1343],
            },
            astTransformers: {
              before: [
                {
                  path: "ts-jest-mock-import-meta",
                  options: {
                    metaObjectReplacement: { url: "https://www.url.com" },
                  },
                },
              ],
            },
          },
        ],
      },
      testEnvironment: "jsdom",
      moduleNameMapper: {
        "@m2c2kit/(.*)$": "<rootDir>/packages/$1/src",
      },
    },
    {
      displayName: { name: "@m2c2kit/physics", color: "gray" },
      roots: ["<rootDir>/packages/physics"],
      moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
      testMatch: [
        "<rootDir>/packages/physics/src/__tests__/**/*.(spec|test).(ts|tsx|js)",
      ],
      testPathIgnorePatterns: [".rollup.cache", "build", "TestHelpers.ts"],
      transform: {
        "^.+\\.tsx?$": [
          "ts-jest",
          {
            useESM: true,
            testLocationInResults: false,
            tsconfig: "tsconfig.json",
            diagnostics: {
              ignoreCodes: [1343],
            },
            astTransformers: {
              before: [
                {
                  path: "ts-jest-mock-import-meta",
                  options: {
                    metaObjectReplacement: { url: "https://www.url.com" },
                  },
                },
              ],
            },
          },
        ],
      },
      testEnvironment: "jsdom",
      moduleNameMapper: {
        "@m2c2kit/(.*)$": "<rootDir>/packages/$1/src",
      },
    },
    {
      ...jsWithTsESM, // see https://github.com/kulshekhar/ts-jest/issues/3888#issuecomment-1336490015
      displayName: { name: "@m2c2kit/build-helpers", color: "magenta" },
      roots: ["<rootDir>/packages/build-helpers"],
      moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
      testMatch: [
        "<rootDir>/packages/build-helpers/src/__tests__/**/*.(spec|test).(ts|tsx|js)",
      ],
      transform: {
        "^.+\\.tsx?$": [
          "ts-jest",
          {
            useESM: true,
            testLocationInResults: false,
            tsconfig: "./packages/build-helpers/tsconfig.json",
          },
        ],
      },
    },
  ],
};

export default jestConfig;
