import { Activity } from "./Activity";
import { ActivityType } from "./ActivityType";
import CanvasKitInit, {
  CanvasKit,
  Canvas,
  Surface,
  Font,
  Paint,
} from "canvaskit-wasm";
import { Constants } from "./Constants";
import { M2NodeEvent } from "./M2NodeEvent";
import { IDrawable } from "./IDrawable";
import { M2Node } from "./M2Node";
import { M2NodeType } from "./M2NodeType";
import { RgbaColor } from "./RgbaColor";
import { Sprite } from "./Sprite";
import { M2ImageStatus } from "./M2Image";
import { Scene } from "./Scene";
import { Transition } from "./Transition";
import { GameOptions } from "./GameOptions";
import { GameData } from "./GameData";
import { Uuid } from "./Uuid";
import { M2EventType, I18nDataReadyEvent } from "./M2Event";
import { Timer } from "./Timer";
import { GameParameters } from "./GameParameters";
import { JsonSchema, JsonSchemaDataTypeScriptTypes } from "./JsonSchema";
import { TrialSchema } from "./TrialSchema";
import { GameMetric } from "./GameMetrics";
import { I18n } from "./I18n";
import { Translation } from "./Translation";
import { LocalizationOptions } from "./LocalizationOptions";
import { WebColors } from "./WebColors";
import { CanvasKitHelpers } from "./CanvasKitHelpers";
import { IDataStore } from "./IDataStore";
import { ActivityEvent } from "./ActivityEvent";
import { ActivityEventListener } from "./ActivityEventListener";
import { ActivityResults } from "./ActivityResults";
import { CallbackOptions } from "./CallbackOptions";
import { ActivityLifecycleEvent } from "./ActivityLifecycleEvent";
import { ActivityResultsEvent } from "./ActivityResultsEvent";
import { M2c2KitHelpers } from "./M2c2KitHelpers";
import { Plugin } from "./Plugin";
import { FontManager } from "./FontManager";
import { ImageManager } from "./ImageManager";
import { SoundManager } from "./SoundManager";
import { ModuleMetadata } from "./ModuleMetadata";
import { M2FontStatus } from "./M2Font";
import { Manifest } from "./Manifest";
import { GameBaseUrls } from "./GameBaseUrls";
import { GameEvent } from "./GameEvent";
import { EventStore, EventStoreMode } from "./EventStore";
import { M2NodeFactory } from "./M2NodeFactory";
import { EventMaterializer } from "./EventMaterializer";
import { M2Error } from "./M2Error";
import { InputManager } from "./InputManager";
import { SceneManager } from "./SceneManager";
import { DataManager } from "./DataManager";
import { WebGlInfo } from "./WebGlInfo";

type WarmupFunction = (canvas: Canvas, positionOffset?: number) => void;
interface WarmupFunctionQueue {
  warmupFunction: WarmupFunction;
  positionOffset?: number;
}

export class Game implements Activity {
  readonly type = ActivityType.Game;
  _canvasKit?: CanvasKit;
  sessionUuid = "";
  uuid = Uuid.generate();
  name: string;
  id: string;
  publishUuid = "";
  studyId?: string;
  studyUuid?: string;
  moduleMetadata: ModuleMetadata;
  readonly canvasKitWasmVersion = "__CANVASKITWASM_VERSION__";
  options: GameOptions;
  beginTimestamp = NaN;
  beginIso8601Timestamp = "";
  private eventListeners = new Array<ActivityEventListener<ActivityEvent>>();
  private gameMetrics: Array<GameMetric> = new Array<GameMetric>();
  private fpsMetricReportThreshold: number;
  private maximumRecordedActivityMetrics: number;
  private stepCount = 0;
  private steppingNow = 0;
  i18n?: I18n;
  private warmupFunctionQueue = new Array<WarmupFunctionQueue>();
  private warmupFinished = false;
  private _dataStores?: IDataStore[];
  private plugins: Array<Plugin> = [];
  additionalParameters?: unknown;
  private _fontManager?: FontManager;
  private _imageManager?: ImageManager;
  private _soundManager?: SoundManager;
  private _inputManager?: InputManager;
  sceneManager: SceneManager;
  dataManager: DataManager;
  manifest?: Manifest;
  eventStore = new EventStore();
  private nodeFactory = new M2NodeFactory();
  private _eventMaterializer?: EventMaterializer;
  /** Nodes created during event replay */
  materializedNodes = new Array<M2Node>();

  /**
   * The base class for all games. New games should extend this class.
   *
   * @param options - {@link GameOptions}
   */
  constructor(options: GameOptions) {
    if (!options.id || options.id.trim() === "") {
      throw new M2Error("id is required in GameOptions");
    }
    if (!Uuid.isValid(options.publishUuid)) {
      const providedPublishUuid = options.publishUuid
        ? `Provided publishUuid was ${options.publishUuid}. `
        : "";
      console.warn(
        `Missing or invalid publishUuid in GameOptions. ${providedPublishUuid}To generate a valid UUID, visit a site such as https://www.uuidgenerator.net/version4`,
      );
    }
    const { parameters, ...optionsWithoutParameters } = options;
    this.options = optionsWithoutParameters;
    this.options.parameters = M2c2KitHelpers.sanitizeParameters(parameters);
    this.name = options.name;
    this.id = options.id;
    this.publishUuid = options.publishUuid;
    this.fpsMetricReportThreshold =
      options.fpsMetricReportThreshold ?? Constants.FPS_METRIC_REPORT_THRESHOLD;
    this.maximumRecordedActivityMetrics =
      options.maximumRecordedActivityMetrics ??
      Constants.MAXIMUM_RECORDED_ACTIVITY_METRICS;
    this.addLocalizationParametersToGameParameters();
    if (this.options.locale !== undefined) {
      this.setParameters({ locale: this.options.locale });
    }
    if (this.options.fallbackLocale !== undefined) {
      this.setParameters({ fallback_locale: this.options.fallbackLocale });
    }
    if (this.options.missingLocalizationColor) {
      this.setParameters({
        missing_localization_color: this.options.missingLocalizationColor,
      });
    }
    if (this.options.translation) {
      this.setParameters({ translation: this.options.translation });
    }
    if (this.options.additionalTranslation) {
      this.setParameters({ translation: this.options.additionalTranslation });
    }
    if (!this.options.trialSchema) {
      this.options.trialSchema = {};
    }
    if (!this.options.scoringSchema) {
      this.options.scoringSchema = {};
    }
    if (options.moduleMetadata) {
      this.moduleMetadata = options.moduleMetadata;
    } else {
      this.moduleMetadata = {
        name: "",
        version: "",
        dependencies: {},
      };
    }
    if (options.moduleMetadata?.name && options.version) {
      console.log(
        `⚪ ${options.moduleMetadata.name} version ${options.version}`,
      );
    }

    this.sceneManager = new SceneManager(this);
    this.dataManager = new DataManager(this);
  }

