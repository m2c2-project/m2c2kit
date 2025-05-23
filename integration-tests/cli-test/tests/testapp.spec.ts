import { test, expect, Locator, Browser } from "@playwright/test";
import { PNG, PNGWithMetadata } from "pngjs";
import pixelmatch from "pixelmatch";
import * as fs from "fs";

test.describe("m2c2 cli new integration test", () => {
  const url = "http://testapp:3000";
  test.beforeAll(async () => {
    console.log("Waiting 4s before starting playwright tests...");
    await new Promise((r) => setTimeout(r, 4000));
  });

  test("starter app creates canvas 400px wide, 800px high", async ({
    browser,
  }) => {
    const canvas = await getM2c2Canvas(browser, url);
    expect(await canvas.getAttribute("width")).toBe("400");
    expect(await canvas.getAttribute("height")).toBe("800");
  });

  test("starter app creates a scene1 that pixel matches our reference scene1", async ({
    browser,
  }) => {
    const canvas = await getM2c2Canvas(browser, url);
    const buffer = await canvas.screenshot();
    // uncomment to save a new reference image
    //fs.writeFileSync("scene1.png", buffer);
    const canvasPng = PNG.sync.read(buffer);
    const scene1Png = readPngFromFile("./images/testAppScene1.png");
    expect(diffPixelCount(canvasPng, scene1Png)).toBe(0);
  });

  test("starter app advances to next page and create a scene2 that pixel matches our reference scene2", async ({
    browser,
  }) => {
    const canvas = await getM2c2Canvas(browser, url);
    /**
     * { x, y } position to click is OFFSETS from TOP LEFT of canvas
     * Thus, { x: 310, y: 692 } is in the hit area of the NEXT button
     */
    await canvas.click({ position: { x: 310, y: 692 } });
    // wait for the scene to transition to complete
    await canvas.page().waitForTimeout(1000);
    const buffer = await canvas.screenshot();
    const canvasPng = PNG.sync.read(buffer);
    const scene2Png = readPngFromFile("./images/testAppScene2.png");
    expect(diffPixelCount(canvasPng, scene2Png)).toBe(0);
  });
});

test.describe("m2c2 cli static-site integration test", () => {
  const url = "http://testmodule:8080/index.html?assessment=testmodule@1.0.0";
  test.beforeAll(async () => {
    console.log("Waiting 4s before starting playwright tests...");
    await new Promise((r) => setTimeout(r, 4000));
  });

  test("static site creates a test module scene1 that pixel matches our reference scene1", async ({
    browser,
  }) => {
    const canvas = await getM2c2Canvas(browser, url);
    const buffer = await canvas.screenshot();
    const canvasPng = PNG.sync.read(buffer);
    const scene1Png = readPngFromFile("./images/testModuleScene1.png");
    expect(diffPixelCount(canvasPng, scene1Png)).toBe(0);
  });

  test("static site creates demo page", async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto("http://testmodule:8080/demo/index.html");
    const content = await page.content();
    expect(content).toContain("Assessment demos");
  });

  test("static site copies testmodule schemas.json to assessment folder", async ({
    browser,
  }) => {
    const page = await browser.newPage();
    const url =
      "http://testmodule:8080/assessments/testmodule@1.0.0/schemas.json";
    const response = await page.goto(url);
    expect(response?.ok()).toBeTruthy();
    const content = await page.content();
    expect(content).toContain(`"$schema"`);
  });
});

async function getM2c2Canvas(browser: Browser, url: string): Promise<Locator> {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 1200 },
  });

  /**
   * Originally, this was:
   *   await page.goto()...
   *   await page.waitForEvent()...
   * But, that was not reliable. Sometimes, the page would load before
   * the console event listener was set up, and the event would be missed.
   */
  await Promise.all([
    page.waitForEvent("console", (msg) =>
      msg.text().includes("started activity"),
    ),
    /**
     * Both the m2c2 test app being served AND the playwright tests will be
     * running in docker containers on a shared network. Thus, when
     * we direct Playwright to navigate to the m2c2 test app, we must use
     * the test app service name as defined within docker-compose.yaml,
     * NOT localhost.
     */
    page.goto(url),
  ]);
  // wait, because the canvas may not yet be sized and ready
  await page.waitForTimeout(500);
  return page.locator("#m2c2kit-canvas");
}

function diffPixelCount(png1: PNGWithMetadata, png2: PNGWithMetadata): number {
  const diff = new PNG({ width: png1.width, height: png1.height });
  const numDiffPixels = pixelmatch(
    png1.data,
    png2.data,
    diff.data,
    png1.width,
    png1.height,
    { threshold: 0 },
  );
  return numDiffPixels;
}

function readPngFromFile(filepath: string): PNGWithMetadata {
  return PNG.sync.read(fs.readFileSync(filepath));
}
