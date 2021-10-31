// see https://stackoverflow.com/a/57825692
module.exports = {
  preset: "ts-jest",
  setupFilesAfterEnv: ["./jestSetupFilesAfterEnv.js"],
  watchPathIgnorePatterns: ["/examples/", "/dist/", "/node_modules/"],
};
