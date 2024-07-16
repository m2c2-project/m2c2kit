import { Activity } from "./Activity";
import { ActivityType } from "./ActivityType";
import CanvasKitInit, {
  CanvasKit,
  Canvas,
  Surface,
  Font,
  Image,
  Paint,
} from "canvaskit-wasm";
import { Constants } from "./Constants";
import { TapEvent } from "./TapEvent";
import { M2PointerEvent } from "./M2PointerEvent";
import { M2NodeEvent } from "./M2NodeEvent";
import { IDrawable } from "./IDrawable";
import { M2Node } from "./M2Node";
import { M2NodeType } from "./M2NodeType";
import { RgbaColor } from "./RgbaColor";
import { Sprite } from "./Sprite";
import { Shape } from "./Shape";
import { Action } from "./Action";
import { M2Image, M2ImageStatus } from "./M2Image";
import { Scene } from "./Scene";
import {
  SceneTransition,
  Transition,
  TransitionType,
  SlideTransition,
  TransitionDirection,
} from "./Transition";
import { GameOptions } from "./GameOptions";
import { GameData } from "./GameData";
import { Uuid } from "./Uuid";
import {
  DomPointerDownEvent,
  M2EventType,
  M2NodeNewEvent,
  ScenePresentEvent,
  I18nDataReadyEvent,
} from "./M2Event";
import { PendingScreenshot } from "./PendingScreenshot";
import { Timer } from "./Timer";
import { GameParameters } from "./GameParameters";
import {
  JsonSchema,
  JsonSchemaDataType,
  JsonSchemaDataTypeScriptTypes,
} from "./JsonSchema";
import { DeviceMetadata, deviceMetadataSchema } from "./DeviceMetadata";
import { TrialSchema } from "./TrialSchema";
import { GameMetric } from "./GameMetrics";
import { Point } from "./Point";
import { WebGlInfo } from "./WebGlInfo";
import { I18n } from "./I18n";
import { Translation } from "./Translation";
import { LocalizationOptions } from "./LocalizationOptions";
import { WebColors } from "./WebColors";
import { CanvasKitHelpers } from "./CanvasKitHelpers";
import { IDataStore } from "./IDataStore";
import { ShapeType } from "./ShapeType";
import { M2DragEvent } from "./M2DragEvent";
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
import { Easings } from "./Easings";

