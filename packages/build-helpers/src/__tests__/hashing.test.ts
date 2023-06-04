import { hashM2c2kitAssets } from "..";
import cpy from "cpy";
import { rimrafSync } from "rimraf";
import * as fs from "fs";

describe("hashM2c2kitAssets rollup plugin", () => {
  beforeAll(async () => {
    rimrafSync("packages/build-helpers/src/__tests__/dist");
    await cpy(
      "packages/build-helpers/src/__tests__/dist-test/**/*",
      "packages/build-helpers/src/__tests__/dist"
    );
  });

  it("creates hash-manifest.json", async () => {
    const rollupPlugin = hashM2c2kitAssets(
      "dist",
      "packages/build-helpers/src/__tests__"
    );
    await rollupPlugin.closeBundle.handler();

    const hashManifestExists = fs.existsSync(
      "packages/build-helpers/src/__tests__/dist/hash-manifest.json"
    );
    expect(hashManifestExists).toBe(true);
  });

  it("creates correct hash for index.js", async () => {
    const hashFileExists = fs.existsSync(
      "packages/build-helpers/src/__tests__/dist/index.41c4a996681dd2b9.js"
    );
    expect(hashFileExists).toBe(true);
  });

  it("creates correct hash for canvaskit.wasm", async () => {
    const hashFileExists = fs.existsSync(
      "packages/build-helpers/src/__tests__/dist/assets/canvaskit.ec1ea31c11baeadb.wasm"
    );
    expect(hashFileExists).toBe(true);
  });

  it("creates correct hash for png", async () => {
    const hashFileExists = fs.existsSync(
      "packages/build-helpers/src/__tests__/dist/assets/testapp/images/assessmentExample.3f7ed709655bd148.png"
    );
    expect(hashFileExists).toBe(true);
  });

  it("creates correct hash for font", async () => {
    const hashFileExists = fs.existsSync(
      "packages/build-helpers/src/__tests__/dist/assets/testapp/fonts/roboto/Roboto-Regular.f36638c2135b71e5.ttf"
    );
    expect(hashFileExists).toBe(true);
  });

  it("creates correct hash for css", async () => {
    const hashFileExists = fs.existsSync(
      "packages/build-helpers/src/__tests__/dist/assets/css/m2c2kit.42697434248ea1d8.css"
    );
    expect(hashFileExists).toBe(true);
  });

  it("index.html references correct hash for index.js", async () => {
    const contents = fs.readFileSync(
      "packages/build-helpers/src/__tests__/dist/index.html",
      { encoding: "utf-8" }
    );
    expect(contents.includes("index.41c4a996681dd2b9.js")).toBe(true);
  });

  it("index.html references correct hash for m2c2kit.css", async () => {
    const contents = fs.readFileSync(
      "packages/build-helpers/src/__tests__/dist/index.html",
      { encoding: "utf-8" }
    );
    expect(contents.includes("m2c2kit.42697434248ea1d8.css")).toBe(true);
  });

  it("index.js references correct hash for canvaskit.wasm", async () => {
    const contents = fs.readFileSync(
      "packages/build-helpers/src/__tests__/dist/index.41c4a996681dd2b9.js",
      { encoding: "utf-8" }
    );
    expect(contents.includes("canvaskit.ec1ea31c11baeadb.wasm")).toBe(true);
  });

  it("index.js references correct hash for png", async () => {
    const contents = fs.readFileSync(
      "packages/build-helpers/src/__tests__/dist/index.41c4a996681dd2b9.js",
      { encoding: "utf-8" }
    );
    expect(contents.includes("assessmentExample.3f7ed709655bd148.png")).toBe(
      true
    );
  });

  it("index.js references correct hash for font", async () => {
    const contents = fs.readFileSync(
      "packages/build-helpers/src/__tests__/dist/index.41c4a996681dd2b9.js",
      { encoding: "utf-8" }
    );
    expect(contents.includes("Roboto-Regular.f36638c2135b71e5.ttf")).toBe(true);
  });
});
