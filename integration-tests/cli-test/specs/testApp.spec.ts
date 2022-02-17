import M2c2Page from "../pages/m2c2.page";
import { PNG, PNGWithMetadata } from "pngjs";
import * as fs from "fs";
import * as pixelmatch from "pixelmatch";

describe("m2c2 cli starter app", () => {
  let canvasElement: WebdriverIO.Element;

  beforeAll(async () => {
    /**
     * Both the m2c2 test app being served AND the selenium server will be
     * running in docker containers on a shared network. Thus, when
     * we direct selenium to navigate to the m2c2 test app, use we must use
     * the service name as defined within docker-compose.yaml, NOT localhost
     */

    await browser.url("http://m2c2app:3000");
    // wait for the first scene to render, 2000ms should be ok.
    await browser.pause(2000);
    canvasElement = await M2c2Page.m2c2Canvas;
  });

  it("should create canvas 400px wide, 800px high", async () => {
    expect(await canvasElement.getAttribute("width")).toBe("400");
    expect(await canvasElement.getAttribute("height")).toBe("800");
  });

  it("should create a scene1 that pixel matches our reference scene1", async () => {
    const canvasPng = await elementToPng(canvasElement);
    const scene1Png = readPngFromFile("./images/testAppScene1.png");
    expect(diffPixelCount(canvasPng, scene1Png)).toBe(0);
  });

  it("should advance to next page and create a scene2 that pixel matches our reference scene2", async () => {
    /**
     * x, y arguments to click are OFFSETS from CENTER of element
     * Thus, 110, 340 is in the hit area of the NEXT button
     * from the center of our 400 wide by 800 high canvas
     */
    await canvasElement.click({ x: 110, y: 340 });
    await browser.pause(1000);

    const canvasPng = await elementToPng(canvasElement);
    const scene2Png = readPngFromFile("./images/testAppScene2.png");
    expect(diffPixelCount(canvasPng, scene2Png)).toBe(0);
  });
});

/** Helper functions */

const elementToPng = async (
  element: WebdriverIO.Element
): Promise<PNGWithMetadata> => {
  /**
   * according to the spec (https://www.w3.org/TR/webdriver1/),
   * this magic string "element-6066-11e4-a52e-4f735466cecf"
   * is the "web element identifier"; we use it to get the web element's
   * "web element reference".
   * There is some inconsistency in terminology across the spec and the
   * webdriverio docs (https://webdriver.io/docs/api/chromium/#takeelementscreenshot)
   * "web element reference" in the spec seems to be the same as
   * "elementId in the webdriverio docs
   */
  const elementId = element["element-6066-11e4-a52e-4f735466cecf"];
  const elementPngAsBase64 = await browser.takeElementScreenshot(elementId);
  const buffer = Buffer.from(elementPngAsBase64, "base64");
  return PNG.sync.read(buffer);
};

const diffPixelCount = (
  png1: PNGWithMetadata,
  png2: PNGWithMetadata
): number => {
  const diff = new PNG({ width: png1.width, height: png1.height });
  const numDiffPixels = pixelmatch(
    png1.data,
    png2.data,
    diff.data,
    png1.width,
    png1.height,
    { threshold: 0 }
  );
  return numDiffPixels;
};

const readPngFromFile = (filepath: string): PNGWithMetadata => {
  return PNG.sync.read(fs.readFileSync(filepath));
};
