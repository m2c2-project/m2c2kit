import { CanvasKitHelpers } from "./CanvasKitHelpers";
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
import { ActivityType } from "./ActivityType";

export class Session {
  options: SessionOptions;
  fontManager: FontManager;
  imageManager: ImageManager;
  currentActivity?: Activity;
  uuid: string;
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
    for (const activity of this.options.activities) {
      if (this.options.activities.filter((a) => a === activity).length > 1) {
        throw new Error(
          `error in SessionOptions.activities: an instance of the activity named "${activity.name}" has been added more than once to the session. If you want to repeat the same activity, create separate instances of it.`
        );
      }
    }
    this.fontManager = new FontManager();
    this.imageManager = new ImageManager();
    this.options.activities.forEach((activity) => (activity.session = this));
    if (this.options.sessionUuid) {
      this.uuid = this.options.sessionUuid;
    } else {
      this.uuid = Uuid.generate();
    }
  }

  /**
   * Asynchronously initializes the m2c2kit engine and loads assets
   */
  async init(): Promise<void> {
    Timer.start("sessionInit");

    this.options.activities.forEach((activity) => activity.init());

    const [canvasKit] = await this.getAsynchronousAssets();
    this.loadAssets(canvasKit);
    this.imageManager.removeScratchCanvas();

    console.log(
      `⚪ Session.init() took ${Timer.elapsed("sessionInit").toFixed(0)} ms`
    );
    Timer.remove("sessionInit");
    const sessionLifecycleChangeCallback =
      this.options.sessionCallbacks?.onSessionLifecycle;
    if (sessionLifecycleChangeCallback) {
      sessionLifecycleChangeCallback({
        target: this,
        type: EventType.SessionInitialize,
      });
    }
  }

  /**
   * Starts the session and starts the first activity.
   */
  start(): void {
    this.currentActivity = this.options.activities.find(Boolean);
    if (this.currentActivity) {
      this.configureDomForActivity(this.currentActivity);
      this.currentActivity.start();
    }
  }

  /**
   * Declares the session ended and sends callback.
   */
  end(): void {
    const sessionLifecycleChangeCallback =
      this.options.sessionCallbacks?.onSessionLifecycle;
    if (sessionLifecycleChangeCallback) {
      sessionLifecycleChangeCallback({
        target: this,
        type: EventType.SessionEnd,
      });
    }
    this.setCanvasDivVisibility(false);
    this.setSurveyDivVisibility(false);
    this.stop();
  }

  private stop(): void {
    this.dispose();
  }

  /**
   * Frees up resources that were allocated to run the session.
   *
   * @remarks This will be done automatically by the m2c2kit library;
   * the end-user must not call this.
   */
  private dispose(): void {
    /**
     * All CanvasKit objects are disposed by the games that used them,
     * except for FontMgr, which is session-wide and shared by games.
     */
    CanvasKitHelpers.Dispose([this.fontManager.fontMgr]);
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
    if (this.currentActivity) {
      this.configureDomForActivity(this.currentActivity);
      this.currentActivity.start();
    }
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

  /**
   * Depending on the type of activity, set the visibility of the survey div
   * and canvas div.
   *
   * @param activity - the activity to configure the DOM for
   */
  private configureDomForActivity(activity: Activity): void {
    if (activity.type == ActivityType.Game) {
      this.setCanvasDivVisibility(true);
      this.setSurveyDivVisibility(false);
    }
    if (activity.type == ActivityType.Survey) {
      this.setCanvasDivVisibility(false);
      this.setSurveyDivVisibility(true);
    }
  }

  /**
   * Shows or hides the survey div.
   *
   * @param visible - true if the survey div should be visible
   */
  private setSurveyDivVisibility(visible: boolean): void {
    const surveyDiv = document.getElementById("m2c2kit-survey-div");
    if (surveyDiv && visible) {
      surveyDiv.classList.remove("m2c2kit-display-none");
      surveyDiv.classList.add("m2c2kit-display-block");
    }
    if (surveyDiv && !visible) {
      surveyDiv.classList.add("m2c2kit-display-none");
      surveyDiv.classList.remove("m2c2kit-display-block");
    }
  }

  /**
   * Shows or hides the canvas div.
   *
   * @param visible - true if the canvas div should be visible
   */
  private setCanvasDivVisibility(visible: boolean): void {
    const canvasDiv = document.getElementById("m2c2kit-canvas-div");
    if (canvasDiv && visible) {
      canvasDiv.classList.remove("m2c2kit-display-none");
      canvasDiv.classList.add("m2c2kit-flex-container");
    }
    if (canvasDiv && !visible) {
      canvasDiv.classList.add("m2c2kit-display-none");
      canvasDiv.classList.remove("m2c2kit-flex-container");
    }
  }

  /**
   * Gets asynchronous assets, including initialization of canvaskit wasm,
   * fetching of fonts from specified urls, and rendering and fetching
   * of images
   * @returns
   */
  private async getAsynchronousAssets(): Promise<[CanvasKit, void, void[]]> {
    const canvasKitPromise = this.loadCanvasKit(this.options.canvasKitWasmUrl);
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
  private loadCanvasKit(canvasKitWasmUrl: string): Promise<CanvasKit> {
    return CanvasKitInit(canvasKitWasmUrl);
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
      .filter((activity) => activity.type == ActivityType.Game)
      .forEach((activity) => {
        const game = activity as unknown as Game;
        game.canvasKit = canvasKit;
      });
  }

  private getFontsConfigurationFromGames(): GameFontUrls[] {
    return this.options.activities
      .filter((activity) => activity.type == ActivityType.Game)
      .map((activity) => {
        const game = activity as unknown as Game;
        return { uuid: game.uuid, fontUrls: game.options.fontUrls ?? [] };
      });
  }

  private getImagesConfigurationFromGames(): GameImages[] {
    return this.options.activities
      .filter((activity) => activity.type == ActivityType.Game)
      .map((activity) => {
        const game = activity as unknown as Game;
        return { uuid: game.uuid, images: game.options.images ?? [] };
      });
  }
}
