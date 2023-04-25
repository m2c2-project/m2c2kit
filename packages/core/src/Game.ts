import "./Globals";
import { Activity } from "./Activity";
import { ActivityType } from "./ActivityType";
import { CanvasKit, Canvas, Surface, Font, Image, Paint } from "canvaskit-wasm";
import { Constants } from "./Constants";
import { EventBase } from "./EventBase";
import { TapEvent } from "./TapEvent";
import { M2PointerEvent } from "./M2PointerEvent";
import { EntityEvent } from "./EntityEvent";
import { IDrawable } from "./IDrawable";
import { Entity } from "./Entity";
import { EntityType } from "./EntityType";
import { RgbaColor } from "./RgbaColor";
import { Sprite } from "./Sprite";
import { Shape } from "./Shape";
import { Action } from "./Action";
import { LoadedImage } from "./LoadedImage";
import { Scene } from "./Scene";
import {
  SceneTransition,
  Transition,
  TransitionType,
  SlideTransition,
  TransitionDirection,
} from "./Transition";
import { GameOptions } from "./GameOptions";
import { Session } from "./Session";
import { GameData } from "./GameData";
import { Uuid } from "./Uuid";
import { EventType } from "./EventBase";
import { PendingScreenshot } from "./PendingScreenshot";
import { Timer } from "./Timer";
import { GameParameters } from "./GameParameters";
import { JsonSchema, JsonSchemaDataType } from "./JsonSchema";
import { DeviceMetadata, deviceMetadataSchema } from "./DeviceMetadata";
import { TrialSchema } from "./TrialSchema";
import { GameMetric } from "./GameMetrics";
import { Point } from "./Point";
import { WebGlInfo } from "./WebGlInfo";
import { I18n } from "./I18n";
import { Translations } from "./Translations";
import { LocalizationOptions } from "./LocalizationOptions";
import { WebColors } from "./WebColors";
import { DomHelpers } from "./DomHelpers";
import { CanvasKitHelpers } from "./CanvasKitHelpers";
import { IDataStore } from "./IDataStore";
import { ShapeType } from "./ShapeType";
import { M2DragEvent } from "./M2DragEvent";

