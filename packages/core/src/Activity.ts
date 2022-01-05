import { ImageManager } from "./ImageManager";
import { FontManager } from "./FontManager";
import { CanvasKit, CanvasKitInit } from "./CanvasKitInit";
import { Game } from "./Game";
import { GameFontUrls } from "./GameFontUrls";
import { GameImages } from "./GameImages";
import { Timer } from "./Timer";
import { ActivityOptions } from "./ActivityOptions";

export class Activity {
  options: ActivityOptions;
  fontManager: FontManager;
  imageManager: ImageManager;
  currentGame?: Game;
  private canvasKit?: CanvasKit;

  /**
   * An Activity contains one or more games; this class
   * manages the start and stop of games, and advancement to next game.
   *
   * @param options
   */
  constructor(options: ActivityOptions) {
    this.options = options;
    this.fontManager = new FontManager();
    this.imageManager = new ImageManager();
    this.options.games.forEach((game) => (game.activity = this));
  }

  /**
   * Asynchronously initializes the m2c2kit engine and loads assets
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
    this.currentGame = this.options.games.find(Boolean);
    console.log(`starting game: ${this.currentGame?.options.name}`);
    this.currentGame?.start();
  }

  /**
   * Stops the current game and advances and starts the next game in the activity.
   * If there is no game after the current game, throws error
   */
  advanceToNextGame(): void {
    if (!this.currentGame) {
      throw new Error("error in advanceToNextGame(): no current game");
    }
    if (!this.nextGame) {
      throw new Error("error in advanceToNextGame(): no next game");
    }
    this.currentGame.stop();
    this.currentGame = this.nextGame;
    console.log(`starting game: ${this.currentGame?.options.name}`);
    this.currentGame.start();
  }

  /**
   * Gets the next game after the current one, or undefined if
   * this is the last game.
   */
  get nextGame(): Game | undefined {
    if (!this.currentGame) {
      throw new Error("error in get nextGame(): no current game");
    }
    const index = this.options.games.indexOf(this.currentGame);
    if (index === this.options.games.length - 1) {
      return undefined;
    }
    const currentGameIndex = this.options.games.indexOf(this.currentGame);
    return this.options.games[currentGameIndex + 1];
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

    this.options.games.forEach((game) => {
      game.canvasKit = canvasKit;
    });
  }

  private getFontsConfigurationFromGames(): GameFontUrls[] {
    return this.options.games.map((game) => {
      return { uuid: game.uuid, fontUrls: game.options.fontUrls ?? [] };
    });
  }

  private getImagesConfigurationFromGames(): GameImages[] {
    return this.options.games.map((game) => {
      return { uuid: game.uuid, images: game.options.svgImages ?? [] };
    });
  }
}
