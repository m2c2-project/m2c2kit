export const config: WebdriverIO.Config = {
  specs: ["./**/*.spec.ts"],
  capabilities: [
    {
      browserName: "chrome",
      maxInstances: 1,
      "goog:chromeOptions": {
        // to run chrome headless the following flags are required
        // (see https://developers.google.com/web/updates/2017/04/headless-chrome)
        args: ["--window-size=1200,1200"],
      },
    },
  ],
  framework: "Jasmine",
  jasmineOpts: {
    defaultTimeoutInterval: 120000,
  },
  autoCompileOpts: {
    autoCompile: true,
    // for all available options
    tsNodeOpts: {
      transpileOnly: true,
      project: "tsconfig.json",
    },
  },
};
