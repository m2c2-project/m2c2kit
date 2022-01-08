import "./Globals";
import { Activity } from "./Activity";
import { CanvasKit, Canvas, Surface, Font, Image, Paint } from "canvaskit-wasm";
import { Constants } from "./Constants";
import { TapEvent } from "./TapListener";
import { IDrawable } from "./IDrawable";
import { Entity } from "./Entity";
import { EntityType } from "./EntityType";
import { Point } from "./Point";
import { RgbaColor } from "./RgbaColor";
import { Sprite } from "./Sprite";
import { Action } from "./Action";
import { LoadedImage } from "./LoadedImage";
import { Scene } from "./Scene";
import {
  SceneTransition,
  Transition,
  TransitionType,
  PushTransition,
  TransitionDirection,
} from "./Transition";
import { GameOptions } from "./GameOptions";
import { Session } from "./Session";
import { GameData } from "./GameData";
import { Uuid } from "./Uuid";

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
}
export class Game implements Activity {
  _canvasKit?: CanvasKit;
  _session?: Session;
  uuid = Uuid.generate();
  options: GameOptions;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(options: GameOptions, specifiedParameters: any = {}) {
    // store the game options, including the game's parameters
    // but override these default parameters with the specified parameters,
    // if supplied
    const { parameters, ...optionsWithoutGameParameters } = options;
    this.options = { ...optionsWithoutGameParameters };
    this.options.parameters = { ...parameters };
    Object.keys(specifiedParameters).forEach((key) => {
      if (!parameters || !(key in parameters)) {
        throw new Error(
          `game ${this.options.name} does not have a parameter named ${key}`
        );
      }
      if (this.options.parameters && this.options.parameters[key]) {
        this.options.parameters[key].value = specifiedParameters[key];
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
    metadata: {
      userAgent: "",
    },
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
  private incomingSceneTransitions = new Array<SceneTransition>();
  private currentSceneSnapshot?: Image;

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
   * Specifies the scene that will be presented upon the next frame draw.
   *
   * @param scene
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
        throw new Error(`scene ${scene} not found`);
      }
    } else {
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

    let initStartedTimeStamp = 0;
    if (!this.unitTesting) {
      initStartedTimeStamp = window.performance.now();
    }

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

    if (!this.unitTesting) {
      console.log(
        `Game.init() took ${(
          window.performance.now() - initStartedTimeStamp
        ).toFixed(0)} ms`
      );
    }

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
    this.surface.requestAnimationFrame(this.loop.bind(this));
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
      },
    };
    const trialSchema = this.options.trialSchema ?? {};

    const variables = Object.entries(trialSchema);
    const validDataTypes = ["number", "string", "boolean", "object"];
    for (const [variableName, propertySchema] of variables) {
      if (!validDataTypes.includes(propertySchema.type)) {
        throw new Error(
          `invalid schema. variable ${variableName} is type ${propertySchema.type}. type must be number, string, boolean, or object`
        );
      }
    }
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
    const providedDataType = typeof value;
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
   * Calling this will trigger the onTrialComplete callback function,
   * if one was provided in SessionOptions. This is how the game communicates
   * trial data to the parent session, which can then save or process the data.
   * It is the responsibility of the the game programmer to call this at
   * the appropriate time. It is not triggered automatically.
   */
  trialComplete(): void {
    this.trialIndex++;
    if (this.session.options.gameCallbacks?.onGameTrialComplete) {
      this.session.options.gameCallbacks.onGameTrialComplete({
        // above, we just incremented the trialIndex by 1, so this
        // completed trial index is trialIndex - 1
        trialIndex: this.trialIndex - 1,
        gameParameters: this.options.parameters ?? {},
        gameData: this.data,
        trialSchema: this.options.trialSchema ?? {},
        gameUuid: this.uuid,
        gameName: this.options.name,
      });
    }
  }

  /**
   * Should be called when the current game has ended. This will trigger
   * the onGameEnd callback function, if one was provided in SessionOptions.
   * This is how the game communicates its ended or "finished" state to the
   * parent session.
   * It is the responsibility of the the game programmer to call this at
   * the appropriate time. It is not triggered automatically.
   */
  end(): void {
    if (this.session.options.gameCallbacks?.onGameEnd) {
      this.session.options.gameCallbacks.onGameEnd({
        ended: true,
        gameUuid: this.uuid,
        gameName: this.options.name,
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
        // this should not happen, because above we verified that
        // this.incomingSceneTransitions.length > 0
        throw new Error("no incoming scene transition");
      }

      const incomingScene = incomingSceneTransition.scene;
      const transition = incomingSceneTransition.transition;

      const outgoingSceneImage = this.currentSceneSnapshot;
      if (!outgoingSceneImage) {
        throw new Error("no outgoing scene image");
      }

      const outgoingScene = new Scene({ name: "outgoingScene" });
      // Typically, a scene's width and height are assigned in its
      // initialize() function during update(). But that approach will not
      // work for scene transitions because we need the outgoing scene's width
      // and height for animateSceneTransition(), which will execute before
      // update(). Therefore, to properly position the incoming scene
      // animation, we need to assign the outgoing scene's width and height now.
      outgoingScene.size.width = this.canvasCssWidth;
      outgoingScene.size.height = this.canvasCssHeight;

      this.addScene(outgoingScene);
      if (!outgoingSceneImage) {
        console.log("outgoingSceneImage is undefined/null");
      }
      const loadedImage = new LoadedImage(
        "outgoingSceneSnapshot",
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
        name: "outgoingSceneSprite",
        imageName: "outgoingSceneSnapshot",
        position: new Point(
          this.canvasCssWidth / Globals.rootScale / 2,
          this.canvasCssHeight / Globals.rootScale / 2
        ),
      });
      spr.scale = 1 / Globals.rootScale;
      outgoingScene.addChild(spr);
      outgoingScene._active = true;
      if (incomingScene !== this.currentScene && this.currentScene) {
        this.currentScene._active = false;
      }

      this.currentScene = incomingScene;
      this.currentScene._active = true;

      if (incomingScene._setupCallback) {
        incomingScene._setupCallback(incomingScene);
      }

      if (outgoingScene && incomingScene) {
        if (transition) {
          this.animateSceneTransition(incomingScene, transition, outgoingScene);
        } else {
          outgoingScene._active = false;
        }
      }
    }
  }

  private update(): void {
    this.scenes
      .filter((scene) => scene._active)
      .forEach((scene) => scene.update());
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
      case TransitionType.push: {
        const direction = (transition as PushTransition).direction;
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
              Action.Sequence([
                Action.Move({
                  point: new Point(0, 0),
                  duration: duration,
                  runDuringTransition: true,
                }),
                Action.Custom({
                  callback: () => {
                    incomingScene._transitioning = false;
                  },
                  runDuringTransition: true,
                }),
              ])
            );
            outgoingScene.run(
              Action.Sequence([
                Action.Move({
                  point: new Point(-outgoingScene.size.width, 0),
                  duration: duration,
                  runDuringTransition: true,
                }),
                Action.Custom({
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
              Action.Sequence([
                Action.Move({
                  point: new Point(0, 0),
                  duration: duration,
                  runDuringTransition: true,
                }),
                Action.Custom({
                  callback: () => {
                    incomingScene._transitioning = false;
                  },
                  runDuringTransition: true,
                }),
              ])
            );
            outgoingScene.run(
              Action.Sequence([
                Action.Move({
                  point: new Point(outgoingScene.size.width, 0),
                  duration: duration,
                  runDuringTransition: true,
                }),
                Action.Custom({
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
              Action.Sequence([
                Action.Move({
                  point: new Point(0, 0),
                  duration: duration,
                  runDuringTransition: true,
                }),
                Action.Custom({
                  callback: () => {
                    incomingScene._transitioning = false;
                  },
                  runDuringTransition: true,
                }),
              ])
            );
            outgoingScene.run(
              Action.Sequence([
                Action.Move({
                  point: new Point(0, -outgoingScene.size.height),
                  duration: duration,
                  runDuringTransition: true,
                }),
                Action.Custom({
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
              Action.Sequence([
                Action.Move({
                  point: new Point(0, 0),
                  duration: duration,
                  runDuringTransition: true,
                }),
                Action.Custom({
                  callback: () => {
                    incomingScene._transitioning = false;
                  },
                  runDuringTransition: true,
                }),
              ])
            );
            outgoingScene.run(
              Action.Sequence([
                Action.Move({
                  point: new Point(0, outgoingScene.size.height),
                  duration: duration,
                  runDuringTransition: true,
                }),
                Action.Custom({
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
   * Creates a tap listener for an entity based on the entity name
   *
   * @remarks Typically, tap listeners will be created using the onTap() method of each entity. This alternative allows creation with entity name.
   *
   * @param entityName
   * @param codeCallback
   * @param replaceExistingCodeCallback
   */
  createTapListener(
    entityName: string,
    codeCallback: (tapEvent: TapEvent) => void,
    replaceExistingCodeCallback = true
  ): void {
    const entities = this.entities.filter(
      (entity) => entity.name === entityName
    );
    if (entities.length > 1) {
      console.warn(
        `warning: CreateTapListener() found more than one entity with name ${entityName}. Tap listener will be attached to first entity found. All entities that receive tap events should be uniquely named`
      );
    }
    const entity = entities
      .filter((entity) => entity.name === entityName)
      .find(Boolean);
    if (entity === undefined) {
      throw new Error(
        `could not add taplistener. entity with name ${entityName} could not be found in the game entity tree`
      );
    }

    entity.onTap(codeCallback, replaceExistingCodeCallback);
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
    this.scenes.forEach((scene) => getChildEntitiesRecursive(scene, entities));
    return entities;
  }

  //#region User Interaction ------------------------------------------------------------
  private htmlCanvasMouseDownHandler(event: MouseEvent): void {
    event.preventDefault();
    const scene = this.currentScene;
    if (!scene || !this.sceneCanReceiveUserInteraction(scene)) {
      return;
    }

    const x = event.offsetX;
    const y = event.offsetY;
    this.processTaps(scene, x, y);
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
    this.processTaps(scene, x, y);
  }

  private sceneCanReceiveUserInteraction(scene: Scene): boolean {
    if (
      scene.game === scene.game.session?.currentActivity &&
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

  private processTaps(entity: Entity, x: number, y: number): void {
    // note: x and y are relative to the HTML canvas element
    if (
      entity.isUserInteractionEnabled &&
      this.tapIsWithinEntityBounds(entity, x, y)
    ) {
      this.handleEntityTapped(entity, x, y);
    }
    if (entity.children) {
      entity.children
        // a hidden entity (and its children) can't receive taps,
        // even if isUserInteractionEnabled is true
        .filter((entity) => !entity.hidden)
        .forEach((entity) => this.processTaps(entity, x, y));
    }
  }

  private handleEntityTapped(entity: Entity, x: number, y: number): void {
    entity.tapListeners.forEach((listener) => {
      if (listener.entityName === entity.name) {
        if (listener.codeCallback) {
          const bb = this.calculateEntityAbsoluteBoundingBox(entity);
          const relativeX =
            ((x - bb.xMin) / (bb.xMax - bb.xMin)) * entity.size.width;
          const relativeY =
            ((y - bb.yMin) / (bb.yMax - bb.yMin)) * entity.size.height;
          listener.codeCallback({
            tappedEntity: entity,
            point: new Point(relativeX, relativeY),
          });
        } else {
          throw new Error(
            `tap listener codeCallback for ${entity.name} is undefined`
          );
        }
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
