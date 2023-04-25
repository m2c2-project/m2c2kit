import { CanvasKitHelpers } from "./CanvasKitHelpers";
import { EventType } from "./EventBase";
import { Activity } from "./Activity";
import { ImageManager } from "./ImageManager";
import { FontManager } from "./FontManager";
import CanvasKitInit, { CanvasKit } from "canvaskit-wasm";
import { Game } from "./Game";
import { GameFontUrls } from "./GameFontUrls";
import { GameImages } from "./GameImages";
import { Timer } from "./Timer";
import { SessionOptions } from "./SessionOptions";
import { Uuid } from "./Uuid";
import { ActivityType } from "./ActivityType";
import { DomHelpers } from "./DomHelpers";
import { IDataStore } from "./IDataStore";

export class Session {
  options: SessionOptions;
  fontManager: FontManager;
  imageManager: ImageManager;
  currentActivity?: Activity;
  uuid: string;
  dataStore?: IDataStore;
  private sessionDictionary = new Map<string, SessionDictionaryValues>();
  private canvasKit?: CanvasKit;
  private version = "__PACKAGE_JSON_VERSION__";

  /**
   * A Session contains one or more activities. The session manages the start
   * and stop of activities, and advancement to next activity
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
    console.log(`⚪ @m2c2kit/core version ${this.version}`);
    Timer.start("sessionInit");
    DomHelpers.addLoadingElements();
    DomHelpers.setSpinnerVisibility(true);
    DomHelpers.setCanvasOverlayVisibility(true);

    await Promise.all(
      this.options.activities.map((activity) => {
        // IDataStore implementation is provided by another library and must
        // be set in the session before calling session.init()
        activity.dataStore = this.dataStore;
        return activity.init();
      })
    );

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
  async start(): Promise<void> {
    this.currentActivity = this.options.activities.find(Boolean);
    if (this.currentActivity) {
      DomHelpers.configureDomForActivity(this.currentActivity);
      await this.currentActivity.start();
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
    DomHelpers.hideAll();
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
   * Stops the current activity and goes to the activity with the provided id.
   *
   * @param options
   */
  async goToActivity(options: GoToActivityOptions): Promise<void> {
    const nextActivity = this.options.activities
      .filter((activity) => activity.id === options.id)
      .find(Boolean);
    if (!nextActivity) {
      throw new Error(
        `Error in goToActivity(): Session does not contain an activity with id ${options.id}.`
      );
    }
    if (this.currentActivity) {
      this.currentActivity.stop();
    }

    /**
     * From this point on, the phrase "currentActivity" refers to the activity
     * that we are going to, not the one we are leaving.
     * currentActivityOldObject is an instance of the activity that has been
     * fully initialized previously. We use currentActivityOldObject as a
     * blueprint to create a new instance.
     */
    const currentActivityOldObject = nextActivity;

    /**
     * It is possible the current activity is one we have executed before. In
     * that case, we need to reset everything about this activity. The cleanest
     * way to do that is create a new instance of it. The below factory
     * function does that.
     * see https://stackoverflow.com/a/14378462
     */
    const activityFactoryFunction =
      currentActivityOldObject.constructor.bind.apply(
        currentActivityOldObject.constructor,
        [null]
      );
    this.currentActivity = new activityFactoryFunction() as Activity;

    const indexOfCurrentActivity = this.options.activities.indexOf(
      currentActivityOldObject
    );
    this.options.activities[indexOfCurrentActivity] = this.currentActivity;
    DomHelpers.configureDomForActivity(this.currentActivity);

    /**
     * Because the current activity has been newly created, it needs properties
     * assigned to it that it would have received in the Session.init()
     * method. Also, if the old instance had new parameters set via
     * Game.SetParameters(), we must apply them.
     */
    this.currentActivity.session = this;
    this.currentActivity.dataStore = this.dataStore;
    if (this.currentActivity instanceof Game && this.canvasKit) {
      this.currentActivity.canvasKit = this.canvasKit;
    }
    if (currentActivityOldObject.additionalParameters) {
      this.currentActivity.setParameters(
        currentActivityOldObject.additionalParameters
      );
    }

    /**
     * In Session.init(), async assets were loaded. Once processed, they were
     * stored in a dictionary, with the activity uuid as the key. When a new
     * instance of the activity is created, the object has a different uuid.
     * We must update the uuid in the dictionaries (if it exists).
     */
    if (this.imageManager.loadedImages[currentActivityOldObject.uuid]) {
      this.imageManager.loadedImages[this.currentActivity.uuid] =
        this.imageManager.loadedImages[currentActivityOldObject.uuid];
      delete this.imageManager.loadedImages[currentActivityOldObject.uuid];
    }
    if (this.fontManager.gameTypefaces[currentActivityOldObject.uuid]) {
      this.fontManager.gameTypefaces[this.currentActivity.uuid] =
        this.fontManager.gameTypefaces[currentActivityOldObject.uuid];
      delete this.fontManager.gameTypefaces[currentActivityOldObject.uuid];
    }

    await this.currentActivity.init();
    await this.currentActivity.start();
  }

