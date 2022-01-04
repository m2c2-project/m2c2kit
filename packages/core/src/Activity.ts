import { ImageManager } from "./ImageManager";
import { FontManager } from "./FontManager";
import { CanvasKit, CanvasKitInit } from "./CanvasKitInit";
import { Game } from "./Game";
import { GameFontUrls } from "./GameFontUrls";
import { GameImages } from "./GameImages";
import { Timer } from "./Timer";

export interface ActivityOptions {
  /** The games that compose this activity */
  games: Array<Game>;
}

export class Activity {
  fontManager: FontManager;
  imageManager: ImageManager;
  private canvasKit?: CanvasKit;
  private games = new Array<Game>();
  currentGame?: Game;

  /**
   * An Activity contains one or more games; this class
   * manages the start and stop of games, and progression between games.
   *
   * @param options
   */
  constructor(options: ActivityOptions) {
    this.fontManager = new FontManager();
    this.imageManager = new ImageManager();
    this.games = options.games;
    this.games.forEach((game) => (game.activity = this));
  }

  /**
   * Asynchronously initializes the m2c2kit engine and loads assets
   *
   */
  async init(): Promise<void> {
    Timer.Start("activityInit");

    const [canvasKit] = await this.getAsynchronousAssets();
    this.loadAssets(canvasKit);

    console.log(
      `Activity.init() took ${Timer.Elapsed("activityInit").toFixed(0)} ms`
    );
    Timer.Remove("activityInit");
  }

  /**
   * Starts the activity and starts the first game.
   */
  start(): void {
    this.currentGame = this.games.find(Boolean);
    console.log(`starting game: ${this.currentGame?.options.name}`);
    this.currentGame?.start();
  }

  /**
   * Advances to the next game in the activity.
   */
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

  /**
   * Gets asynchronous assets, including initialization of canvaskit wasm,
   * fetching of fonts from specified urls, and rendering and fetching
   * of images
   * @returns
   */
  private async getAsynchronousAssets(): Promise<[CanvasKit, void, void[]]> {
    const canvasKitPromise = this.loadCanvasKit();
    const fetchFontsPromise = this.fontManager.fetchFonts(
      this.getFontsConfigurationFromGames()
    );
    const renderImagesPromise = this.imageManager.renderImages(
      this.getImagesConfigurationFromGames()
    );

    return await Promise.all([
      canvasKitPromise,
      fetchFontsPromise,
      renderImagesPromise,
    ]);
  }

  // call CanvasKitInit through loadCanvasKit so we can mock
  // loadCanvasKit using jest
  private loadCanvasKit(): Promise<CanvasKit> {
    return CanvasKitInit();
  }

  private loadAssets(canvasKit: CanvasKit) {
    this.assignCanvasKit(canvasKit);
    this.fontManager.loadAllGamesFontData();
    this.imageManager.loadAllGamesRenderedImages();
  }

  private assignCanvasKit(canvasKit: CanvasKit) {
    this.canvasKit = canvasKit;
    this.fontManager.canvasKit = this.canvasKit;
    this.imageManager.canvasKit = this.canvasKit;

    this.games.forEach((game) => {
      game.canvasKit = canvasKit;
    });
  }

  private getFontsConfigurationFromGames(): GameFontUrls[] {
    return this.games.map((game) => {
      return { uuid: game.uuid, fontUrls: game.options.fontUrls ?? [] };
    });
  }

  private getImagesConfigurationFromGames(): GameImages[] {
    return this.games.map((game) => {
      return { uuid: game.uuid, images: game.options.svgImages ?? [] };
    });
  }
}
