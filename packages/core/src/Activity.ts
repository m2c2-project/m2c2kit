import { ImageManager } from "./ImageManager";
import { FontManager } from "./FontManager";
import { CanvasKit, CanvasKitInit } from "./CanvasKitInit";
import { FontData, Game } from ".";

export interface ActivityOptions {
  games: Array<Game>;
}

export class Activity {
  private canvasKit?: CanvasKit;
  private games = new Array<Game>();
  fontManager: FontManager;
  imageManager: ImageManager;
  private scratchHtmlCanvas?: HTMLCanvasElement;
  private currentGame?: Game;

  constructor(options: ActivityOptions) {
    this.fontManager = new FontManager();
    this.imageManager = new ImageManager();
    this.games = options.games;
    this.games.forEach((game) => (game.activity = this));
  }

  /**
   * Asynchronously initializes the m2c2kit engine and load assets
   *
   */
  async init(): Promise<void> {
    let initStartedTimeStamp: number;
    initStartedTimeStamp = window.performance.now();

    this.createScratchCanvas();

    const canvasKitPromise = CanvasKitInit();
    const fetchFontsPromise = this.fetchFonts();
    const renderImagesPromise = this.renderImages();

    const [canvasKit, nestedAllGamesFontData, _] = await Promise.all([
      canvasKitPromise,
      fetchFontsPromise,
      renderImagesPromise,
    ]);

    this.assignCanvasKit(canvasKit);

    const allGamesFontData = nestedAllGamesFontData.flat();
    this.loadAllGamesFontData(allGamesFontData);
    console.log(
      `Activity.init() took ${(
        window.performance.now() - initStartedTimeStamp
      ).toFixed(0)} ms`
    );

    this.imageManager.LoadRenderedImages();
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

  private renderImages() {
    if (this.scratchHtmlCanvas === undefined) {
      throw new Error("scratch html canvas is undefined");
    }
    this.imageManager.initialize(this.scratchHtmlCanvas);

    const renderImagesPromises = new Array<Promise<void>>();
    this.games.forEach((game) => {
      if (game.options.svgImages) {
        let findDuplicates = (arr: string[]) =>
          arr.filter((item, index) => arr.indexOf(item) != index);
        const duplicateImageNames = findDuplicates(
          game.options.svgImages.map((i) => i.name)
        );
        if (duplicateImageNames.length > 0) {
          throw new Error(
            "image names must be unique. these image names are duplicated within a game: " +
              duplicateImageNames.join(", ")
          );
        }
        game.options.svgImages.map((svg) => {
          renderImagesPromises.push(
            this.imageManager.renderSvgImage(game.uuid, svg)
          );
        });
      }
    });
    return Promise.all(renderImagesPromises);
  }

  private fetchFonts() {
    const fetchFontsPromises = new Array<Promise<FontData[]>>();
    this.games.forEach((game) => {
      const fetchOneGameFontsPromise =
        this.fontManager.FetchGameFontsAsArrayBuffers(
          game.uuid,
          game.options.fontUrls ?? []
        );
      fetchFontsPromises.push(fetchOneGameFontsPromise);
    });
    return Promise.all(fetchFontsPromises);
  }

  private createScratchCanvas() {
    const scratchCanvas = document.createElement("canvas");
    scratchCanvas.id = "m2c2kitscratchcanvas";
    scratchCanvas.hidden = true;
    document.body.appendChild(scratchCanvas);
    this.scratchHtmlCanvas = scratchCanvas;
  }

  private assignCanvasKit(canvasKit: CanvasKit) {
    this.canvasKit = canvasKit;
    this.fontManager.canvasKit = this.canvasKit;
    this.imageManager.canvasKit = this.canvasKit;

    this.games.forEach((game) => {
      game.canvasKit = canvasKit;
    });
  }

  start(): void {
    this.currentGame = this.games.find(Boolean);
    console.log(`starting game: ${this.currentGame?.options.name}`);
    this.currentGame?.start();
  }

  nextGame(): void {
    if (!this.currentGame) {
      throw new Error("no current game");
    }
    const index = this.games.indexOf(this.currentGame);
    if (index === this.games.length - 1) {
      throw new Error("no next game");
    }
    this.currentGame.stop();
    const currentGameIndex = this.games.indexOf(this.currentGame);
    this.currentGame = this.games[currentGameIndex + 1];
    console.log(`starting game: ${this.currentGame?.options.name}`);
    this.currentGame.start();
  }
}
