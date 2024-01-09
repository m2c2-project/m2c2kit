import { EventBase, EventType } from "./EventBase";
import { EventListenerBase } from "./EventListenerBase";
import { Activity } from "./Activity";
import { ImageManager } from "./ImageManager";
import CanvasKitInit, { CanvasKit } from "canvaskit-wasm";
import { Game } from "./Game";
import { GameImages } from "./GameImages";
import { Timer } from "./Timer";
import { SessionOptions } from "./SessionOptions";
import { Uuid } from "./Uuid";
import { ActivityType } from "./ActivityType";
import { DomHelpers } from "./DomHelpers";
import { IDataStore } from "./IDataStore";
import { CallbackOptions } from "./CallbackOptions";
import { ActivityLifecycleEvent } from "./ActivityLifecycleEvent";
import { SessionLifecycleEvent } from "./SessionLifecycleEvent";
import { ActivityResultsEvent } from "./ActivityResultsEvent";
import { Constants } from "./Constants";

export class Session {
  options: SessionOptions;
  imageManager: ImageManager;
  currentActivity?: Activity;
  uuid: string;
  dataStores?: IDataStore[];
  private eventListeners = new Array<EventListenerBase>();
  private sessionDictionary = new Map<string, SessionDictionaryValues>();
  private canvasKit?: CanvasKit;
  private initialized = false;
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
          `error in SessionOptions.activities: an instance of the activity named "${activity.name}" has been added more than once to the session. If you want to repeat the same activity, create separate instances of it.`,
        );
      }
    }
    this.imageManager = new ImageManager(this);
    this.options.activities.forEach((activity) => (activity.session = this));
    if (this.options.sessionUuid) {
      this.uuid = this.options.sessionUuid;
    } else {
      this.uuid = Uuid.generate();
    }
  }

  /**
   * Executes a callback when the session initializes.
   *
   * @param callback - function to execute.
   * @param options - options for the callback.
   */
  onInitialize(
    callback: (sessionLifecycleEvent: SessionLifecycleEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(
      EventType.SessionInitialize,
      callback as (ev: EventBase) => void,
      options,
    );
  }

  /**
   * Executes a callback when the session starts.
   *
   * @param callback - function to execute.
   * @param options - options for the callback.
   */
  onStart(
    callback: (sessionLifecycleEvent: SessionLifecycleEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(
      EventType.SessionStart,
      callback as (ev: EventBase) => void,
      options,
    );
  }

  /**
   * Executes a callback when the session ends.
   *
   * @param callback - function to execute.
   * @param options - options for the callback.
   */
  onEnd(
    callback: (sessionLifecycleEvent: SessionLifecycleEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(
      EventType.SessionEnd,
      callback as (ev: EventBase) => void,
      options,
    );
  }

  /**
   * Executes a callback when any activity in the session generates data.
   *
   * @param callback - function to execute.
   * @param options - options for the callback.
   */
  onActivityData(
    callback: (activityResultsEvent: ActivityResultsEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(
      EventType.ActivityData,
      callback as (ev: EventBase) => void,
      options,
    );
  }

  private addEventListener(
    type: EventType,
    callback: (ev: EventBase) => void,
    options?: CallbackOptions,
  ): void {
    const eventListener: EventListenerBase = {
      type: type,
      callback: callback,
      key: options?.key,
    };

    if (options?.replaceExisting) {
      this.eventListeners = this.eventListeners.filter(
        (listener) => !(listener.type === eventListener.type),
      );
    }
    this.eventListeners.push(eventListener);
  }

  private raiseEventOnListeners(event: EventBase, extra?: unknown): void {
    if (extra) {
      event = {
        ...event,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(extra as any),
      };
    }
    this.eventListeners
      .filter((listener) => listener.type === event.type)
      .forEach((listener) => {
        listener.callback(event);
      });
  }

  private async sessionActivityStartHandler(event: ActivityLifecycleEvent) {
    const activityType =
      event.target.type === ActivityType.Game ? "game" : "survey";
    console.log(`🟢 started activity (${activityType}) ${event.target.name}`);
  }

  private async sessionActivityCancelHandler(event: ActivityLifecycleEvent) {
    const activityType =
      event.target.type === ActivityType.Game ? "game" : "survey";
    console.log(`🚫 canceled activity (${activityType}) ${event.target.name}`);

    if (this.nextActivity && this.options.autoGoToNextActivity !== false) {
      await this.goToNextActivity();
      // Note: important to return here, because now this.nextActivity refers
      // to the activity AFTER the one we have just advanced to.
      return;
    }
    if (!this.nextActivity && this.options.autoEndAfterLastActivity !== false) {
      this.end();
    }
  }

  private async sessionActivityEndHandler(event: ActivityLifecycleEvent) {
    const activityType =
      event.target.type === ActivityType.Game ? "game" : "survey";
    console.log(`🔴 ended activity (${activityType}) ${event.target.name}`);
    if (this.nextActivity && this.options.autoGoToNextActivity !== false) {
      await this.goToNextActivity();
      // Note: important to return here, because now this.nextActivity refers
      // to the activity AFTER the one we have just advanced to.
      return;
    }
    if (!this.nextActivity && this.options.autoEndAfterLastActivity !== false) {
      this.end();
    }
  }

  private async sessionActivityLifecycleHandler(event: ActivityLifecycleEvent) {
    if (event.type === EventType.ActivityStart) {
      await this.sessionActivityStartHandler(event);
      return;
    }

    if (event.type === EventType.ActivityCancel) {
      await this.sessionActivityCancelHandler(event);
      return;
    }

    if (event.type === EventType.ActivityEnd) {
      await this.sessionActivityEndHandler(event);
      return;
    }

    throw new Error("unknown activity lifecycle event type");
  }

  private activityResultsEventHandler(event: ActivityResultsEvent) {
    this.raiseEventOnListeners(event);
  }

  /**
   * Asynchronously initializes the m2c2kit engine and loads assets
   *
   * @deprecated Use Session.initialize() instead.
   */
  async init(): Promise<void> {
    console.warn(
      `The init() method of Session is deprecated. Use initialize() instead.`,
    );
    return this.initialize();
  }

  /**
   * Check if the Activity uses the deprecated init() method.
   *
   * @remarks Activity.init() is deprecated and should be replaced with
   * Activity.initialize().
   *
   * @param activity
   * @returns true if the activity defines its own init() method, false otherwise.
   */
  private activityUsesDeprecatedInit(activity: Activity): boolean {
    if (activity.type === ActivityType.Survey) {
      return false;
    }
    const activityPrototype = Object.getPrototypeOf(activity);
    const gamePrototype = Object.getPrototypeOf(activityPrototype);
    return activityPrototype?.init !== gamePrototype?.init;
  }

  /**
   * Asynchronously initializes the m2c2kit engine and loads assets
   */
  async initialize(): Promise<void> {
    console.log(`⚪ @m2c2kit/core version ${this.version}`);
    Timer.start("sessionInitialize");
    const sessionInitializeEvent: SessionLifecycleEvent = {
      target: this,
      type: EventType.SessionInitialize,
    };
    this.raiseEventOnListeners(sessionInitializeEvent);
    DomHelpers.addLoadingElements();
    DomHelpers.setSpinnerVisibility(true);
    DomHelpers.setCanvasOverlayVisibility(true);

    this.dataStores = this.options.dataStores;
    if (this.dataStores?.length === 0) {
      throw new Error(
        "Session.initialize(): dataStores must be undefined or a non-zero array of datastores.",
      );
    }

    const [canvasKit] = await this.getAsynchronousAssets();
    this.options.activities
      .filter((activity) => activity.type == ActivityType.Game)
      .forEach((activity) => {
        const game = activity as unknown as Game;
        game.canvasKit = canvasKit;
      });

    await Promise.all(
      this.options.activities.map((activity) => {
        // IDataStore implementation is provided by another library and must
        // be set in the session before calling session.initialize()
        activity.dataStores = this.dataStores;
        activity.onStart(this.sessionActivityLifecycleHandler.bind(this));
        activity.onCancel(this.sessionActivityLifecycleHandler.bind(this));
        activity.onEnd(this.sessionActivityLifecycleHandler.bind(this));
        activity.onData((event: ActivityResultsEvent) => {
          this.activityResultsEventHandler(event);
        });

        if (this.activityUsesDeprecatedInit(activity)) {
          console.warn(
            `game ${activity.id}: Activity.init() is deprecated. In the assessment class that extends Game, use Activity.initialize() instead:\n  async initialize() {\n    await super.initialize();\n    ...\n  }\n`,
          );
          return activity.init();
        }
        return activity.initialize();
      }),
    );

    this.loadAssets(canvasKit);
    this.imageManager.removeScratchCanvas();

    console.log(
      `⚪ Session.sessionInitialize() took ${Timer.elapsed(
        "sessionInitialize",
      ).toFixed(0)} ms`,
    );
    Timer.remove("sessionInitialize");
    this.initialized = true;
    if (this.options.autoStartAfterInit !== false) {
      await this.start();
    }
  }

  /**
   * Waits for the session to be initialized.
   *
   * @remarks Session.initialize() is asynchronous, and it should be awaited
   * so that the session is fully initialized before calling Session.start().
   * If it is not awaited (or it cannot be awaited because the target
   * environment does not support top-level await), this function ensures that
   * the session has been initialized.
   */
  private async waitForSessionInitialization(): Promise<void> {
    while (!this.initialized) {
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          Constants.SESSION_INITIALIZATION_POLLING_INTERVAL_MS,
        ),
      );
    }
  }

  /**
   * Starts the session and starts the first activity.
   */
  async start(): Promise<void> {
    await this.waitForSessionInitialization();
    console.log("🟢 started session");
    const sessionStartEvent: SessionLifecycleEvent = {
      target: this,
      type: EventType.SessionStart,
    };
    this.raiseEventOnListeners(sessionStartEvent);
    this.currentActivity = this.options.activities.find(Boolean);
    if (this.currentActivity) {
      DomHelpers.configureDomForActivity(this.currentActivity);
      await this.currentActivity.start();
    } else {
      // no activities, so immediately end the session
      console.warn("no activities in session.");
      this.end();
    }
  }

  /**
   * Declares the session ended and sends callback.
   */
  end(): void {
    console.log("🔴 ended session");
    DomHelpers.hideAll();
    this.stop();
    const sessionEndEvent: SessionLifecycleEvent = {
      target: this,
      type: EventType.SessionEnd,
    };
    this.raiseEventOnListeners(sessionEndEvent);
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
    // TODO: Are there are any other resources that need to be disposed at the session level?
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
        `Error in goToActivity(): Session does not contain an activity with id ${options.id}.`,
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
        [null],
      );
    this.currentActivity = new activityFactoryFunction() as Activity;

    const indexOfCurrentActivity = this.options.activities.indexOf(
      currentActivityOldObject,
    );
    this.options.activities[indexOfCurrentActivity] = this.currentActivity;
    DomHelpers.configureDomForActivity(this.currentActivity);

    /**
     * Because the current activity has been newly created, it needs properties
     * assigned to it that it would have received in the Session.initialize()
     * method. Also, if the old instance had new parameters set via
     * Game.SetParameters(), we must apply them.
     */
    this.currentActivity.session = this;
    this.currentActivity.dataStores = this.dataStores;
    /**
     * IMPORTANT: Originally, we checked if the current activity was a game
     * by checking if it was an instance of Game. However, if we are mixing
     * code bundles, the Game class in one bundle will not be the same as the
     * Game class in another bundle. Instead, we must check the type property
     * of the activity.
     */
    if (this.currentActivity.type === ActivityType.Game && this.canvasKit) {
      (this.currentActivity as Game).canvasKit = this.canvasKit;
    }
    if (currentActivityOldObject.additionalParameters) {
      this.currentActivity.setParameters(
        currentActivityOldObject.additionalParameters,
      );
    }

    /**
     * In Session.initialize(), async assets were loaded. Once processed, they were
     * stored in a dictionary, with the activity uuid as the key. When a new
     * instance of the activity is created, the object has a different uuid.
     * We must update the uuid in the dictionaries (if it exists).
     */
    if (this.imageManager.loadedImages[currentActivityOldObject.uuid]) {
      this.imageManager.loadedImages[this.currentActivity.uuid] =
        this.imageManager.loadedImages[currentActivityOldObject.uuid];
      delete this.imageManager.loadedImages[currentActivityOldObject.uuid];
    }

    await this.currentActivity.initialize();
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

    DomHelpers.configureDomForActivity(this.currentActivity);
    await this.currentActivity.start();
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
      this.currentActivity,
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
  private async getAsynchronousAssets(): Promise<[CanvasKit, void[]]> {
    const canvasKitPromise = this.loadCanvasKit(this.options.canvasKitWasmUrl);
    const renderImagesPromise = this.imageManager.renderImages(
      this.getImagesConfigurationFromGames(),
    );

    return await Promise.all([canvasKitPromise, renderImagesPromise]);
  }

  // call CanvasKitInit through loadCanvasKit so we can mock
  // loadCanvasKit using jest
  private loadCanvasKit(canvasKitWasmUrl: string): Promise<CanvasKit> {
    const fullUrl = this.prependAssetsUrl(canvasKitWasmUrl);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return CanvasKitInit({ locateFile: (_file) => fullUrl });
  }

  private loadAssets(canvasKit: CanvasKit) {
    this.assignCanvasKit(canvasKit);
    this.imageManager.loadAllGamesRenderedImages();
  }

  private assignCanvasKit(canvasKit: CanvasKit) {
    this.canvasKit = canvasKit;
    this.imageManager.canvasKit = this.canvasKit;

    this.options.activities
      .filter((activity) => activity.type == ActivityType.Game)
      .forEach((activity) => {
        const game = activity as unknown as Game;
        game.canvasKit = canvasKit;
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

  prependAssetsUrl(url: string): string {
    function hasUrlScheme(str: string): boolean {
      return /^[a-z]+:\/\//i.test(str);
    }

    if (hasUrlScheme(url)) {
      return url;
    }
    if (!this.options.assetsUrl) {
      return `assets/${url}`;
    }
    return (
      this.options.assetsUrl.replace(/\/$/, "") + "/" + url.replace(/^\//, "")
    );
  }
}

export interface GoToActivityOptions {
  /** ActivityId of the activity to go to. */
  id: string;
}

/**
 * Types of values that can be stored in the session dictionary.
 */
export type SessionDictionaryValues =
  | string
  | number
  | boolean
  | object
  | null
  | undefined;
