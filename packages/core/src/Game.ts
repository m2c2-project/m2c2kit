import "./Globals";
import { Activity } from "./Activity";
import { ActivityType } from "./ActivityType";
import { CanvasKit, Canvas, Surface, Font, Image, Paint } from "canvaskit-wasm";
import { Constants } from "./Constants";
import { TapEvent } from "./TapEvent";
import { EntityEvent } from "./EntityEvent";
import { IDrawable } from "./IDrawable";
import { Entity } from "./Entity";
import { EntityType } from "./EntityType";
import { RgbaColor } from "./RgbaColor";
import { Sprite } from "./Sprite";
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
import { JsonSchema } from "./JsonSchema";

interface BoundingBox {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}
export interface TrialData {
  [key: string]: string | number | boolean | undefined | null;
}
export interface Metadata {
  userAgent?: string;
  devicePixelRatio?: number;
  screen?: screenMetadata;
}

/**
 * screenMetadata is similar to window.Screen, except we don't want the
 * methods on the window.Screen.ScreenOrientation
 */
interface screenMetadata {
  readonly availHeight: number;
  readonly availWidth: number;
  readonly colorDepth: number;
  readonly height: number;
  /** ScreenOrientation has some methods on it; we only want these two properties
   * However, when unit testing, orientation is not available to us. Thus, make this
   * property optional
   */
  readonly orientation?: Pick<ScreenOrientation, "type" | "angle">;
  readonly pixelDepth: number;
  readonly width: number;
}

export class Game implements Activity {
  readonly type = ActivityType.game;
  _canvasKit?: CanvasKit;
  _session?: Session;
  uuid = Uuid.generate();
  name: string;
  options: GameOptions;
  beginTimestamp = NaN;