  /**
   * Returns the base URL of an imported module.
   *
   * @remarks Previously, a regex was used:
   * `const regex = new RegExp(`^.*${packageName}[^\\/]*`);`
   * but this triggered irrelevant warnings for ReDoS in some overly
   * sensitive package scanners, so now we use URL and pathname parsing.
   * Also: trailing slashes are removed from the returned base URL.
   *
   * @param packageName - the name of the imported package module, like
   * `@m2c2kit/assessment-symbol-search`
   * @param moduleUrl - the full URL of the module's entrypoint, possibly
   * including a version suffix, like `https://cdn.com/@m2c2kit/assessment-symbol-search@0.8.13/dist/index.js`
   * @returns - the base URL of the imported module, without the entrypoint,
   * like `https://cdn.com/@m2c2kit/assessment-symbol-search@0.8.13`
   */
  private getImportedModuleBaseUrl(
    packageName: string,
    moduleUrl: string,
  ): string {
    const url = new URL(moduleUrl);
    const segments = url.pathname.split("/").filter(Boolean);
    let lastMatchIndex = -1;

    for (let i = 0; i < segments.length - 1; i++) {
      if (packageName.startsWith("@")) {
        const nameParts = packageName.split("/");
        if (nameParts.length === 2) {
          const scopePart = nameParts[0]; // e.g., "@scope"
          const namePart = nameParts[1]; // e.g., "name"
          for (let i = 0; i < segments.length - 1; i++) {
            if (
              segments[i] === scopePart &&
              (segments[i + 1] === namePart ||
                segments[i + 1].startsWith(`${namePart}@`))
            ) {
              lastMatchIndex = i + 1;
            }
          }
        }
        // If nameParts.length !== 2, it's a malformed scoped package name,
        // lastMatchIndex will remain -1, and an error will be thrown, which is appropriate.
      } else {
        if (
          segments[i] === packageName ||
          segments[i].startsWith(`${packageName}@`)
        ) {
          lastMatchIndex = i;
        }
      }
    }

    if (lastMatchIndex === -1) {
      throw new Error(
        `Could not locate base URL for package "${packageName}" in "${moduleUrl}"`,
      );
    }

    const basePath = segments.slice(0, lastMatchIndex + 1).join("/");
    return `${url.origin}/${basePath}`.replace(/\/*$/, "");
  }

  private addLocalizationParametersToGameParameters(): void {
    this.options.parameters = {
      ...this.options.parameters,
      ...I18n.makeLocalizationParameters(),
    };
  }

  async init(): Promise<void> {
    return this.initialize();
  }

  /**
   * Loads the canvaskit wasm binary.
   *
   * @internal For m2c2kit library use only
   *
   * @remarks The CanvasKit object is initialized with this method, rather
   * than calling `CanvasKitInit()` directly, so that this method can be
   * easily mocked in tests.
   *
   * @param canvasKitWasmUrl - URL to the canvaskit wasm binary
   * @returns a promise that resolves to a CanvasKit object
   */
  loadCanvasKit(canvasKitWasmUrl: string): Promise<CanvasKit> {
    return CanvasKitInit({ locateFile: () => canvasKitWasmUrl });
  }

  /**
   * Resolves base URL locations for game assets and CanvasKit wasm binary.
   *
   * @internal For m2c2kit library use only
   *
   * @param game - game to resolve base URLs for
   * @returns base URLs for game assets and CanvasKit wasm binary
   */
  async resolveGameBaseUrls(game: Game) {
    let moduleUrl: string | undefined;
    let isImportedModule = false;

    /**
     * If not an imported module, the default asset location is under the
     * game's id, e.g., `assets/symbol-search`. Note: the game's id is the
     * id as specified in `GameOptions`, which is often different than the
     * name in `package.json`. For symbol search, id is `symbol-search`, but
     * the package name is `@m2c2kit/assessment-symbol-search`.
     */
    let assetsBaseUrl = `assets/${game.id}`;
    /**
     * Is the game code an imported module? (the alternative is that the
     * game code has been bundled). If the game code is an imported module,
     * assetsBaseUrl must point to the location of the imported module
     * assets URL. Note: Game code will be recognized as an imported module
     * only if it was built with the `addModuleMetadata` plugin in the
     * rollup configuration.
     */
    if (game.moduleMetadata.name) {
      try {
        /**
         * moduleUrl is the URL to the module entrypoint JavaScript, e.g., https://cdn.jsdelivr.net/npm/@m2c2kit/assessment-symbol-search@0.8.13/dist/index.js
         * moduleBaseUrl omits the entrypoint, e.g., https://cdn.jsdelivr.net/npm/@m2c2kit/assessment-symbol-search@0.8.13
         */
        // @ts-expect-error Using import.meta here, even though it's not supported in our tsconfig module version. That's OK, because we'll include a browser polyfill.
        moduleUrl = await import.meta.resolve(game.moduleMetadata.name);
        const moduleBaseUrl = game.getImportedModuleBaseUrl(
          game.moduleMetadata.name,
          moduleUrl,
        );
        assetsBaseUrl = moduleBaseUrl + "/assets";
        isImportedModule = true;
      } catch {
        /**
         * If the game code is not an imported module, an exception will
         * occur with import.meta.resolve(). This is ok. In this case,
         * the default location for `assetsBaseUrl`, assigned above, will be
         * used.
         */
      }
    }

    let canvasKitWasmBaseUrl = `assets/${game.id}`;
    try {
      /**
       * Is the @m2c2kit/core code an imported module? Even if the game code
       * is not an imported module, @m2c2kit/core may be imported (e.g., the
       * user is programming a new assessment, is not using a bundler, and
       * imports @m2c2kit/core from a module URL).
       */
      // @ts-expect-error Using import.meta here, even though it's not supported in our tsconfig module version. That's OK, because we'll include a browser polyfill.
      const coreModuleUrl = await import.meta.resolve("@m2c2kit/core");
      canvasKitWasmBaseUrl =
        game.getImportedModuleBaseUrl("@m2c2kit/core", coreModuleUrl) +
        "/assets";
    } catch {
      /**
       * If the game code is an imported module, @m2c2kit/core must also
       * be imported. Otherwise, this is a fatal error, because we cannot
       * locate the CanvasKit wasm binary.
       */
      if (isImportedModule) {
        throw new M2Error(
          `the package ${game.moduleMetadata.name} has been imported from a module URL (${moduleUrl}), but the @m2c2kit/core package module URL could not be determined.`,
        );
      }
    }

    return {
      assets: assetsBaseUrl,
      canvasKitWasm: canvasKitWasmBaseUrl,
    } as GameBaseUrls;
  }

  private async configureI18n(localizationOptions: LocalizationOptions) {
    this.i18n = new I18n(this, localizationOptions);
    if (!this.i18n) {
      throw new M2Error("I18n object is undefined");
    }
    await this.i18n.initialize();
    this.eventStore.addEvent({
      type: "I18nDataReadyEvent",
      target: this.i18n,
      localizationOptions: localizationOptions,
      ...M2c2KitHelpers.createFrameUpdateTimestamps(),
    } as I18nDataReadyEvent);
  }

  private async waitForErudaInitialization(maxWaitDurationMs = 5000) {
    await new Promise((resolve) => {
      let cumulativeWaitTime = 0;
      const intervalId = setInterval(() => {
        if (m2c2Globals.erudaInitialized === true) {
          clearInterval(intervalId);
          resolve(void 0);
        }
        cumulativeWaitTime = cumulativeWaitTime + 100;
        if (cumulativeWaitTime > maxWaitDurationMs) {
          console.warn(
            `Could not initialize eruda within ${maxWaitDurationMs} milliseconds.`,
          );
          clearInterval(intervalId);
          resolve(void 0);
        }
      }, 100);
    });
  }

  async initialize() {
    if (m2c2Globals.erudaRequested === true) {
      await this.waitForErudaInitialization();
    }

    if (this.options.recordEvents === true) {
      this.eventStore.mode = EventStoreMode.Record;
    }

    const baseUrls = await this.resolveGameBaseUrls(this);

    /**
     * If the manifest is undefined, it means that the manifest has not yet
     * been loaded. If code was built without a manifest, the manifest will
     * be set to an empty Manifest object by loadManifest().
     */
    if (this.manifest === undefined) {
      this.manifest = await this.loadManifest();
    }

    if (this._canvasKit === undefined) {
      const manifestCanvasKitWasmUrl = M2c2KitHelpers.getUrlFromManifest(
        this,
        baseUrls.canvasKitWasm + `/canvaskit-${this.canvasKitWasmVersion}.wasm`,
      );
      try {
        this.canvasKit = await this.loadCanvasKit(manifestCanvasKitWasmUrl);
      } catch (err) {
        throw new M2Error(
          `game ${this.id} could not load canvaskit wasm file from ${manifestCanvasKitWasmUrl}. err: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    if (this.isLocalizationRequested()) {
      const localizationOptions =
        this.getLocalizationOptionsFromGameParameters();
      await this.configureI18n(localizationOptions);
    }

    this.fontManager = new FontManager(this, baseUrls);
    this.imageManager = new ImageManager(this, baseUrls);
    this.soundManager = new SoundManager(this, baseUrls);

    this.eventMaterializer = new EventMaterializer({
      game: this,
      nodeFactory: this.nodeFactory,
      freeNodesScene: this.sceneManager.freeNodesScene,
      configureI18n: this.configureI18n.bind(this),
    });

    return Promise.all([
      this.fontManager.initializeFonts(this.options.fonts),
      this.imageManager.initializeImages(this.options.images),
      this.soundManager.initializeSounds(this.options.sounds),
    ]) as unknown as Promise<void>;
  }

  /**
   * Returns the manifest, if manifest.json was created during the build.
   *
   * @internal For m2c2kit library use only
   *
   * @remarks This should be called without any parameters. The
   * `manifestJsonUrl` parameter's default value will be modified during the
   * build step, if the build was configured to include the manifest.json
   *
   * @param manifestJsonUrl - Do not use this parameter. Allow the default.
   * @returns a promise that resolves to the manifest object, or an empty object if there is no manifest
   */
  async loadManifest(manifestJsonUrl = "__NO_M2C2KIT_MANIFEST_JSON_URL__") {
    if (manifestJsonUrl.includes("NO_M2C2KIT_MANIFEST_JSON_URL")) {
      return {};
    }
    let manifestResponse: Response;
    try {
      manifestResponse = await fetch(manifestJsonUrl);
      /**
       * fetch does not throw exceptions on server status errors, such as
       * 404. Must check response.ok
       */
      if (!manifestResponse.ok) {
        throw new M2Error(
          `Error ${manifestResponse.status} on GET manifest.json from ${manifestJsonUrl}.`,
        );
      }
    } catch {
      throw new M2Error(
        `Network error on GET manifest.json from ${manifestJsonUrl}.`,
      );
    }

    try {
      return (await manifestResponse.json()) as Manifest;
    } catch {
      throw new M2Error(`Error parsing manifest.json from ${manifestJsonUrl}.`);
    }
  }

  get fontManager(): FontManager {
    if (!this._fontManager) {
      throw new M2Error("fontManager is undefined");
    }
    return this._fontManager;
  }

  set fontManager(fontManager: FontManager) {
    this._fontManager = fontManager;
  }

  get imageManager(): ImageManager {
    if (!this._imageManager) {
      throw new M2Error("imageManager is undefined");
    }
    return this._imageManager;
  }

  set imageManager(imageManager: ImageManager) {
    this._imageManager = imageManager;
  }

  get soundManager(): SoundManager {
    if (!this._soundManager) {
      throw new M2Error("soundManager is undefined");
    }
    return this._soundManager;
  }

  set soundManager(soundManager: SoundManager) {
    this._soundManager = soundManager;
  }

  get eventMaterializer(): EventMaterializer {
    if (!this._eventMaterializer) {
      throw new M2Error("eventMaterializer is undefined");
    }
    return this._eventMaterializer;
  }
  set eventMaterializer(eventMaterializer: EventMaterializer) {
    this._eventMaterializer = eventMaterializer;
  }

  get inputManager(): InputManager {
    if (!this._inputManager) {
      throw new M2Error("inputManager is undefined");
    }
    return this._inputManager;
  }

  set inputManager(inputManager: InputManager) {
    this._inputManager = inputManager;
  }

  /**
   * Returns the scenes that have been added to the game.
   */
  get scenes() {
    return this.sceneManager.scenes;
  }

  /**
   * Returns the current game scene.
   *
   * @remarks The current scene is the scene that is currently being
   * rendered. If no scene has been set as the current scene, this will
   * return undefined.
   */
  get currentScene(): Scene | undefined {
    return this.sceneManager.currentScene;
  }

  /**
   * Returns the game snapshots.
   *
   * @remarks Snapshots are the most recent images of the current scene. These
   * are in raw CanvasKit `Image` format and must be converted to another
   * format, such as PNG via `CanvasKit.MakeImage()`, before they can be
   * meaningfully exported.
   */
  get snapshots() {
    return this.sceneManager.snapshots;
  }

  /**
   * Adds prefixes to a key to ensure that keys are unique across activities
   * and studies.
   *
   * @remarks When a value is saved to the key-value data store, the key must
   * be prefixed with additional information to ensure that keys are unique.
   * The prefixes will include the activity id and publish UUID, and possibly
   * the study id and study UUID, if they are set (this is so that keys are
   * unique across different studies that might use the same activity).
   *
   * @param key - item key to add prefixes to
   * @returns the item key with prefixes added
   */
  private addPrefixesToKey(key: string) {
    let k = "";
    if (this.studyId && this.studyUuid) {
      k = this.studyId.concat(":", this.studyUuid, ":");
    } else if (this.studyId || this.studyUuid) {
      throw new M2Error(
        `study_id and study_uuid must both be set or unset. Values are study_id: ${this.studyId}, study_uuid: ${this.studyUuid}`,
      );
    }
    return k.concat(this.id.concat(this.id, ":", this.publishUuid, ":", key));
  }

  /**
   * Saves an item to the activity's key-value store.
   *
   * @remarks The underlying persistence provider of the key-value store must
   * have been previously provided in `SessionOptions`.
   * @example
   * import { LocalDatabase } from "@m2c2kit/db";
   * const session = new Session({
   *   dataStores: [new LocalDatabase()]
   *   ...
   * });
   * @param key - item key
   * @param value - item value
   * @param globalStore - if true, treat the item as "global" and not
   * associated with a specific activity; global items can be accessed
   * by any activity. Default is false.
   * @returns key
   */
  storeSetItem(
    key: string,
    value: string | number | boolean | object | undefined | null,
    globalStore = false,
  ): Promise<string> {
    const prefixedKey = globalStore ? key : this.addPrefixesToKey(key);
    return this.dataStores[0].setItem(
      prefixedKey,
      value,
      globalStore ? "" : this.publishUuid,
    );
  }

  /**
   * Gets an item value from the activity's key-value store.
   *
   * @remarks The underlying persistence provider of the key-value store must
   * have been previously provided in `SessionOptions`.
   * @example
   * import { LocalDatabase } from "@m2c2kit/db";
   * const session = new Session({
   *   dataStores: [new LocalDatabase()]
   *   ...
   * });
   * @param key - item key
   * @param globalStore - if true, treat the item as "global" and not
   * associated with a specific activity; global items can be accessed
   * by any activity. Default is false.
   * @returns value of the item
   */
  storeGetItem<T extends string | number | boolean | object | undefined | null>(
    key: string,
    globalStore = false,
  ): Promise<T> {
    const prefixedKey = globalStore ? key : this.addPrefixesToKey(key);
    return this.dataStores[0].getItem<T>(prefixedKey);
  }

  /**
   * Deletes an item value from the activity's key-value store.
   *
   * @remarks The underlying persistence provider of the key-value store must
   * have been previously provided in `SessionOptions`.
   * @example
   * import { LocalDatabase } from "@m2c2kit/db";
   * const session = new Session({
   *   dataStores: [new LocalDatabase()]
   *   ...
   * });
   * @param key - item key
   * @param globalStore - if true, treat the item as "global" and not
   * associated with a specific activity; global items can be accessed
   * by any activity. Default is false.
   */
  storeDeleteItem(key: string, globalStore = false) {
    const prefixedKey = globalStore ? key : this.addPrefixesToKey(key);
    return this.dataStores[0].deleteItem(prefixedKey);
  }

  /**
   * Deletes all items from the activity's key-value store.
   *
   * @remarks The underlying persistence provider of the key-value store must
   * have been previously provided in `SessionOptions`.
   * @example
   * import { LocalDatabase } from "@m2c2kit/db";
   * const session = new Session({
   *   dataStores: [new LocalDatabase()]
   *   ...
   * });
   */
  storeClearItems() {
    return this.dataStores[0].clearItemsByActivityPublishUuid(this.publishUuid);
  }

  /**
   * Returns keys of all items in the activity's key-value store.
   *
   * @remarks The underlying persistence provider of the key-value store must
   * have been previously provided in `SessionOptions`.
   * @example
   * import { LocalDatabase } from "@m2c2kit/db";
   * const session = new Session({
   *   dataStores: [new LocalDatabase()]
   *   ...
   * });
   * @param globalStore - if true, treat the item as "global" and not
   * associated with a specific activity; global items can be accessed
   * by any activity. Default is false.
   */
  storeItemsKeys(globalStore = false) {
    return this.dataStores[0].itemsKeysByActivityPublishUuid(
      globalStore ? "" : this.publishUuid,
    );
  }

  /**
   * Determines if a key exists in the activity's key-value store.
   *
   * @remarks The underlying persistence provider of the key-value store must
   * have been previously provided in `SessionOptions`.
   * @example
   * import { LocalDatabase } from "@m2c2kit/db";
   * const session = new Session({
   *   dataStores: [new LocalDatabase()]
   *   ...
   * });
   * @param key - item key
   * @param globalStore - if true, treat the item as "global" and not
   * associated with a specific activity; global items can be accessed
   * by any activity. Default is false.
   * @returns true if the key exists, false otherwise
   */
  storeItemExists(key: string, globalStore = false) {
    const prefixedKey = globalStore ? key : this.addPrefixesToKey(key);
    return this.dataStores[0].itemExists(prefixedKey);
  }

  get dataStores(): IDataStore[] {
    if (!this._dataStores) {
      throw new M2Error("dataStores is undefined");
    }
    return this._dataStores;
  }

  set dataStores(dataStores: IDataStore[]) {
    this._dataStores = dataStores;
  }

  hasDataStores(): boolean {
    return (this._dataStores && this._dataStores.length > 0) || false;
  }

  private getLocalizationOptionsFromGameParameters() {
    const locale = this.getParameter<string>("locale");
    const fallbackLocale = this.getParameterOrFallback<string, undefined>(
      "fallback_locale",
      undefined,
    );
    const missingTranslationColor = this.getParameterOrFallback<
      RgbaColor,
      undefined
    >("missing_localization_color", undefined);
    const additionalTranslation = this.getParameterOrFallback<
      Translation,
      undefined
    >("translation", undefined);
    const translation = this.options.translation;
    return <LocalizationOptions>{
      locale,
      fallbackLocale,
      missingLocalizationColor: missingTranslationColor,
      additionalTranslation: additionalTranslation,
      translation: translation,
    };
  }

  private isLocalizationRequested(): boolean {
    const locale = this.getParameterOrFallback<string, undefined>(
      "locale",
      undefined,
    );

    if (locale === "") {
      throw new M2Error(
        "Empty string in locale. Leave locale undefined or null to prevent localization.",
      );
    }

    /**
     * If the locale is not set, but the game has a translation object, we
     * will use the base locale as the locale. This is to ensure that the
     * game will show some text, rather than translation keys.
     */
    if ((locale === null || locale === undefined) && this.options.translation) {
      this.setParameters({ locale: this.options.translation.baseLocale });
      return true;
    }
    if (
      (locale === null || locale === undefined) &&
      this.options.translation === undefined
    ) {
      return false;
    }
    return true;
  }

  setParameters(additionalParameters: unknown): void {
    const sanitizedParams =
      M2c2KitHelpers.sanitizeParameters(additionalParameters);
    const { parameters } = this.options;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.keys(sanitizedParams as any).forEach((key) => {
      /**
       * The parameter "diagnostics" is a special case. It is for setting the
       * diagnostics reporting, and it will not be added to the game's
       * parameters. It is processed by the Session class and not used by the
       * game.
       */
      if (key === "diagnostics") {
        return;
      }

      /**
       * The parameter "eruda" is a special case. It is for loading the eruda
       * debugging console, and it will not be added to the game's parameters.
       */
      if (key === "eruda") {
        const erudaRequested =
          (sanitizedParams as { [key: string]: boolean })[key] === true;
        if (erudaRequested) {
          M2c2KitHelpers.loadEruda();
        }
        return;
      }

      /**
       * The parameter "scripts" is a special case. It is for loading arbitrary
       * scripts (when debugging, testing), and it will not be added to the
       * game's parameters. "scripts" must be an array of URL strings. If
       * "scripts" has come from a URL query parameter, it must have been
       * previously decoded/deserialized by decodeURIComponent() and
       * JSON.parse().
       */
      if (key === "scripts") {
        const scriptUrls = (sanitizedParams as { [key: string]: string[] })[
          key
        ];
        if (scriptUrls) {
          M2c2KitHelpers.loadScriptUrls(scriptUrls);
        }
        return;
      }

      if (!parameters || !(key in parameters)) {
        console.warn(
          `game ${
            this.options.name
          } does not have a parameter named ${key}. attempt to set parameter ${key} to value ${
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (sanitizedParams as any)[key]
          } will be ignored`,
        );
      } else if (this.options.parameters && this.options.parameters[key]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const providedValue = (sanitizedParams as any)[key];
        let value;
        if (
          this.options.parameters[key].type !== undefined &&
          providedValue !== undefined
        ) {
          try {
            value = M2c2KitHelpers.convertValueToType(
              providedValue,
              this.options.parameters[key].type,
            );
          } catch (e: unknown) {
            throw new M2Error(
              "Error setting parameter " + key + ": " + (e as Error).message,
            );
          }
        } else {
          value = providedValue;
        }
        this.options.parameters[key].default = value;
      }

      if (this.additionalParameters === undefined) {
        this.additionalParameters = {};
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.additionalParameters as { [key: string]: any })[key] =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (sanitizedParams as any)[key];
    });
  }

  get canvasKit(): CanvasKit {
    if (!this._canvasKit) {
      throw new M2Error("canvaskit is undefined");
    }
    return this._canvasKit;
  }

  set canvasKit(canvasKit: CanvasKit) {
    this._canvasKit = canvasKit;
  }

  /** The scene, or its name as a string, to be presented when the game is started. If this is undefined, the game will start with the first scene that has been added */
  public entryScene?: Scene | string;
  /** The participant data generated by the game. */
  get data(): GameData {
    return this.dataManager.data;
  }
  /** The 0-based index of the current trial */
  get trialIndex(): number {
    return this.dataManager.trialIndex;
  }
  private htmlCanvas?: HTMLCanvasElement;
  surface?: Surface;
  private showFps?: boolean;
  bodyBackgroundColor?: RgbaColor;

  private priorUpdateTime?: number;
  private fpsTextFont?: Font;
  private fpsTextPaint?: Paint;
  private drawnFrames = 0;
  private lastFpsUpdate = 0;
  private nextFpsUpdate = 0;
  private fpsRate = 0;
  private animationFramesRequested = 0;
  private limitFps = false;
  private gameStopRequested = false;

  canvasCssWidth = 0;
  canvasCssHeight = 0;

  /**
   * Adds a node as a free node (a node that is not part of a scene)
   * to the game.
   *
   * @remarks Once added to the game, a free node will always be drawn,
   * and it will not be part of any scene transitions. This is useful if
   * a node must persistently be drawn and not move with scene
   * transitions. The appearance of the free node must be managed
   * by the programmer. Note: internally, the free nodes are part of a
   * special scene (named "__freeNodesScene"), but this scene is handled
   * apart from regular scenes in order to achieve the free node behavior.
   *
   * @param node - node to add as a free node
   */
  addFreeNode(node: M2Node): void {
    this.sceneManager.addFreeNode(node);
  }

  /**
   * @deprecated Use addFreeNode() instead
   */
  addFreeEntity(node: M2Node): void {
    this.sceneManager.addFreeNode(node);
  }

  /**
   * Removes a free node from the game.
   *
   * @remarks Throws exception if the node to remove is not currently added
   * to the game as a free node
   *
   * @param node - the free node to remove or its name as a string
   */
  removeFreeNode(node: M2Node | string): void {
    this.sceneManager.removeFreeNode(node);
  }

  /**
   * @deprecated Use removeFreeNode() instead
   */
  removeFreeEntity(node: M2Node | string): void {
    this.sceneManager.removeFreeNode(node);
  }

  /**
   * Removes all free nodes from the game.
   */
  removeAllFreeNodes(): void {
    this.sceneManager.removeAllFreeNodes();
  }

  /**
   * @deprecated Use removeAllFreeNodes() instead
   */
  removeAllFreeEntities(): void {
    this.sceneManager.removeAllFreeNodes();
  }

  /**
   * Returns array of free nodes that have been added to the game.
   *
   * @returns array of free nodes
   */
  get freeNodes(): Array<M2Node> {
    return this.sceneManager.freeNodes;
  }

  /**
   * @deprecated Use Game.freeEntities instead
   */
  get freeEntities(): Array<M2Node> {
    return this.sceneManager.freeNodes;
  }

  /**
   * Adds a scene to the game.
   *
   * @remarks A scene, and its children nodes, cannot be presented unless it
   * has been added to the game object. A scene can be added to the game
   * only once.
   *
   * @param scene
   */
  addScene(scene: Scene): void {
    this.sceneManager.add(scene);
  }

  /**
   * Adds multiple scenes to the game.
   *
   * @param scenes
   */
  addScenes(scenes: Array<Scene>): void {
    scenes.forEach((scene) => {
      this.sceneManager.add(scene);
    });
  }

  /**
   * Removes a scene from the game.
   *
   * @param scene - the scene to remove or its name as a string
   */
  removeScene(scene: Scene | string): void {
    this.sceneManager.remove(scene);
  }

  /**
   * Specifies the scene that will be presented upon the next frame draw.
   *
   * @param scene - the scene, its string name, or UUID
   * @param transition
   */
  presentScene(scene: string | Scene, transition?: Transition): void {
    this.sceneManager.present(scene, transition);
  }

  /**
   * Gets the value of the game parameter. If parameterName
   * is not found, then throw exception.
   *
   * @param parameterName - the name of the game parameter whose value is requested
   * @returns
   */
  getParameter<T>(parameterName: string): T {
    if (
      this.options.parameters !== undefined &&
      Object.keys(this.options.parameters).includes(parameterName)
    ) {
      return this.options.parameters[parameterName].default as T;
    } else {
      throw new M2Error(`game parameter ${parameterName} not found`);
    }
  }

  /**
   * Gets the value of the game parameter. If parameterName
   * is not found, then return fallback value
   *
   * @param parameterName - the name of the game parameter whose value is requested
   * @param fallbackValue - the value to return if parameterName is not found
   * @returns
   */
  getParameterOrFallback<T, U>(parameterName: string, fallbackValue: U): T | U {
    if (
      this.options.parameters !== undefined &&
      Object.keys(this.options.parameters).includes(parameterName)
    ) {
      return this.options.parameters[parameterName].default as T;
    } else {
      return fallbackValue;
    }
  }

  /**
   * Returns true if a game parameter exists for the given string.
   *
   * @param parameterName - the name of the game parameter whose existence is queried
   * @returns
   */
  hasParameter(parameterName: string): boolean {
    if (
      this.options.parameters !== undefined &&
      Object.keys(this.options.parameters).includes(parameterName)
    ) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Starts the game loop.
   *
   * @remarks If entryScene is undefined, the game will start with scene
   * defined in the game object's entryScene property. If that is undefined,
   * the game will start with the first scene in the game object's scenes.
   * If there are no scenes in the game object's scenes, it will throw
   * an error.
   * Although the method has no awaitable calls, we will likely do
   * so in the future. Thus this method is async.
   *
   * @param entryScene - The scene (Scene object or its string name) to display when the game starts
   */
  async start(entryScene?: Scene | string) {
    const gameInitOptions = this.options;

    this.setupHtmlCanvases(
      gameInitOptions.canvasId,
      gameInitOptions.width,
      gameInitOptions.height,
      gameInitOptions.stretch,
    );
    this.showFps = gameInitOptions.showFps ?? false;
    this.bodyBackgroundColor = gameInitOptions.bodyBackgroundColor;

    this.dataManager.initializeData();

    this.setupCanvasKitSurface();
    this.setupFpsFont();
    this.setupInputManager();

    this.beginTimestamp = Timer.now();
    this.beginIso8601Timestamp = new Date().toISOString();

    let startingScene: Scene | undefined;

    if (entryScene !== undefined) {
      if (typeof entryScene === "object") {
        startingScene = entryScene;
      } else {
        startingScene = this.scenes
          .filter((scene) => scene.name === entryScene)
          .find(Boolean);
      }
    } else if (this.entryScene !== undefined) {
      if (typeof this.entryScene === "object") {
        startingScene = this.entryScene;
      } else {
        startingScene = this.scenes
          .filter((scene) => scene.name === this.entryScene)
          .find(Boolean);
      }
    } else {
      startingScene = this.scenes.find(Boolean);
    }

    if (startingScene === undefined) {
      throw new M2Error(
        "cannot start game. entry scene has not been added to the game object.",
      );
    }

    this.sceneManager.present(startingScene);
    if (this.surface === undefined) {
      throw new M2Error("CanvasKit surface is undefined");
    }

    if (this.options.timeStepping) {
      this.addTimeSteppingControlsToDom();
      this.updateTimeSteppingOutput();
    } else {
      this.removeTimeSteppingControlsFromDom();
    }

    if (this.options.showEventStoreControls) {
      this.addEventControlsToDom();
    }

    this.warmupFinished = false;
    const gameWarmupStartEvent: GameEvent = {
      target: this,
      type: M2EventType.GameWarmupStart,
      ...M2c2KitHelpers.createFrameUpdateTimestamps(),
    };
    this.raiseActivityEventOnListeners(gameWarmupStartEvent);

    this.warmupFunctionQueue.push({
      warmupFunction: this.warmupShadersWithPrimitives,
    });
    this.warmupFunctionQueue.push({
      warmupFunction: this.warmupShadersWithPrimitives,
      positionOffset: 0.10012117,
    });
    this.warmupFunctionQueue.push({
      warmupFunction: this.warmupShadersWithScenes,
    });

    this.surface.requestAnimationFrame(this.loop.bind(this));

    const activityStartEvent: ActivityLifecycleEvent = {
      target: this,
      type: M2EventType.ActivityStart,
      ...M2c2KitHelpers.createFrameUpdateTimestamps(),
    };
    this.raiseActivityEventOnListeners(activityStartEvent);
  }

  playEventsHandler(mouseEvent: MouseEvent) {
    if ((mouseEvent?.target as HTMLElement)?.id === "replay-events") {
      this.eventStore.mode = EventStoreMode.Disabled;
      this.scenes.forEach((scene) => {
        this.removeScene(scene);
      });
      this.sceneManager.clearCurrentScene();
      this.eventListeners = new Array<ActivityEventListener<ActivityEvent>>();
      this.sceneManager.freeNodesScene.removeAllChildren();
      this.materializedNodes = [];
      this.eventStore.replay();
      this.setReplayEventsButtonEnabled(false);
      this.setStopReplayButtonEnabled(true);
    }

    if ((mouseEvent?.target as HTMLElement)?.id === "stop-replay") {
      this.eventStore.clearEvents();
      this.setReplayEventsButtonEnabled(true);
      this.setStopReplayButtonEnabled(false);
    }

    if ((mouseEvent?.target as HTMLElement)?.id === "log-events") {
      if (this.eventStore.mode === EventStoreMode.Replay) {
        console.log(this.eventStore.serializedEventsBeforeReplay);
        console.log(
          `Total events: ${JSON.parse(this.eventStore.serializedEventsBeforeReplay).length}`,
        );
        return;
      }
      console.log(JSON.stringify(this.eventStore.getEvents()));
      console.log(`Total events: ${this.eventStore.getEvents().length}`);
    }
  }

  private replayEventsButtonEnabled = true;
  private setReplayEventsButtonEnabled(enable: boolean) {
    const replayEventsButton = document.getElementById("replay-events");
    if (!replayEventsButton) {
      return;
    }
    if (enable) {
      replayEventsButton.removeAttribute("disabled");
      this.replayEventsButtonEnabled = true;
      return;
    }
    replayEventsButton.setAttribute("disabled", "true");
    this.replayEventsButtonEnabled = false;
  }

  private setStopReplayButtonEnabled(enable: boolean) {
    const stopReplayButton = document.getElementById("stop-replay");
    if (!stopReplayButton) {
      return;
    }
    if (enable) {
      stopReplayButton.removeAttribute("disabled");
      return;
    }
    stopReplayButton.setAttribute("disabled", "true");
  }

  private addEventControlsToDom() {
    const existingDiv = document.getElementById("m2c2kit-event-controls-div");
    if (existingDiv) {
      existingDiv.remove();
    }

    const body = document.getElementsByTagName("body")[0];
    if (body) {
      const div = document.createElement("div");
      div.id = "m2c2kit-event-controls-div";
      div.style.position = "fixed";
      div.style.top = "4px";
      div.style.left = "4px";
      body.prepend(div);

      const btn = document.createElement("button");
      btn.id = "replay-events";
      btn.title = "replay event recording";
      btn.innerText = "▶️";
      btn.style.marginRight = "4px";
      div.appendChild(btn);
      btn.addEventListener("click", this.playEventsHandler.bind(this));

      const btn2 = document.createElement("button");
      btn2.id = "stop-replay";
      btn2.title = "stop event replay";
      btn2.innerText = "⏹️";
      btn2.style.marginRight = "4px";
      btn2.disabled = true;
      div.appendChild(btn2);
      btn2.addEventListener("click", this.playEventsHandler.bind(this));

      const btn3 = document.createElement("button");
      btn3.id = "log-events";
      btn3.title = "log events to console";
      btn3.innerText = "📄";
      btn3.style.marginRight = "4px";
      div.appendChild(btn3);
      btn3.addEventListener("click", this.playEventsHandler.bind(this));

      const replayThroughTextSpan = document.createElement("span");
      replayThroughTextSpan.title =
        "optional: replay events only through a given sequence number. Default is to replay all events.";
      replayThroughTextSpan.innerText = "Replay through sequence: ";
      div.appendChild(replayThroughTextSpan);

      const input = document.createElement("input");
      input.id = "sequence-number";
      input.title =
        "optional: replay events only through a given sequence number. Default is to replay all events.";
      input.style.marginRight = "4px";
      div.appendChild(input);
    }
  }

  private addTimeSteppingControlsToDom() {
    const existingDiv = document.getElementById("m2c2kit-time-stepping-div");
    if (existingDiv) {
      return;
    }

    const body = document.getElementsByTagName("body")[0];
    if (body) {
      const div = document.createElement("div");
      div.id = "m2c2kit-time-stepping-div";
      body.prepend(div);

      const btn = document.createElement("button");
      btn.id = "1-step-advance";
      btn.title = "advance 1 step (16.667 ms)";
      btn.innerText = ">";
      btn.style.marginRight = "4px";
      div.appendChild(btn);
      btn.addEventListener("click", this.advanceStepsHandler.bind(this));

      const btn2 = document.createElement("button");
      btn2.id = "55-step-advance";
      btn2.title = "advance 55 steps (916.667 ms)";
      btn2.innerText = ">>";
      btn2.style.marginRight = "4px";
      div.appendChild(btn2);
      btn2.addEventListener("click", this.advanceStepsHandler.bind(this));

      const stepsInput = document.createElement("input");
      stepsInput.id = "time-stepping-steps-input";
      stepsInput.title = "steps";
      stepsInput.style.width = "40px";
      stepsInput.style.marginRight = "4px";
      stepsInput.setAttribute("readonly", "true");
      div.appendChild(stepsInput);

      const nowInput = document.createElement("input");
      nowInput.id = "time-stepping-now-input";
      nowInput.title = "milliseconds";
      nowInput.style.width = "80px";
      nowInput.style.marginRight = "4px";
      nowInput.setAttribute("readonly", "true");
      div.appendChild(nowInput);
    }
  }

  private updateTimeSteppingOutput(): void {
    const stepsInput = document.getElementById(
      "time-stepping-steps-input",
    ) as HTMLInputElement;
    if (stepsInput) {
      stepsInput.value = this.stepCount.toString();
    }
    const nowInput = document.getElementById(
      "time-stepping-now-input",
    ) as HTMLInputElement;
    if (nowInput) {
      nowInput.value = this.steppingNow.toFixed(2);
    }
  }

  private advanceStepsHandler(mouseEvent: MouseEvent): void {
    if ((mouseEvent?.target as HTMLElement)?.id === "1-step-advance") {
      this.steppingNow = this.steppingNow + 16.66666666666667;
      this.stepCount = this.stepCount + 1;
    } else if ((mouseEvent?.target as HTMLElement)?.id === "55-step-advance") {
      this.steppingNow = this.steppingNow + 16.66666666666667 * 55;
      this.stepCount = this.stepCount + 55;
    }
    this.updateTimeSteppingOutput();
  }

  private removeTimeSteppingControlsFromDom() {
    const div = document.getElementById("m2c2kit-time-stepping-div");
    if (div) {
      div.remove();
    }
  }

  /**
   * Warms up the Skia-based shaders underlying canvaskit by drawing
   * primitives.
   *
   * @remarks Some canvaskit methods take extra time the first time they are
   * called because a WebGL shader must be compiled. If the method is part of
   * an animation, then this may cause frame drops or "jank." To alleviate
   * this, we can "warm up" the shader associated with the method by calling
   * it at the beginning of our game. Thus, all warmup operations will be
   * concentrated at the beginning and will not be noticeable. This warmup
   * function draws a series of primitives to the canvas. From testing,
   * the actual WebGl shaders compiled by canvaskit vary depending on the
   * device hardware. Thus, warmup functions that might call all relevant
   * WebGL shaders on desktop hardware may not be sufficient for mobile.
   *
   * @param canvas - the canvaskit-canvas to draw on
   * @param positionOffset - an offset to add to the position of each
   * primitive. Different shaders may be compiled depending on if the position
   * was fractional or not. This offset allows us to warmup both cases.
   */
  private warmupShadersWithPrimitives(
    canvas: Canvas,
    positionOffset = 0,
  ): void {
    canvas.save();
    if (positionOffset == 0) {
      canvas.scale(1 / m2c2Globals.canvasScale, 1 / m2c2Globals.canvasScale);
    } else {
      canvas.scale(
        (1 / m2c2Globals.canvasScale) * 1.13,
        (1 / m2c2Globals.canvasScale) * 1.13,
      );
    }

    if (!this.surface) {
      throw new M2Error("surface is undefined");
    }
    const surfaceWidth = this.surface.width();
    const surfaceHeight = this.surface.height();
    const centerX = Math.round(surfaceWidth / 2) + positionOffset;
    const centerY = Math.round(surfaceHeight / 2) + positionOffset;
    const originX = positionOffset;
    const originY = positionOffset;

    const backgroundPaint = CanvasKitHelpers.makePaint(
      this.canvasKit,
      WebColors.White,
      this.canvasKit.PaintStyle.Fill,
      true,
    );
    canvas.drawRect(
      [0, 0, this.surface.width(), this.surface.height()],
      backgroundPaint,
    );

    const fillColorPaintNotAntialiased = CanvasKitHelpers.makePaint(
      this.canvasKit,
      WebColors.Black,
      this.canvasKit.PaintStyle.Fill,
      false,
    );

    const fillColorPaintAntialiased = CanvasKitHelpers.makePaint(
      this.canvasKit,
      WebColors.Black,
      this.canvasKit.PaintStyle.Fill,
      true,
    );

    const strokeColorPaintNotAntialiased = CanvasKitHelpers.makePaint(
      this.canvasKit,
      WebColors.Black,
      this.canvasKit.PaintStyle.Stroke,
      false,
    );
    strokeColorPaintNotAntialiased.setStrokeWidth(2);

    const strokeColorPaintAntialiased = CanvasKitHelpers.makePaint(
      this.canvasKit,
      WebColors.Black,
      this.canvasKit.PaintStyle.Stroke,
      true,
    );
    strokeColorPaintAntialiased.setStrokeWidth(2);

    canvas.drawCircle(centerX, centerY, 32, fillColorPaintNotAntialiased);
    canvas.drawCircle(centerX, centerY, 32, fillColorPaintAntialiased);
    canvas.drawCircle(centerX, centerY, 32, strokeColorPaintNotAntialiased);
    canvas.drawCircle(centerX, centerY, 32, strokeColorPaintAntialiased);

    const fontManager = this.fontManager;
    const fontNames = this.fontManager.getFontNames();
    if (
      fontNames.length > 0 &&
      fontManager.fonts[fontNames[0]].status === M2FontStatus.Ready
    ) {
      const typeface = fontManager.getTypeface(fontNames[0]);
      const font = new this.canvasKit.Font(
        typeface,
        16 * m2c2Globals.canvasScale,
      );
      canvas.drawText(
        "abc",
        centerX,
        centerY,
        fillColorPaintNotAntialiased,
        font,
      );
      canvas.drawText("abc", centerX, centerY, fillColorPaintAntialiased, font);
    }

    const snapshot = this.sceneManager.takeCurrentSceneSnapshot();
    canvas.drawImage(snapshot, originX, originY);
    snapshot.delete();

    canvas.drawRect([originX, originY, 16, 16], fillColorPaintNotAntialiased);
    canvas.drawRect([originX, originY, 16, 16], fillColorPaintAntialiased);
    canvas.drawRect([originX, originY, 16, 16], strokeColorPaintNotAntialiased);
    canvas.drawRect([originX, originY, 16, 16], strokeColorPaintAntialiased);
    canvas.restore();
  }

  /**
   * Warms up the Skia-based shaders underlying canvaskit by drawing
   * m2c2kit nodes.
   *
   * @remarks While warmupShadersWithPrimitives draws a predefined set of
   * primitives, this function initializes and draws all canvaskit objects
   * that have been defined as m2c2kit nodes. This not only is another
   * opportunity for shader warmup, it also does the node initialization.
   *
   * @param canvas - the canvaskit-canvas to draw on
   */
  private warmupShadersWithScenes(canvas: Canvas): void {
    [...this.scenes, this.sceneManager.freeNodesScene].forEach((scene) => {
      scene.warmup(canvas);
    });

    /**
     * images that are in sprites will have been warmed up above, but images
     * that are not yet added to a sprite have not been warmed up.
     * Thus, warmup these not-yet-added images.
     */
    const warmedUpImageNames = this.nodes
      .filter((node) => node.type === M2NodeType.Sprite)
      .map((node) => (node as Sprite).imageName);
    const images = this.imageManager.images;
    // images may be undefined/null if the game does not have images
    if (images) {
      const imageNames = Object.keys(images).filter(
        (name) => name !== "__outgoingSceneSnapshot",
      );
      imageNames.forEach((imageName) => {
        if (!warmedUpImageNames.includes(imageName)) {
          if (images[imageName].status === M2ImageStatus.Ready) {
            const image = images[imageName].canvaskitImage;
            if (!image) {
              throw new M2Error(`image ${imageName} is undefined`);
            }
            canvas.drawImage(image, 0, 0);
          }
        }
      });
    }

    const whitePaint = new this.canvasKit.Paint();
    whitePaint.setColor(this.canvasKit.Color(255, 255, 255, 1));
    if (!this.surface) {
      throw new M2Error("surface is undefined");
    }
    canvas.drawRect(
      [0, 0, this.surface.width(), this.surface.height()],
      whitePaint,
    );
  }

  stop(): void {
    if (this.currentScene) {
      this.currentScene._active = false;
    }
    this.gameStopRequested = true;
    Timer.removeAll();
    this.dispose();
  }

  /**
   * Frees up resources that were allocated to run the game.
   *
   * @remarks This will be done automatically by the m2c2kit library; the
   * end-user must not call this. FOR INTERNAL USE ONLY.
   */
  dispose(): void {
    // When unit-testing, the input manager may not have been initialized, so
    // check before disposing.
    if (this._inputManager) {
      this.inputManager.dispose();
    }
    this.nodes
      .filter((e) => e.isDrawable)
      .forEach((e) => (e as unknown as IDrawable).dispose());
    if (this._fontManager) {
      this.fontManager.dispose();
    }
  }

  /**
   * Adds data to the game's TrialData object.
   *
   * @remarks `variableName` must be previously defined in the
   * {@link TrialSchema} object in {@link GameOptions}. The type of the value
   * must match what was defined in the trial schema, otherwise an error is
   * thrown.
   *
   * @param variableName - variable to be set
   * @param value - value of the variable to set
   */
  addTrialData(
    variableName: string,
    value: JsonSchemaDataTypeScriptTypes,
  ): void {
    this.dataManager.addTrialData(variableName, value);
  }

  /**
   * Adds data to the game's scoring data.
   *
   * @remarks The variable name (or object property names) must be previously
   * defined in the {@link ScoringSchema} object in {@link GameOptions}.
   * The type of the value must match what was defined in the scoring schema,
   * otherwise an error is thrown.
   *
   * @param variableNameOrObject - Either a variable name (string) or an object
   * containing multiple key-value pairs to add all at once.
   * @param value - Value of the variable to set (only used when
   * variableNameOrObject is a variable name string).
   */
  addScoringData(
    variableNameOrObject:
      | string
      | Record<string, JsonSchemaDataTypeScriptTypes>
      | Array<Record<string, JsonSchemaDataTypeScriptTypes>>,
    value?: JsonSchemaDataTypeScriptTypes,
  ): void {
    this.dataManager.addScoringData(variableNameOrObject, value);
  }

  /**
   * Adds custom trial schema to the game's trialSchema object.
   *
   * @param schema - Trial schema to add
   *
   * @remarks This is useful if you want to add custom trial variables.
   * This must be done before Session.start() is called, because
   * Session.start() will call Game.start(), which will initialize
   * the trial schema.
   */
  addTrialSchema(schema: TrialSchema): void {
    const keys = Object.keys(schema);
    keys.forEach((key) => {
      if (!this.options.trialSchema) {
        throw new M2Error("trial schema is undefined");
      }
      this.options.trialSchema[key] = schema[key];
    });
  }

  /**
   * Sets the value of a variable that will be the same for all trials.
   *
   * @remarks This sets the value of a variable that is the same across
   * all trials ("static"). This is useful for variables that are not
   * part of the trial schema, but that you want to save for each trial in
   * your use case. For example, you might want to save the subject's
   * participant ID for each trial, but this is not part of the trial schema.
   * Rather than modify the source code for the game, you can do the following
   * to ensure that the participant ID is saved for each trial:
   *
   *   game.addTrialSchema(&#123
   *     participant_id: &#123
   *       type: "string",
   *       description: "ID of the participant",
   *     &#125;
   *   &#125;);
   *   game.addStaticTrialData("participant_id", "12345");
   *
   *  When Game.trialComplete() is called, the participant_id variable will
   *  be saved for the trial with the value "12345".
   *
   * @param variableName - variable to be set
   * @param value - value of the variable to set
   */
  addStaticTrialData(
    variableName: string,
    value: JsonSchemaDataTypeScriptTypes,
  ) {
    this.dataManager.addStaticTrialData(variableName, value);
  }

  /**
   * Should be called when the current trial has completed. It will
   * also increment the trial index.
   *
   * @remarks Calling will trigger the onActivityResults callback function,
   * if one was provided in SessionOptions. This is how the game communicates
   * trial data to the parent session, which can then save or process the data.
   * It is the responsibility of the the game programmer to call this at
   * the appropriate time. It is not triggered automatically.
   */
  trialComplete(): void {
    /**
     * locale and device_metadata might change between or during trials,
     * so update them to reflect their state at the end of the trial.
     */
    if (this.dataManager.data.trials[this.trialIndex]?.["locale"]) {
      this.dataManager.data.trials[this.trialIndex]["locale"] =
        this.i18n?.locale ?? null;
    }
    if (this.dataManager.data.trials[this.trialIndex]?.["device_metadata"]) {
      this.dataManager.data.trials[this.trialIndex]["device_metadata"] =
        this.dataManager.getDeviceMetadata();
    }
    if (Object.keys(this.dataManager.staticTrialSchema).length > 0) {
      this.dataManager.data.trials[this.trialIndex] = {
        ...this.dataManager.data.trials[this.trialIndex],
        ...this.dataManager.staticTrialSchema,
      };
    }

    this.dataManager.incrementTrialIndex();

    const resultsEvent: ActivityResultsEvent = {
      type: M2EventType.ActivityData,
      ...M2c2KitHelpers.createFrameUpdateTimestamps(),
      target: this,
      /** newData is only the trial that recently completed */
      newData: this.dataManager.data.trials[this.trialIndex - 1],
      newDataSchema: this.dataManager.makeNewGameDataSchema(),
      /** data is all the data collected so far in the game */
      data: this.dataManager.data,
      dataSchema: this.dataManager.makeGameDataSchema(),
      dataType: "Trial",
      activityConfiguration: this.makeGameActivityConfiguration(
        this.options.parameters ?? {},
      ),
      activityConfigurationSchema: this.makeGameActivityConfigurationSchema(
        this.options.parameters ?? {},
      ),
      activityMetrics: this.gameMetrics,
    };
    this.raiseActivityEventOnListeners(resultsEvent);
  }

  /**
   * Marks scoring as complete.
   *
   * @remarks This method must be called after the game has finished adding
   * scores using addScoringData(). Calling will trigger the onActivityResults
   * callback function, if one was provided in SessionOptions. This is how the
   * game communicates scoring data to the parent session, which can then save
   * or process the data. It is the responsibility of the the game programmer
   * to call this at the appropriate time. It is not triggered automatically.
   */
  scoringComplete(): void {
    const resultsEvent: ActivityResultsEvent = {
      type: M2EventType.ActivityData,
      ...M2c2KitHelpers.createFrameUpdateTimestamps(),
      target: this,
      newData: this.dataManager.data.scoring,
      newDataSchema: this.dataManager.makeScoringDataSchema(),
      data: this.dataManager.data.scoring,
      dataSchema: this.dataManager.makeScoringDataSchema(),
      dataType: "Scoring",
      activityConfiguration: this.makeGameActivityConfiguration(
        this.options.parameters ?? {},
      ),
      activityConfigurationSchema: this.makeGameActivityConfigurationSchema(
        this.options.parameters ?? {},
      ),
      activityMetrics: this.gameMetrics,
    };
    this.raiseActivityEventOnListeners(resultsEvent);
  }

  /**
   * GameParameters combines default parameters values and
   * JSON Schema to describe what the parameters are.
   * The next two functions extract GameParameters's two parts
   * (the default values and the schema) so they can be returned
   * separately in the activityData event
   */

  private makeGameActivityConfiguration(parameters: GameParameters): unknown {
    const gameParams: GameParameters = JSON.parse(JSON.stringify(parameters));
    // don't include the parameters used for localization
    const {
      locale, // eslint-disable-line @typescript-eslint/no-unused-vars
      fallback_locale, // eslint-disable-line @typescript-eslint/no-unused-vars
      missing_localization_color, // eslint-disable-line @typescript-eslint/no-unused-vars
      translation, // eslint-disable-line @typescript-eslint/no-unused-vars
      ...result
    } = gameParams;

    for (const prop in result) {
      for (const subProp in result[prop]) {
        if (subProp == "default") {
          result[prop] = result[prop][subProp];
        }
      }
    }
    return result;
  }

  private makeGameActivityConfigurationSchema(
    parameters: GameParameters,
  ): JsonSchema {
    const gameParams: GameParameters = JSON.parse(JSON.stringify(parameters));
    // don't include the parameters used for localization
    const {
      locale, // eslint-disable-line @typescript-eslint/no-unused-vars
      fallback_locale, // eslint-disable-line @typescript-eslint/no-unused-vars
      missing_localization_color, // eslint-disable-line @typescript-eslint/no-unused-vars
      translation, // eslint-disable-line @typescript-eslint/no-unused-vars
      ...result
    } = gameParams;

    for (const prop in result) {
      if (!("type" in result[prop]) && "value" in result[prop]) {
        const valueType = typeof result[prop]["default"];
        // if the "type" of the value was not provided,
        // infer it from the value itself
        // (note: in our JSON schema, we don't support bigint, function,
        // symbol, or undefined, so we skip those).
        if (
          valueType !== "bigint" &&
          valueType !== "function" &&
          valueType !== "symbol" &&
          valueType !== "undefined"
        ) {
          result[prop].type = valueType;
        }
      }
      for (const subProp in result[prop]) {
        if (subProp == "default") {
          delete result[prop][subProp];
        }
      }
    }
    return {
      description: `activity configuration from the assessment ${this.name}`,
      type: "object",
      properties: result,
    } as JsonSchema;
  }

  /**
   * Should be called when current game has ended successfully.
   *
   * @remarks This will send an ActivityEnd event to any listeners, such as
   * a function provided to Game.onEnd() or a callback defined in
   * SessionOptions.activityCallbacks.onActivityLifecycle. This is how the
   * game can communicate changes in activity state to the parent session.
   * It is the responsibility of the the game programmer to call this at the
   * appropriate time. It is not triggered automatically.
   */
  end(): void {
    const activityEndEvent: ActivityLifecycleEvent = {
      target: this,
      type: M2EventType.ActivityEnd,
      ...M2c2KitHelpers.createFrameUpdateTimestamps(),
    };
    const results: ActivityResults = {
      data: this.dataManager.data,
      dataSchema: this.dataManager.makeGameDataSchema(),
      dataType: "Trial",
      activityConfiguration: this.makeGameActivityConfiguration(
        this.options.parameters ?? {},
      ),
      activityConfigurationSchema: this.makeGameActivityConfigurationSchema(
        this.options.parameters ?? {},
      ),
      activityMetrics: this.gameMetrics,
    };
    this.raiseActivityEventOnListeners(activityEndEvent, results);
  }

  /**
   * Should be called when current game has been canceled by a user action.
   *
   * @remarks This will send an ActivityCancel event to any listeners, such as
   * a function provided to Game.onCancel() or a callback defined in
   * SessionOptions.activityCallbacks.onActivityLifecycle. This is how the
   * game can communicate changes in activity state to the parent session.
   * It is the responsibility of the the game programmer to call this at the
   * appropriate time. It is not triggered automatically.
   */
  cancel(): void {
    const activityCancelEvent: ActivityLifecycleEvent = {
      target: this,
      type: M2EventType.ActivityCancel,
      ...M2c2KitHelpers.createFrameUpdateTimestamps(),
    };
    const results: ActivityResults = {
      data: this.dataManager.data,
      dataSchema: this.dataManager.makeGameDataSchema(),
      dataType: "Trial",
      activityConfiguration: this.makeGameActivityConfiguration(
        this.options.parameters ?? {},
      ),
      activityConfigurationSchema: this.makeGameActivityConfigurationSchema(
        this.options.parameters ?? {},
      ),
      activityMetrics: this.gameMetrics,
    };
    this.raiseActivityEventOnListeners(activityCancelEvent, results);
  }

  private setupHtmlCanvases(
    canvasId: string | undefined,
    width: number,
    height: number,
    stretch: boolean | undefined,
  ): void {
    m2c2Globals.canvasScale = Math.round(window.devicePixelRatio * 100) / 100;

    let htmlCanvas: HTMLCanvasElement | undefined;
    if (canvasId === undefined) {
      const canvasCollection = document.getElementsByTagName("canvas");

      let canvases = new Array<HTMLCanvasElement>();
      for (let i = 0; i < canvasCollection.length; i++) {
        canvases.push(canvasCollection[i]);
      }
      canvases = canvases.filter(
        (canvas) => !canvas.id.startsWith("m2c2kit-scratch-canvas"),
      );

      if (canvases.length === 0) {
        throw new M2Error("no html canvas tag was found in the html");
      }
      const m2c2kitCanvas = canvases.filter(
        (c) => c.id === "m2c2kit-canvas",
      )[0];
      if (m2c2kitCanvas) {
        htmlCanvas = m2c2kitCanvas;
        if (canvases.length > 1) {
          console.log("using canvas with id 'm2c2kit-canvas'");
        }
      } else {
        htmlCanvas = canvasCollection[0];
        if (canvases.length > 1) {
          console.log("using first canvas");
        }
      }
    } else {
      htmlCanvas = document.getElementById(canvasId) as HTMLCanvasElement;
      if (htmlCanvas === undefined) {
        throw new M2Error(
          `could not find canvas HTML element with id "${canvasId}"`,
        );
      }
    }

    if (stretch || window.innerWidth < width || window.innerHeight < height) {
      const requestedAspectRatio = height / width;
      const actualAspectRatio = window.innerHeight / window.innerWidth;

      if (actualAspectRatio < requestedAspectRatio) {
        m2c2Globals.rootScale = window.innerHeight / height;
      } else {
        m2c2Globals.rootScale = window.innerWidth / width;
      }
    }

    htmlCanvas.style.width = m2c2Globals.rootScale * width + "px";
    htmlCanvas.style.height = m2c2Globals.rootScale * height + "px";
    htmlCanvas.width = m2c2Globals.rootScale * width * m2c2Globals.canvasScale;
    htmlCanvas.height =
      m2c2Globals.rootScale * height * m2c2Globals.canvasScale;
    this.htmlCanvas = htmlCanvas;
    this.canvasCssWidth = width;
    this.canvasCssHeight = height;

    m2c2Globals.canvasCssWidth = width;
    m2c2Globals.canvasCssHeight = height;
  }

  private setupCanvasKitSurface(): void {
    if (this.htmlCanvas === undefined) {
      throw new M2Error("main html canvas is undefined");
    }

    // @ts-expect-error type error when adding property to window object
    window.logWebGl = this.options.logWebGl;
    WebGlInfo.interceptWebGlCalls(this.htmlCanvas);
    this.dataManager.queryWebGlRendererInfo();

    const surface = this.canvasKit.MakeWebGLCanvasSurface(this.htmlCanvas);
    if (surface === null) {
      throw new M2Error(
        `could not make CanvasKit surface from canvas HTML element`,
      );
    }
    this.surface = surface;
    console.log(
      `⚪ CanvasKit surface is backed by ${
        this.surface.reportBackendTypeIsGPU() ? "GPU" : "CPU"
      }`,
    );
    this.surface
      .getCanvas()
      .scale(m2c2Globals.canvasScale, m2c2Globals.canvasScale);
  }

  private setupFpsFont(): void {
    this.fpsTextFont = new this.canvasKit.Font(
      null,
      Constants.FPS_DISPLAY_TEXT_FONT_SIZE * m2c2Globals.canvasScale,
    );
    this.fpsTextPaint = new this.canvasKit.Paint();
    this.fpsTextPaint.setColor(
      this.canvasKit.Color(
        Constants.FPS_DISPLAY_TEXT_COLOR[0],
        Constants.FPS_DISPLAY_TEXT_COLOR[1],
        Constants.FPS_DISPLAY_TEXT_COLOR[2],
        Constants.FPS_DISPLAY_TEXT_COLOR[3],
      ),
    );
    this.fpsTextPaint.setAntiAlias(true);
  }

  private setupInputManager(): void {
    if (this.htmlCanvas === undefined) {
      throw new M2Error("main html canvas is undefined");
    }
    this.inputManager = new InputManager(this, this.htmlCanvas);
  }

  private loop(canvas: Canvas): void {
    if (!this.surface) {
      throw new M2Error("surface is undefined");
    }

    if (this.warmupFunctionQueue.length > 0) {
      const warmup = this.warmupFunctionQueue.shift();
      warmup?.warmupFunction.call(this, canvas, warmup.positionOffset);
      this.surface.requestAnimationFrame(this.loop.bind(this));
      return;
    }

    if (!this.warmupFinished) {
      /**
       * We will reach this point only if warmupFunctionQueue is empty.
       * Thus, set warmupFinished to true and send the GameWarmupEnd event.
       */
      this.warmupFinished = true;
      const gameWarmupEndEvent: GameEvent = {
        target: this,
        type: M2EventType.GameWarmupEnd,
        ...M2c2KitHelpers.createFrameUpdateTimestamps(),
      };
      this.raiseActivityEventOnListeners(gameWarmupEndEvent);
      this.surface.requestAnimationFrame(this.loop.bind(this));
      return;
    }

    if (
      this.soundManager.hasSoundsToDecode() &&
      navigator.userActivation.hasBeenActive
    ) {
      // we do not await this
      this.soundManager.decodeFetchedSounds();
    }

    if (this.gameStopRequested) {
      // delete() shows an error in console. deleteLater() does not. Why?
      this.surface.deleteLater();
      return;
    }
    this.animationFramesRequested++;
    if (
      !this.limitFps ||
      this.animationFramesRequested %
        Math.round(60 / Constants.LIMITED_FPS_RATE) ===
        0
    ) {
      if (
        this.currentScene === undefined &&
        this.sceneManager.incomingSceneTransitions.length === 0 &&
        this.eventStore.mode !== EventStoreMode.Replay
      ) {
        throw new M2Error(
          "Can not run game without a current or incoming scene",
        );
      }

      this.updateGameTime();

      if (this.eventStore.mode === EventStoreMode.Replay) {
        const events = this.eventStore.dequeueEvents(Timer.now());
        this.eventMaterializer.materialize(events);
        if (
          this.eventStore.eventQueueLength === 0 &&
          !this.replayEventsButtonEnabled
        ) {
          this.setReplayEventsButtonEnabled(true);
          this.setStopReplayButtonEnabled(false);
        }
      }

      this.sceneManager.handleIncomingSceneTransitions();
      this.update();
      this.draw(canvas);
      this.sceneManager.handleScreenshots();

      /**
       * Free nodes should not slide off the screen during transitions.
       * Thus, draw the free nodes AFTER a screen shot may have
       * taken place.
       */
      this.sceneManager.freeNodesScene.draw(canvas);
    }

    this.priorUpdateTime = m2c2Globals.now;
    this.surface.requestAnimationFrame(this.loop.bind(this));
  }

  private updateGameTime(): void {
    if (!this.options.timeStepping) {
      m2c2Globals.now = performance.now();
    } else {
      m2c2Globals.now = this.steppingNow;
    }

    if (this.priorUpdateTime) {
      m2c2Globals.deltaTime = m2c2Globals.now - this.priorUpdateTime;
    } else {
      m2c2Globals.deltaTime = 0;
    }
  }

  /**
   * Registers a plugin with the game.
   *
   * @remarks Upon registration, the plugin's optional asynchronous
   * `initialize()` method will be called.
   *
   * @param plugin - Plugin to register
   */
  async registerPlugin(plugin: Plugin) {
    if (plugin.type !== ActivityType.Game) {
      throw new M2Error(
        `registerPlugin(): plugin ${plugin.id} is not a game plugin. It is a ${plugin.type} plugin.`,
      );
    }
    if (
      this.plugins.includes(plugin) ||
      this.plugins.map((p) => p.id).includes(plugin.id)
    ) {
      throw new M2Error(
        `registerPlugin(): plugin ${plugin.id} already registered.`,
      );
    }
    this.plugins.push(plugin);
    if (plugin.initialize) {
      await plugin.initialize(this);
    }
  }

  /**
   * Updates active scenes and executes plugins.
   *
   */
  private update(): void {
    this.executeBeforeUpdatePlugins();
    this.sceneManager.updateScenes();
    this.executeAfterUpdatePlugins();
  }

  /**
   * Executes all active plugins before scenes are updated.
   */
  private executeBeforeUpdatePlugins() {
    this.plugins
      .filter(
        (p) => typeof p.beforeUpdate === "function" && p.disabled !== true,
      )
      .forEach((p) => {
        if (p.beforeUpdate) {
          p.beforeUpdate(this, m2c2Globals.deltaTime);
        }
      });
  }

  /**
   * Executes all active plugins after scenes have been updated.
   */
  private executeAfterUpdatePlugins() {
    this.plugins
      .filter((p) => typeof p.afterUpdate === "function" && p.disabled !== true)
      .forEach((p) => {
        if (p.afterUpdate) {
          p.afterUpdate(this, m2c2Globals.deltaTime);
        }
      });
  }

  private draw(canvas: Canvas): void {
    this.sceneManager.drawScenes(canvas);
    this.drawnFrames++;
    this.calculateFps();
    if (this.showFps) {
      this.drawFps(canvas);
    }
  }

  private calculateFps(): void {
    if (this.lastFpsUpdate === 0) {
      this.lastFpsUpdate = m2c2Globals.now;
      this.nextFpsUpdate =
        m2c2Globals.now + Constants.FPS_DISPLAY_UPDATE_INTERVAL;
    } else {
      if (m2c2Globals.now >= this.nextFpsUpdate) {
        this.fpsRate =
          this.drawnFrames / ((m2c2Globals.now - this.lastFpsUpdate) / 1000);
        this.drawnFrames = 0;
        this.lastFpsUpdate = m2c2Globals.now;
        this.nextFpsUpdate =
          m2c2Globals.now + Constants.FPS_DISPLAY_UPDATE_INTERVAL;
        if (
          this.gameMetrics.length < this.maximumRecordedActivityMetrics &&
          this.fpsRate < this.fpsMetricReportThreshold
        ) {
          this.gameMetrics.push({
            fps: Number.parseFloat(this.fpsRate.toFixed(2)),
            fps_interval_ms: Constants.FPS_DISPLAY_UPDATE_INTERVAL,
            fps_report_threshold: this.fpsMetricReportThreshold,
            activity_type: ActivityType.Game,
            activity_uuid: this.uuid,
            iso8601_timestamp: new Date().toISOString(),
          });
        }
      }
    }
  }

  /**
   * Takes screenshot of canvas
   *
   * @remarks Coordinates should be provided unscaled; that is, the method
   * will handle any scaling that happened due to device pixel ratios
   * not equal to 1. This returns a promise because the screenshot request
   * must be queued and completed once a draw cycle has completed. See
   * the loop() method.
   *
   * @param sx - Upper left coordinate of screenshot
   * @param sy - Upper right coordinate of screenshot
   * @param sw - width of area to screenshot
   * @param sh - height of area to screenshot
   * @returns Promise of Uint8Array of image data
   */
  takeScreenshot(
    sx?: number,
    sy?: number,
    sw?: number,
    sh?: number,
  ): Promise<Uint8Array | null> {
    return this.sceneManager.takeScreenshot(sx, sy, sw, sh);
  }

  private drawFps(canvas: Canvas): void {
    canvas.save();
    const drawScale = m2c2Globals.canvasScale;
    canvas.scale(1 / drawScale, 1 / drawScale);
    if (!this.fpsTextFont || !this.fpsTextPaint) {
      throw new M2Error("fps font or paint is undefined");
    }
    canvas.drawText(
      "FPS: " + this.fpsRate.toFixed(2),
      0,
      0 + Constants.FPS_DISPLAY_TEXT_FONT_SIZE * drawScale,
      this.fpsTextPaint,
      this.fpsTextFont,
    );
    canvas.restore();
  }

  /**
   * Creates an event listener for a node based on the node name
   *
   * @remarks Typically, event listeners will be created using a method specific to the event, such as onTapDown(). This alternative allows creation with node name.
   *
   * @param type - the type of event to listen for, e.g., "tapDown"
   * @param nodeName - the node name for which an event will be listened
   * @param callback - the callback to be invoked when the event occurs
   * @param callbackOptions
   */
  createEventListener(
    type: M2EventType,
    nodeName: string,
    callback: (event: M2NodeEvent) => void,
    callbackOptions?: CallbackOptions,
  ): void {
    const nodes = this.nodes.filter((node) => node.name === nodeName);
    if (nodes.length > 1) {
      console.warn(
        `warning: createEventListener() found more than one node with name ${nodeName}. Event listener will be attached to first node found. All nodes that receive tap events should be uniquely named`,
      );
    }
    const node = nodes.filter((node) => node.name === nodeName).find(Boolean);
    if (node === undefined) {
      throw new M2Error(
        `could not create event listener. node with name ${nodeName} could not be found in the game node tree`,
      );
    }

    if (!Object.values(M2EventType).includes(type)) {
      throw new M2Error(
        `game ${this.id}: could not create event listener. event type ${type} is not known`,
      );
    }
    node.addEventListener(type, callback, callbackOptions);
  }

  /**
   * Returns array of all nodes that have been added to the game object.
   */
  get nodes(): Array<M2Node> {
    function getChildNodesRecursive(node: M2Node, nodes: Array<M2Node>): void {
      nodes.push(node);
      node.children.forEach((child) => getChildNodesRecursive(child, nodes));
    }

    const nodes = new Array<M2Node>();
    [...this.scenes, this.sceneManager.freeNodesScene].forEach((scene) =>
      getChildNodesRecursive(scene, nodes),
    );
    return nodes;
  }

  /**
   * @deprecated use Game.nodes instead
   */
  get entities(): Array<M2Node> {
    return this.nodes;
  }

  /**
   * Executes a callback when the game starts.
   *
   * @param callback - function to execute.
   * @param options - options for the callback.
   */
  onStart(
    callback: (activityLifecycleEvent: ActivityLifecycleEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(M2EventType.ActivityStart, callback, options);
  }

  /**
   * Executes a callback when the game is canceled.
   *
   * @param callback - function to execute.
   * @param options - options for the callback.
   */
  onCancel(
    callback: (activityLifecycleEvent: ActivityLifecycleEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(M2EventType.ActivityCancel, callback, options);
  }

  /**
   * Executes a callback when the game ends.
   *
   * @param callback - function to execute.
   * @param options - options for the callback.
   */
  onEnd(
    callback: (activityLifecycleEvent: ActivityLifecycleEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(M2EventType.ActivityEnd, callback, options);
  }

  /**
   * Executes a callback when the game generates data.
   *
   * @param callback - function to execute.
   * @param options - options for the callback.
   */
  onData(
    callback: (activityResultsEvent: ActivityResultsEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(M2EventType.ActivityData, callback, options);
  }

  /**
   * Executes a callback when the game begins its warmup.
   *
   * @internal For m2c2kit library use only
   *
   * @param callback - function to execute.
   * @param options - options for the callback.
   */
  onWarmupStart(
    callback: (gameEvent: GameEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(M2EventType.GameWarmupStart, callback, options);
  }

  /**
   * Executes a callback when the game ends its warmup.
   *
   * @internal For m2c2kit library use only
   *
   * @param callback - function to execute.
   * @param options - options for the callback.
   */
  onWarmupEnd(
    callback: (activityEvent: ActivityEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(M2EventType.GameWarmupEnd, callback, options);
  }

  private addEventListener<T extends ActivityEvent>(
    type: M2EventType,
    callback: (ev: T) => void,
    options?: CallbackOptions,
  ): void {
    const eventListener: ActivityEventListener<T> = {
      type: type,
      activityUuid: this.uuid,
      callback: callback,
    };

    if (options?.replaceExisting) {
      this.eventListeners = this.eventListeners.filter(
        (listener) =>
          !(
            listener.activityUuid === eventListener.activityUuid &&
            listener.type === eventListener.type
          ),
      );
    }
    this.eventListeners.push(
      eventListener as ActivityEventListener<ActivityEvent>,
    );
  }

  private raiseActivityEventOnListeners(
    activityEvent: ActivityEvent,
    extra?: unknown,
  ): void {
    if (extra) {
      activityEvent = {
        ...activityEvent,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(extra as any),
      };
    }
    this.eventListeners
      .filter((listener) => listener.type === activityEvent.type)
      .forEach((listener) => {
        listener.callback(activityEvent);
      });
  }
}