  /**
   * Stops the current activity and advances to next activity in the session.
   * If there is no activity after the current activity, throws error.
   */
  async goToNextActivity(): Promise<void> {
    if (!this.currentActivity) {
      throw new Error("error in advanceToNextActivity(): no current activity");
    }
    if (!this.nextActivity) {
      throw new Error("error in advanceToNextActivity(): no next activity");
    }
    this.currentActivity.stop();
    this.currentActivity = this.nextActivity;
    if (this.currentActivity) {
      DomHelpers.configureDomForActivity(this.currentActivity);
      await this.currentActivity.start();
    }
  }

  /**
   * Stops the current activity and advances to next activity in the session.
   * If there is no activity after the current activity, throws error.
   *
   * @deprecated Use goToNextActivity() instead.
   */
  async advanceToNextActivity(): Promise<void> {
    await this.goToNextActivity();
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
   * Saves an item to the session's key-value dictionary.
   *
   * @remarks The session dictionary is not persisted. It is available only
   * during the actively running session. It is useful for storing temporary
   * data to coordinate between activities.
   *
   * @param key - item key
   * @param value - item value
   */
  dictionarySetItem(key: string, value: SessionDictionaryValues): void {
    this.sessionDictionary.set(key, value);
  }

  /**
   * Gets an item value from the session's key-value dictionary.
   *
   * @remarks The session dictionary is not persisted. It is available only
   * during the actively running session. It is useful for storing temporary
   * data to coordinate between activities.
   *
   * @param key - item key
   * @returns value of the item
   */
  dictionaryGetItem<T extends SessionDictionaryValues>(key: string) {
    return this.sessionDictionary.get(key) as T;
  }

  /**
   * Deletes an item value from the session's key-value dictionary.
   *
   * @remarks The session dictionary is not persisted. It is available only
   * during the actively running session. It is useful for storing temporary
   * data to coordinate between activities.
   *
   * @param key - item key
   * @returns true if the item was deleted, false if it did not exist
   */
  dictionaryDeleteItem(key: string) {
    return this.sessionDictionary.delete(key);
  }

  /**
   * Determines if a key exists in the activity's key-value dictionary.
   *
   * @remarks The session dictionary is not persisted. It is available only
   * during the actively running session. It is useful for storing temporary
   * data to coordinate between activities.
   *
   * @param key - item key
   * @returns true if the key exists, false otherwise
   */
  dictionaryItemExists(key: string) {
    return this.sessionDictionary.has(key);
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return CanvasKitInit({ locateFile: (_file) => canvasKitWasmUrl });
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

export interface GoToActivityOptions {
  /** ActivityId of the activity to go to. */
  id: string;
}

/**
 * Types of values that can be stored in the session dictonary.
 */
export type SessionDictionaryValues =
  | string
  | number
  | boolean
  | object
  | null
  | undefined;
