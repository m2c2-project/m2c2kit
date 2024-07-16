import {
  Activity,
  ActivityEvent,
  ActivityType,
  ActivityLifecycleEvent,
  ActivityResultsEvent,
  CallbackOptions,
  IDataStore,
  Timer,
  FontAsset,
  Uuid,
  M2EventType,
  Constants,
  M2EventListener,
  Game,
  M2c2KitHelpers,
} from "@m2c2kit/core";
import { DomHelper } from "./DomHelper";
import { SessionOptions } from "./SessionOptions";
import { SessionLifecycleEvent } from "./SessionLifecycleEvent";
import { SessionEvent, SessionEventType } from "./SessionEvent";
import { m2c2kitCss } from "./m2c2kitCss";

export class Session {
  options: SessionOptions;
  currentActivity?: Activity;
  uuid: string;
  dataStores?: IDataStore[];
  private eventListeners = new Array<
    M2EventListener<SessionEvent | ActivityEvent>
  >();
  private sessionDictionary = new Map<string, SessionDictionaryValues>();
  private initialized = false;

  /**
   * A Session contains one or more activities. The session manages the start
   * and stop of activities, and advancement to next activity
   *
   * @param options
   */
  constructor(options: SessionOptions) {
    this.options = options;
    if (this.options.sessionUuid) {
      this.uuid = this.options.sessionUuid;
    } else {
      this.uuid = Uuid.generate();
    }

    for (const activity of this.options.activities) {
      if (this.options.activities.filter((a) => a === activity).length > 1) {
        throw new Error(
          `error in SessionOptions.activities: an instance of the activity named "${activity.name}" has been added more than once to the session. If you want to repeat the same activity, create separate instances of it.`,
        );
      }
      activity.sessionUuid = this.uuid;
      if (this.options.activityCallbacks?.onActivityLifecycle) {
        activity.onStart(this.options.activityCallbacks.onActivityLifecycle);
        activity.onCancel(this.options.activityCallbacks.onActivityLifecycle);
        activity.onEnd(this.options.activityCallbacks.onActivityLifecycle);
      }
      if (this.options.activityCallbacks?.onActivityResults) {
        activity.onData(this.options.activityCallbacks.onActivityResults);
      }

      if (activity.type === ActivityType.Game) {
        const game = activity as Game;
        game.onWarmupStart(() => {
          DomHelper.setCanvasOverlayVisibility(true);
        });
        game.onWarmupEnd(() => {
          DomHelper.setCanvasOverlayVisibility(false);
          DomHelper.setBusyAnimationVisibility(false);
        });
      }
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
      SessionEventType.SessionInitialize,
      callback,
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
    this.addEventListener(SessionEventType.SessionStart, callback, options);
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
    this.addEventListener(SessionEventType.SessionEnd, callback, options);
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
    this.addEventListener(M2EventType.ActivityData, callback, options);
  }

  private addEventListener<T extends SessionEvent | ActivityEvent>(
    type: M2EventType | SessionEventType,
    callback: (ev: T) => void,
    options?: CallbackOptions,
  ): void {
    const eventListener: M2EventListener<T> = {
      type: type,
      callback: callback,
      key: options?.key,
    };

    if (options?.replaceExisting) {
      this.eventListeners = this.eventListeners.filter(
        (listener) => !(listener.type === eventListener.type),
      );
    }
    this.eventListeners.push(
      eventListener as M2EventListener<SessionEvent | ActivityEvent>,
    );
  }

  private raiseEventOnListeners(
    event: SessionEvent | ActivityEvent,
    extra?: unknown,
  ): void {
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
    if (event.type === M2EventType.ActivityStart) {
      await this.sessionActivityStartHandler(event);
      return;
    }

    if (event.type === M2EventType.ActivityCancel) {
      await this.sessionActivityCancelHandler(event);
      return;
    }

    if (event.type === M2EventType.ActivityEnd) {
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
    Timer.startNew("sessionInitialize");
    const sessionInitializeEvent: SessionEvent = {
      target: this,
      type: SessionEventType.SessionInitialize,
      ...M2c2KitHelpers.createTimestamps(),
    };
    this.raiseEventOnListeners(sessionInitializeEvent);
    const rootId =
      this.options.rootElementId ?? Constants.DEFAULT_ROOT_ELEMENT_ID;
    const root = document.getElementById(rootId);
    if (!root) {
      throw new Error(
        `Session.initialize(): root element with id ${rootId} not found. The index.html should have: <div id="${rootId}"></div>.`,
      );
    }
    DomHelper.createRoot(root);
    DomHelper.addStyleSheet(this.options.styleSheet ?? m2c2kitCss);
    DomHelper.addLoadingElements();
    DomHelper.setBusyAnimationVisibility(true);
    DomHelper.setCanvasOverlayVisibility(true);

    this.dataStores = this.options.dataStores;
    if (this.dataStores?.length === 0) {
      throw new Error(
        "Session.initialize(): dataStores must be undefined or a non-zero array of datastores.",
      );
    }

    await this.getSharedAssets(this.options.activities);

    await Promise.all(
      this.options.activities.map((activity) => {
        activity.studyId = this.options.studyId;
        activity.studyUuid = this.options.studyUuid;
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

    console.log(
      `⚪ Session.initialize() took ${Timer.elapsed(
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
   * Asynchronously loads fonts and wasm binaries that are common across two
   * or more game activities and shares them with the games.
   *
   * @param activities - array of activities
   */
  private async getSharedAssets(activities: Activity[]) {
    const games = activities.filter(
      (activity) =>
        activity.type === ActivityType.Game &&
        (activity as Game).options.shareAssets !== false,
    ) as Array<Game>;

    if (games.length > 0) {
      const manifest = await games[0].loadManifest();
      games.forEach((game) => {
        game.manifest = manifest;
      });

      const wasmPromises = this.initializeSharedCanvasKit(games);
      const fontPromises = this.fetchSharedFontData(games);
      await Promise.all([...wasmPromises, ...fontPromises]);
    }
  }

  private initializeSharedCanvasKit(games: Game[]) {
    const sharedWasmVersions = this.getDuplicates(
      games.map((game) => game.canvasKitWasmVersion),
    );
    const wasmAssets = games.map((game) => {
      return {
        game: game,
        version: game.canvasKitWasmVersion,
        data: undefined,
      };
    });

    const wasmPromises = sharedWasmVersions.map(async (sharedWasmVersion) => {
      const wasmAsset = wasmAssets.filter(
        (wasm) => wasm.version === sharedWasmVersion,
      )[0];
      const game = wasmAsset.game;
      const baseUrls = await game.resolveGameBaseUrls(game);
      const canvasKitWasmFilename = `canvaskit-${game.canvasKitWasmVersion}.wasm`;
      const manifestCanvasKitWasmUrl = M2c2KitHelpers.getUrlFromManifest(
        game,
        `${baseUrls.canvasKitWasm}/${canvasKitWasmFilename}`,
      );
      console.log(`⚪ sharing ${canvasKitWasmFilename} within session`);

      const canvasKit = await game.loadCanvasKit(manifestCanvasKitWasmUrl);
      games.forEach((game) => {
        if (game.canvasKitWasmVersion === sharedWasmVersion) {
          game.canvasKit = canvasKit;
        }
      });
    });
    return wasmPromises;
  }

  private fetchSharedFontData(games: Game[]) {
    const fontFiles = games
      .flatMap(
        (game) => game.options.fonts?.filter((f) => f.lazy !== true) ?? [],
      )
      .map((fontAsset) => this.getFilenameFromUrl(fontAsset.url));
    const sharedFontFiles = this.getDuplicates(fontFiles);

    const allGameFonts: Array<GameFontAsset> = games.flatMap((game) => {
      return (game.options.fonts ?? []).map((fontAsset) => {
        return {
          game: game,
          fontAsset: fontAsset,
          filename: this.getFilenameFromUrl(fontAsset.url),
          data: undefined,
        };
      });
    });

    const fontPromises = sharedFontFiles.map(async (sharedFontFile) => {
      const gameFontAsset = allGameFonts.filter(
        (gameFont) => gameFont.filename === sharedFontFile,
      )[0];
      const game = gameFontAsset.game;
      const baseUrls = await game.resolveGameBaseUrls(game);
      const fontUrl = M2c2KitHelpers.getUrlFromManifest(
        game,
        `${baseUrls.assets}/${gameFontAsset.fontAsset.url}`,
      );
      console.log(
        `⚪ sharing ${this.getFilenameFromUrl(fontUrl)} within session`,
      );

      const response = await fetch(fontUrl);
      const fontData = await response.arrayBuffer();
      games
        .flatMap((game) => game.options.fonts ?? [])
        .forEach((fontAsset) => {
          if (this.getFilenameFromUrl(fontAsset.url) === sharedFontFile) {
            fontAsset.sharedFont = {
              url: fontUrl,
              data: fontData,
            };
          }
        });
    });
    return fontPromises;
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
      type: SessionEventType.SessionStart,
      ...M2c2KitHelpers.createTimestamps(),
    };
    this.raiseEventOnListeners(sessionStartEvent);
    this.currentActivity = this.options.activities.find(Boolean);
    if (this.currentActivity) {
      DomHelper.configureDomForActivity(this.currentActivity);
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
    DomHelper.hideM2c2Elements();
    this.stop();
    const sessionEndEvent: SessionLifecycleEvent = {
      target: this,
      type: SessionEventType.SessionEnd,
      ...M2c2KitHelpers.createTimestamps(),
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
    DomHelper.configureDomForActivity(this.currentActivity);

    /**
     * Because the current activity has been newly created, it needs properties
     * assigned to it that it would have received in the Session.initialize()
     * method. Also, if the old instance had new parameters set via
     * Game.SetParameters(), we must apply them.
     */
    this.currentActivity.dataStores = this.dataStores;
    /**
     * IMPORTANT: Originally, we checked if the current activity was a game
     * by checking if it was an instance of Game. However, if we are mixing
     * code bundles, the Game class in one bundle will not be the same as the
     * Game class in another bundle. Instead, we must check the type property
     * of the activity.
     */
    // if (this.currentActivity.type === ActivityType.Game && this.canvasKit) {
    //   (this.currentActivity as Game).canvasKit = this.canvasKit;
    // }
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
    // if (this.imageManager.loadedImages[currentActivityOldObject.uuid]) {
    //   this.imageManager.loadedImages[this.currentActivity.uuid] =
    //     this.imageManager.loadedImages[currentActivityOldObject.uuid];
    //   delete this.imageManager.loadedImages[currentActivityOldObject.uuid];
    // }
    // if (this.fontManager.gameTypefaces[currentActivityOldObject.uuid]) {
    //   this.fontManager.gameTypefaces[this.currentActivity.uuid] =
    //     this.fontManager.gameTypefaces[currentActivityOldObject.uuid];
    //   delete this.fontManager.gameTypefaces[currentActivityOldObject.uuid];
    // }

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

    DomHelper.configureDomForActivity(this.currentActivity);
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
   * Returns the filename from a url.
   *
   * @param url - url to parse
   * @returns filename
   */
  private getFilenameFromUrl(url: string) {
    return url.substring(url.lastIndexOf("/") + 1);
  }

  /**
   * Returns the duplicated strings in an array.
   *
   * @param s - array of strings
   * @returns array of duplicated strings
   */
  private getDuplicates(s: string[]): string[] {
    const count: { [key: string]: number } = {};
    const duplicates: string[] = [];

    for (const str of s) {
      count[str] = (count[str] || 0) + 1;
      if (count[str] === 2) {
        duplicates.push(str);
      }
    }

    return duplicates;
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

interface GameFontAsset {
  game: Game;
  fontAsset: FontAsset;
  filename: string;
  data: ArrayBuffer | undefined;
}
