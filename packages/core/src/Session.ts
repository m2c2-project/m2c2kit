import { EventType } from "./EventBase";
import { Activity } from "./Activity";
import { ImageManager } from "./ImageManager";
import { FontManager } from "./FontManager";
import { CanvasKit, CanvasKitInit } from "./CanvasKitInit";
import { Game } from "./Game";
import { GameFontUrls } from "./GameFontUrls";
import { GameImages } from "./GameImages";
import { Timer } from "./Timer";
import { SessionOptions } from "./SessionOptions";
import { Uuid } from "./Uuid";

export class Session {
  options: SessionOptions;
  fontManager: FontManager;
  imageManager: ImageManager;
  currentActivity?: Activity;
  uuid = Uuid.generate();
  private canvasKit?: CanvasKit;

  /**
   * A Session contains one or more activities; currently, the only
   * class that implements Activity is Game, but Survey is planned.
   * The session manages the start and stop of activities, and
   * advancement to next activity
   *
   * @param options
   */
  constructor(options: SessionOptions) {
    this.options = options;
    this.fontManager = new FontManager();
    this.imageManager = new ImageManager();
    this.options.activities.forEach((activity) => (activity.session = this));
  }

  /**
   * Asynchronously initializes the m2c2kit engine and loads assets
   */
  async init(): Promise<void> {
    Timer.start("sessionInit");

    const [canvasKit] = await this.getAsynchronousAssets();
    this.loadAssets(canvasKit);

    console.log(
      `Session.init() took ${Timer.elapsed("sessionInit").toFixed(0)} ms`
    );
    Timer.remove("sessionInit");
    const sessionLifecycleChangeCallback =
      this.options.sessionCallbacks?.onSessionLifecycleChange;
    if (sessionLifecycleChangeCallback) {
      sessionLifecycleChangeCallback({
        eventType: EventType.sessionLifecycle,
        initialized: true,
        ended: false,
      });
    }
  }

  /**
   * Starts the session and starts the first activity.
   */
  start(): void {
    this.currentActivity = this.options.activities.find(Boolean);
    this.logStartingActivity();
    this.currentActivity?.start();
  }

  /**
   * Declares the session ended and sends callback.
   */
  end(): void {
    const sessionLifecycleChangeCallback =
      this.options.sessionCallbacks?.onSessionLifecycleChange;
    if (sessionLifecycleChangeCallback) {
      sessionLifecycleChangeCallback({
        eventType: EventType.sessionLifecycle,
        initialized: false,
        ended: true,
      });
    }
  }

  /**
   * Stops the current activity and advances to next activity in the session.
   * If there is no activity after the current activity, throws error
   */
  advanceToNextActivity(): void {
    if (!this.currentActivity) {
      throw new Error("error in advanceToNextActivity(): no current activity");
    }
    if (!this.nextActivity) {
      throw new Error("error in advanceToNextActivity(): no next activity");
    }
    this.currentActivity.stop();
    this.currentActivity = this.nextActivity;
    this.logStartingActivity();
    this.currentActivity.start();
  }

  /**
   * Gets the next activity after the current one, or undefined if
   * this is the last activity.
   */
  get nextActivity(): Activity | undefined {
    if (!this.currentActivity) {
      throw new Error("error in get nextActivity(): no current activity");
    }
    const index = this.options.activities.indexOf(this.currentActivity);
    if (index === this.options.activities.length - 1) {
      return undefined;
    }
    const currentActivityIndex = this.options.activities.indexOf(
      this.currentActivity
    );
    return this.options.activities[currentActivityIndex + 1];
  }

  private logStartingActivity(): void {
    if (this.currentActivity instanceof Game) {
      const version = this.currentActivity?.options.version
        ? `, version ${this.currentActivity?.options.version}`
        : "";
      console.log(
        `starting game: ${this.currentActivity?.options.name + version}`
      );
    }
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

    this.options.activities
      .filter((activity) => activity instanceof Game)
      .forEach((activity) => {
        const game = activity as unknown as Game;
        game.canvasKit = canvasKit;
      });
  }

  private getFontsConfigurationFromGames(): GameFontUrls[] {
    return this.options.activities
      .filter((activity) => activity instanceof Game)
      .map((activity) => {
        const game = activity as unknown as Game;
        return { uuid: game.uuid, fontUrls: game.options.fontUrls ?? [] };
      });
  }

  private getImagesConfigurationFromGames(): GameImages[] {
    return this.options.activities
      .filter((activity) => activity instanceof Game)
      .map((activity) => {
        const game = activity as unknown as Game;
        return { uuid: game.uuid, images: game.options.images ?? [] };
      });
  }
}