interface BoundingBox {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}
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
  _session?: Session;
  uuid = Uuid.generate();
  name: string;
  id: string;
  options: GameOptions;
  beginTimestamp = NaN;
  beginIso8601Timestamp = "";
  private gameMetrics: Array<GameMetric> = new Array<GameMetric>();
  private fpsMetricReportThreshold: number;
  private maximumRecordedActivityMetrics: number;
  private stepCount = 0;
  private steppingNow = 0;
  i18n?: I18n;
  private warmupFunctionQueue = new Array<WarmupFunctionQueue>();
  private loaderElementsRemoved = false;
  private _dataStore?: IDataStore;
  additionalParameters?: unknown;

  /**
   * The base class for all games. New games should extend this class.
   *
   * @param options - {@link GameOptions}
   */
  constructor(options: GameOptions) {
    this.options = options;
    this.name = options.name;
    this.id = options.id;
    this.freeEntitiesScene.game = this;
    this.freeEntitiesScene.needsInitialization = true;
    this.fpsMetricReportThreshold =
      options.fpsMetricReportThreshold ?? Constants.FPS_METRIC_REPORT_THRESHOLD;
    this.maximumRecordedActivityMetrics =
      options.maximumRecordedActivityMetrics ??
      Constants.MAXIMUM_RECORDED_ACTIVITY_METRICS;
    this.addLocalizationParametersToGameParameters();
  }

  private addLocalizationParametersToGameParameters(): void {
    this.options.parameters = {
      ...this.options.parameters,
      ...I18n.makeLocalizationParameters(),
    };
  }

  async init() {
    if (this.isLocalizationRequested()) {
      const options = this.getLocalizationOptionsFromGameParameters();
      this.i18n = new I18n(options);
    }
  }

  /**
   * Saves an item to the activity's key-value store.
   *
   * @remarks The underlying persistence provider of the key-value store must
   * be previously set in the activity's `Session` before use:
   * ```
   * const db: IDataStore = new LocalDatabase();
   * session.dataStore = db;
   * session.init();
   * ```
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
    globalStore = false
  ): Promise<string> {
    const k = globalStore ? key : this.id.concat(":", key);
    const activityId = globalStore ? "" : this.id;
    return this.dataStore.setItem(k, value, activityId);
  }

  /**
   * Gets an item value from the activity's key-value store.
   *
   * @remarks The underlying persistence provider of the key-value store must
   * be previously set in the activity's `Session` before use:
   * ```
   * const db: IDataStore = new LocalDatabase();
   * session.dataStore = db;
   * session.init();
   * ```
   * @param key - item key
   * @param globalStore - if true, treat the item as "global" and not
   * associated with a specific activity; global items can be accessed
   * by any activity. Default is false.
   * @returns value of the item
   */
  storeGetItem<T extends string | number | boolean | object | undefined | null>(
    key: string,
    globalStore = false
  ): Promise<T> {
    const k = globalStore ? key : this.id.concat(":", key);
    return this.dataStore.getItem<T>(k);
  }

  /**
   * Deletes an item value from the activity's key-value store.
   *
   * @remarks The underlying persistence provider of the key-value store must
   * be previously set in the activity's `Session` before use:
   * ```
   * const db: IDataStore = new LocalDatabase();
   * session.dataStore = db;
   * session.init();
   * ```
   * @param key - item key
   * @param globalStore - if true, treat the item as "global" and not
   * associated with a specific activity; global items can be accessed
   * by any activity. Default is false.
   */
  storeDeleteItem(key: string, globalStore = false) {
    const k = globalStore ? key : this.id.concat(":", key);
    return this.dataStore.deleteItem(k);
  }

  /**
   * Deletes all items from the activity's key-value store.
   *
   * @remarks The underlying persistence provider of the key-value store must
   * be previously set in the activity's `Session` before use:
   * ```
   * const db: IDataStore = new LocalDatabase();
   * session.dataStore = db;
   * session.init();
   * ```
   */
  storeClearItems() {
    return this.dataStore.clearItemsByActivityId(this.id);
  }

  /**
   * Returns keys of all items in the activity's key-value store.
   *
   * @remarks The underlying persistence provider of the key-value store must
   * be previously set in the activity's `Session` before use:
   * ```
   * const db: IDataStore = new LocalDatabase();
   * session.dataStore = db;
   * session.init();
   * ```
   * @param globalStore - if true, treat the item as "global" and not
   * associated with a specific activity; global items can be accessed
   * by any activity. Default is false.
   */
  storeItemsKeys(globalStore = false) {
    return this.dataStore.itemsKeysByActivityId(globalStore ? "" : this.id);
  }

  /**
   * Determines if a key exists in the activity's key-value store.
   *
   * @remarks The underlying persistence provider of the key-value store must
   * be previously set in the activity's `Session` before use:
   * ```
   * const db: IDataStore = new LocalDatabase();
   * session.dataStore = db;
   * session.init();
   * ```
   * @param key - item key
   * @param globalStore - if true, treat the item as "global" and not
   * associated with a specific activity; global items can be accessed
   * by any activity. Default is false.
   * @returns true if the key exists, false otherwise
   */
  storeItemExists(key: string, globalStore = false) {
    const k = globalStore ? key : this.id.concat(":", key);
    return this.dataStore.itemExists(k);
  }

  get dataStore(): IDataStore {
    if (!this._dataStore) {
      throw new Error("dataStore is undefined");
    }
    return this._dataStore;
  }

  set dataStore(dataStore: IDataStore) {
    this._dataStore = dataStore;
  }

  private getLocalizationOptionsFromGameParameters() {
    const locale = this.getParameter<string>("locale");
    const fallbackLocale = this.getParameterOrFallback<string, undefined>(
      "fallback_locale",
      undefined
    );
    const missingTranslationColor = this.getParameterOrFallback<
      RgbaColor,
      undefined
    >("missing_translation_font_color", undefined);
    const additionalTranslations = this.getParameterOrFallback<
      Translations,
      undefined
    >("translations", undefined);
    const translations = this.options.translations;
    return <LocalizationOptions>{
      locale,
      fallbackLocale,
      missingTranslationFontColor: missingTranslationColor,
      additionalTranslations,
      translations,
    };
  }

  private isLocalizationRequested(): boolean {
    const locale = this.getParameterOrFallback<string, undefined>(
      "locale",
      undefined
    );

    if (locale === "") {
      throw new Error(
        "Empty string in locale. Leave locale undefined or null to prevent localization."
      );
    }
    return locale !== undefined && locale !== null;
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
          } will be ignored`
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

  get session(): Session {
    if (!this._session) {
      throw new Error("session is undefined");
    }
    return this._session;
  }

  set session(session: Session) {
    this._session = session;
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

  private currentScene?: Scene;
  private priorUpdateTime?: number;
  private fpsTextFont?: Font;
  private fpsTextPaint?: Paint;
  private drawnFrames = 0;
  private lastFpsUpdate = 0;
  private nextFpsUpdate = 0;
  private fpsRate = 0;
  private animationFramesRequested = 0;
  private limitFps = false;
  private unitTesting = false;
  private gameStopRequested = false;
  private webGlRendererInfo = "";

  canvasCssWidth = 0;
  canvasCssHeight = 0;

  scenes = new Array<Scene>();
  private freeEntitiesScene = new Scene({
    name: Constants.FREE_ENTITIES_SCENE_NAME,
    backgroundColor: [255, 255, 255, 0],
  });
  private incomingSceneTransitions = new Array<SceneTransition>();
  private currentSceneSnapshot?: Image;
  private pendingScreenshot?: PendingScreenshot;

  /**
   * Adds an entity as a free entity (an entity that is not part of a scene)
   * to the game.
   *
   * @remarks Once added to the game, a free entity will always be drawn,
   * and it will not be part of any scene transitions. This is useful if
   * an entity must persisently be drawn and not move with scene
   * transitions. The appearance of the free entity must be managed
   * by the programmer. Note: internally, the free entities are part of a
   * special scene (named "__freeEntitiesScene"), but this scene is handled
   * apart from regular scenes in order to achieve the free entity behavior.
   *
   * @param entity - entity to add as a free entity
   */
  addFreeEntity(entity: Entity): void {
    this.freeEntitiesScene.addChild(entity);
  }

  /**
   * Removes a free entity from the game.
   *
   * @remarks Throws exception if the entity to remove is not currently added
   * to the game as a free entity
   *
   * @param entity - the free entity to remove or its name as a string
   */
  removeFreeEntity(entity: Entity | string): void {
    if (typeof entity === "string") {
      if (
        !this.freeEntitiesScene.children
          .map((child) => child.name)
          .includes(entity)
      ) {
        throw new Error(
          `cannot remove free entity named "${entity}" because it is not currently part of the game's free entities. `
        );
      }
      this.freeEntitiesScene.children = this.freeEntitiesScene.children.filter(
        (child) => child.name !== entity
      );
    } else {
      if (!this.freeEntitiesScene.children.includes(entity)) {
        throw new Error(
          `cannot remove free entity "${entity.toString()}" because it is not currently part of the game's free entities. `
        );
      }
      this.freeEntitiesScene.children = this.freeEntitiesScene.children.filter(
        (child) => child !== entity
      );
    }
  }

  /**
   * Removes all free entities from the game.
   */
  removeAllFreeEntities(): void {
    while (this.freeEntitiesScene.children.length) {
      this.freeEntitiesScene.children.pop();
    }
  }

  /**
   * Returns array of free entities that have been added to the game.
   *
   * @returns array of free entities
   */
  get freeEntities(): Array<Entity> {
    return this.freeEntitiesScene.children;
  }

  /**
   * Adds a scene to the game.
   *
   * @remarks A scene, and its children entities, cannot be presented unless it has been added to the game object.
   *
   * @param scene
   */
  addScene(scene: Scene): void {
    scene.game = this;
    scene.needsInitialization = true;
    this.scenes.push(scene);
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
    if (scene instanceof Scene) {
      if (this.scenes.includes(scene)) {
        this.scenes = this.scenes.filter((s) => s !== scene);
      } else {
        throw new Error(
          `cannot remove scene ${scene} from game because the scene is not currently added to the game`
        );
      }
    } else {
      if (this.scenes.map((s) => s.name).includes(scene)) {
        this.scenes = this.scenes.filter((s) => s.name !== scene);
      } else {
        throw new Error(
          `cannot remove scene named "${scene}" from game because the scene is not currently added to the game`
        );
      }
    }
  }

  /**
   * Specifies the scene that will be presented upon the next frame draw.
   *
   * @param scene
   * @param transition
   */
  presentScene(scene: string | Scene, transition = Transition.none()): void {
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
        throw new Error(`scene ${scene} not found`);
      }
    } else {
      if (!this.scenes.some((scene_) => scene_ === scene)) {
        throw new Error(
          `scene ${scene} exists, but it has not been added to the game object`
        );
      }
      incomingScene = scene;
    }
    incomingScene.initialize();
    incomingScene.needsInitialization = false;

    const sceneTransition = new SceneTransition(incomingScene, transition);
    this.incomingSceneTransitions.push(sceneTransition);
    if (incomingScene.game.bodyBackgroundColor !== undefined) {
      document.body.style.backgroundColor = `rgb(${incomingScene.game.bodyBackgroundColor[0]},${incomingScene.game.bodyBackgroundColor[1]},${incomingScene.game.bodyBackgroundColor[2]},${incomingScene.game.bodyBackgroundColor[3]})`;
    } else {
      document.body.style.backgroundColor = `rgb(${incomingScene.backgroundColor[0]},${incomingScene.backgroundColor[1]},${incomingScene.backgroundColor[2]},${incomingScene.backgroundColor[3]})`;
    }
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
   * @param fallback - the value to return if parameterName is not found
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
    this.unitTesting = gameInitOptions._unitTesting ?? false;

    this.setupHtmlCanvases(
      gameInitOptions.canvasId,
      gameInitOptions.width,
      gameInitOptions.height,
      gameInitOptions.stretch
    );
    this.showFps = gameInitOptions.showFps ?? false;
    this.bodyBackgroundColor = gameInitOptions.bodyBackgroundColor;

    this.initData();

    this.setupCanvasKitSurface();
    this.setupFpsFont();
    this.setupCanvasDomEventHandlers();

    let startingScene: Scene | undefined;

    if (entryScene !== undefined) {
      if (entryScene instanceof Scene) {
        startingScene = entryScene;
        if (!this.scenes.includes(startingScene)) {
          throw new Error(
            `cannot start game. scene named "${entryScene}" has not been added to the game object`
          );
        }
      } else {
        startingScene = this.scenes
          .filter((scene) => scene.name === entryScene)
          .find(Boolean);
        if (startingScene === undefined) {
          throw new Error(
            `cannot start game. scene named "${entryScene}" has not been added to the game object`
          );
        }
      }
    } else {
      startingScene = this.scenes.find(Boolean);
      if (startingScene === undefined) {
        throw new Error(
          `cannot start game. no scenes have been added to the game object`
        );
      }
    }

    this.presentScene(startingScene);
    if (this.surface === undefined) {
      throw new Error("CanvasKit surface is undefined");
    }
    this.beginTimestamp = Timer.now();
    this.beginIso8601Timestamp = new Date().toISOString();

    if (this.options.timeStepping) {
      this.addTimeSteppingControlsToDom();
      this.updateTimeSteppingOutput();
    } else {
      this.removeTimeSteppingControlsFromDom();
    }

    DomHelpers.setCanvasOverlayVisibility(true);

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

    if (this.session.options.activityCallbacks?.onActivityLifecycle) {
      this.session.options.activityCallbacks.onActivityLifecycle({
        type: EventType.ActivityStart,
        target: this,
      });
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
      "time-stepping-steps-input"
    ) as HTMLInputElement;
    if (stepsInput) {
      stepsInput.value = this.stepCount.toString();
    }
    const nowInput = document.getElementById(
      "time-stepping-now-input"
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
    positionOffset = 0
  ): void {
    canvas.save();
    if (positionOffset == 0) {
      canvas.scale(1 / Globals.canvasScale, 1 / Globals.canvasScale);
    } else {
      canvas.scale(
        (1 / Globals.canvasScale) * 1.13,
        (1 / Globals.canvasScale) * 1.13
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
      true
    );
    canvas.drawRect(
      [0, 0, this.surface.width(), this.surface.height()],
      backgroundPaint
    );

    const fillColorPaintNotAntialiased = CanvasKitHelpers.makePaint(
      this.canvasKit,
      WebColors.Black,
      this.canvasKit.PaintStyle.Fill,
      false
    );

    const fillColorPaintAntialiased = CanvasKitHelpers.makePaint(
      this.canvasKit,
      WebColors.Black,
      this.canvasKit.PaintStyle.Fill,
      true
    );

    const strokeColorPaintNotAntialiased = CanvasKitHelpers.makePaint(
      this.canvasKit,
      WebColors.Black,
      this.canvasKit.PaintStyle.Stroke,
      false
    );
    strokeColorPaintNotAntialiased.setStrokeWidth(2);

    const strokeColorPaintAntialiased = CanvasKitHelpers.makePaint(
      this.canvasKit,
      WebColors.Black,
      this.canvasKit.PaintStyle.Stroke,
      true
    );
    strokeColorPaintAntialiased.setStrokeWidth(2);

    canvas.drawCircle(centerX, centerY, 32, fillColorPaintNotAntialiased);
    canvas.drawCircle(centerX, centerY, 32, fillColorPaintAntialiased);
    canvas.drawCircle(centerX, centerY, 32, strokeColorPaintNotAntialiased);
    canvas.drawCircle(centerX, centerY, 32, strokeColorPaintAntialiased);

    const fontManager = this.session.fontManager;
    const fontNames = this.session.fontManager.getFontNames(this.uuid);
    if (fontNames.length > 0) {
      const typeface = fontManager.getTypeface(this.uuid, fontNames[0]);
      const font = new this.canvasKit.Font(typeface, 16 * Globals.canvasScale);
      canvas.drawText(
        "abc",
        centerX,
        centerY,
        fillColorPaintNotAntialiased,
        font
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
   * m2c2kit entities.
   *
   * @remarks While warmupShadersWithPrimitives draws a predefined set of
   * primitives, this function initializes and draws all canvaskit objects
   * that have been defined as m2c2kit entities. This not only is another
   * opportunity for shader warmup, it also does the entity initialization.
   *
   * @param canvas - the canvaskit-canvas to draw on
   */
  private warmupShadersWithScenes(canvas: Canvas): void {
    [...this.scenes, this.freeEntitiesScene].forEach((scene) => {
      scene.warmup(canvas);
    });

    /**
     * images that are in sprites will have been warmed up above, but images
     * that are not yet added to a sprite have not been warmed up.
     * Thus, warmup these not-yet-added images.
     */
    const warmupedImageNames = this.entities
      .filter((entity) => entity.type === EntityType.Sprite)
      .map((entitity) => (entitity as Sprite).imageName);
    const loadedImages = this.session.imageManager.loadedImages[this.uuid];
    // loadedImages may be undefined/null if the game does not have images
    if (loadedImages) {
      const imageNames = Object.keys(loadedImages).filter(
        (name) => name !== "__outgoingSceneSnapshot"
      );
      imageNames.forEach((imageName) => {
        if (!warmupedImageNames.includes(imageName)) {
          const image = loadedImages[imageName].image;
          canvas.drawImage(image, 0, 0);
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
      whitePaint
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
   * @remarks This will be done automatically by the m2c2kit library;
   * the end-user must not call this.
   */
  dispose(): void {
    this.entities
      .filter((e) => e.isDrawable)
      .forEach((e) => (e as unknown as IDrawable).dispose());
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
          `invalid schema. variable ${variableName} is type ${propertySchema.type}. type must be number, string, boolean, object, or array`
        );
      }
    }
  }

  private propertySchemaDataTypeIsValid(
    propertySchemaType: JsonSchemaDataType | JsonSchemaDataType[]
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
      // screen.orientation was not avaiable and not mocked
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addTrialData(variableName: string, value: any): void {
    if (!this.options.trialSchema) {
      throw new Error(
        "no trial schema were provided in GameOptions. cannot add trial data"
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
        session_uuid: this.session.uuid,
        activity_uuid: this.uuid,
        activity_id: this.options.id,
        activity_version: this.options.version,
        device_timezone:
          Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone ?? "",
        device_timezone_offset_minutes: new Date().getTimezoneOffset(),
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
        `type for variable ${variableName} (value: ${value}) is "${providedDataType}". Based on schema for this variable, expected type was "${expectedDataTypes}"`
      );
    }
    this.data.trials[this.trialIndex][variableName] = value;
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
    this.trialIndex++;
    if (this.session.options.activityCallbacks?.onActivityResults) {
      this.session.options.activityCallbacks.onActivityResults({
        type: EventType.ActivityData,
        iso8601Timestamp: new Date().toISOString(),
        target: this,
        /** newData is only the trial that recently completed */
        newData: this.data.trials[this.trialIndex - 1],
        newDataSchema: this.makeNewGameDataSchema(),
        /** data is all the data collected so far in the game */
        data: this.data,
        dataSchema: this.makeGameDataSchema(),
        activityConfiguration: this.makeGameActivityConfiguration(
          this.options.parameters ?? {}
        ),
        activityConfigurationSchema: this.makeGameActivityConfigurationSchema(
          this.options.parameters ?? {}
        ),
        activityMetrics: this.gameMetrics,
      });
    }
  }

  /**
   * The m2c2kit engine will automatically include these schema and their
   * values in the trial data.
   */
  private readonly automaticTrialSchema: TrialSchema = {
    document_uuid: {
      type: "string",
      format: "uuid",
      description: "Unique identifier for this data document.",
    },
    session_uuid: {
      type: "string",
      format: "uuid",
      description:
        "Unique identifier for all activities in this administration of the session.",
    },
    activity_uuid: {
      type: "string",
      format: "uuid",
      description:
        "Unique identifier for all trials in this administration of the activity.",
    },
    activity_id: {
      type: "string",
      description: "Identifier of the activity.",
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
      missing_translation_font_color, // eslint-disable-line @typescript-eslint/no-unused-vars
      translations, // eslint-disable-line @typescript-eslint/no-unused-vars
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
    parameters: GameParameters
  ): JsonSchema {
    const gameParams: GameParameters = JSON.parse(JSON.stringify(parameters));
    // don't include the parameters used for localization
    const {
      locale, // eslint-disable-line @typescript-eslint/no-unused-vars
      fallback_locale, // eslint-disable-line @typescript-eslint/no-unused-vars
      missing_translation_font_color, // eslint-disable-line @typescript-eslint/no-unused-vars
      translations, // eslint-disable-line @typescript-eslint/no-unused-vars
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
   * @remarks This will trigger the onActivityLifecycleChange callback function,
   * if one was provided in SessionOptions. This is how the game can communicate
   * its state to the parent session. It is the responsibility of the the game
   * programmer to call this at the appropriate time. It is not triggered
   * automatically.
   */
  end(): void {
    if (this.session.options.activityCallbacks?.onActivityLifecycle) {
      this.session.options.activityCallbacks.onActivityLifecycle({
        type: EventType.ActivityEnd,
        target: this,
        results: {
          data: this.data,
          dataSchema: this.makeGameDataSchema(),
          activityConfiguration: this.makeGameActivityConfiguration(
            this.options.parameters ?? {}
          ),
          activityConfigurationSchema: this.makeGameActivityConfigurationSchema(
            this.options.parameters ?? {}
          ),
          activityMetrics: this.gameMetrics,
        },
      });
    }
  }

  /**
   * Should be called when current game has been canceled by a user action.
   *
   * @remarks This will trigger the onActivityLifecycleChange callback function,
   * if one was provided in SessionOptions. This is how the game can communicate
   * its state to the parent session. It is the responsibility of the the game
   * programmer to call this at the appropriate time. It is not triggered
   * automatically.
   */
  cancel(): void {
    if (this.session.options.activityCallbacks?.onActivityLifecycle) {
      this.session.options.activityCallbacks.onActivityLifecycle({
        type: EventType.ActivityCancel,
        target: this,
        results: {
          data: this.data,
          dataSchema: this.makeGameDataSchema(),
          activityConfiguration: this.makeGameActivityConfiguration(
            this.options.parameters ?? {}
          ),
          activityConfigurationSchema: this.makeGameActivityConfigurationSchema(
            this.options.parameters ?? {}
          ),
          activityMetrics: this.gameMetrics,
        },
      });
    }
  }

  private setupHtmlCanvases(
    canvasId: string | undefined,
    width: number,
    height: number,
    stretch: boolean | undefined
  ): void {
    Globals.canvasScale = Math.round(window.devicePixelRatio * 100) / 100;

    let htmlCanvas: HTMLCanvasElement | undefined;
    if (canvasId === undefined) {
      const canvasCollection = document.getElementsByTagName("canvas");

      let canvases = new Array<HTMLCanvasElement>();
      for (let i = 0; i < canvasCollection.length; i++) {
        canvases.push(canvasCollection[i]);
      }
      canvases = canvases.filter(
        (canvas) => canvas.id !== "m2c2kitscratchcanvas"
      );

      if (canvases.length === 0) {
        throw new Error("no html canvas tag was found in the html");
      } else if (canvases.length > 1) {
        console.warn("warning: more than one html canvas was found.");
      }
      const m2c2kitCanvas = canvases.filter(
        (c) => c.id === "m2c2kit-canvas"
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
          `could not find canvas HTML element with id "${canvasId}"`
        );
      }
    }

    if (stretch || window.innerWidth < width || window.innerHeight < height) {
      const requestedAspectRatio = height / width;
      const actualAspectRatio = window.innerHeight / window.innerWidth;

      if (actualAspectRatio < requestedAspectRatio) {
        Globals.rootScale = window.innerHeight / height;
      } else {
        Globals.rootScale = window.innerWidth / width;
      }
    }

    htmlCanvas.style.width = Globals.rootScale * width + "px";
    htmlCanvas.style.height = Globals.rootScale * height + "px";
    htmlCanvas.width = Globals.rootScale * width * Globals.canvasScale;
    htmlCanvas.height = Globals.rootScale * height * Globals.canvasScale;
    this.htmlCanvas = htmlCanvas;
    this.canvasCssWidth = width;
    this.canvasCssHeight = height;

    Globals.canvasCssWidth = width;
    Globals.canvasCssHeight = height;
  }

  private setupCanvasKitSurface(): void {
    if (this.htmlCanvas === undefined) {
      throw new Error("main html canvas is undefined");
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
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
        `could not make CanvasKit surface from canvas HTML element`
      );
    }
    this.surface = surface;
    console.log(
      `⚪ CanvasKit surface is backed by ${
        this.surface.reportBackendTypeIsGPU() ? "GPU" : "CPU"
      }`
    );
    this.surface.getCanvas().scale(Globals.canvasScale, Globals.canvasScale);
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
            `🔼 getContext(${args.map((a) => a.toString()).join(", ")})`
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
      Constants.FPS_DISPLAY_TEXT_FONT_SIZE * Globals.canvasScale
    );
    this.fpsTextPaint = new this.canvasKit.Paint();
    this.fpsTextPaint.setColor(
      this.canvasKit.Color(
        Constants.FPS_DISPLAY_TEXT_COLOR[0],
        Constants.FPS_DISPLAY_TEXT_COLOR[1],
        Constants.FPS_DISPLAY_TEXT_COLOR[2],
        Constants.FPS_DISPLAY_TEXT_COLOR[3]
      )
    );
    this.fpsTextPaint.setAntiAlias(true);
  }

  private setupCanvasDomEventHandlers(): void {
    if (this.htmlCanvas === undefined) {
      throw new Error("main html canvas is undefined");
    }
    // When the callback is executed, within the execuion of the callback code
    // we want 'this' to be this game object, not the html canvas to which the event listener is attached.
    // Thus, we use "this.htmlCanvasPointerDownHandler.bind(this)" instead of the usual "htmlCanvasPointerDownHandler"
    this.htmlCanvas.addEventListener(
      "pointerdown",
      this.htmlCanvasPointerDownHandler.bind(this)
    );
    this.htmlCanvas.addEventListener(
      "pointerup",
      this.htmlCanvasPointerUpHandler.bind(this)
    );
    this.htmlCanvas.addEventListener(
      "pointermove",
      this.htmlCanvasPointerMoveHandler.bind(this)
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
      this.htmlCanvasPointerLeaveHandler.bind(this)
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

    if (!this.loaderElementsRemoved) {
      this.loaderElementsRemoved = true;
      DomHelpers.setCanvasOverlayVisibility(false);
      DomHelpers.setSpinnerVisibility(false);
      this.surface.requestAnimationFrame(this.loop.bind(this));
      return;
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
        this.incomingSceneTransitions.length === 0
      ) {
        throw new Error("Can not run game without a current or incoming scene");
      }

      this.updateGameTime();
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
       * Free entities should not slide off the screen during transitions.
       * Thus, draw the free entities AFTER a screen shot may have
       * taken place.
       */
      this.freeEntitiesScene.draw(canvas);

      if (this.pendingScreenshot) {
        this.handlePendingScreenshot(this.pendingScreenshot);
        this.pendingScreenshot = undefined;
      }
    }

    this.priorUpdateTime = Globals.now;
    this.surface.requestAnimationFrame(this.loop.bind(this));
  }

  snapshots = new Array<Image>();

  private updateGameTime(): void {
    if (!this.options.timeStepping) {
      Globals.now = performance.now();
    } else {
      Globals.now = this.steppingNow;
    }

    if (this.priorUpdateTime) {
      Globals.deltaTime = Globals.now - this.priorUpdateTime;
    } else {
      Globals.deltaTime = 0;
    }
  }

  private handleIncomingSceneTransitions(
    incomingSceneTransitions: Array<SceneTransition>
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
        if (incomingScene._setupCallback) {
          incomingScene._setupCallback(incomingScene);
        }
        if (incomingScene._appearCallback) {
          incomingScene._appearCallback(incomingScene);
        }
        return;
      }

      // outgoingScene isn't the current scene; it's a scene that has a
      // screenshot of the current scene.
      this.currentSceneSnapshot = this.snapshots.shift();
      if (!this.currentSceneSnapshot) {
        throw new Error("No snapshop available for outgoing scene");
      }
      const outgoingScene = this.createOutgoingScene(this.currentSceneSnapshot);
      outgoingScene._active = true;
      if (this.currentScene) {
        this.currentScene._active = false;
      }
      this.currentScene = incomingScene;
      this.currentScene._active = true;
      if (incomingScene._setupCallback) {
        incomingScene._setupCallback(incomingScene);
      }

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
    const loadedImage = new LoadedImage(
      Constants.OUTGOING_SCENE_IMAGE_NAME,
      outgoingSceneImage,
      this.canvasCssWidth,
      this.canvasCssHeight
    );
    this.session.imageManager.addLoadedImage(loadedImage, this.uuid);

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
        x: this.canvasCssWidth / Globals.rootScale / 2,
        y: this.canvasCssHeight / Globals.rootScale / 2,
      },
    });
    spr.scale = 1 / Globals.rootScale;
    outgoingScene.addChild(spr);
    return outgoingScene;
  }

  private update(): void {
    this.scenes
      .filter((scene) => scene._active)
      .forEach((scene) => scene.update());
    this.freeEntitiesScene.update();
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
      this.lastFpsUpdate = Globals.now;
      this.nextFpsUpdate = Globals.now + Constants.FPS_DISPLAY_UPDATE_INTERVAL;
    } else {
      if (Globals.now >= this.nextFpsUpdate) {
        this.fpsRate =
          this.drawnFrames / ((Globals.now - this.lastFpsUpdate) / 1000);
        this.drawnFrames = 0;
        this.lastFpsUpdate = Globals.now;
        this.nextFpsUpdate =
          Globals.now + Constants.FPS_DISPLAY_UPDATE_INTERVAL;
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
      const sx = pendingScreenshot.rect[0] * Globals.canvasScale;
      const sy = pendingScreenshot.rect[1] * Globals.canvasScale;
      const sw = pendingScreenshot.rect[2] * Globals.canvasScale;
      const sh = pendingScreenshot.rect[3] * Globals.canvasScale;
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
   * @param sh - hegith of area to screenshot
   * @returns Promise of Uint8Array of image data
   */
  takeScreenshot(
    sx?: number,
    sy?: number,
    sw?: number,
    sh?: number
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
            "Exactly 0 or 4 arguments must be supplied to takeScreenshot()"
          );
        }
      }
    });
  }

  private animateSceneTransition(
    incomingScene: Scene,
    transition: Transition,
    outgoingScene: Scene
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
                    if (incomingScene._appearCallback) {
                      incomingScene._appearCallback(incomingScene);
                    }
                    /**
                     * For the transitions, the outgoing scene is a temporary scene
                     * that has a screenshot of the previous scene. Thus it is
                     * ok to remove because it will never be used again.
                     */
                    this.removeScene(Constants.OUTGOING_SCENE_NAME);
                  },
                  runDuringTransition: true,
                }),
              ])
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
              ])
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
                    if (incomingScene._appearCallback) {
                      incomingScene._appearCallback(incomingScene);
                    }
                    this.removeScene(Constants.OUTGOING_SCENE_NAME);
                  },
                  runDuringTransition: true,
                }),
              ])
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
              ])
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
                    if (incomingScene._appearCallback) {
                      incomingScene._appearCallback(incomingScene);
                    }
                    this.removeScene(Constants.OUTGOING_SCENE_NAME);
                  },
                  runDuringTransition: true,
                }),
              ])
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
              ])
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
                    if (incomingScene._appearCallback) {
                      incomingScene._appearCallback(incomingScene);
                    }
                    this.removeScene(Constants.OUTGOING_SCENE_NAME);
                  },
                  runDuringTransition: true,
                }),
              ])
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
              ])
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
    const drawScale = Globals.canvasScale;
    canvas.scale(1 / drawScale, 1 / drawScale);
    if (!this.fpsTextFont || !this.fpsTextPaint) {
      throw new Error("fps font or paint is undefined");
    }
    canvas.drawText(
      "FPS: " + this.fpsRate.toFixed(2),
      0,
      0 + Constants.FPS_DISPLAY_TEXT_FONT_SIZE * drawScale,
      this.fpsTextPaint,
      this.fpsTextFont
    );
    canvas.restore();
  }

  /**
   * Creates an event listener for an entity based on the entity name
   *
   * @remarks Typically, event listeners will be created using a method specific to the event, such as onTapDown(). This alternative allows creation with entity name.
   *
   * @param type - the type of event to listen for, e.g., "tapdown"
   * @param entityName - the entity name for which an event will be listened
   * @param callback
   * @param replaceExistingCallback
   */
  createEventListener(
    type: EventType,
    entityName: string,
    callback: (event: EntityEvent) => void,
    replaceExistingCallback = true
  ): void {
    const entities = this.entities.filter(
      (entity) => entity.name === entityName
    );
    if (entities.length > 1) {
      console.warn(
        `warning: createEventListener() found more than one entity with name ${entityName}. Event listener will be attached to first entity found. All entities that receive tap events should be uniquely named`
      );
    }
    const entity = entities
      .filter((entity) => entity.name === entityName)
      .find(Boolean);
    if (entity === undefined) {
      throw new Error(
        `could not create event listener. entity with name ${entityName} could not be found in the game entity tree`
      );
    }

    switch (type) {
      case EventType.PointerDown: {
        entity.onPointerDown(callback, replaceExistingCallback);
        break;
      }
      default: {
        throw new Error(
          `could not create event listener: event type ${type} is not known`
        );
      }
    }
  }

  /**
   * Returns array of all entities that have been added to the game object.
   */
  get entities(): Array<Entity> {
    function getChildEntitiesRecursive(
      entity: Entity,
      entities: Array<Entity>
    ): void {
      entities.push(entity);
      entity.children.forEach((child) =>
        getChildEntitiesRecursive(child, entities)
      );
    }

    const entities = new Array<Entity>();
    [...this.scenes, this.freeEntitiesScene].forEach((scene) =>
      getChildEntitiesRecursive(scene, entities)
    );
    return entities;
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
    const m2Event: EventBase = {
      target: scene,
      type: EventType.PointerDown,
      handled: false,
    };
    this.processDomPointerDown(scene, m2Event, domPointerEvent);
    this.processDomPointerDown(
      this.freeEntitiesScene,
      m2Event,
      domPointerEvent
    );
  }

  private htmlCanvasPointerUpHandler(domPointerEvent: PointerEvent): void {
    domPointerEvent.preventDefault();
    const scene = this.currentScene;
    if (!scene || !this.sceneCanReceiveUserInteraction(scene)) {
      return;
    }
    const m2Event: EventBase = {
      target: scene,
      type: EventType.PointerUp,
      handled: false,
    };
    this.processDomPointerUp(scene, m2Event, domPointerEvent);
    this.processDomPointerUp(this.freeEntitiesScene, m2Event, domPointerEvent);
  }

  private htmlCanvasPointerMoveHandler(domPointerEvent: PointerEvent): void {
    domPointerEvent.preventDefault();
    const scene = this.currentScene;
    if (!scene || !this.sceneCanReceiveUserInteraction(scene)) {
      return;
    }
    const m2Event: EventBase = {
      target: scene,
      type: EventType.PointerMove,
      handled: false,
    };
    this.processDomPointerMove(scene, m2Event, domPointerEvent);
    this.processDomPointerMove(
      this.freeEntitiesScene,
      m2Event,
      domPointerEvent
    );
  }

  /**
   * Adjusts dragging behavior when the pointer leaves the canvas
   *
   * @remarks This is necessary because the pointerup event is not fired when
   * the pointer leaves the canvas. On desktop, this means that the user might
   * lift the pointer outside the canvas, but the entity will still be dragged
   * when the pointer is moved back into the canvas.
   *
   * @param domPointerEvent
   * @returns
   */
  private htmlCanvasPointerLeaveHandler(domPointerEvent: PointerEvent): void {
    if (!this.currentScene) {
      return;
    }
    this.currentScene.children.forEach((entity) => {
      if (entity.dragging) {
        const m2Event: EventBase = {
          target: entity,
          type: EventType.DragEnd,
          handled: false,
        };

        entity.dragging = false;
        entity.pressed = false;
        entity.pressedAndWithinHitArea = false;
        this.raiseM2DragEndEvent(entity, m2Event, domPointerEvent);
        return;
      }
    });
  }

  /**
   * Determines if/how m2c2kit entities respond to the DOM PointerDown event
   *
   * @param entity - entity that might be affected by the DOM PointerDown event
   * @param m2Event
   * @param domPointerEvent
   */
  private processDomPointerDown(
    entity: Entity,
    m2Event: EventBase,
    domPointerEvent: PointerEvent
  ): void {
    if (m2Event.handled) {
      return;
    }

    // note: offsetX and offsetY are relative to the HTML canvas element
    if (
      entity.isUserInteractionEnabled &&
      this.IsCanvasPointWithinEntityBounds(
        entity,
        domPointerEvent.offsetX,
        domPointerEvent.offsetY
      )
    ) {
      entity.pressed = true;
      entity.pressedAndWithinHitArea = true;
      entity.pressedInitialPointerOffset = {
        x: domPointerEvent.offsetX,
        y: domPointerEvent.offsetY,
      };
      this.raiseM2PointerDownEvent(entity, m2Event, domPointerEvent);
      this.raiseTapDownEvent(entity, m2Event, domPointerEvent);
    }
    if (entity.children) {
      entity.children
        // a hidden entity (and its children) can't receive taps,
        // even if isUserInteractionEnabled is true
        .filter((entity) => !entity.hidden)
        // only drawables have z-postion
        .filter((entity) => entity.isDrawable)
        // process taps on children by zPosition order
        .sort(
          (a, b) =>
            (b as unknown as IDrawable).zPosition -
            (a as unknown as IDrawable).zPosition
        )
        .forEach((entity) =>
          this.processDomPointerDown(entity, m2Event, domPointerEvent)
        );
    }
  }

  private processDomPointerUp(
    entity: Entity,
    m2Event: EventBase,
    domPointerEvent: PointerEvent
  ): void {
    if (m2Event.handled) {
      return;
    }

    if (entity.dragging) {
      entity.dragging = false;
      entity.pressed = false;
      entity.pressedAndWithinHitArea = false;
      this.raiseM2DragEndEvent(entity, m2Event, domPointerEvent);
      m2Event.handled = true;
      return;
    }

    if (
      entity.isUserInteractionEnabled &&
      entity.pressed &&
      entity.pressedAndWithinHitArea
    ) {
      /**
       * released pointer within hit area after pointer had been earlier
       * been pressed in the hit area and never left the hit area
       */
      entity.pressed = false;
      entity.pressedAndWithinHitArea = false;
      this.raiseTapUpEvent(entity, m2Event, domPointerEvent);
      this.raiseTapUpAny(entity, m2Event, domPointerEvent);
      this.raiseM2PointerUpEvent(entity, m2Event, domPointerEvent);
    } else if (
      entity.isUserInteractionEnabled &&
      entity.pressed &&
      entity.pressedAndWithinHitArea == false
    ) {
      /**
       * released pointer anywhere after pointer had been earlier
       * been pressed in the hit area
       */
      entity.pressed = false;
      entity.pressedAndWithinHitArea = false;
      this.raiseTapUpAny(entity, m2Event, domPointerEvent);
    } else if (
      entity.isUserInteractionEnabled &&
      this.IsCanvasPointWithinEntityBounds(
        entity,
        domPointerEvent.offsetX,
        domPointerEvent.offsetY
      )
    ) {
      /**
       * released pointer in the hit area
       */
      entity.pressed = false;
      entity.pressedAndWithinHitArea = false;
      this.raiseM2PointerUpEvent(entity, m2Event, domPointerEvent);
    }

    if (entity.children) {
      entity.children
        // a hidden entity (and its children) can't receive taps,
        // even if isUserInteractionEnabled is true
        .filter((entity) => !entity.hidden)
        // only drawables have z-postion
        .filter((entity) => entity.isDrawable)
        // process taps on children by zPosition order
        .sort(
          (a, b) =>
            (b as unknown as IDrawable).zPosition -
            (a as unknown as IDrawable).zPosition
        )
        .forEach((entity) =>
          this.processDomPointerUp(entity, m2Event, domPointerEvent)
        );
    }
  }

  private processDomPointerMove(
    entity: Entity,
    m2Event: EventBase,
    domPointerEvent: PointerEvent
  ): void {
    if (m2Event.handled) {
      return;
    }

    if (entity.isUserInteractionEnabled && entity.draggable && entity.pressed) {
      let firstMoveOfDrag = false;
      let deltaX: number;
      let deltaY: number;
      if (entity.dragging === false) {
        entity.dragging = true;
        firstMoveOfDrag = true;
        deltaX = domPointerEvent.offsetX - entity.pressedInitialPointerOffset.x;
        deltaY = domPointerEvent.offsetY - entity.pressedInitialPointerOffset.y;
      } else {
        deltaX = domPointerEvent.offsetX - entity.draggingLastPointerOffset.x;
        deltaY = domPointerEvent.offsetY - entity.draggingLastPointerOffset.y;
      }
      entity.position.x += deltaX;
      entity.position.y += deltaY;
      entity.draggingLastPointerOffset = {
        x: domPointerEvent.offsetX,
        y: domPointerEvent.offsetY,
      };
      m2Event.handled = true;
      if (firstMoveOfDrag) {
        this.raiseM2DragStartEvent(entity, m2Event, domPointerEvent);
      } else {
        this.raiseM2DragEvent(entity, m2Event, domPointerEvent);
      }
      return;
    }

    // note: offsetX and offsetY are relative to the HTML canvas element
    if (
      entity.isUserInteractionEnabled &&
      entity.pressed &&
      entity.pressedAndWithinHitArea &&
      !this.IsCanvasPointWithinEntityBounds(
        entity,
        domPointerEvent.offsetX,
        domPointerEvent.offsetY
      )
    ) {
      entity.pressedAndWithinHitArea = false;
      this.raiseTapLeaveEvent(entity, m2Event, domPointerEvent);
    }
    if (
      this.IsCanvasPointWithinEntityBounds(
        entity,
        domPointerEvent.offsetX,
        domPointerEvent.offsetY
      )
    ) {
      this.raiseM2PointerMoveEvent(entity, m2Event, domPointerEvent);
    }

    if (entity.children) {
      entity.children
        // a hidden entity (and its children) can't receive taps,
        // even if isUserInteractionEnabled is true
        .filter((entity) => !entity.hidden)
        // only drawables have z-postion
        .filter((entity) => entity.isDrawable)
        // process taps on children by zPosition order
        .sort(
          (a, b) =>
            (b as unknown as IDrawable).zPosition -
            (a as unknown as IDrawable).zPosition
        )
        .forEach((entity) =>
          this.processDomPointerMove(entity, m2Event, domPointerEvent)
        );
    }
  }

  private raiseM2PointerDownEvent(
    entity: Entity,
    m2Event: EventBase,
    domPointerEvent: PointerEvent
  ): void {
    m2Event.target = entity;
    m2Event.type = EventType.PointerDown;
    this.raiseEventOnListeningEntities<M2PointerEvent>(
      entity,
      m2Event,
      domPointerEvent
    );
  }

  private raiseTapDownEvent(
    entity: Entity,
    m2Event: EventBase,
    domPointerEvent: PointerEvent
  ): void {
    m2Event.target = entity;
    m2Event.type = EventType.TapDown;
    this.raiseEventOnListeningEntities<TapEvent>(
      entity,
      m2Event,
      domPointerEvent
    );
  }

  private raiseTapLeaveEvent(
    entity: Entity,
    m2Event: EventBase,
    domPointerEvent: PointerEvent
  ): void {
    m2Event.target = entity;
    m2Event.type = EventType.TapLeave;
    this.raiseEventOnListeningEntities<TapEvent>(
      entity,
      m2Event,
      domPointerEvent
    );
  }

  private raiseM2PointerUpEvent(
    entity: Entity,
    m2Event: EventBase,
    domPointerEvent: PointerEvent
  ): void {
    m2Event.target = entity;
    m2Event.type = EventType.PointerUp;
    this.raiseEventOnListeningEntities<M2PointerEvent>(
      entity,
      m2Event,
      domPointerEvent
    );
  }

  private raiseTapUpEvent(
    entity: Entity,
    m2Event: EventBase,
    domPointerEvent: PointerEvent
  ): void {
    m2Event.target = entity;
    m2Event.type = EventType.TapUp;
    this.raiseEventOnListeningEntities<TapEvent>(
      entity,
      m2Event,
      domPointerEvent
    );
  }

  private raiseTapUpAny(
    entity: Entity,
    m2Event: EventBase,
    domPointerEvent: PointerEvent
  ): void {
    m2Event.target = entity;
    m2Event.type = EventType.TapUpAny;
    this.raiseEventOnListeningEntities<TapEvent>(
      entity,
      m2Event,
      domPointerEvent
    );
  }

  private raiseM2PointerMoveEvent(
    entity: Entity,
    m2Event: EventBase,
    domPointerEvent: PointerEvent
  ): void {
    m2Event.target = entity;
    m2Event.type = EventType.PointerMove;
    this.raiseEventOnListeningEntities<M2PointerEvent>(
      entity,
      m2Event,
      domPointerEvent
    );
  }

  private raiseM2DragStartEvent(
    entity: Entity,
    m2Event: EventBase,
    domPointerEvent: PointerEvent
  ): void {
    m2Event.target = entity;
    m2Event.type = EventType.DragStart;
    this.raiseEventOnListeningEntities<M2DragEvent>(
      entity,
      m2Event,
      domPointerEvent
    );
  }

  private raiseM2DragEvent(
    entity: Entity,
    m2Event: EventBase,
    domPointerEvent: PointerEvent
  ): void {
    m2Event.target = entity;
    m2Event.type = EventType.Drag;
    this.raiseEventOnListeningEntities<M2DragEvent>(
      entity,
      m2Event,
      domPointerEvent
    );
  }

  private raiseM2DragEndEvent(
    entity: Entity,
    m2Event: EventBase,
    domPointerEvent: PointerEvent
  ): void {
    m2Event.target = entity;
    m2Event.type = EventType.DragEnd;
    this.raiseEventOnListeningEntities<M2DragEvent>(
      entity,
      m2Event,
      domPointerEvent
    );
  }

  private calculatePointWithinEntityFromDomPointerEvent(
    entity: Entity,
    domPointerEvent: PointerEvent
  ): Point {
    let width = entity.size.width;
    let height = entity.size.height;

    if (
      entity.type === EntityType.Shape &&
      (entity as Shape).shapeType === ShapeType.Circle
    ) {
      const radius = (entity as Shape).circleOfRadius;
      if (!radius) {
        throw "circleOfRadius is undefined";
      }
      width = radius * 2;
      height = radius * 2;
    }

    const x = domPointerEvent.offsetX;
    const y = domPointerEvent.offsetY;
    const bb = this.calculateEntityAbsoluteBoundingBox(entity);
    const relativeX = ((x - bb.xMin) / (bb.xMax - bb.xMin)) * width;
    const relativeY = ((y - bb.yMin) / (bb.yMax - bb.yMin)) * height;
    return { x: relativeX, y: relativeY };
  }

  private raiseEventOnListeningEntities<T extends EntityEvent>(
    entity: Entity,
    m2Event: EventBase,
    domEvent: Event
  ): void {
    entity.eventListeners
      .filter((listener) => listener.type === m2Event.type)
      .forEach((listener) => {
        if (listener.entityUuid === entity.uuid) {
          (m2Event as T).target = entity;

          switch (m2Event.type) {
            case EventType.PointerDown:
            case EventType.PointerMove:
            case EventType.PointerUp:
              (m2Event as M2PointerEvent).point =
                this.calculatePointWithinEntityFromDomPointerEvent(
                  entity,
                  domEvent as PointerEvent
                );
              (m2Event as M2PointerEvent).buttons = (
                domEvent as PointerEvent
              ).buttons;
              listener.callback(m2Event as T);
              break;
            case EventType.TapDown:
            case EventType.TapUp:
            case EventType.TapUpAny:
            case EventType.TapLeave:
              (m2Event as TapEvent).point =
                this.calculatePointWithinEntityFromDomPointerEvent(
                  entity,
                  domEvent as PointerEvent
                );

              (m2Event as TapEvent).buttons = (
                domEvent as PointerEvent
              ).buttons;

              listener.callback(m2Event as T);
              break;
            case EventType.DragStart:
            case EventType.Drag:
            case EventType.DragEnd:
              (m2Event as M2DragEvent).position = {
                x: entity.position.x,
                y: entity.position.y,
              };
              (m2Event as M2DragEvent).buttons = (
                domEvent as PointerEvent
              ).buttons;
              listener.callback(m2Event as T);
              break;
          }
        }
      });
  }

  private sceneCanReceiveUserInteraction(scene: Scene): boolean {
    if (
      scene.game === (scene.game.session?.currentActivity as unknown as Game) &&
      scene._transitioning === false
    ) {
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
   * Checks if the given canvas point is within the entity's bounds.
   *
   * @param entity - entity to check bounds for
   * @param x - x coordinate of the canvas point
   * @param y - y coordinate of the canvas point
   * @returns true if x, y point is within the entity's bounds
   */
  private IsCanvasPointWithinEntityBounds(
    entity: Entity,
    x: number,
    y: number
  ): boolean {
    if (!entity.isDrawable) {
      throw "only drawable entities can receive pointer events";
    }
    if (
      entity.type === EntityType.Shape &&
      (entity as Shape).shapeType === ShapeType.Circle
    ) {
      const bb = this.calculateEntityAbsoluteBoundingBox(entity);
      const radius = (entity as Shape).circleOfRadius;
      if (!radius) {
        throw "circleOfRadius is undefined";
      }
      const center = { x: bb.xMin + radius, y: bb.yMin + radius };
      const distance = Math.sqrt(
        Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2)
      );
      return distance <= radius;
    }

    if (entity.size.width === 0 || entity.size.height === 0) {
      // console.warn(
      //   `warning: entity ${entity.toString()} has isUserInteractionEnabled = true, but has no interactable area. Size is ${
      //     entity.size.width
      //   }, ${entity.size.height}`
      // );
      return false;
    }

    if (entity.type === EntityType.TextLine && isNaN(entity.size.width)) {
      // console.warn(
      //   `warning: entity ${entity.toString()} is a textline with width = NaN. A textline must have its width manually set.`
      // );
      return false;
    }

    const bb = this.calculateEntityAbsoluteBoundingBox(entity);

    if (
      entity.isUserInteractionEnabled &&
      x >= bb.xMin &&
      x <= bb.xMax &&
      y >= bb.yMin &&
      y <= bb.yMax
    ) {
      return true;
    }
    return false;
  }

  private calculateEntityAbsoluteBoundingBox(entity: Entity): BoundingBox {
    const anchorPoint = (entity as unknown as IDrawable).anchorPoint;
    const scale = entity.absoluteScale;
    // TODO: NEEDS TO BE FIXED FOR ANCHOR POINTS OTHER THAN (.5, .5)
    // TODO: TEST THIS FURTHER

    let width = entity.size.width;
    let height = entity.size.height;

    if (
      entity.type === EntityType.Shape &&
      (entity as Shape).shapeType === ShapeType.Circle
    ) {
      const radius = (entity as Shape).circleOfRadius;
      if (!radius) {
        throw "circleOfRadius is undefined";
      }
      width = radius * 2;
      height = radius * 2;
    }

    const xMin = entity.absolutePosition.x - width * anchorPoint.x * scale;
    const xMax =
      entity.absolutePosition.x + width * (1 - anchorPoint.x) * scale;
    const yMin = entity.absolutePosition.y - height * anchorPoint.y * scale;
    const yMax =
      entity.absolutePosition.y + height * (1 - anchorPoint.y) * scale;
    // const xMin = entity.absolutePosition.x - entity.size.width * anchorPoint.x * scale;
    // const xMax = entity.absolutePosition.x + entity.size.width * anchorPoint.x * scale;
    // const yMin = entity.absolutePosition.y - entity.size.height * anchorPoint.y * scale;
    // const yMax = entity.absolutePosition.y + entity.size.height * anchorPoint.y * scale;
    return { xMin, xMax, yMin, yMax };
  }
}