  constructor(options: GameOptions) {
    this.options = options;
    this.name = options.name;
    this.freeEntitiesScene.game = this;
    this.freeEntitiesScene.needsInitialization = true;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  init() {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setParameters(newParameters: any): void {
    const { parameters } = this.options;
    Object.keys(newParameters).forEach((key) => {
      if (!parameters || !(key in parameters)) {
        console.warn(
          `game ${this.options.name} does not have a parameter named ${key}. attempt to set parameter ${key} to value ${newParameters[key]} will be ignored`
        );
      } else if (this.options.parameters && this.options.parameters[key]) {
        this.options.parameters[key].value = newParameters[key];
      }
    });
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

  public entryScene?: Scene | string;
  public data: GameData = {
    trials: new Array<TrialData>(),
    metadata: {},
  };
  public trialIndex = 0;
  private htmlCanvas?: HTMLCanvasElement;
  private surface?: Surface;
  private showFps?: boolean;
  private bodyBackgroundColor?: RgbaColor;

  private currentScene?: Scene;
  private priorUpdateTime?: number;
  private fpsTextFont?: Font;
  private fpsTextPaint?: Paint;
  private drawnFrames = 0;
  private lastFpsUpdate = 0;
  private nextFpsUpdate = 0;
  private fps = 0;
  private animationFramesRequested = 0;
  private limitFps = false;
  private unitTesting = false;
  private gameStopRequested = false;

  canvasCssWidth = 0;
  canvasCssHeight = 0;

  private scenes = new Array<Scene>();
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
    this.currentSceneSnapshot = undefined;
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
      return this.options.parameters[parameterName].value as T;
    } else {
      throw new Error(`game parameter ${parameterName} not found`);
    }
  }

  /**
   * Starts the game loop. If entryScene is undefined, the game object's entryScene must be set.
   *
   * @param entryScene - The scene (Scene object or its string name) to display when the game starts
   */
  start(entryScene?: Scene | string): void {
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
    this.setupEventHandlers();

    let startingScene: Scene | undefined;

    if (entryScene !== undefined) {
      if (entryScene instanceof Scene) {
        startingScene = entryScene;
      } else {
        startingScene = startingScene = this.scenes
          .filter((scene) => scene.name === entryScene)
          .find(Boolean);
        if (startingScene === undefined) {
          throw new Error(
            `cannot start game. scene named "${entryScene}" has not been added to the game object`
          );
        }
      }
    } else {
      if (this.entryScene === undefined) {
        throw new Error(
          `cannot start game. the game object's entryScene has not been assigned`
        );
      }
      if (this.entryScene instanceof Scene) {
        startingScene = this.entryScene;
      } else {
        startingScene = startingScene = this.scenes
          .filter((scene) => scene.name === this.entryScene)
          .find(Boolean);
        if (startingScene === undefined) {
          throw new Error(
            `cannot start game. scene named "${entryScene}" has not been added to the game object`
          );
        }
      }
    }

    this.presentScene(startingScene);
    if (this.surface === undefined) {
      throw new Error("CanvasKit surface is undefined");
    }
    this.warmupShaders(this.surface);
    this.beginTimestamp = Timer.now();
    this.surface.requestAnimationFrame(this.loop.bind(this));
  }

  /**
   * Warms up the Skia-based shaders underlying canvaskit
   *
   * @remarks Some canvaskit methods, such as drawImage, take extra time the
   * first time they are called. If the method is part of an animation,
   * then this may cause frame drops or "jank." To alleviate this, we can
   * "warm up" the shader associated with the method by calling it at the
   * beginning of our game. Thus, all warmup operations will be concentrated
   * at the beginning and will not be noticeable. We initialize and draw
   * all canvaskit objects that have been defined within m2c2kit entities,
   * and then immediately draw a white rectangle over them so that the
   * user does not see any flicker.
   *
   * @param surface - the canvaskit surface
   */
  private warmupShaders(surface: Surface): void {
    const canvas = surface.getCanvas();
    const whitePaint = new this.canvasKit.Paint();
    whitePaint.setColor(this.canvasKit.Color(255, 255, 255, 1));

    [...this.scenes, this.freeEntitiesScene].forEach((scene) =>
      scene.children.forEach((child) => {
        if (child.isDrawable) {
          (child as unknown as IDrawable).warmup(canvas);
        }
      })
    );

    /**
     * images that are in sprites will have been warmed up above, but images
     * that are not yet added to a sprite have not been warmed up.
     * Thus, warmup these not-yet-added images.
     */
    const warmupedImageNames = this.entities
      .filter((entity) => entity.type === EntityType.sprite)
      .map((entitity) => (entitity as Sprite).imageName);
    const loadedImages = this.session.imageManager.loadedImages[this.uuid];
    // loadedImages may be undefined/null if the game does not have images
    if (loadedImages) {
      const imageNames = Object.keys(loadedImages);
      imageNames.forEach((imageName) => {
        if (!warmupedImageNames.includes(imageName)) {
          const image = loadedImages[imageName].image;
          console.log("warmed up " + imageName);
          canvas.drawImage(image, 0, 0);
        }
      });
    }

    const rr = this.canvasKit.RRectXY(
      this.canvasKit.LTRBRect(0, 0, surface.width(), surface.height()),
      0,
      0
    );
    canvas.drawRRect(rr, whitePaint);
  }

  stop(): void {
    if (this.currentScene) {
      this.currentScene._active = false;
    }
    this.gameStopRequested = true;
  }

  initData(): void {
    this.trialIndex = 0;
    this.data = {
      trials: new Array<TrialData>(),
      metadata: {
        userAgent: navigator.userAgent,
        devicePixelRatio: window.devicePixelRatio,
        screen: this.getScreenMetadata(),
      },
    };
    const trialSchema = this.options.trialSchema ?? {};

    const variables = Object.entries(trialSchema);
    const validDataTypes = ["number", "string", "boolean", "object", "array"];
    for (const [variableName, propertySchema] of variables) {
      if (
        propertySchema.type !== undefined &&
        !validDataTypes.includes(propertySchema.type)
      ) {
        throw new Error(
          `invalid schema. variable ${variableName} is type ${propertySchema.type}. type must be number, string, boolean, object, or array`
        );
      }
    }
  }

  private getScreenMetadata(): screenMetadata {
    const screen = window.screen;
    if (!screen.orientation) {
      // we're likely running unit tests in node, so
      // screen.orientation was not avaiable and not mocked
      return {
        availHeight: screen.availHeight,
        availWidth: screen.availWidth,
        colorDepth: screen.colorDepth,
        height: screen.height,
        pixelDepth: screen.pixelDepth,
        width: screen.width,
      };
    }
    return {
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
    };
  }

  /**
   * Adds data to the game's TrialData object.
   *
   * @remarks The variableName must be previously defined in the trialSchema object passed in during game initialization. see {@link GameInitOptions.trialSchema}. The type of the value must match what was defined in the trialSchema, otherwise an error is thrown.
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
      this.data.trials.push(emptyTrial);
    }
    if (!(variableName in this.options.trialSchema)) {
      throw new Error(`trial variable ${variableName} not defined in schema`);
    }
    const expectedDataType = this.options.trialSchema[variableName].type;
    let providedDataType = typeof value as string;
    // in JavaScript, typeof an array returns "object"!
    // Therefore, do some extra checking to see if we have an array
    if (providedDataType === "object") {
      if (Object.prototype.toString.call(value) === "[object Array]") {
        providedDataType = "array";
      }
    }
    if (providedDataType !== expectedDataType) {
      throw new Error(
        `type for variable ${variableName} (value: ${value}) is "${providedDataType}". Based on schema for this variable, expected type was "${expectedDataType}"`
      );
    }
    this.data.trials[this.trialIndex][variableName] = value;
  }

  /**
   * Should be called when the current trial has completed. It will
   * also increment the trial index.
   * Calling this will trigger the onActivityDataCreate callback function,
   * if one was provided in SessionOptions. This is how the game communicates
   * trial data to the parent session, which can then save or process the data.
   * It is the responsibility of the the game programmer to call this at
   * the appropriate time. It is not triggered automatically.
   */
  trialComplete(): void {
    this.trialIndex++;
    /** some metadata, such as window size (on browsers) or device
     * orientation (on mobile phones) MIGHT change multiple times
     * throughout a game. Rather than record all of these values as
     * they potentially change, update the metadata at the end of
     * each trial when the trial is complete.
     */
    this.data.metadata.screen = this.getScreenMetadata();
    this.data.metadata.devicePixelRatio = window.devicePixelRatio;
    if (this.session.options.activityCallbacks?.onActivityDataCreate) {
      // newData is only the trial that recently completed
      // data is all the data collected so far in the game

      // return schema as JSON Schema Draft-07
      const newDataSchema: JsonSchema = {
        description: `a single completed trial from the assessment ${this.name}`,
        type: "object",
        properties: this.options.trialSchema,
      };

      const dataSchema: JsonSchema = {
        description: `all trial and metadata from the assessment ${this.name}`,
        type: "object",
        required: ["trials", "metadata"],
        properties: {
          trials: {
            type: "array",
            items: { $ref: "#/$defs/trial" },
          },
          metadata: {
            type: "object",
          },
        },
        $defs: {
          trial: {
            type: "object",
            properties: this.options.trialSchema,
          },
        },
      };

      /**
       * GameParameters combines default parameters values and
       * JSON Schema to describe what the parameters are.
       * The next two functions extract GameParameters's two parts
       * (the default values and the schema) so they can be returned
       * separately in the activityData event
       */

      const makeGameActivityConfiguration = (
        parameters: GameParameters
      ): unknown => {
        const result: GameParameters = JSON.parse(JSON.stringify(parameters));

        for (const prop in result) {
          for (const subProp in result[prop]) {
            if (subProp == "value") {
              result[prop] = result[prop][subProp];
            }
          }
        }
        return result;
      };

      const makeGameActivityConfigurationSchema = (
        parameters: GameParameters
      ): JsonSchema => {
        const result: GameParameters = JSON.parse(JSON.stringify(parameters));

        for (const prop in result) {
          if (!("type" in result[prop]) && "value" in result[prop]) {
            const valueType = typeof result[prop]["value"];
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
            if (subProp == "value") {
              delete result[prop][subProp];
            }
          }
        }
        return {
          description: `activity configuration from the assessment ${this.name}`,
          type: "object",
          properties: result,
        } as JsonSchema;
      };

      this.session.options.activityCallbacks.onActivityDataCreate({
        eventType: EventType.activityData,
        uuid: this.uuid,
        name: this.options.name,
        newData: this.data.trials[this.trialIndex - 1],
        newDataSchema: newDataSchema,
        data: this.data,
        dataSchema: dataSchema,
        activityConfiguration: makeGameActivityConfiguration(
          this.options.parameters ?? {}
        ),
        activityConfigurationSchema: makeGameActivityConfigurationSchema(
          this.options.parameters ?? {}
        ),
      });
    }
  }

  /**
   * Should be called when the current game has ended. This will trigger
   * the onActivityLifecycleChange callback function, if one was provided in
   * SessionOptions. This is how the game can communicate its ended or
   * "finished" state to the parent session.
   * It is the responsibility of the the game programmer to call this at
   * the appropriate time. It is not triggered automatically.
   */
  end(): void {
    if (this.session.options.activityCallbacks?.onActivityLifecycleChange) {
      this.session.options.activityCallbacks.onActivityLifecycleChange({
        eventType: EventType.activityLifecycle,
        ended: true,
        uuid: this.uuid,
        name: this.options.name,
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
        console.warn(
          "warning: more than one html canvas was found. Using the first one"
        );
      }
      htmlCanvas = canvasCollection[0];
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
    const surface = this.canvasKit.MakeCanvasSurface(this.htmlCanvas);
    if (surface === null) {
      throw new Error(
        `could not make CanvasKit surface from canvas HTML element`
      );
    }
    this.surface = surface;
    console.log(
      `CanvasKit surface is backed by ${
        this.surface.reportBackendTypeIsGPU() ? "GPU" : "CPU"
      }`
    );
    this.surface.getCanvas().scale(Globals.canvasScale, Globals.canvasScale);
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

  private setupEventHandlers(): void {
    if (this.htmlCanvas === undefined) {
      throw new Error("main html canvas is undefined");
    }
    // When the callback is executed, within the execuion of the callback code
    // we want 'this' to be this game object, not the html canvas to which the event listener is attached.
    // Thus, we use "this.htmlCanvasMouseDownHandler.bind(this)" instead of the usual "htmlCanvasMouseDownHandler"
    this.htmlCanvas.addEventListener(
      "mousedown",
      this.htmlCanvasMouseDownHandler.bind(this)
    );
    this.htmlCanvas.addEventListener(
      "touchstart",
      this.htmlCanvasTouchStartHandler.bind(this)
    );
  }

  private loop(canvas: Canvas): void {
    if (this.gameStopRequested) {
      // not sure if it is necessary/recommended to delete?
      // if (this.surface === undefined) {
      //   throw new Error("CanvasKit surface is undefined");
      // }
      // this.surface.deleteLater();
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

      if (this.incomingSceneTransitions.length > 0) {
        // in order to do a scene transition, we need an image of the outgoing scene
        this.currentSceneSnapshot = this.takeCurrentSceneSnapshot();
      }

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
    if (this.surface === undefined) {
      throw new Error("CanvasKit surface is undefined");
    }
    this.surface.requestAnimationFrame(this.loop.bind(this));
  }

  private updateGameTime(): void {
    Globals.now = window.performance.now();
    if (this.priorUpdateTime) {
      Globals.deltaTime = Globals.now - this.priorUpdateTime;
    } else {
      Globals.deltaTime = 0;
    }
  }

  private handleIncomingSceneTransitions(
    incomingSceneTransitions: Array<SceneTransition>
  ): void {
    // only begin this scene transition if we have a snapshot of the current scene
    if (incomingSceneTransitions.length > 0 && this.currentSceneSnapshot) {
      const incomingSceneTransition = incomingSceneTransitions.shift();
      if (incomingSceneTransition === undefined) {
        // should not happen; checked this.incomingSceneTransitions.length > 0
        throw new Error("no incoming scene transition");
      }

      const incomingScene = incomingSceneTransition.scene;
      const transition = incomingSceneTransition.transition;

      // no transition (type "none"); just present the incoming scene
      if (transition.type === TransitionType.none) {
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
    if (this.showFps) {
      this.drawFps(canvas);
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
      case TransitionType.slide: {
        const direction = (transition as SlideTransition).direction;
        switch (direction) {
          case TransitionDirection.left:
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
                    if (outgoingScene.game.currentSceneSnapshot) {
                      outgoingScene.game.currentSceneSnapshot.delete();
                    }
                  },
                  runDuringTransition: true,
                }),
              ])
            );
            break;
          case TransitionDirection.right:
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
                    if (outgoingScene.game.currentSceneSnapshot) {
                      outgoingScene.game.currentSceneSnapshot.delete();
                    }
                  },
                  runDuringTransition: true,
                }),
              ])
            );
            break;
          case TransitionDirection.up:
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
                    if (outgoingScene.game.currentSceneSnapshot) {
                      outgoingScene.game.currentSceneSnapshot.delete();
                    }
                  },
                  runDuringTransition: true,
                }),
              ])
            );
            break;
          case TransitionDirection.down:
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
                    if (outgoingScene.game.currentSceneSnapshot) {
                      outgoingScene.game.currentSceneSnapshot.delete();
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
    if (this.lastFpsUpdate === 0) {
      this.lastFpsUpdate = Globals.now;
      this.nextFpsUpdate = Globals.now + Constants.FPS_DISPLAY_UPDATE_INTERVAL;
    } else {
      if (Globals.now >= this.nextFpsUpdate) {
        this.fps =
          this.drawnFrames / ((Globals.now - this.lastFpsUpdate) / 1000);
        this.drawnFrames = 0;
        this.lastFpsUpdate = Globals.now;
        this.nextFpsUpdate =
          Globals.now + Constants.FPS_DISPLAY_UPDATE_INTERVAL;
      }

      canvas.save();
      const drawScale = Globals.canvasScale;
      canvas.scale(1 / drawScale, 1 / drawScale);
      if (!this.fpsTextFont || !this.fpsTextPaint) {
        throw new Error("fps font or paint is undefined");
      }
      canvas.drawText(
        "FPS: " + this.fps.toFixed(2),
        0,
        0 + Constants.FPS_DISPLAY_TEXT_FONT_SIZE * drawScale,
        this.fpsTextPaint,
        this.fpsTextFont
      );
      canvas.restore();
    }
  }

  /**
   * Creates an event listener for an entity based on the entity name
   *
   * @remarks Typically, event listeners will be created using a method specific to the event, such as onTapDown(). This alternative allows creation with entity name.
   *
   * @param eventType - the type of event to listen for, e.g., "tapdown"
   * @param entityName - the entity name for which an event will be listened
   * @param callback
   * @param replaceExistingCallback
   */
  createEventListener(
    eventType: string,
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

    switch (eventType) {
      case "tapdown": {
        entity.onTapDown(callback, replaceExistingCallback);
        break;
      }
      default: {
        throw new Error(
          `could not create event listener: event type ${eventType} is not known`
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

  private htmlCanvasMouseDownHandler(event: MouseEvent): void {
    event.preventDefault();
    const scene = this.currentScene;
    if (!scene || !this.sceneCanReceiveUserInteraction(scene)) {
      return;
    }

    const x = event.offsetX;
    const y = event.offsetY;
    const tapEvent: TapEvent = {
      target: scene,
      point: { x, y },
      handled: false,
    };
    this.processTaps(scene, tapEvent, x, y);
  }

  private htmlCanvasTouchStartHandler(event: TouchEvent): void {
    event.preventDefault();
    const scene = this.currentScene;
    if (!scene || !this.sceneCanReceiveUserInteraction(scene)) {
      return;
    }

    const canvas = event.target as HTMLCanvasElement;
    const bounds = canvas.getBoundingClientRect();
    const firstTouch = event.touches.item(0);
    if (firstTouch === null) {
      console.warn(
        "warning: canvas received touchstart event, but TouchList was empty"
      );
      return;
    }
    const x = firstTouch.pageX - bounds.x;
    const y = firstTouch.pageY - bounds.y;
    const tapEvent: TapEvent = {
      target: scene,
      point: { x, y },
      handled: false,
    };
    this.processTaps(scene, tapEvent, x, y);
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

  private processTaps(
    entity: Entity,
    tapEvent: TapEvent,
    x: number,
    y: number
  ): void {
    // if it's already been handled, don't do anything
    if (tapEvent.handled) {
      return;
    }

    // note: x and y are relative to the HTML canvas element
    if (
      entity.isUserInteractionEnabled &&
      this.tapIsWithinEntityBounds(entity, x, y)
    ) {
      this.handleEntityTapped(entity, tapEvent, x, y);
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
        .forEach((entity) => this.processTaps(entity, tapEvent, x, y));
    }
  }

  private handleEntityTapped(
    entity: Entity,
    tapEvent: TapEvent,
    x: number,
    y: number
  ): void {
    entity.eventListeners
      .filter((listener) => listener.eventType === "tapdown")
      .forEach((listener) => {
        if (listener.entityName === entity.name) {
          const bb = this.calculateEntityAbsoluteBoundingBox(entity);
          const relativeX =
            ((x - bb.xMin) / (bb.xMax - bb.xMin)) * entity.size.width;
          const relativeY =
            ((y - bb.yMin) / (bb.yMax - bb.yMin)) * entity.size.height;
          tapEvent.target = entity;
          tapEvent.point = { x: relativeX, y: relativeY };
          listener.callback(tapEvent);
        }
      });
  }

  private tapIsWithinEntityBounds(
    entity: Entity,
    x: number,
    y: number
  ): boolean {
    if (!entity.isDrawable) {
      throw "only drawable entities can receive tap events";
    }

    if (entity.size.width === 0 || entity.size.height === 0) {
      console.warn(
        `warning: entity ${entity.toString()} has isUserInteractionEnabled = true, but has no tappable area. Size is ${
          entity.size.width
        }, ${entity.size.height}`
      );
      return false;
    }

    if (entity.type === EntityType.textline && isNaN(entity.size.width)) {
      console.warn(
        `warning: entity ${entity.toString()} is a textline with width = NaN. A textline must have its width manually set.`
      );
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
    const xMin =
      entity.absolutePosition.x - entity.size.width * anchorPoint.x * scale;
    const xMax =
      entity.absolutePosition.x +
      entity.size.width * (1 - anchorPoint.x) * scale;
    const yMin =
      entity.absolutePosition.y - entity.size.height * anchorPoint.y * scale;
    const yMax =
      entity.absolutePosition.y +
      entity.size.height * (1 - anchorPoint.y) * scale;
    // const xMin = entity.absolutePosition.x - entity.size.width * anchorPoint.x * scale;
    // const xMax = entity.absolutePosition.x + entity.size.width * anchorPoint.x * scale;
    // const yMin = entity.absolutePosition.y - entity.size.height * anchorPoint.y * scale;
    // const yMax = entity.absolutePosition.y + entity.size.height * anchorPoint.y * scale;
    return { xMin, xMax, yMin, yMax };
  }
}
