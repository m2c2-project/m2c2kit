import { hashM2c2kitAssets } from "..";
import cpy from "cpy";
import { rimrafSync } from "rimraf";
import * as fs from "fs";

describe("hashM2c2kitAssets rollup plugin", () => {
  beforeAll(async () => {
    rimrafSync("packages/build-helpers/src/__tests__/dist");
    await cpy(
      "packages/build-helpers/src/__tests__/dist-test/**/*",
      "packages/build-helpers/src/__tests__/dist",
    );
  });

  it("creates manifest.json", async () => {
    const rollupPlugin = hashM2c2kitAssets(
      "dist",
      "packages/build-helpers/src/__tests__",
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (rollupPlugin.writeBundle as any).handler();

    const manifestExists = fs.existsSync(
      "packages/build-helpers/src/__tests__/dist/manifest.json",
    );
    expect(manifestExists).toBe(true);
  });

  it("creates correct hash for index.js", async () => {
    const hashFileExists = fs.existsSync(
      "packages/build-helpers/src/__tests__/dist/index.c9df28c0a2b6735b.js",
    );
    expect(hashFileExists).toBe(true);
  });

  it("creates correct hash for canvaskit.wasm", async () => {
    const hashFileExists = fs.existsSync(
      "packages/build-helpers/src/__tests__/dist/assets/scratch/canvaskit-0.38.2.1b00aa4762039fc0.wasm",
    );
    expect(hashFileExists).toBe(true);
  });

  it("creates correct hash for png", async () => {
    const hashFileExists = fs.existsSync(
      "packages/build-helpers/src/__tests__/dist/assets/scratch/images/assessmentExample.3f7ed709655bd148.png",
    );
    expect(hashFileExists).toBe(true);
  });

  it("creates correct hash for font", async () => {
    const hashFileExists = fs.existsSync(
      "packages/build-helpers/src/__tests__/dist/assets/scratch/fonts/roboto/Roboto-Regular.f36638c2135b71e5.ttf",
    );
    expect(hashFileExists).toBe(true);
  });

  it("index.html references correct hash for index.js", async () => {
    const contents = fs.readFileSync(
      "packages/build-helpers/src/__tests__/dist/index.html",
      { encoding: "utf-8" },
    );
    expect(contents.includes("index.c9df28c0a2b6735b.js")).toBe(true);
  });
});