export interface TrialData {
  [key: string]: string | number | boolean | object | undefined | null;
}

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
  staticTrialSchema = <{ [key: string]: JsonSchemaDataTypeScriptTypes }>{};
  private _fontManager?: FontManager;
  private _imageManager?: ImageManager;
  private _soundManager?: SoundManager;
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
      throw new Error("id is required in GameOptions");
    }
    if (!Uuid.isValid(options.publishUuid)) {
      const providedPublishUuid = options.publishUuid
        ? `Provided publishUuid was ${options.publishUuid}. `
        : "";
      console.warn(
        `Missing or invalid publishUuid in GameOptions. ${providedPublishUuid}To generate a valid UUID, visit a site such as https://www.uuidgenerator.net/version4`,
      );
    }
    this.options = options;
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
    if (options.moduleMetadata) {
      this.moduleMetadata = options.moduleMetadata;
    } else {
      this.moduleMetadata = {
        name: "",
        version: "",
        dependencies: {},
      };
    }
  }

  private createFreeNodesScene() {
    this.freeNodesScene.game = this;
    this.freeNodesScene.needsInitialization = true;

    const freeNodeSceneOptions = {
      name: Constants.FREE_NODES_SCENE_NAME,
      backgroundColor: [255, 255, 255, 0],
      uuid: this.freeNodesScene.uuid,
    };
    const freeNodesSceneNewEvent: M2NodeNewEvent = {
      type: M2EventType.NodeNew,
      target: this.freeNodesScene,
      nodeType: M2NodeType.Scene,
      ...M2c2KitHelpers.createFrameUpdateTimestamps(),
      nodeOptions: freeNodeSceneOptions,
      sequence: m2c2Globals.eventSequence,
    };
    this.eventStore.addEvent(freeNodesSceneNewEvent);
  }

  private getImportedModuleBaseUrl(packageName: string, moduleUrl: string) {
    const regex = new RegExp(`^.*${packageName}[^\\/]*`);
    const matches = moduleUrl.match(regex);
    if (!matches || matches.length === 0) {
      throw new Error(
        `Could not calculate imported assessment package base URL. Package name: ${packageName}, module URL: ${moduleUrl}`,
      );
    }
    return matches[0];
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
        throw new Error(
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
      throw new Error("I18n object is undefined");
    }
    await this.i18n.initialize();
    this.eventStore.addEvent({
      type: "I18nDataReadyEvent",
      target: this.i18n,
      localizationOptions: localizationOptions,
      ...M2c2KitHelpers.createFrameUpdateTimestamps(),
    } as I18nDataReadyEvent);
  }

  async initialize() {
    if (this.options.recordEvents === true) {
      this.eventStore.mode = EventStoreMode.Record;
    }
    this.createFreeNodesScene();

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
        throw new Error(
          `game ${this.id} could not load canvaskit wasm file from ${manifestCanvasKitWasmUrl}`,
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
      freeNodesScene: this.freeNodesScene,
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
        throw new Error(
          `Error ${manifestResponse.status} on GET manifest.json from ${manifestJsonUrl}.`,
        );
      }
    } catch {
      throw new Error(
        `Network error on GET manifest.json from ${manifestJsonUrl}.`,
      );
    }

    try {
      return (await manifestResponse.json()) as Manifest;
    } catch {
      throw new Error(`Error parsing manifest.json from ${manifestJsonUrl}.`);
    }
  }

  get fontManager(): FontManager {
    if (!this._fontManager) {
      throw new Error("fontManager is undefined");
    }
    return this._fontManager;
  }

  set fontManager(fontManager: FontManager) {
    this._fontManager = fontManager;
  }

  get imageManager(): ImageManager {
    if (!this._imageManager) {
      throw new Error("imageManager is undefined");
    }
    return this._imageManager;
  }

  set imageManager(imageManager: ImageManager) {
    this._imageManager = imageManager;
  }

  get soundManager(): SoundManager {
    if (!this._soundManager) {
      throw new Error("soundManager is undefined");
    }
    return this._soundManager;
  }

  set soundManager(soundManager: SoundManager) {
    this._soundManager = soundManager;
  }

  get eventMaterializer(): EventMaterializer {
    if (!this._eventMaterializer) {
      throw new Error("eventMaterializer is undefined");
    }
    return this._eventMaterializer;
  }
  set eventMaterializer(eventMaterializer: EventMaterializer) {
    this._eventMaterializer = eventMaterializer;
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
      throw new Error(
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
      throw new Error("dataStores is undefined");
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
      throw new Error(
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
    const { parameters } = this.options;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.keys(additionalParameters as any).forEach((key) => {
      if (!parameters || !(key in parameters)) {
        console.warn(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          `game ${
            this.options.name
          } does not have a parameter named ${key}. attempt to set parameter ${key} to value ${
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (additionalParameters as any)[key]
          } will be ignored`,
        );
      } else if (this.options.parameters && this.options.parameters[key]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.options.parameters[key].default = (additionalParameters as any)[
          key
        ];
      }
    });
    this.additionalParameters = additionalParameters;
  }

  get canvasKit(): CanvasKit {
    if (!this._canvasKit) {
      throw new Error("canvaskit is undefined");
    }
    return this._canvasKit;
  }

  set canvasKit(canvasKit: CanvasKit) {
    this._canvasKit = canvasKit;
  }

  /** The scene, or its name as a string, to be presented when the game is started. If this is undefined, the game will start with the first scene that has been added */
  public entryScene?: Scene | string;
  public data: GameData = {
    trials: new Array<TrialData>(),
  };
  /** The 0-based index of the current trial */
  public trialIndex = 0;
  private htmlCanvas?: HTMLCanvasElement;
  surface?: Surface;
  private showFps?: boolean;
  private bodyBackgroundColor?: RgbaColor;

  currentScene?: Scene;
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
  private webGlRendererInfo = "";

  canvasCssWidth = 0;
  canvasCssHeight = 0;

  scenes = new Array<Scene>();
  freeNodesScene = new Scene({
    name: Constants.FREE_NODES_SCENE_NAME,
    backgroundColor: [255, 255, 255, 0],
  });
  private incomingSceneTransitions = new Array<SceneTransition>();
  private currentSceneSnapshot?: Image;
  private pendingScreenshot?: PendingScreenshot;

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
    this.freeNodesScene.addChild(node);
  }

  /**
   * @deprecated Use addFreeNode() instead
   */
  addFreeEntity(node: M2Node): void {
    this.addFreeNode(node);
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
    if (typeof node === "string") {
      const child = this.freeNodesScene.children
        .filter((child) => child.name === node)
        .find(Boolean);
      if (!child) {
        throw new Error(
          `cannot remove free node named "${node}" because it is not currently part of the game's free nodes. `,
        );
      }
      this.freeNodesScene.removeChild(child);
    } else {
      this.freeNodesScene.removeChild(node);
    }
  }

  /**
   * @deprecated Use removeFreeNode() instead
   */
  removeFreeEntity(node: M2Node | string): void {
    this.removeFreeNode(node);
  }

  /**
   * Removes all free nodes from the game.
   */
  removeAllFreeNodes(): void {
    while (this.freeNodesScene.children.length) {
      this.freeNodesScene.children.pop();
    }
  }

  /**
   * @deprecated Use removeAllFreeNodes() instead
   */
  removeAllFreeEntities(): void {
    this.removeAllFreeNodes();
  }

  /**
   * Returns array of free nodes that have been added to the game.
   *
   * @returns array of free nodes
   */
  get freeNodes(): Array<M2Node> {
    return this.freeNodesScene.children;
  }

  /**
   * @deprecated Use Game.freeEntities instead
   */
  get freeEntities(): Array<M2Node> {
    return this.freeNodes;
  }

  /**
   * Adds a scene to the game.
   *
   * @remarks A scene, and its children nodes, cannot be presented unless it has been added to the game object.
   *
   * @param scene
   */
  addScene(scene: Scene): void {
    scene.game = this;
    scene.needsInitialization = true;
    this.scenes.push(scene);
    this.addNodeEvents(scene);
  }

  /**
   * Adds events from a node and its children to the game's event store.
   *
   * @remarks This method is first called when a scene is added to the game.
   * If the scene or any of its descendants was constructed or had its
   * properties changed before it was added to the game, these events were
   * stored within the node (because the game event store was not yet
   * available). This method retrieves these events from the node and adds
   * them to the game's event store.
   *
   * @param node - node that contains events to add
   */
  private addNodeEvents(node: M2Node): void {
    this.eventStore.addEvents(node.nodeEvents);
    node.nodeEvents.length = 0;
    for (const child of node.children) {
      this.addNodeEvents(child);
    }
  }

  /**
   * Adds multiple scenes to the game.
   *
   * @param scenes
   */
  addScenes(scenes: Array<Scene>): void {
    scenes.forEach((scene) => {
      this.addScene(scene);
    });
  }

  /**
   * Removes a scene from the game.
   *
   * @param scene - the scene to remove or its name as a string
   */
  removeScene(scene: Scene | string): void {
    if (typeof scene === "object") {
      if (this.scenes.includes(scene)) {
        this.scenes = this.scenes.filter((s) => s !== scene);
      } else {
        throw new Error(
          `cannot remove scene ${scene} from game because the scene is not currently added to the game`,
        );
      }
    } else {
      if (this.scenes.map((s) => s.name).includes(scene)) {
        this.scenes = this.scenes.filter((s) => s.name !== scene);
      } else {
        throw new Error(
          `cannot remove scene named "${scene}" from game because the scene is not currently added to the game`,
        );
      }
    }
  }

  /**
   * Specifies the scene that will be presented upon the next frame draw.
   *
   * @param scene - the scene, its string name, or UUID
   * @param transition
   */
  presentScene(scene: string | Scene, transition?: Transition): void {
    // When we want to present a new scene, we can't immediately switch to the new scene
    // because we could be in the middle of updating the entire scene and its children hierarchy.
    // Thus, we have a queue called "incomingSceneTransitions" that has the next scene and its
    // optional transition animation. We handle the scene transition as the first step of the
    // game loop, before we update the scene and its children hierarchy.
    let incomingScene: Scene | undefined;
    if (typeof scene === "string") {
      incomingScene = this.scenes
        .filter((scene_) => scene_.name === scene)
        .find(Boolean);
      if (incomingScene === undefined) {
        incomingScene = this.scenes
          .filter((scene_) => scene_.uuid === scene)
          .find(Boolean);
      }
      if (incomingScene === undefined) {
        throw new Error(`scene ${scene} not found`);
      }
    } else {
      if (!this.scenes.some((scene_) => scene_ === scene)) {
        throw new Error(
          `scene ${scene} exists, but it has not been added to the game object`,
        );
      }
      incomingScene = scene;
    }
    incomingScene.initialize();
    incomingScene.needsInitialization = false;

    const sceneTransition = new SceneTransition(
      incomingScene,
      transition ?? Transition.none(),
    );
    this.incomingSceneTransitions.push(sceneTransition);
    if (incomingScene.game.bodyBackgroundColor !== undefined) {
      document.body.style.backgroundColor = `rgb(${incomingScene.game.bodyBackgroundColor[0]},${incomingScene.game.bodyBackgroundColor[1]},${incomingScene.game.bodyBackgroundColor[2]},${incomingScene.game.bodyBackgroundColor[3]})`;
    } else {
      document.body.style.backgroundColor = `rgb(${incomingScene.backgroundColor[0]},${incomingScene.backgroundColor[1]},${incomingScene.backgroundColor[2]},${incomingScene.backgroundColor[3]})`;
    }

    let direction: TransitionDirection | undefined;
    if (transition?.type === TransitionType.Slide) {
      direction = (transition as SlideTransition).direction;
    }

    const scenePresentEvent: ScenePresentEvent = {
      type: "ScenePresent",
      target: incomingScene,
      uuid: incomingScene.uuid,
      ...M2c2KitHelpers.createFrameUpdateTimestamps(),
      transitionType: transition?.type ?? TransitionType.None,
      duration: transition?.duration,
      direction: direction,
      easingType: transition?.easing
        ? Easings.toTypeAsString(transition.easing)
        : undefined,
    };
    this.eventStore.addEvent(scenePresentEvent);
    return;
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
      throw new Error(`game parameter ${parameterName} not found`);
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

    this.initData();

    this.setupCanvasKitSurface();
    this.setupFpsFont();
    this.setupCanvasDomEventHandlers();

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
      throw new Error(
        "cannot start game. entry scene has not been added to the game object.",
      );
    }

    this.presentScene(startingScene);
    if (this.surface === undefined) {
      throw new Error("CanvasKit surface is undefined");
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
      this.currentScene = undefined;
      this.eventListeners = new Array<ActivityEventListener<ActivityEvent>>();
      this.freeNodesScene.removeAllChildren();
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
      throw new Error("surface is undefined");
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

    const snapshot = this.takeCurrentSceneSnapshot();
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
    [...this.scenes, this.freeNodesScene].forEach((scene) => {
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
              throw new Error(`image ${imageName} is undefined`);
            }
            canvas.drawImage(image, 0, 0);
          }
        }
      });
    }

    const whitePaint = new this.canvasKit.Paint();
    whitePaint.setColor(this.canvasKit.Color(255, 255, 255, 1));
    if (!this.surface) {
      throw new Error("surface is undefined");
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
    this.nodes
      .filter((e) => e.isDrawable)
      .forEach((e) => (e as unknown as IDrawable).dispose());
    this.fontManager.dispose();
  }

  private initData(): void {
    this.trialIndex = 0;
    this.data = {
      trials: new Array<TrialData>(),
    };
    const trialSchema = this.options.trialSchema ?? {};

    const variables = Object.entries(trialSchema);

    for (const [variableName, propertySchema] of variables) {
      if (
        propertySchema.type !== undefined &&
        !this.propertySchemaDataTypeIsValid(propertySchema.type)
        //!validDataTypes.includes(propertySchema.type)
      ) {
        throw new Error(
          `invalid schema. variable ${variableName} is type ${propertySchema.type}. type must be number, string, boolean, object, or array`,
        );
      }
    }
  }

  private propertySchemaDataTypeIsValid(
    propertySchemaType: JsonSchemaDataType | JsonSchemaDataType[],
  ): boolean {
    const validDataTypes = [
      "string",
      "number",
      "integer",
      "object",
      "array",
      "boolean",
      "null",
    ];
    if (typeof propertySchemaType === "string") {
      return validDataTypes.includes(propertySchemaType);
    }
    let dataTypeIsValid = true;
    if (Array.isArray(propertySchemaType)) {
      propertySchemaType.forEach((element) => {
        if (!validDataTypes.includes(element)) {
          dataTypeIsValid = false;
        }
      });
    } else {
      throw new Error(`Invalid data type: ${propertySchemaType}`);
    }
    return dataTypeIsValid;
  }

  private getDeviceMetadata(): DeviceMetadata {
    const screen = window.screen;
    if (!screen.orientation) {
      // we're likely running unit tests in node, so
      // screen.orientation was not available and not mocked
      return {
        userAgent: navigator.userAgent,
        devicePixelRatio: window.devicePixelRatio,
        screen: {
          availHeight: screen.availHeight,
          availWidth: screen.availWidth,
          colorDepth: screen.colorDepth,
          height: screen.height,
          pixelDepth: screen.pixelDepth,
          width: screen.width,
        },
        webGlRenderer: this.webGlRendererInfo,
      };
    }
    return {
      userAgent: navigator.userAgent,
      devicePixelRatio: window.devicePixelRatio,
      screen: {
        availHeight: screen.availHeight,
        availWidth: screen.availWidth,
        colorDepth: screen.colorDepth,
        height: screen.height,
        orientation: {
          type: screen.orientation.type,
          angle: screen.orientation.angle,
        },
        pixelDepth: screen.pixelDepth,
        width: screen.width,
      },
      webGlRenderer: this.webGlRendererInfo,
    };
  }

  /**
   * Adds data to the game's TrialData object.
   *
   * @remarks The variableName must be previously defined in the trialSchema
   * object passed in during game initialization through
   * {@link GameInitOptions.trialSchema}. The type of the value must match
   * what was defined in the trialSchema, otherwise an error is thrown.
   *
   * @param variableName - variable to be set
   * @param value - value of the variable to set
   */
  addTrialData(
    variableName: string,
    value: JsonSchemaDataTypeScriptTypes,
  ): void {
    if (!this.options.trialSchema) {
      throw new Error(
        "no trial schema were provided in GameOptions. cannot add trial data",
      );
    }

    if (this.data.trials.length < this.trialIndex + 1) {
      const emptyTrial: TrialData = {};
      const variables = Object.entries(this.options.trialSchema);
      for (const [variableName] of variables) {
        emptyTrial[variableName] = null;
      }
      this.data.trials.push({
        document_uuid: Uuid.generate(),
        study_id: this.studyId ?? null,
        study_uuid: this.studyUuid ?? null,
        session_uuid: this.sessionUuid,
        activity_uuid: this.uuid,
        activity_id: this.options.id,
        activity_publish_uuid: this.options.publishUuid,
        activity_version: this.options.version,
        device_timezone:
          Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone ?? "",
        device_timezone_offset_minutes: new Date().getTimezoneOffset(),
        locale: this.i18n?.locale ?? null,
        ...emptyTrial,
        device_metadata: this.getDeviceMetadata(),
      });
    }
    if (!(variableName in this.options.trialSchema)) {
      throw new Error(`trial variable ${variableName} not defined in schema`);
    }

    let expectedDataTypes: string[];

    if (Array.isArray(this.options.trialSchema[variableName].type)) {
      expectedDataTypes = this.options.trialSchema[variableName]
        .type as Array<JsonSchemaDataType>;
    } else {
      expectedDataTypes = [
        this.options.trialSchema[variableName].type as string,
      ];
    }

    let providedDataType = typeof value as string;
    // in JavaScript, typeof an array returns "object"!
    // Therefore, do some extra checking to see if we have an array
    if (providedDataType === "object") {
      if (Object.prototype.toString.call(value) === "[object Array]") {
        providedDataType = "array";
      }
    }
    if (value === undefined || value === null) {
      providedDataType = "null";
    }
    if (
      !expectedDataTypes.includes(providedDataType) &&
      !(
        providedDataType === "number" &&
        Number.isInteger(value) &&
        expectedDataTypes.includes("integer")
      )
    ) {
      throw new Error(
        `type for variable ${variableName} (value: ${value}) is "${providedDataType}". Based on schema for this variable, expected type was "${expectedDataTypes}"`,
      );
    }
    this.data.trials[this.trialIndex][variableName] = value;
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
        throw new Error("trial schema is undefined");
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
    if (!this.options.trialSchema) {
      throw new Error("trial schema is undefined");
    }
    if (this.options.trialSchema[variableName] === undefined) {
      throw new Error(`trial variable ${variableName} not defined in schema`);
    }
    this.staticTrialSchema[variableName] = value;
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
    if (this.data.trials[this.trialIndex]?.["locale"]) {
      this.data.trials[this.trialIndex]["locale"] = this.i18n?.locale ?? null;
    }
    if (this.data.trials[this.trialIndex]?.["device_metadata"]) {
      this.data.trials[this.trialIndex]["device_metadata"] =
        this.getDeviceMetadata();
    }
    if (Object.keys(this.staticTrialSchema).length > 0) {
      this.data.trials[this.trialIndex] = {
        ...this.data.trials[this.trialIndex],
        ...this.staticTrialSchema,
      };
    }

    this.trialIndex++;

    const resultsEvent: ActivityResultsEvent = {
      type: M2EventType.ActivityData,
      ...M2c2KitHelpers.createFrameUpdateTimestamps(),
      target: this,
      /** newData is only the trial that recently completed */
      newData: this.data.trials[this.trialIndex - 1],
      newDataSchema: this.makeNewGameDataSchema(),
      /** data is all the data collected so far in the game */
      data: this.data,
      dataSchema: this.makeGameDataSchema(),
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
   * The m2c2kit engine will automatically include these schema and their
   * values in the trial data.
   */
  private readonly automaticTrialSchema: TrialSchema = {
    study_id: {
      type: ["string", "null"],
      description:
        "The short human-readable text ID of the study (protocol, experiment, or other aggregate) that contains the administration of this activity.",
    },
    study_uuid: {
      type: ["string", "null"],
      format: "uuid",
      description:
        "Unique identifier of the study (protocol, experiment, or other aggregate) that contains the administration of this activity.",
    },
    document_uuid: {
      type: "string",
      format: "uuid",
      description: "Unique identifier for this data document.",
    },
    session_uuid: {
      type: "string",
      format: "uuid",
      description:
        "Unique identifier for all activities in this administration of the session. This identifier changes each time a new session starts.",
    },
    activity_uuid: {
      type: "string",
      format: "uuid",
      description:
        "Unique identifier for all trials in this administration of the activity. This identifier changes each time the activity starts.",
    },
    activity_id: {
      type: "string",
      description: "Human-readable identifier of the activity.",
    },
    activity_publish_uuid: {
      type: "string",
      format: "uuid",
      description:
        "Persistent unique identifier of the activity. This identifier never changes. It can be used to identify the activity across different studies and sessions.",
    },
    activity_version: {
      type: "string",
      description: "Version of the activity.",
    },
    device_timezone: {
      type: "string",
      description:
        "Timezone of the device. Calculated from Intl.DateTimeFormat().resolvedOptions().timeZone.",
    },
    device_timezone_offset_minutes: {
      type: "integer",
      description:
        "Difference in minutes between UTC and device timezone. Calculated from Date.getTimezoneOffset().",
    },
    locale: {
      type: ["string", "null"],
      description:
        "Locale of the trial. null if the activity does not support localization.",
    },
  };

  private makeNewGameDataSchema(): JsonSchema {
    // return schema as JSON Schema draft 2019-09
    const newDataSchema: JsonSchema = {
      description: `A single trial and metadata from the assessment ${this.name}.`,
      $comment: `Activity identifier: ${this.options.id}, version: ${this.options.version}.`,
      $schema: "https://json-schema.org/draft/2019-09/schema",
      type: "object",
      properties: {
        ...this.automaticTrialSchema,
        ...this.options.trialSchema,
        device_metadata: deviceMetadataSchema,
      },
    };
    return newDataSchema;
  }

  private makeGameDataSchema(): JsonSchema {
    const dataSchema: JsonSchema = {
      description: `All trials and metadata from the assessment ${this.name}.`,
      $comment: `Activity identifier: ${this.options.id}, version: ${this.options.version}.`,
      $schema: "https://json-schema.org/draft/2019-09/schema",
      type: "object",
      required: ["trials"],
      properties: {
        trials: {
          type: "array",
          items: { $ref: "#/$defs/trial" },
          description: "All trials from the assessment.",
        },
      },
      $defs: {
        trial: {
          type: "object",
          properties: {
            ...this.automaticTrialSchema,
            ...this.options.trialSchema,
            device_metadata: deviceMetadataSchema,
          },
        },
      },
    };
    return dataSchema;
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
      data: this.data,
      dataSchema: this.makeGameDataSchema(),
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
      data: this.data,
      dataSchema: this.makeGameDataSchema(),
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
        throw new Error("no html canvas tag was found in the html");
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
        throw new Error(
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
      throw new Error("main html canvas is undefined");
    }

    // @ts-expect-error type error when adding property to window object
    window.logWebGl = this.options.logWebGl;
    this.interceptWebGlCalls();

    try {
      this.webGlRendererInfo = WebGlInfo.getRendererString();
    } catch {
      this.webGlRendererInfo = "err";
      WebGlInfo.dispose();
    }

    const surface = this.canvasKit.MakeWebGLCanvasSurface(this.htmlCanvas);
    if (surface === null) {
      throw new Error(
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

  private interceptWebGlCalls() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!this.htmlCanvas.__proto__.m2c2ModifiedGetContext) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.htmlCanvas.__proto__.m2c2ModifiedGetContext = true;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const getContextOriginal = this.htmlCanvas.__proto__.getContext;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.htmlCanvas.__proto__.getContext = function (...args) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (window.logWebGl) {
          console.log(
            `🔼 getContext(${args.map((a) => a.toString()).join(", ")})`,
          );
        }
        const context = getContextOriginal.apply(this, [...args]);

        // if (context.__proto__.createProgram) {
        //   if (!context.__proto__.m2c2ModifiedCreateProgram) {
        //     context.__proto__.m2c2ModifiedCreateProgram = true;
        //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //     // @ts-ignore
        //     const createProgramOriginal = context.__proto__.createProgram;
        //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //     // @ts-ignore
        //     context.__proto__.createProgram = function (...args) {
        //       console.log("🔼 createProgram()");
        //       return createProgramOriginal.apply(this, [...args]);
        //     };
        //   }
        // }

        // if (context.__proto__.shaderSource) {
        //   if (!context.__proto__.m2c2ModifiedShaderSource) {
        //     context.__proto__.m2c2ModifiedShaderSource = true;
        //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //     // @ts-ignore
        //     const shaderSourceOriginal = context.__proto__.shaderSource
        //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //     // @ts-ignore
        //     context.__proto__.shaderSource= function (...args) {
        //       console.log(`🔼 shaderSource(): ${args[1]}`);
        //       return shaderSourceOriginal.apply(this, [...args]);
        //     };
        //   }
        // }

        if (context.__proto__.compileShader) {
          if (!context.__proto__.m2c2ModifiedCompileShader) {
            context.__proto__.m2c2ModifiedCompileShader = true;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const compileShaderOriginal = context.__proto__.compileShader;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            context.__proto__.compileShader = function (...args) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              if (window.logWebGl) {
                const shader = args[0];
                const source = context.getShaderSource(shader);
                console.log(`🔼 compileShader():`);
                console.log(source);
              }
              return compileShaderOriginal.apply(this, [...args]);
            };
          }
        }

        return context;
      };
    }
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

  private setupCanvasDomEventHandlers(): void {
    if (this.htmlCanvas === undefined) {
      throw new Error("main html canvas is undefined");
    }
    // When the callback is executed, within the execution of the callback code
    // we want 'this' to be this game object, not the html canvas to which the event listener is attached.
    // Thus, we use "this.htmlCanvasPointerDownHandler.bind(this)" instead of the usual "htmlCanvasPointerDownHandler"
    this.htmlCanvas.addEventListener(
      "pointerdown",
      this.htmlCanvasPointerDownHandler.bind(this),
    );
    this.htmlCanvas.addEventListener(
      "pointerup",
      this.htmlCanvasPointerUpHandler.bind(this),
    );
    this.htmlCanvas.addEventListener(
      "pointermove",
      this.htmlCanvasPointerMoveHandler.bind(this),
    );
    /**
     * on some (all?) mobile devices, even if the page is has no scrollable
     * content, a touch drag down will partially scroll the screen. This will
     * interfere will some of our events, such as trail making. Thus, we
     * prevent this.
     */
    this.htmlCanvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
    });
    this.htmlCanvas.addEventListener(
      "pointerleave",
      this.htmlCanvasPointerLeaveHandler.bind(this),
    );
  }

  private loop(canvas: Canvas): void {
    if (!this.surface) {
      throw new Error("surface is undefined");
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
        this.incomingSceneTransitions.length === 0 &&
        this.eventStore.mode !== EventStoreMode.Replay
      ) {
        throw new Error("Can not run game without a current or incoming scene");
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

      this.handleIncomingSceneTransitions(this.incomingSceneTransitions);
      this.update();
      this.draw(canvas);

      /**
       * In prior versions, I took a snapshot only when needed, e.g.,
       * after a new scene transition was requested. From performance testing,
       * however, I found that taking a snapshot has negligible impact on
       * performance. It is only encoding the image to bytes, i.e.,
       * image.encodeToBytes(), that is expensive. Thus, we can take a
       * snapshot after every draw, in case we'll need the snapshot.
       *
       * IMPORTANT: snapshots must be deleted when not needed, otherwise we
       * will create a massive memory leak because we are creating them
       * 60 times per second.
       */
      while (this.snapshots.length > 0) {
        this.snapshots.shift()?.delete();
      }
      this.snapshots.push(this.takeCurrentSceneSnapshot());

      /**
       * Free nodes should not slide off the screen during transitions.
       * Thus, draw the free nodes AFTER a screen shot may have
       * taken place.
       */
      this.freeNodesScene.draw(canvas);

      if (this.pendingScreenshot) {
        this.handlePendingScreenshot(this.pendingScreenshot);
        this.pendingScreenshot = undefined;
      }
    }

    this.priorUpdateTime = m2c2Globals.now;
    this.surface.requestAnimationFrame(this.loop.bind(this));
  }

  snapshots = new Array<Image>();

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

  private handleIncomingSceneTransitions(
    incomingSceneTransitions: Array<SceneTransition>,
  ): void {
    if (incomingSceneTransitions.length === 0) {
      return;
    }
    /**
     * Only begin this scene transition if 1) we have a snapshot of the
     * current scene, OR 2) the incoming scene has transition type of
     * None and thus we don't need a snapshot.
     */
    if (
      this.snapshots.length > 0 ||
      incomingSceneTransitions[0].transition.type === TransitionType.None
    ) {
      const incomingSceneTransition = incomingSceneTransitions.shift();
      if (incomingSceneTransition === undefined) {
        // should not happen; checked this.incomingSceneTransitions.length > 0
        throw new Error("no incoming scene transition");
      }

      const incomingScene = incomingSceneTransition.scene;
      const transition = incomingSceneTransition.transition;

      // no transition (type "none"); just present the incoming scene
      if (transition.type === TransitionType.None) {
        if (this.currentScene) {
          this.currentScene._active = false;
        }
        this.currentScene = incomingScene;
        this.currentScene._active = true;
        this.raiseSceneEvent(incomingScene, "SceneSetup");
        this.raiseSceneEvent(incomingScene, "SceneAppear");
        return;
      }

      // outgoingScene isn't the current scene; it's a scene that has a
      // screenshot of the current scene.
      this.currentSceneSnapshot = this.snapshots.shift();
      if (!this.currentSceneSnapshot) {
        throw new Error("No snapshot available for outgoing scene");
      }
      const outgoingScene = this.createOutgoingScene(this.currentSceneSnapshot);
      outgoingScene._active = true;
      if (this.currentScene) {
        this.currentScene._active = false;
      }
      this.currentScene = incomingScene;
      this.currentScene._active = true;
      this.raiseSceneEvent(incomingScene, "SceneSetup");

      // animateSceneTransition() will run the transition animation,
      // mark the outgoing scene as inactive once the animation is done,
      // and also run the incoming scene's onAppear callback
      this.animateSceneTransition(incomingScene, transition, outgoingScene);
    }
  }

  /**
   * Creates a scene that has a screen shot of the current scene.
   *
   * @param outgoingSceneImage - an image of the current scene
   * @returns - the scene with the screen shot
   */
  private createOutgoingScene(outgoingSceneImage: Image) {
    const outgoingScene = new Scene({ name: Constants.OUTGOING_SCENE_NAME });
    // Typically, a scene's width and height are assigned in its
    // initialize() function during update(). But that approach will not
    // work for scene transitions because we need the outgoing scene's width
    // and height for animateSceneTransition(), which will execute before
    // update(). Therefore, to properly position the incoming scene
    // animation, we need to assign the outgoing scene's width and height now.
    outgoingScene.size.width = this.canvasCssWidth;
    outgoingScene.size.height = this.canvasCssHeight;

    this.addScene(outgoingScene);
    const image: M2Image = {
      imageName: Constants.OUTGOING_SCENE_IMAGE_NAME,
      canvaskitImage: outgoingSceneImage,
      width: this.canvasCssWidth,
      height: this.canvasCssHeight,
      status: M2ImageStatus.Ready,
      localize: false,
      isFallback: false,
    };
    this.imageManager.addImage(image);

    // if this._rootScale is not 1, that means we scaled down everything
    // because the display is too small, or we stretched to a larger
    // display. When that happens, the screen shot that was taken of
    // the outgoing scene needs to be positioned and re-scaled:
    // the sprite containing the screen shot is scaled, and the sprite's
    // position is adjusted.
    const spr = new Sprite({
      name: Constants.OUTGOING_SCENE_SPRITE_NAME,
      imageName: Constants.OUTGOING_SCENE_IMAGE_NAME,
      position: {
        x: this.canvasCssWidth / m2c2Globals.rootScale / 2,
        y: this.canvasCssHeight / m2c2Globals.rootScale / 2,
      },
    });
    spr.scale = 1 / m2c2Globals.rootScale;
    outgoingScene.addChild(spr);
    return outgoingScene;
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
      throw new Error(
        `registerPlugin(): plugin ${plugin.id} is not a game plugin. It is a ${plugin.type} plugin.`,
      );
    }
    if (
      this.plugins.includes(plugin) ||
      this.plugins.map((p) => p.id).includes(plugin.id)
    ) {
      throw new Error(
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
    this.updateScenes();
    this.executeAfterUpdatePlugins();
  }

  /**
   * Updates all active scenes and their children.
   */
  private updateScenes() {
    this.scenes
      .filter((scene) => scene._active)
      .forEach((scene) => scene.update());
    this.freeNodesScene.update();
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
    this.scenes
      .filter((scene) => scene._active)
      .forEach((scene) => scene.draw(canvas));

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

  private takeCurrentSceneSnapshot(): Image {
    if (this.surface === undefined) {
      throw new Error("CanvasKit surface is undefined");
    }
    return this.surface.makeImageSnapshot();
  }

  private handlePendingScreenshot(pendingScreenshot: PendingScreenshot) {
    if (!this.surface) {
      throw new Error("no surface");
    }
    let image: Image;
    if (pendingScreenshot.rect.length == 4) {
      const sx = pendingScreenshot.rect[0] * m2c2Globals.canvasScale;
      const sy = pendingScreenshot.rect[1] * m2c2Globals.canvasScale;
      const sw = pendingScreenshot.rect[2] * m2c2Globals.canvasScale;
      const sh = pendingScreenshot.rect[3] * m2c2Globals.canvasScale;
      const scaledRect = [sx, sy, sx + sw, sy + sh];
      image = this.surface.makeImageSnapshot(scaledRect);
    } else {
      image = this.surface.makeImageSnapshot();
    }

    const imageAsPngBytes = image.encodeToBytes();
    pendingScreenshot.promiseResolve(imageAsPngBytes);
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
    if (!this.surface) {
      throw new Error("no canvaskit surface. unable to take screenshot.");
    }

    const missingParametersCount = [sx, sy, sw, sh]
      .map((x) => (x ? 0 : 1) as number)
      .reduce((a, b) => a + b);

    return new Promise((resolve, reject) => {
      switch (missingParametersCount) {
        case 0: {
          if (!sx || !sy || !sw || !sh) {
            // should never get here because case is 0 missing parameters
            reject("missing values in arguments for takeScreenshot()");
            return;
          }
          this.pendingScreenshot = {
            rect: [sx, sy, sw, sh],
            promiseResolve: resolve,
          };
          break;
        }
        case 4: {
          this.pendingScreenshot = {
            rect: [],
            promiseResolve: resolve,
          };
          break;
        }
        default: {
          reject(
            "Exactly 0 or 4 arguments must be supplied to takeScreenshot()",
          );
        }
      }
    });
  }

  private animateSceneTransition(
    incomingScene: Scene,
    transition: Transition,
    outgoingScene: Scene,
  ): void {
    // animateSceneTransition will be called as the first step of the game loop, for reasons described above
    // in presentScene()
    const duration = transition.duration;
    // we set each scene as transitioning because we don't want to start any actions on the incoming
    // scene children until the scene is done transitioning.
    incomingScene._transitioning = true;
    outgoingScene._transitioning = true;

    switch (transition.type) {
      case TransitionType.Slide: {
        const direction = (transition as SlideTransition).direction;
        switch (direction) {
          case TransitionDirection.Left:
            incomingScene.position.x = incomingScene.size.width;
            // Because these actions are part of the scene transition, it's important to set optional parameter
            // runDuringTransition to "true" for the Move and Custom actions.
            // These transitions actions will move the screens and then set the scene's transitioning property
            // to false. It's important to set the transitioning property to false because then the regular,
            // non-transition actions previously set on the scene will then begin.
            // Also, very important to execute currentSceneSnapshot.delete() to prevent memory leaks
            incomingScene.run(
              Action.sequence([
                Action.move({
                  point: { x: 0, y: 0 },
                  duration: duration,
                  easing: transition.easing,
                  runDuringTransition: true,
                }),
                Action.custom({
                  callback: () => {
                    incomingScene._transitioning = false;
                    this.raiseSceneEvent(incomingScene, "SceneAppear");
                    /**
                     * For the transitions, the outgoing scene is a temporary scene
                     * that has a screenshot of the previous scene. Thus it is
                     * ok to remove because it will never be used again.
                     */
                    this.removeScene(Constants.OUTGOING_SCENE_NAME);
                  },
                  runDuringTransition: true,
                }),
              ]),
            );
            outgoingScene.run(
              Action.sequence([
                Action.move({
                  point: { x: -outgoingScene.size.width, y: 0 },
                  duration: duration,
                  easing: transition.easing,
                  runDuringTransition: true,
                }),
                Action.custom({
                  callback: () => {
                    outgoingScene._active = false;
                    outgoingScene._transitioning = false;
                    if (this.currentSceneSnapshot) {
                      this.currentSceneSnapshot.delete();
                    }
                  },
                  runDuringTransition: true,
                }),
              ]),
            );
            break;
          case TransitionDirection.Right:
            incomingScene.position.x = -incomingScene.size.width;
            incomingScene.run(
              Action.sequence([
                Action.move({
                  point: { x: 0, y: 0 },
                  duration: duration,
                  easing: transition.easing,
                  runDuringTransition: true,
                }),
                Action.custom({
                  callback: () => {
                    incomingScene._transitioning = false;
                    this.raiseSceneEvent(incomingScene, "SceneAppear");
                    this.removeScene(Constants.OUTGOING_SCENE_NAME);
                  },
                  runDuringTransition: true,
                }),
              ]),
            );
            outgoingScene.run(
              Action.sequence([
                Action.move({
                  point: { x: outgoingScene.size.width, y: 0 },
                  duration: duration,
                  easing: transition.easing,
                  runDuringTransition: true,
                }),
                Action.custom({
                  callback: () => {
                    outgoingScene._active = false;
                    outgoingScene._transitioning = false;
                    if (this.currentSceneSnapshot) {
                      this.currentSceneSnapshot.delete();
                    }
                  },
                  runDuringTransition: true,
                }),
              ]),
            );
            break;
          case TransitionDirection.Up:
            incomingScene.position.y = incomingScene.size.height;
            incomingScene.run(
              Action.sequence([
                Action.move({
                  point: { x: 0, y: 0 },
                  duration: duration,
                  easing: transition.easing,
                  runDuringTransition: true,
                }),
                Action.custom({
                  callback: () => {
                    incomingScene._transitioning = false;
                    this.raiseSceneEvent(incomingScene, "SceneAppear");
                    this.removeScene(Constants.OUTGOING_SCENE_NAME);
                  },
                  runDuringTransition: true,
                }),
              ]),
            );
            outgoingScene.run(
              Action.sequence([
                Action.move({
                  point: { x: 0, y: -outgoingScene.size.height },
                  duration: duration,
                  easing: transition.easing,
                  runDuringTransition: true,
                }),
                Action.custom({
                  callback: () => {
                    outgoingScene._active = false;
                    outgoingScene._transitioning = false;
                    if (this.currentSceneSnapshot) {
                      this.currentSceneSnapshot.delete();
                    }
                  },
                  runDuringTransition: true,
                }),
              ]),
            );
            break;
          case TransitionDirection.Down:
            incomingScene.position.y = -incomingScene.size.height;
            incomingScene.run(
              Action.sequence([
                Action.move({
                  point: { x: 0, y: 0 },
                  duration: duration,
                  easing: transition.easing,
                  runDuringTransition: true,
                }),
                Action.custom({
                  callback: () => {
                    incomingScene._transitioning = false;
                    this.raiseSceneEvent(incomingScene, "SceneAppear");
                    this.removeScene(Constants.OUTGOING_SCENE_NAME);
                  },
                  runDuringTransition: true,
                }),
              ]),
            );
            outgoingScene.run(
              Action.sequence([
                Action.move({
                  point: { x: 0, y: outgoingScene.size.height },
                  duration: duration,
                  easing: transition.easing,
                  runDuringTransition: true,
                }),
                Action.custom({
                  callback: () => {
                    outgoingScene._active = false;
                    outgoingScene._transitioning = false;
                    if (this.currentSceneSnapshot) {
                      this.currentSceneSnapshot.delete();
                    }
                  },
                  runDuringTransition: true,
                }),
              ]),
            );
            break;
          default:
            throw new Error("unknown transition direction");
        }
        break;
      }
      default:
        throw new Error("unknown transition type");
    }
  }

  private drawFps(canvas: Canvas): void {
    canvas.save();
    const drawScale = m2c2Globals.canvasScale;
    canvas.scale(1 / drawScale, 1 / drawScale);
    if (!this.fpsTextFont || !this.fpsTextPaint) {
      throw new Error("fps font or paint is undefined");
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
      throw new Error(
        `could not create event listener. node with name ${nodeName} could not be found in the game node tree`,
      );
    }

    if (!Object.values(M2EventType).includes(type)) {
      throw new Error(
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
    [...this.scenes, this.freeNodesScene].forEach((scene) =>
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
   * Receives callback from DOM PointerDown event
   *
   * @param domPointerEvent - PointerEvent from the DOM
   * @returns
   */
  private htmlCanvasPointerDownHandler(domPointerEvent: PointerEvent): void {
    domPointerEvent.preventDefault();
    const scene = this.currentScene;
    if (!scene || !this.sceneCanReceiveUserInteraction(scene)) {
      return;
    }

    if (!this.htmlCanvas) {
      throw new Error("main html canvas is undefined");
    }
    const domPointerDownEvent: DomPointerDownEvent = {
      type: "DomPointerDown",
      target: this.htmlCanvas,
      x: domPointerEvent.offsetX / m2c2Globals.rootScale,
      y: domPointerEvent.offsetY / m2c2Globals.rootScale,
      ...M2c2KitHelpers.createTimestamps(),
    };
    this.eventStore.addEvent(domPointerDownEvent);

    const nodeEvent: M2NodeEvent = {
      target: scene,
      type: M2EventType.PointerDown,
      handled: false,
      ...M2c2KitHelpers.createTimestamps(),
    };
    this.processDomPointerDown(scene, nodeEvent, domPointerEvent);
    this.processDomPointerDown(this.freeNodesScene, nodeEvent, domPointerEvent);
  }

  private htmlCanvasPointerUpHandler(domPointerEvent: PointerEvent): void {
    domPointerEvent.preventDefault();
    const scene = this.currentScene;
    if (!scene || !this.sceneCanReceiveUserInteraction(scene)) {
      return;
    }
    const nodeEvent: M2NodeEvent = {
      target: scene,
      type: M2EventType.PointerUp,
      handled: false,
      ...M2c2KitHelpers.createTimestamps(),
    };
    this.processDomPointerUp(scene, nodeEvent, domPointerEvent);
    this.processDomPointerUp(this.freeNodesScene, nodeEvent, domPointerEvent);
  }

  private htmlCanvasPointerMoveHandler(domPointerEvent: PointerEvent): void {
    domPointerEvent.preventDefault();
    const scene = this.currentScene;
    if (!scene || !this.sceneCanReceiveUserInteraction(scene)) {
      return;
    }
    const nodeEvent: M2NodeEvent = {
      target: scene,
      type: M2EventType.PointerMove,
      handled: false,
      ...M2c2KitHelpers.createTimestamps(),
    };
    this.processDomPointerMove(scene, nodeEvent, domPointerEvent);
    this.processDomPointerMove(this.freeNodesScene, nodeEvent, domPointerEvent);
  }

  private htmlCanvasPointerLeaveHandler(domPointerEvent: PointerEvent): void {
    if (!this.currentScene) {
      return;
    }

    domPointerEvent.preventDefault();
    const scene = this.currentScene;
    if (!scene || !this.sceneCanReceiveUserInteraction(scene)) {
      return;
    }
    const nodeEvent: M2NodeEvent = {
      target: scene,
      type: M2EventType.PointerLeave,
      handled: false,
      ...M2c2KitHelpers.createTimestamps(),
    };
    this.processDomPointerLeave(scene, nodeEvent, domPointerEvent);
    this.processDomPointerLeave(
      this.freeNodesScene,
      nodeEvent,
      domPointerEvent,
    );
  }

  /**
   * Determines if/how m2c2kit nodes respond to the DOM PointerDown event
   *
   * @param node - node that might be affected by the DOM PointerDown event
   * @param nodeEvent
   * @param domPointerEvent
   */
  private processDomPointerDown(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domPointerEvent: PointerEvent,
  ): void {
    if (nodeEvent.handled) {
      return;
    }

    // note: offsetX and offsetY are relative to the HTML canvas element
    if (
      node.isUserInteractionEnabled &&
      this.IsCanvasPointWithinNodeBounds(
        node,
        domPointerEvent.offsetX,
        domPointerEvent.offsetY,
      )
    ) {
      node.pressed = true;
      node.pressedAndWithinHitArea = true;
      node.pressedInitialPointerOffset = {
        x: domPointerEvent.offsetX,
        y: domPointerEvent.offsetY,
      };
      this.raiseM2PointerDownEvent(node, nodeEvent, domPointerEvent);
      this.raiseTapDownEvent(node, nodeEvent, domPointerEvent);
    }
    if (node.children) {
      node.children
        // a hidden node (and its children) can't receive taps,
        // even if isUserInteractionEnabled is true
        .filter((node) => !node.hidden)
        // only drawables have z-position
        .filter((node) => node.isDrawable)
        // process taps on children by zPosition order
        .sort(
          (a, b) =>
            (b as unknown as IDrawable).zPosition -
            (a as unknown as IDrawable).zPosition,
        )
        .forEach((node) =>
          this.processDomPointerDown(node, nodeEvent, domPointerEvent),
        );
    }
  }

  private processDomPointerUp(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domPointerEvent: PointerEvent,
  ): void {
    if (nodeEvent.handled) {
      return;
    }

    if (node.dragging) {
      node.dragging = false;
      node.pressed = false;
      node.pressedAndWithinHitArea = false;
      this.raiseM2DragEndEvent(node, nodeEvent, domPointerEvent);
      nodeEvent.handled = true;
      return;
    }

    if (
      node.isUserInteractionEnabled &&
      node.pressed &&
      node.pressedAndWithinHitArea
    ) {
      /**
       * released pointer within hit area after pointer had been earlier
       * been pressed in the hit area and never left the hit area
       */
      node.pressed = false;
      node.pressedAndWithinHitArea = false;
      this.raiseTapUpEvent(node, nodeEvent, domPointerEvent);
      this.raiseTapUpAny(node, nodeEvent, domPointerEvent);
      this.raiseM2PointerUpEvent(node, nodeEvent, domPointerEvent);
    } else if (
      node.isUserInteractionEnabled &&
      node.pressed &&
      node.pressedAndWithinHitArea == false
    ) {
      /**
       * released pointer anywhere after pointer had been earlier
       * been pressed in the hit area
       */
      node.pressed = false;
      node.pressedAndWithinHitArea = false;
      this.raiseTapUpAny(node, nodeEvent, domPointerEvent);
    } else if (
      node.isUserInteractionEnabled &&
      this.IsCanvasPointWithinNodeBounds(
        node,
        domPointerEvent.offsetX,
        domPointerEvent.offsetY,
      )
    ) {
      /**
       * released pointer in the hit area
       */
      node.pressed = false;
      node.pressedAndWithinHitArea = false;
      this.raiseM2PointerUpEvent(node, nodeEvent, domPointerEvent);
    }

    if (node.children) {
      node.children
        // a hidden node (and its children) can't receive taps,
        // even if isUserInteractionEnabled is true
        .filter((node) => !node.hidden)
        // only drawables have z-position
        .filter((node) => node.isDrawable)
        // process taps on children by zPosition order
        .sort(
          (a, b) =>
            (b as unknown as IDrawable).zPosition -
            (a as unknown as IDrawable).zPosition,
        )
        .forEach((node) =>
          this.processDomPointerUp(node, nodeEvent, domPointerEvent),
        );
    }
  }

  private processDomPointerMove(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domPointerEvent: PointerEvent,
  ): void {
    if (nodeEvent.handled) {
      return;
    }

    if (node.isUserInteractionEnabled && node.draggable && node.pressed) {
      let firstMoveOfDrag = false;
      let deltaX: number;
      let deltaY: number;
      if (node.dragging === false) {
        node.dragging = true;
        firstMoveOfDrag = true;
        deltaX = domPointerEvent.offsetX - node.pressedInitialPointerOffset.x;
        deltaY = domPointerEvent.offsetY - node.pressedInitialPointerOffset.y;
      } else {
        deltaX = domPointerEvent.offsetX - node.draggingLastPointerOffset.x;
        deltaY = domPointerEvent.offsetY - node.draggingLastPointerOffset.y;
      }
      node.position.x += deltaX;
      node.position.y += deltaY;
      node.draggingLastPointerOffset = {
        x: domPointerEvent.offsetX,
        y: domPointerEvent.offsetY,
      };
      nodeEvent.handled = true;
      if (firstMoveOfDrag) {
        this.raiseM2DragStartEvent(node, nodeEvent, domPointerEvent);
      } else {
        this.raiseM2DragEvent(node, nodeEvent, domPointerEvent);
      }
      return;
    }

    if (
      node.isUserInteractionEnabled &&
      node.pressed &&
      node.pressedAndWithinHitArea &&
      !this.IsCanvasPointWithinNodeBounds(
        node,
        domPointerEvent.offsetX,
        domPointerEvent.offsetY,
      )
    ) {
      node.pressedAndWithinHitArea = false;
      this.raiseTapLeaveEvent(node, nodeEvent, domPointerEvent);
    }
    if (
      node.isUserInteractionEnabled &&
      this.IsCanvasPointWithinNodeBounds(
        node,
        domPointerEvent.offsetX,
        domPointerEvent.offsetY,
      )
    ) {
      this.raiseM2PointerMoveEvent(node, nodeEvent, domPointerEvent);
      node.withinHitArea = true;
    }
    if (
      node.isUserInteractionEnabled &&
      node.withinHitArea &&
      !this.IsCanvasPointWithinNodeBounds(
        node,
        domPointerEvent.offsetX,
        domPointerEvent.offsetY,
      )
    ) {
      node.withinHitArea = false;
      this.raiseM2PointerLeaveEvent(node, nodeEvent, domPointerEvent);
    }

    if (node.children) {
      node.children
        // a hidden node (and its children) can't receive taps,
        // even if isUserInteractionEnabled is true
        .filter((node) => !node.hidden)
        // only drawables have z-position
        .filter((node) => node.isDrawable)
        // process taps on children by zPosition order
        .sort(
          (a, b) =>
            (b as unknown as IDrawable).zPosition -
            (a as unknown as IDrawable).zPosition,
        )
        .forEach((node) =>
          this.processDomPointerMove(node, nodeEvent, domPointerEvent),
        );
    }
  }

  private processDomPointerLeave(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domPointerEvent: PointerEvent,
  ): void {
    if (nodeEvent.handled) {
      return;
    }

    /**
     * Adjust dragging behavior when the pointer leaves the canvas.
     * This is necessary because the pointerup event is not fired when the
     * pointer leaves the canvas. On desktop, this means that the user might
     * lift the pointer outside the canvas, but the node will still be
     * dragged when the pointer is moved back into the canvas.
     */
    if (node.dragging) {
      const m2Event: M2NodeEvent = {
        target: node,
        type: M2EventType.DragEnd,
        handled: false,
        ...M2c2KitHelpers.createTimestamps(),
      };

      node.dragging = false;
      node.pressed = false;
      node.pressedAndWithinHitArea = false;
      this.raiseM2DragEndEvent(node, m2Event, domPointerEvent);
      return;
    }

    // note: offsetX and offsetY are relative to the HTML canvas element
    if (
      node.isUserInteractionEnabled &&
      node.pressed &&
      node.pressedAndWithinHitArea &&
      !this.IsCanvasPointWithinNodeBounds(
        node,
        domPointerEvent.offsetX,
        domPointerEvent.offsetY,
      )
    ) {
      node.pressedAndWithinHitArea = false;
      this.raiseTapLeaveEvent(node, nodeEvent, domPointerEvent);
    }

    if (
      node.isUserInteractionEnabled &&
      node.withinHitArea &&
      !this.IsCanvasPointWithinNodeBounds(
        node,
        domPointerEvent.offsetX,
        domPointerEvent.offsetY,
      )
    ) {
      node.withinHitArea = false;
      this.raiseM2PointerLeaveEvent(node, nodeEvent, domPointerEvent);
    }

    if (node.children) {
      node.children
        // a hidden node (and its children) can't receive taps,
        // even if isUserInteractionEnabled is true
        .filter((node) => !node.hidden)
        // only drawables have z-position
        .filter((node) => node.isDrawable)
        // process taps on children by zPosition order
        .sort(
          (a, b) =>
            (b as unknown as IDrawable).zPosition -
            (a as unknown as IDrawable).zPosition,
        )
        .forEach((node) =>
          this.processDomPointerLeave(node, nodeEvent, domPointerEvent),
        );
    }
  }

  private raiseM2PointerDownEvent(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domPointerEvent: PointerEvent,
  ): void {
    nodeEvent.target = node;
    nodeEvent.type = M2EventType.PointerDown;
    this.raiseEventOnListeningNodes<M2PointerEvent>(
      node,
      nodeEvent,
      domPointerEvent,
    );
  }

  private raiseTapDownEvent(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domPointerEvent: PointerEvent,
  ): void {
    nodeEvent.target = node;
    nodeEvent.type = M2EventType.TapDown;
    this.raiseEventOnListeningNodes<TapEvent>(node, nodeEvent, domPointerEvent);
  }

  private raiseTapLeaveEvent(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domPointerEvent: PointerEvent,
  ): void {
    nodeEvent.target = node;
    nodeEvent.type = M2EventType.TapLeave;
    this.raiseEventOnListeningNodes<TapEvent>(node, nodeEvent, domPointerEvent);
  }

  private raiseM2PointerUpEvent(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domPointerEvent: PointerEvent,
  ): void {
    nodeEvent.target = node;
    nodeEvent.type = M2EventType.PointerUp;
    this.raiseEventOnListeningNodes<M2PointerEvent>(
      node,
      nodeEvent,
      domPointerEvent,
    );
  }

  private raiseTapUpEvent(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domPointerEvent: PointerEvent,
  ): void {
    nodeEvent.target = node;
    nodeEvent.type = M2EventType.TapUp;
    this.raiseEventOnListeningNodes<TapEvent>(node, nodeEvent, domPointerEvent);
  }

  private raiseTapUpAny(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domPointerEvent: PointerEvent,
  ): void {
    nodeEvent.target = node;
    nodeEvent.type = M2EventType.TapUpAny;
    this.raiseEventOnListeningNodes<TapEvent>(node, nodeEvent, domPointerEvent);
  }

  private raiseM2PointerMoveEvent(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domPointerEvent: PointerEvent,
  ): void {
    nodeEvent.target = node;
    nodeEvent.type = M2EventType.PointerMove;
    this.raiseEventOnListeningNodes<M2PointerEvent>(
      node,
      nodeEvent,
      domPointerEvent,
    );
  }

  private raiseM2PointerLeaveEvent(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domPointerEvent: PointerEvent,
  ): void {
    nodeEvent.target = node;
    nodeEvent.type = M2EventType.PointerLeave;
    this.raiseEventOnListeningNodes<M2PointerEvent>(
      node,
      nodeEvent,
      domPointerEvent,
    );
  }

  private raiseM2DragStartEvent(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domPointerEvent: PointerEvent,
  ): void {
    nodeEvent.target = node;
    nodeEvent.type = M2EventType.DragStart;
    this.raiseEventOnListeningNodes<M2DragEvent>(
      node,
      nodeEvent,
      domPointerEvent,
    );
  }

  private raiseM2DragEvent(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domPointerEvent: PointerEvent,
  ): void {
    nodeEvent.target = node;
    nodeEvent.type = M2EventType.Drag;
    this.raiseEventOnListeningNodes<M2DragEvent>(
      node,
      nodeEvent,
      domPointerEvent,
    );
  }

  private raiseM2DragEndEvent(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domPointerEvent: PointerEvent,
  ): void {
    nodeEvent.target = node;
    nodeEvent.type = M2EventType.DragEnd;
    this.raiseEventOnListeningNodes<M2DragEvent>(
      node,
      nodeEvent,
      domPointerEvent,
    );
  }

  private raiseSceneEvent(
    scene: Scene,
    eventType: "SceneSetup" | "SceneAppear",
  ): void {
    const event: M2NodeEvent = {
      target: scene,
      type: eventType,
      ...M2c2KitHelpers.createFrameUpdateTimestamps(),
    };
    scene.eventListeners
      .filter((listener) => listener.type === eventType)
      .forEach((listener) => listener.callback(event));
  }

  private calculatePointWithinNodeFromDomPointerEvent(
    node: M2Node,
    domPointerEvent: PointerEvent,
  ): Point {
    let width = node.size.width;
    let height = node.size.height;

    if (
      node.type === M2NodeType.Shape &&
      (node as Shape).shapeType === ShapeType.Circle
    ) {
      const radius = (node as Shape).circleOfRadius;
      if (!radius) {
        throw "circleOfRadius is undefined";
      }
      width = radius * 2;
      height = radius * 2;
    }

    let x = domPointerEvent.offsetX;
    let y = domPointerEvent.offsetY;
    const bb = M2c2KitHelpers.calculateNodeAbsoluteBoundingBox(node);

    /**
     * If the node or any of its ancestors have been rotated, we need to
     * adjust the point reported on the DOM to account for the rotation. We
     * do this by calculating the rotation transforms that were used to
     * display the rotated node and applying the reverse rotation transforms
     * to the DOM point.
     */
    if (M2c2KitHelpers.nodeOrAncestorHasBeenRotated(node)) {
      const transforms = M2c2KitHelpers.calculateRotationTransforms(
        node as M2Node & IDrawable,
      );
      transforms.forEach((transform) => {
        const rotatedPoint = M2c2KitHelpers.rotatePoint(
          { x, y },
          // take negative because we are applying the reverse rotation
          -transform.radians,
          transform.center,
        );
        x = rotatedPoint.x;
        y = rotatedPoint.y;
      });
    }

    const relativeX = ((x - bb.xMin) / (bb.xMax - bb.xMin)) * width;
    const relativeY = ((y - bb.yMin) / (bb.yMax - bb.yMin)) * height;
    return { x: relativeX, y: relativeY };
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

  private raiseEventOnListeningNodes<T extends M2NodeEvent>(
    node: M2Node,
    nodeEvent: M2NodeEvent,
    domEvent: Event,
  ): void {
    node.eventListeners
      .filter((listener) => listener.type === nodeEvent.type)
      .forEach((listener) => {
        if (listener.nodeUuid === node.uuid) {
          (nodeEvent as T).target = node;

          switch (nodeEvent.type) {
            case M2EventType.PointerDown:
            case M2EventType.PointerMove:
            case M2EventType.PointerUp:
            case M2EventType.PointerLeave:
              (nodeEvent as M2PointerEvent).point =
                this.calculatePointWithinNodeFromDomPointerEvent(
                  node,
                  domEvent as PointerEvent,
                );
              (nodeEvent as M2PointerEvent).buttons = (
                domEvent as PointerEvent
              ).buttons;
              listener.callback(nodeEvent as T);
              break;
            case M2EventType.TapDown:
            case M2EventType.TapUp:
            case M2EventType.TapUpAny:
            case M2EventType.TapLeave:
              (nodeEvent as TapEvent).point =
                this.calculatePointWithinNodeFromDomPointerEvent(
                  node,
                  domEvent as PointerEvent,
                );

              (nodeEvent as TapEvent).buttons = (
                domEvent as PointerEvent
              ).buttons;

              listener.callback(nodeEvent as T);
              break;
            case M2EventType.DragStart:
            case M2EventType.Drag:
            case M2EventType.DragEnd:
              (nodeEvent as M2DragEvent).position = {
                x: node.position.x,
                y: node.position.y,
              };
              (nodeEvent as M2DragEvent).buttons = (
                domEvent as PointerEvent
              ).buttons;
              listener.callback(nodeEvent as T);
              break;
          }
          if (!node.suppressEvents) {
            this.eventStore.addEvent(nodeEvent);
          }
        }
      });
  }

  private sceneCanReceiveUserInteraction(scene: Scene): boolean {
    if (scene._active && scene._transitioning === false) {
      // allow interaction only on scene that is part of the session's
      // current game
      // AND don't allow interaction when scene is transitioning. If, during scene transition,
      // the user taps a button that starts another scene transition, the scene transition
      // state will be corrupted. We can have only one active scene transition.
      return true;
    }
    return false;
  }

  /**
   *
   * Checks if the given canvas point is within the node's bounds.
   *
   * @param node - node to check bounds for
   * @param x - x coordinate of the canvas point
   * @param y - y coordinate of the canvas point
   * @returns true if x, y point is within the node's bounds
   */
  private IsCanvasPointWithinNodeBounds(
    node: M2Node,
    x: number,
    y: number,
  ): boolean {
    if (!node.isDrawable) {
      throw "only drawable nodes can receive pointer events";
    }
    if (
      node.type === M2NodeType.Shape &&
      (node as Shape).shapeType === ShapeType.Circle
    ) {
      const bb = M2c2KitHelpers.calculateNodeAbsoluteBoundingBox(node);
      const radius = (node as Shape).circleOfRadius;
      if (!radius) {
        throw "circleOfRadius is undefined";
      }
      const center = {
        x: bb.xMin + radius * node.absoluteScale,
        y: bb.yMin + radius * node.absoluteScale,
      };
      const distance = Math.sqrt(
        Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2),
      );
      return distance <= radius * node.absoluteScale;
    }

    if (node.size.width === 0 || node.size.height === 0) {
      // console.warn(
      //   `warning: node ${node.toString()} has isUserInteractionEnabled = true, but has no interactable area. Size is ${
      //     node.size.width
      //   }, ${node.size.height}`
      // );
      return false;
    }

    if (node.type === M2NodeType.TextLine && isNaN(node.size.width)) {
      // console.warn(
      //   `warning: node ${node.toString()} is a TextLine with width = NaN. A TextLine must have its width manually set.`
      // );
      return false;
    }

    const points = M2c2KitHelpers.calculateRotatedPoints(
      node as unknown as IDrawable & M2Node,
    );
    return (
      node.isUserInteractionEnabled &&
      M2c2KitHelpers.isPointInsideRectangle({ x, y }, points)
    );
  }
}
