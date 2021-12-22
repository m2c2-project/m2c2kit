import { ImageManager } from "./ImageManager";
import { FontManager } from "./FontManager";
import { CanvasKit, CanvasKitInit } from "./CanvasKitInit";
import { FontData, Game } from ".";
import { RgbaColor } from "./RgbaColor";
import { SvgImage } from "./SvgImage";

/**
 * Options to specify HTML canvas, set game canvas size, and load game assets.
 */

export interface ActivityOptions {
  games: Array<Game>;
}

export class Activity {
  canvasKit?: CanvasKit;
  games = new Array<Game>();
  options: ActivityOptions;
  fontManager: FontManager;
  imageManager: ImageManager;
  private scratchHtmlCanvas?: HTMLCanvasElement;

  constructor(options: ActivityOptions) {
    this.options = options;
    this.fontManager = new FontManager();
    this.imageManager = new ImageManager();
    this.games = options.games;
  }

  async init(): Promise<void> {
    let initStartedTimeStamp: number;
    initStartedTimeStamp = window.performance.now();

    this.createScratchCanvas();

    const canvasKitPromise = CanvasKitInit();
    const fetchFontsPromise = this.fetchFonts();
    const [canvasKit, nestedAllGamesFontData] = await Promise.all([
      canvasKitPromise,
      Promise.all(fetchFontsPromise),
    ]);

    this.canvasKit = canvasKit;
    this.fontManager.canvasKit = this.canvasKit;
    this.imageManager.canvasKit = this.canvasKit;

    this.games.forEach((game) => {
      game.activity = this;
      game.canvasKit = canvasKit;
    });
    const allGamesFontData = nestedAllGamesFontData.flat();
    this.loadAllGamesFontData(allGamesFontData);
    console.log(
      `Activity.init() took ${(
        window.performance.now() - initStartedTimeStamp
      ).toFixed(0)} ms`
    );
  }

  private loadAllGamesFontData(allGamesFontData: FontData[]) {
    const gameUuids = Array.from(
      new Set(allGamesFontData.map((fd) => fd.gameUuid))
    );
    gameUuids.forEach((gameUuid) => {
      const gameFontData = allGamesFontData
        .filter((fd) => fd.gameUuid === gameUuid)
        .map((fd) => fd.fontArrayBuffer);
      this.fontManager.LoadGameFonts(gameUuid, gameFontData);
    });
  }

  private fetchFonts() {
    const fetchFontsPromise = new Array<Promise<FontData[]>>();
    this.games.forEach((game) => {
      const fetchOneGameFontsPromise =
        this.fontManager.FetchGameFontsAsArrayBuffers(
          game.uuid,
          game.options.fontUrls ?? []
        );
      fetchFontsPromise.push(fetchOneGameFontsPromise);
    });
    return fetchFontsPromise;
  }

  private createScratchCanvas() {
    const scratchCanvas = document.createElement("canvas");
    scratchCanvas.id = "m2c2kitscratchcanvas";
    scratchCanvas.hidden = true;
    document.body.appendChild(scratchCanvas);
    this.scratchHtmlCanvas = scratchCanvas;
  }

  start(): void {
    this.games.find(Boolean)?.start();
  }
}
