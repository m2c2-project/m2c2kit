import { CanvasKitInit } from "./canvaskit";
import { ttfInfo } from "./ttfInfo.js";
import {
  CanvasKit,
  Canvas,
  Surface,
  Font,
  FontMgr,
  Typeface,
  Image,
  Paint,
} from "canvaskit-wasm";
import { Constants } from "./Constants";
import { TapEvent } from "./TapListener";
import { IDrawable } from "./IDrawable";
import { Entity, handleInterfaceOptions } from "./Entity";
import { EntityType } from "./EntityType";
import { Point } from "./Point";
import { RgbaColor } from "./RgbaColor";
import { SceneOptions } from "./SceneOptions";
import { Sprite } from "./Sprite";

export { WebColors } from "./WebColors";

/**
 * Options to specify HTML canvas, set game canvas size, and load game assets.
 */
export interface GameInitOptions {
  /** Id of the HTML canvas that game will be drawn on. If not provided, the first canvas found will be used */
  canvasId?: string;
  /** Width of game canvas */
  width: number;
  /** Height of game canvas */
  height: number;
  /** Stretch to fill screen? Default is false */
  stretch?: boolean;
  /** Schema of trial data; JSON object where key is variable name, value is data type */
  trialSchema?: object;
  /** Default game parameters; JSON object where key is the game parameter, value is default value */
  defaultParameters?: object;
  /** String array of urls from which to load fonts. The first element will be the default font */
  fontUrls?: Array<string>;
  /** Array of SvgImage objects to render and load */
  svgImages?: SvgImage[];
  /** Show FPS in upper left corner? Default is false */
  showFps?: boolean;
  /** Color of the html body, if the game does not fill the screen. Useful for showing scene boundaries. Default is the scene background color */
  bodyBackgroundColor?: RgbaColor;
  /** Adapt execution for unit testing? Default is false */
  _unitTesting?: boolean;
}

/**
 * SVG image to be rendered and loaded from a URL or HTML svg tag in string form.
 */
export interface SvgImage {
  /** Name that will be used to refer to the SVG image. Must be unique among all images */
  name: string;
  /** Width to scale SVG image to */
  width: number;
  /** Height to scale SVG image to */
  height: number;
  /** The HTML SVG tag, in string form, that will be rendered and loaded. Must begin with &#60;svg> and end with &#60;/svg> */
  svgString?: string;
  /** URL of SVG asset to render and load */
  url?: string;
}

interface FontData {
  fontUrl: string;
  fontArrayBuffer: ArrayBuffer;
}

interface BoundingBox {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

interface TrialData {
  [key: string]: string | number | boolean | undefined | null;
}

interface Metadata {
  userAgent?: string;
}

interface GameData {
  trials: Array<TrialData>;
  metadata: Metadata;
}

interface LifecycleCallbacks {
  trialComplete: (
    trialNumber: number,
    data: GameData,
    trialSchema: object
  ) => void;
  allTrialsComplete: (data: GameData, trialSchema: object) => void;
}

export class Game {
  public static _canvasKit: CanvasKit;
  public static _now = NaN;
  public static _deltaTime = NaN;
  public static _canvasScale: number;
  // _rootScale is the scaling factor to be applied to scenes to scale up or
  // down to fit the device's window while preserving the aspect ratio the
  // game was designed for
  public _rootScale = 1.0;
  public entryScene?: Scene | string;
  // use "any" type for game parameters because these will be specific to each
  // game and could be anything; we can't type it now
  // TODO: is there a common, base structure (e.g., trials?) that should
  // be common to game parameters? Replace any with a GameParameters type?
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public parameters: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private defaultParameters: any;
  public data: GameData = {
    trials: new Array<TrialData>(),
    metadata: {
      userAgent: "",
    },
  };
  public trialNumber = 0;
  public trialSchema = {};
  // initialize the lifecycle callbacks to empty functions, in case they are called
  public lifecycle: LifecycleCallbacks = {
    trialComplete: function (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      trialNumber: number,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      data: GameData,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      trialSchema: object
    ): void {
      return;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    allTrialsComplete: function (data: GameData): void {
      return;
    },
  };

  private trialSchemaMap = new Map<string, string>();
  private htmlCanvas?: HTMLCanvasElement;
  private scratchHtmlCanvas?: HTMLCanvasElement;
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

  canvasCssWidth = 0;
  canvasCssHeight = 0;

  private scenes = new Array<Scene>();
  private incomingSceneTransitions = new Array<SceneTransition>();
  private currentSceneSnapshot?: Image;

  /**
   * Asynchronously initializes the game engine and load assets
   *
   * @param gameInitOptions
   * @returns Promise<void>
   */
  init(gameInitOptions: GameInitOptions): Promise<void> {
    this.unitTesting = gameInitOptions._unitTesting ?? false;

    let initStartedTimeStamp: number;
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

    const canvasKitPromise = this.loadCanvasKit();
    const fontDataPromises = this.fetchFonts(gameInitOptions.fontUrls);
    const renderedSvgImagesPromises = this.renderSvgImages(
      gameInitOptions.svgImages
    );

    this.data.metadata.userAgent = navigator.userAgent;

    this.defaultParameters = gameInitOptions.defaultParameters ?? {};
    this.initData(gameInitOptions.trialSchema ?? {});

    return Promise.all([
      canvasKitPromise,
      Promise.all(fontDataPromises),
      Promise.all(renderedSvgImagesPromises),
    ]).then(([canvasKit, fontData, renderedSvgImages]) => {
      Game._canvasKit = canvasKit;
      this.loadFonts(gameInitOptions.fontUrls, fontData);
      ImageManager.LoadRenderedSvgImages(renderedSvgImages);
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
    });
  }

  /**
   * Provide a callback function to be invoked when a trial has completed.
   * It is the responsibility of the the game programmer to call this
   * at the appropriate time. It is not triggered automatically.
   * @param codeCallback
   */
  onTrialComplete(
    codeCallback: (
      trialNumber: number,
      data: GameData,
      trialSchema: object
    ) => void
  ): void {
    this.lifecycle.trialComplete = codeCallback;
  }

  /**
   * Provide a callback function to be invoked when all trials are complete.
   * It is the responsibility of the the game programmer to call this
   * at the appropriate time. It is not triggered automatically.
   * @param codeCallback
   */
  onAllTrialsComplete(codeCallback: (data: GameData) => void): void {
    this.lifecycle.allTrialsComplete = codeCallback;
  }

  /**
   * Adds a scene to the game.
   *
   * @remarks A scene, and its children entities, cannot be preseneted unless it has been added to the game object.
   *
   * @param scene
   */
  addScene(scene: Scene): void {
    scene.size.width = this.canvasCssWidth;
    scene.size.height = this.canvasCssHeight;
    scene.game = this;
    this.scenes.push(scene);
  }

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
   * Gets the value of the specified game parameter. If the value was not
   * provided in the parameters property above, then return the value in
   * defaultParameters. If the parameterName is still not found, then
   * throw exception.
   * @param parameterName - the name of the game parameter whose value is requested
   * @returns
   */
  getParameter<T>(parameterName: string): T {
    if (
      this.parameters !== undefined &&
      Object.keys(this.parameters).includes(parameterName)
    ) {
      return this.parameters[parameterName] as T;
    } else if (this.defaultParameters === undefined) {
      throw new Error(
        `game parameter ${parameterName} not found: value and default value were not provided`
      );
    } else if (Object.keys(this.defaultParameters).includes(parameterName)) {
      return this.defaultParameters[parameterName] as T;
    } else {
      throw new Error(
        `game parameter ${parameterName} not found: value and default value were not provided`
      );
    }
  }

  /**
   * Starts the game loop. If entryScene is undefined, the game object's entryScene must be set.
   *
   * @param entryScene - The scene (Scene object or its string name) to display when the game starts
   */
  start(entryScene?: Scene | string): void {
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
    // @ts-ignore (because CanvasKit types are incomplete)
    this.surface.requestAnimationFrame(this.loop.bind(this));
  }

  initData(trialSchema: object): void {
    this.trialSchema = trialSchema;
    const variables = Object.entries(trialSchema);
    const validDataTypes = ["number", "string", "boolean", "object"];
    variables.forEach((kvp) => {
      if (!validDataTypes.includes(kvp[1])) {
        throw new Error(
          `invalid schema. variable ${kvp[0]} is type ${kvp[1]}. type must be number, string, boolean, or object`
        );
      }
      this.trialSchemaMap.set(kvp[0], kvp[1]);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addTrialData(variableName: string, value: any): void {
    if (this.data.trials.length < this.trialNumber + 1) {
      const emptyTrial: TrialData = {};

      this.trialSchemaMap.forEach((_, k) => {
        // note: when iterating over a Map, the callback function
        // parameters are (value, key); thus, (_, k)
        emptyTrial[k] = null;
      });
      this.data.trials.push(emptyTrial);
    }
    if (!this.trialSchemaMap.has(variableName)) {
      throw new Error(`trial variable ${variableName} not defined in schema`);
    }
    const expectedDataType = this.trialSchemaMap.get(variableName);
    const providedDataType = typeof value;
    if (providedDataType != expectedDataType) {
      throw new Error(
        `type for variable ${variableName} (value: ${value}) is "${providedDataType}". Based on schema for this variable, expected type was "${expectedDataType}"`
      );
    }
    this.data.trials[this.trialNumber][variableName] = value;
  }

  private loadCanvasKit(): Promise<CanvasKit> {
    return CanvasKitInit();
    // below is what I used when I had this import:
    // import * as CanvasKitInit from 'canvaskit-wasm';
    //
    // // @ts-ignore
    // return CanvasKitInit({
    //   locateFile: (file: string) => {
    //     // console.log(file);
    //     return file;
    //   }
    // })
  }

  private setupHtmlCanvases(
    canvasId: string | undefined,
    width: number,
    height: number,
    stretch: boolean | undefined
  ): void {
    Game._canvasScale = Math.round(window.devicePixelRatio * 100) / 100;

    let htmlCanvas: HTMLCanvasElement | undefined;
    if (canvasId === undefined) {
      const canvases = document.getElementsByTagName("canvas");
      if (canvases.length === 0) {
        throw new Error("no html canvas tag was found in the html");
      } else if (canvases.length > 1) {
        console.warn(
          "warning: more than one html canvas was found. Using the first one"
        );
      }
      htmlCanvas = canvases[0];
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
        this._rootScale = window.innerHeight / height;
      } else {
        this._rootScale = window.innerWidth / width;
      }
    }

    htmlCanvas.style.width = this._rootScale * width + "px";
    htmlCanvas.style.height = this._rootScale * height + "px";
    htmlCanvas.width = this._rootScale * width * Game._canvasScale;
    htmlCanvas.height = this._rootScale * height * Game._canvasScale;
    this.htmlCanvas = htmlCanvas;
    this.canvasCssWidth = width;
    this.canvasCssHeight = height;

    // scratch canvas is hidden. we have it so the browser can render svg elements
    // that we then use in CanvasKit (CanvasKit can not render svgs)
    const scratchCanvas = document.createElement("canvas");
    scratchCanvas.id = "m2c2kitscratchcanvas";
    scratchCanvas.hidden = true;
    document.body.appendChild(scratchCanvas);
    this.scratchHtmlCanvas = scratchCanvas;
  }

  private fetchFonts(fontUrls: string[] | undefined): Promise<FontData>[] {
    if (fontUrls) {
      return FontManager.FetchFontsAsArrayBuffers(fontUrls);
    } else {
      return new Array<Promise<FontData>>();
    }
  }

  private renderSvgImages(
    svgImages: SvgImage[] | undefined
  ): Promise<RenderedDataUrlImage>[] {
    if (this.scratchHtmlCanvas === undefined) {
      throw new Error("scratch html canvas is undefined");
    }
    ImageManager.initialize(this.scratchHtmlCanvas);
    if (svgImages) {
      return svgImages.map((svg) => {
        return ImageManager.renderSvgImage(svg);
      });
    } else {
      return new Array<Promise<RenderedDataUrlImage>>();
    }
  }

  private loadFonts(
    fontUrls: string[] | undefined,
    fontData: FontData[] | undefined
  ): void {
    if (!fontUrls || !fontData) {
      return;
    }
    // Load the fonts into the font manager in the same order that they were specified in the options.
    // Font data were fetched asynchronously and thus may be in any order in fontData
    // Order is important because the first loaded font will become the default font
    const fontsArrayBuffers = new Array<ArrayBuffer>();
    fontUrls.forEach((url) => {
      fontsArrayBuffers.push(
        fontData[fontData.findIndex((fd) => fd.fontUrl === url)].fontArrayBuffer
      );
    });
    FontManager.LoadFonts(fontsArrayBuffers);
  }

  private setupCanvasKitSurface(): void {
    if (this.htmlCanvas === undefined) {
      throw new Error("main html canvas is undefined");
    }
    const surface = Game._canvasKit.MakeCanvasSurface(this.htmlCanvas);
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
    this.surface.getCanvas().scale(Game._canvasScale, Game._canvasScale);
  }

  private setupFpsFont(): void {
    this.fpsTextFont = new Game._canvasKit.Font(
      null,
      Constants.FPS_DISPLAY_TEXT_FONT_SIZE * Game._canvasScale
    );
    this.fpsTextPaint = new Game._canvasKit.Paint();
    this.fpsTextPaint.setColor(
      Game._canvasKit.Color(
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

    this.priorUpdateTime = Game._now;
    // @ts-ignore (because CanvasKit types are incomplete)
    this.surface.requestAnimationFrame(this.loop.bind(this));
  }

  private updateGameTime(): void {
    Game._now = window.performance.now();
    if (this.priorUpdateTime) {
      Game._deltaTime = Game._now - this.priorUpdateTime;
    } else {
      Game._deltaTime = 0;
    }
  }

  private handleIncomingSceneTransitions(
    incomingSceneTransitions: Array<SceneTransition>
  ): void {
    // only begin this scene transition if we have a snapshot of the current scene
    if (incomingSceneTransitions.length > 0 && this.currentSceneSnapshot) {
      const incomingSceneTransition = incomingSceneTransitions.shift();
      if (incomingSceneTransition === undefined) {
        // this should not happen, because above we verified (this.incomingSceneTransitions.length > 0)
        throw new Error("no incoming scene transition");
      }

      const incomingScene = incomingSceneTransition.scene;
      const transition = incomingSceneTransition.transition;

      let outgoingScene: Scene | undefined;
      if (true) {
        //if (incomingScene === this.currentScene || incomingScene.name === 'page5b') {
        // because the scene is repeated, we have to use an image for the outgoing scene animation
        const outgoingSceneImage = this.currentSceneSnapshot;
        if (!outgoingSceneImage) {
          throw new Error("no outgoing scene image");
        }

        outgoingScene = new Scene({ name: "outgoingScene" });
        this.addScene(outgoingScene);
        const loadedImage = new LoadedImage(
          "outgoingSceneSnapshot",
          outgoingSceneImage,
          this.canvasCssWidth,
          this.canvasCssHeight
        );
        ImageManager._loadedImages["outgoingSceneSnapshot"] = loadedImage;

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
            this.canvasCssWidth / this._rootScale / 2,
            this.canvasCssHeight / this._rootScale / 2
          ),
        });
        spr.scale = 1 / this._rootScale;
        outgoingScene.addChild(spr);
        outgoingScene._active = true;
        if (incomingScene !== this.currentScene && this.currentScene) {
          this.currentScene._active = false;
        }
      } else {
        outgoingScene = this.currentScene;
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
      this.lastFpsUpdate = Game._now;
      this.nextFpsUpdate = Game._now + Constants.FPS_DISPLAY_UPDATE_INTERVAL;
    } else {
      if (Game._now >= this.nextFpsUpdate) {
        this.fps = this.drawnFrames / ((Game._now - this.lastFpsUpdate) / 1000);
        this.drawnFrames = 0;
        this.lastFpsUpdate = Game._now;
        this.nextFpsUpdate = Game._now + Constants.FPS_DISPLAY_UPDATE_INTERVAL;
      }

      canvas.save();
      const drawScale = Game._canvasScale;
      canvas.scale(1 / drawScale, 1 / drawScale);
      canvas.drawText(
        "FPS: " + this.fps.toFixed(2),
        0,
        0 + Constants.FPS_DISPLAY_TEXT_FONT_SIZE * drawScale,
        this.fpsTextPaint!,
        this.fpsTextFont!
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
    const x = event.offsetX;
    const y = event.offsetY;
    const scene = this.currentScene;
    if (scene === undefined) {
      return;
    }
    if (scene._transitioning) {
      // don't allow interaction when scene is transitioning. If, during scene transition,
      // the user taps a button that starts another scene transition, the scene transition
      // state will be corrupted. We can have only one active scene transition.
      return;
    }
    this.processTaps(scene, x, y);
  }

  private htmlCanvasTouchStartHandler(event: TouchEvent): void {
    event.preventDefault();
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
    const scene = this.currentScene;
    if (scene === undefined) {
      return;
    }
    if (scene._transitioning) {
      // don't allow interaction when scene is transitioning, for reason described
      // in htmlCanvasMouseDownHandler()
      return;
    }
    this.processTaps(scene, x, y);
  }

  private processTaps(entity: Entity, x: number, y: number): void {
    if (
      entity.isUserInteractionEnabled &&
      this.tapIsWithinEntityBounds(entity, x, y)
    ) {
      this.handleEntityTapped(entity, x, y);
    }
    if (entity.children) {
      entity.children.forEach((entity) => this.processTaps(entity, x, y));
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
  //#endregion User Interaction
}

export class ImageManager {
  // scratchCanvas is an extra, non-visible canvas in the DOM we use so the native browser can render SVGs.
  private static scratchCanvas: HTMLCanvasElement;
  private static ctx: CanvasRenderingContext2D;
  private static scale: number;
  static _renderedDataUrlImages: Record<string, RenderedDataUrlImage> = {};
  static _loadedImages: Record<string, LoadedImage> = {};

  static initialize(scratchCanvas: HTMLCanvasElement): void {
    this.scratchCanvas = scratchCanvas;
    const context2d = ImageManager.scratchCanvas.getContext("2d");
    if (context2d === null) {
      throw new Error("could not get 2d canvas context from scratch canvas");
    }
    this.ctx = context2d;
    this.scale = window.devicePixelRatio;
  }

  static renderSvgImage(svgImage: SvgImage): Promise<RenderedDataUrlImage> {
    const image = document.createElement("img");
    return new Promise((resolve) => {
      image.width = svgImage.width;
      image.height = svgImage.height;
      image.onload = () => {
        ImageManager.scratchCanvas.width = svgImage.width * ImageManager.scale;
        ImageManager.scratchCanvas.height =
          svgImage.height * ImageManager.scale;
        ImageManager.ctx.scale(ImageManager.scale, ImageManager.scale);
        ImageManager.ctx.clearRect(0, 0, svgImage.width, svgImage.height);
        ImageManager.ctx.drawImage(
          image,
          0,
          0,
          svgImage.width,
          svgImage.height
        );
        const dataUrl = ImageManager.scratchCanvas.toDataURL();
        this._renderedDataUrlImages[svgImage.name] = new RenderedDataUrlImage(
          svgImage.name,
          dataUrl,
          svgImage.width,
          svgImage.height
        );
        image.remove();
        resolve(this._renderedDataUrlImages[svgImage.name]);
      };
      image.onerror = () => {
        this._renderedDataUrlImages[svgImage.name] = new RenderedDataUrlImage(
          svgImage.name,
          "",
          0,
          0
        );
        resolve(this._renderedDataUrlImages[svgImage.name]);
      };

      if (svgImage.svgString && svgImage.url) {
        throw new Error("provide svg string or url. both were provided");
      }
      if (svgImage.svgString) {
        image.src =
          "data:image/svg+xml," + encodeURIComponent(svgImage.svgString);
      } else if (svgImage.url) {
        image.src = svgImage.url;
      } else {
        throw new Error("no svg string or url provided");
      }
    });
  }

  static LoadRenderedSvgImages(urls: RenderedDataUrlImage[]): void {
    urls.forEach((url) => ImageManager.convertRenderedDataUrlImage(url));
  }

  private static convertRenderedDataUrlImage(
    loadedDataUrlImage: RenderedDataUrlImage
  ): void {
    let img: Image | null = null;
    try {
      img = Game._canvasKit.MakeImageFromEncoded(
        dataURLtoArrayBuffer(loadedDataUrlImage.dataUrlImage)
      );
    } catch {
      throw new Error(
        `could not create image with name "${loadedDataUrlImage.name}"`
      );
    }
    if (img === null) {
      throw new Error(
        `could not create image with name "${loadedDataUrlImage.name}"`
      );
    }
    const loadedImage = new LoadedImage(
      loadedDataUrlImage.name,
      img,
      loadedDataUrlImage.width,
      loadedDataUrlImage.height
    );
    if (Object.keys(ImageManager._loadedImages).includes("name")) {
      throw new Error(
        `an image with name ${loadedDataUrlImage.name} was already loaded`
      );
    }
    ImageManager._loadedImages[loadedDataUrlImage.name] = loadedImage;
    console.log(
      `image loaded. name: ${loadedDataUrlImage.name}, w: ${loadedDataUrlImage.width}, h: ${loadedDataUrlImage.height}`
    );
  }
}

export class FontManager {
  static _fontMgr?: FontMgr;
  private static _typefaces: Record<string, Typeface> = {};

  static _getTypeface(name: string): Typeface {
    return this._typefaces[name];
  }

  static FetchFontsAsArrayBuffers(
    fontUrls: Array<string>
  ): Promise<FontData>[] {
    const fetchFontsPromises = fontUrls.map((fontUrl) =>
      fetch(fontUrl)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => ({
          fontUrl: fontUrl,
          fontArrayBuffer: arrayBuffer,
        }))
    );
    return fetchFontsPromises;
  }

  static LoadFonts(fonts: Array<ArrayBuffer>): void {
    this._fontMgr = Game._canvasKit.FontMgr.FromData(...fonts) ?? undefined;
    if (this._fontMgr === undefined) {
      throw new Error("error loading fonts");
    }
    fonts.forEach((font) => {
      const result = ttfInfo(new DataView(font));
      const fontFamily = result.meta.property
        .filter((p: { name: string; text: string }) => p.name === "font-family")
        .find(Boolean)?.text;
      if (fontFamily === undefined || this._fontMgr === undefined) {
        throw new Error("error loading fonts");
      }
      console.log("font loaded. font family: " + fontFamily);
      const typeface = this._fontMgr.MakeTypefaceFromData(font);
      this._typefaces[fontFamily] = typeface;
    });
  }
}

export class LoadedImage {
  constructor(
    public name: string,
    public image: Image,
    public width: number,
    public height: number
  ) {}
}

class RenderedDataUrlImage {
  constructor(
    public name: string,
    public dataUrlImage: string,
    public width: number,
    public height: number
  ) {}
}

class SceneTransition {
  constructor(public scene: Scene, public transition?: Transition) {}
}

//#region Transitions ------------------------------------------------------------
export abstract class Transition {
  abstract type: TransitionType;
  duration = 0;

  public static push(
    direction: TransitionDirection,
    duration: number
  ): PushTransition {
    return new PushTransition(direction, duration);
  }
}

export class PushTransition extends Transition {
  type = TransitionType.push;
  direction: TransitionDirection;
  constructor(direction: TransitionDirection, duration: number) {
    super();
    this.direction = direction;
    this.duration = duration;
  }
}

export enum TransitionType {
  push = "Push",
}

export enum TransitionDirection {
  up = "Up",
  down = "Down",
  right = "Right",
  left = "Left",
}
//#endregion Transitions

//#region Actions ------------------------------------------------------------

export interface MoveActionOptions {
  /** Destination point. The point is relative to the entity's parent coordinate system */
  point: Point;
  /** Duration of move, in milliseconds */
  duration: number;
  /** Should the action run during screen transitions? Default is no */
  runDuringTransition?: boolean;
}

export interface WaitActionOptions {
  /** Duration of wait, in milliseconds */
  duration: number;
  /** Should the action run during screen transitions? Default is no */
  runDuringTransition?: boolean;
}

export interface CustomActionOptions {
  /** callback - The callback function to be executed  */
  callback: () => void;
  /** Should the action run during screen transitions? Default is no */
  runDuringTransition?: boolean;
}

export interface ScaleActionOptions {
  /** The scaling ratio. 1 is no change, greater than 1 is make bigger, less than 1 is make smaller */
  scale: number;
  /** Duration of scale, in milliseconds */
  duration: number;
  /** Should the action run during screen transitions? Default is no */
  runDuringTransition?: boolean;
}

export abstract class Action {
  abstract type: ActionType;

  startOffset = -1;
  endOffset = -1;
  started = false;
  running = false;
  completed = false;
  runStartTime = -1;
  duration = 0;
  runDuringTransition: boolean;

  parent?: Action;
  isParent = false;
  isChild = false;
  key?: string;

  constructor(runDuringTransition = false) {
    this.runDuringTransition = runDuringTransition;
  }

  /**
   * Creates an action that will move an entity to a point on the screen.
   *
   * @param options - {@link MoveActionOptions}
   * @returns The move action
   */
  public static Move(options: MoveActionOptions): Action {
    return new MoveAction(
      options.point,
      options.duration,
      options.runDuringTransition ?? false
    );
  }

  /**
   * Creates an action that will wait a given duration before it is considered complete.
   *
   * @param options - {@link WaitActionOptions}
   * @returns The wait action
   */
  public static Wait(options: WaitActionOptions): Action {
    return new WaitAction(
      options.duration,
      options.runDuringTransition ?? false
    );
  }

  /**
   * Creates an action that will execute a callback function.
   *
   * @param options - {@link CustomActionOptions}
   * @returns The custom action
   */
  public static Custom(options: CustomActionOptions): Action {
    return new CustomAction(
      options.callback,
      options.runDuringTransition ?? false
    );
  }

  /**
   * Creates an action that will scale the entity's size.
   *
   * @remarks Scaling is relative to any inherited scaling, which is multiplicative. For example, if the entity's parent is scaled to 2.0 and this entity's action scales to 3.0, then the entity will appear 6 times as large as original.
   *
   * @param options - {@link ScaleActionOptions}
   * @returns The scale action
   */
  public static Scale(options: ScaleActionOptions): Action {
    return new ScaleAction(
      options.scale,
      options.duration,
      options.runDuringTransition
    );
  }

  /**
   * Creates an array of actions that will be run in order.
   *
   * @remarks The next action will not begin until the current one has finished. The sequence will be considered completed when the last action has completed.
   *
   * @param actions - One or more actions that form the sequence
   * @returns
   */
  public static Sequence(actions: Array<Action>): Action {
    const sequence = new SequenceAction(actions);
    sequence.children = actions;
    return sequence;
  }

  /**
   * Create an array of actions that will be run simultaneously.
   *
   * @remarks All actions within the group will begin to run at the same time. The group will be considered completed when the longest-running action has completed.
   *
   * @param actions - One or more actions that form the group
   * @returns
   */
  public static Group(actions: Array<Action>): Action {
    const group = new GroupAction(actions);
    group.children = actions;
    return group;
  }

  initialize(entity: Entity, key?: string): Array<Action> {
    // entity.runStartTime = -1;
    this.assignParents(this, this, key);
    const actions = this.flattenActions(this);
    actions.forEach(
      (action) => (action.duration = this.calculateDuration(action))
    );
    this.calculateStartEndOffsets(this);

    // clone actions so we can reuse them on other entities
    // we need to clone because actions have state that is updated over time
    // such as whether they are running or not, etc.
    // if we didn't clone actions, two entities running the same action would
    // share state
    const clonedActions = actions
      .filter(
        (action) =>
          action.type !== ActionType.group &&
          action.type !== ActionType.sequence
      )
      .map((action) => {
        // to prevent circular references, set parent to defined
        // we needed parent only when calculating durations, we no
        // longer need it when executing the actions
        return Action.cloneAction(action, key);
      });

    return clonedActions;
  }

  static cloneAction(action: Action, key?: string): Action {
    let cloned: Action;

    switch (action.type) {
      case ActionType.sequence: {
        const sequence = action as SequenceAction;
        const sequenceChildren = sequence.children.map((child) =>
          Action.cloneAction(child, key)
        );
        cloned = Action.Sequence(sequenceChildren);
        break;
      }
      case ActionType.group: {
        const group = action as SequenceAction;
        const groupChildren = group.children.map((child) =>
          Action.cloneAction(child, key)
        );
        cloned = Action.Sequence(groupChildren);
        break;
      }
      case ActionType.move: {
        const move = action as MoveAction;
        cloned = Action.Move({
          point: move.point,
          duration: move.duration,
          runDuringTransition: move.runDuringTransition,
        });
        break;
      }
      case ActionType.custom: {
        const code = action as CustomAction;
        cloned = Action.Custom({
          callback: code.codeCallback,
          runDuringTransition: code.runDuringTransition,
        });
        break;
      }
      case ActionType.scale: {
        const scale = action as ScaleAction;
        cloned = Action.Scale({
          scale: scale.scale,
          duration: scale.duration,
          runDuringTransition: scale.runDuringTransition,
        });
        break;
      }
      case ActionType.wait: {
        const wait = action as WaitAction;
        cloned = Action.Wait({
          duration: wait.duration,
          runDuringTransition: wait.runDuringTransition,
        });
        break;
      }
      default:
        throw new Error("unknown action");
    }
    if (key !== undefined) {
      cloned.key = key;
    }
    cloned.startOffset = action.startOffset;
    cloned.endOffset = action.endOffset;
    return cloned;
  }

  static evaluateAction(
    action: Action,
    entity: Entity,
    now: number,
    dt: number
  ): void {
    // action should not start yet
    if (now < action.runStartTime + action.startOffset) {
      return;
    }

    if (
      now >= action.runStartTime + action.startOffset &&
      now <= action.runStartTime + action.startOffset + action.duration
    ) {
      action.running = true;
    } else {
      action.running = false;
    }

    if (action.running === false && action.completed === true) {
      return;
    }

    const elapsed = now - (action.runStartTime + action.startOffset);

    if (action.type === ActionType.custom) {
      const customAction = action as CustomAction;
      customAction.codeCallback();
      customAction.running = false;
      customAction.completed = true;
    }

    if (action.type === ActionType.wait) {
      const waitAction = action as WaitAction;
      if (now > action.runStartTime + action.startOffset + action.duration) {
        waitAction.running = false;
        waitAction.completed = true;
      }
    }

    if (action.type === ActionType.move) {
      const moveAction = action as MoveAction;

      if (!moveAction.started) {
        moveAction.dx = moveAction.point.x - entity.position.x;
        moveAction.dy = moveAction.point.y - entity.position.y;
        moveAction.started = true;
      }

      if (elapsed < moveAction.duration) {
        entity.position.x =
          entity.position.x + moveAction.dx * (dt / moveAction.duration);
        entity.position.y =
          entity.position.y + moveAction.dy * (dt / moveAction.duration);
      } else {
        entity.position.x = moveAction.point.x;
        entity.position.y = moveAction.point.y;
        moveAction.running = false;
        moveAction.completed = true;
      }
    }

    if (action.type === ActionType.scale) {
      const scaleAction = action as ScaleAction;

      if (!scaleAction.started) {
        scaleAction.delta = scaleAction.scale - entity.scale;
        scaleAction.started = true;
      }

      if (elapsed < scaleAction.duration) {
        entity.scale =
          entity.scale + scaleAction.delta * (dt / scaleAction.duration);
      } else {
        entity.scale = scaleAction.scale;
        scaleAction.running = false;
        scaleAction.completed = true;
      }
    }
  }

  private calculateDuration(action: Action): number {
    if (action.type === ActionType.group) {
      const groupAction = action as GroupAction;
      const duration = groupAction.children
        .map((child) => this.calculateDuration(child))
        .reduce((max, dur) => {
          return Math.max(max, dur);
        }, 0);
      return duration;
    }

    if (action.type === ActionType.sequence) {
      const groupAction = action as GroupAction;
      const duration = groupAction.children
        .map((child) => this.calculateDuration(child))
        .reduce((sum, dur) => {
          return sum + dur;
        }, 0);
      return duration;
    }

    return action.duration;
  }

  private calculateStartEndOffsets(action: Action): void {
    let parentStartOffset = 0;
    if (action.parent !== undefined) {
      parentStartOffset = action.parent.startOffset;
    }

    if (action.parent?.type! === ActionType.group) {
      action.startOffset = parentStartOffset;
      action.endOffset = action.startOffset + action.duration;
    } else if (action.parent?.type === ActionType.sequence) {
      const parent = action.parent as IActionContainer;

      let dur = 0;
      for (const a of parent!.children!) {
        if (a === action) {
          break;
        }
        dur = dur + a.duration;
      }
      action.startOffset = dur;
      action.endOffset = action.startOffset + action.duration;
    } else {
      action.startOffset = parentStartOffset;
      action.endOffset = action.startOffset + action.duration;
    }

    if (action.isParent) {
      (action as IActionContainer).children?.forEach((child) =>
        this.calculateStartEndOffsets(child)
      );
    }
  }

  private flattenActions(
    action: Action,
    actions?: Array<Action>
  ): Array<Action> {
    if (!actions) {
      actions = new Array<Action>();
      actions.push(action);
    }
    if (action.isParent) {
      const parent = action as IActionContainer;
      const children = parent.children!;
      actions.push(...children);
      parent
        .children!.filter((child) => child.isParent)
        .forEach((child: Action) => this.flattenActions(child, actions));
    }
    return actions;
  }

  private assignParents(
    action: Action,
    rootAction: Action,
    key?: string
  ): void {
    if (key !== undefined) {
      action.key = key;
    }
    if (!rootAction) {
      rootAction = action;
      rootAction.parent = undefined;
    }
    if (action.isParent) {
      const parent = action as IActionContainer;
      const children = parent.children!;
      children.forEach((child) => {
        child.parent = action;
      });
      parent
        .children!.filter((child) => child.isParent)
        .forEach((child: Action) => this.assignParents(child, rootAction, key));
    }
  }
}

interface IActionContainer {
  children?: Array<Action>;
}

class SequenceAction extends Action implements IActionContainer {
  type = ActionType.sequence;
  children: Array<Action>;
  constructor(actions: Array<Action>) {
    super();
    this.children = actions;
    this.isParent = true;
  }
}

class GroupAction extends Action implements IActionContainer {
  type = ActionType.group;
  children = new Array<Action>();
  constructor(actions: Array<Action>) {
    super();
    this.children = actions;
    this.isParent = true;
  }
}

class CustomAction extends Action {
  type = ActionType.custom;
  codeCallback: () => void;
  constructor(codeCallback: () => void, runDuringTransition = false) {
    super(runDuringTransition);
    this.codeCallback = codeCallback;
    this.isParent = false;
    this.duration = 0;
  }
}

class WaitAction extends Action {
  type = ActionType.wait;
  constructor(duration: number, runDuringTransition: boolean) {
    super(runDuringTransition);
    this.duration = duration;
    this.isParent = false;
  }
}

class ScaleAction extends Action {
  type = ActionType.scale;
  scale: number;
  delta = 0;
  constructor(scale: number, duration: number, runDuringTransition = false) {
    super(runDuringTransition);
    this.duration = duration;
    this.scale = scale;
    this.isParent = false;
  }
}

class MoveAction extends Action {
  type = ActionType.move;
  point: Point;
  dx = 0;
  dy = 0;
  constructor(point: Point, duration: number, runDuringTransition: boolean) {
    super(runDuringTransition);
    this.duration = duration;
    this.point = point;
    this.isParent = false;
  }
}

enum ActionType {
  sequence = "Sequence",
  group = "Group",
  wait = "Wait",
  custom = "Custom",
  move = "Move",
  scale = "Scale",
}
//#endregion Actions

//#region Interface options ------------------------------------------------------------
export interface Constraints {
  topToTopOf?: Entity | string;
  topToBottomOf?: Entity | string;
  bottomToTopOf?: Entity | string;
  bottomToBottomOf?: Entity | string;
  startToStartOf?: Entity | string;
  startToEndOf?: Entity | string;
  endToEndOf?: Entity | string;
  endToStartOf?: Entity | string;
  horizontalBias?: number;
  verticalBias?: number;
  // the following allows access to properties using a string key
  [key: string]: Entity | string | number | undefined;
}

/**
 * This class is used internally for processing layout constraints that
 * have been defined according to the Contraints interface.
 *
 * Imagine we have two entities, A and B. B's position is set
 * using its position property. A's position is set using the layout
 * constraint "bottomToTopOf B." A is the focal entity in this example.
 * What this means is that A's y coordinate will be computed such that
 * the bottom of A is the top of B. If A and B are squares, then A sits
 * on top of B with no gap.
 */
export class LayoutConstraint {
  // the constraint, e.g., bottomToTopOf
  type: ConstraintType;
  // alter is the other entity that the focal entity is contrained to.
  // in the example above, A is the focal entity, B is the alter
  // thus the alter entity property is B
  alterEntity: Entity;

  // the below 3 properties are calculated from the constraint type
  // (we set them to false by default to avoid undefined warnings, but
  // they will be definitely assigned in the constructor logic)
  // the properties are used in the positioning update step
  //
  // does the constraint affect the Y or X axis? If not, then it's
  // a horizontal constraint
  verticalConstraint = false;
  // does the constraint apply to the focal entity's "minimum" position
  // along its axis? That is, does the constraint reference the focal
  // entity's "top" or "start"? Top and start are considered minimums because
  // our origin (0, 0) in the upper left.
  // If not, then the constraint applies to the focal entity's "maximum"
  // position, e.g., its "bottom" or "end".
  focalEntityMinimum = false;
  // does the constraint apply to the alter entity's "minimum" position
  // along its axis?
  alterEntityMinimum = false;

  verticalTypes = [
    ConstraintType.topToTopOf,
    ConstraintType.topToBottomOf,
    ConstraintType.bottomToTopOf,
    ConstraintType.bottomToBottomOf,
  ];

  // e.g., entity A
  focalEntityMinimumTypes = [
    ConstraintType.topToTopOf,
    ConstraintType.topToBottomOf,
    ConstraintType.startToStartOf,
    ConstraintType.startToEndOf,
  ];

  // e.g., entity B
  alterEntityMinimumTypes = [
    ConstraintType.topToTopOf,
    ConstraintType.bottomToTopOf,
    ConstraintType.startToStartOf,
    ConstraintType.endToStartOf,
  ];

  constructor(type: ConstraintType, alterEntity: Entity) {
    this.type = type;
    this.alterEntity = alterEntity;

    // If it's not a vertical constraint, it's a horizontal contraint
    // similarly, if it's not a focal entitity minimum constraint,
    // it's a focal entitity maximum constraint. All of these are binary,
    // so we can use a series of if/else to completely assign values to
    // verticalConstraint, focalEntityMinimum, and alterEntityMinimum
    //
    if (this.verticalTypes.includes(type)) {
      this.verticalConstraint = true;
      if (this.focalEntityMinimumTypes.includes(type)) {
        this.focalEntityMinimum = true;
      } else {
        this.focalEntityMinimum = false;
      }
      if (this.alterEntityMinimumTypes.includes(type)) {
        this.alterEntityMinimum = true;
      } else {
        this.alterEntityMinimum = false;
      }
    } else {
      this.verticalConstraint = false;
      if (this.focalEntityMinimumTypes.includes(type)) {
        this.focalEntityMinimum = true;
      } else {
        this.focalEntityMinimum = false;
      }
      if (this.alterEntityMinimumTypes.includes(type)) {
        this.alterEntityMinimum = true;
      } else {
        this.alterEntityMinimum = false;
      }
    }
  }
}

/**
 * This enum is used interally for processing the layout constraints. We use
 * an enum to avoid magic strings.
 */
export enum ConstraintType {
  topToTopOf = "topToTopOf",
  topToBottomOf = "topToBottomOf",
  bottomToTopOf = "bottomToTopOf",
  bottomToBottomOf = "bottomToBottomOf",
  startToStartOf = "startToStartOf",
  startToEndOf = "startToEndOf",
  endToEndOf = "endToEndOf",
  endToStartOf = "endToStartOf",
}

/**
 * The Layout allows relative positioning via constraints.
 * This is not fully implemented yet: DO NOT USE!
 * We use it internally for instructions.
 */
export interface Layout {
  height?: number;
  width?: number;
  marginStart?: number;
  marginEnd?: number;
  marginTop?: number;
  marginBottom?: number;
  constraints?: Constraints;
}

export enum Dimensions {
  MATCH_CONSTRAINT = 0,
}

export class Scene extends Entity implements IDrawable {
  readonly type = EntityType.scene;
  isDrawable = true;
  // Drawable options
  anchorPoint = new Point(0, 0);
  zPosition = 0;
  // Scene options
  private _backgroundColor = Constants.DEFAULT_SCENE_BACKGROUND_COLOR;

  _active = false;
  _transitioning = false;
  _setupCallback?: (scene: Scene) => void;
  private _game?: Game;
  private backgroundPaint?: Paint;

  /**
   * Top-level entity that holds all other entities, such as sprites, rectangles, or labels, that will be displayed on the screen
   *
   * @remarks The scene is the game screen or stage, and fills the entire available screen. There are usually multiple screens to contain multiple stages of the game, such as various instruction pages or phases of a game.
   *
   * @param options
   * @see {@link SceneOptions}
   */
  constructor(options: SceneOptions = {}) {
    super(options);
    handleInterfaceOptions(this, options);
    if (options.backgroundColor) {
      this.backgroundColor = options.backgroundColor;
    }
  }

  override initialize(): void {
    this.scale = this.game._rootScale;
    this.backgroundPaint = new Game._canvasKit.Paint();
    this.backgroundPaint.setColor(
      Game._canvasKit.Color(
        this.backgroundColor[0],
        this.backgroundColor[1],
        this.backgroundColor[2],
        this.backgroundColor[3]
      )
    );
    this.backgroundPaint.setStyle(Game._canvasKit.PaintStyle.Fill);
  }

  set game(game: Game) {
    this._game = game;
  }
  get game(): Game {
    if (this._game === undefined) {
      throw new Error("no active game");
    }
    return this._game;
  }
  get backgroundColor(): RgbaColor {
    return this._backgroundColor;
  }
  set backgroundColor(backgroundColor: RgbaColor) {
    this._backgroundColor = backgroundColor;
    this.needsInitialization = true;
  }

  /**
   * Code that will be called every time the screen is shown.
   *
   * @remarks Use this callback to "reset" entities to their initial state. For example, if a screen allows players to place dots on a grid, the setup() method should ensure the grid is clear of any prior dots from previous times this screen may have been displayed. In addition, if entities should vary in each iteration, that should be done here.
   *
   * @param codeCallback
   */
  setup(codeCallback: (scene: Scene) => void): void {
    this._setupCallback = codeCallback;
  }

  draw(canvas: Canvas): void {
    //console.log(`draw scene ${this.name} at point ${this.position.x},${this.position.y}`);
    // Except for its children, a scene itself only draws a background rectangle to "clear" the screen
    // Due to transition animations, this background rectangle may be beyond the viewable canvas bounds
    canvas.save();
    const drawScale = Game._canvasScale / this.absoluteScale;
    canvas.scale(1 / drawScale, 1 / drawScale);
    const rr = Game._canvasKit.RRectXY(
      Game._canvasKit.LTRBRect(
        this.position.x * drawScale * this.game._rootScale,
        this.position.y * drawScale * this.game._rootScale,
        (this.position.x + this.size.width) * drawScale * this.game._rootScale,
        (this.position.y + this.size.height) * drawScale * this.game._rootScale
      ),
      0,
      0
    );
    canvas.drawRRect(rr, this.backgroundPaint!);
    canvas.restore();

    super.drawChildren(canvas);
  }
}

export interface StoryOptions {
  sceneNamePrefix: string;
}

export abstract class Story {
  // We need to include options as argument, because the concrete classes use them
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static Create(options: StoryOptions): Array<Scene> {
    return new Array<Scene>();
  }
}

export class Timer {
  private originTime = -1;
  private startTime = -1;
  private stopTime = -1;
  private stopped = true;
  private _elapsed = -1;
  private name: string;

  private static _timers = new Array<Timer>();

  constructor(name: string) {
    this.name = name;
  }

  public static Start(name: string): void {
    let timer = this._timers.filter((t) => t.name === name).find(Boolean);
    if (timer === undefined) {
      timer = new Timer(name);
      timer.originTime = window.performance.now();
      timer._elapsed = 0;
      this._timers.push(timer);
    }

    timer.startTime = window.performance.now();
    timer.stopped = false;
  }

  public static Stop(name: string): void {
    const timer = this._timers.filter((t) => t.name === name).find(Boolean);
    if (timer === undefined) {
      throw new Error("timer with this name does not exist");
    }

    if (timer.stopped === true) {
      throw new Error("timer is already stopped");
    }

    timer.stopTime = window.performance.now();
    timer._elapsed = timer._elapsed + timer.stopTime - timer.startTime;
    timer.stopped = true;
  }

  static Restart(name: string): void {
    const timer = this._timers.filter((t) => t.name === name).find(Boolean);
    if (timer === undefined) {
      throw new Error("timer with this name does not exist");
    }

    timer.startTime = window.performance.now();
    timer._elapsed = 0;
    timer.stopped = false;
    console.log("timer restarted");
  }

  static Elapsed(name: string): number {
    const timer = this._timers.filter((t) => t.name === name).find(Boolean);
    if (timer === undefined) {
      throw new Error("timer with this name does not exist");
    }

    if (timer.stopped) {
      return timer._elapsed;
    }

    return timer._elapsed + window.performance.now() - timer.startTime;
  }

  static Remove(name: string): void {
    const timer = this._timers.filter((t) => t.name === name).find(Boolean);
    if (timer === undefined) {
      throw new Error("timer with this name does not exist");
    }

    this._timers.filter((t) => t.name != name);
  }

  static Exists(name: string): boolean {
    return this._timers.some((t) => t.name === name);
  }

  static RemoveAll(): void {
    this._timers = new Array<Timer>();
  }
}

export class RandomDraws {
  /**
   * Draw random integers, without replacement, from a uniform distribution.
   *
   * @param n
   * @param minimumInclusive
   * @param maximumInclusive
   * @returns array of integers
   */
  public static FromRangeWithoutReplacement(
    n: number,
    minimumInclusive: number,
    maximumInclusive: number
  ): Array<number> {
    const result = new Array<number>();
    for (let i = 0; i < n; i++) {
      const sampledNumber =
        Math.floor(Math.random() * (maximumInclusive - minimumInclusive)) +
        minimumInclusive;
      result.includes(sampledNumber) ? n++ : result.push(sampledNumber);
    }
    return result;
  }

  /**
   * Draw random grid cell locations, without replacement, from a uniform distribution of all grid cells. Grid cell locations are zero-based, i.e., upper-left is (0,0).
   *
   * @param n - Number of draws
   * @param rows  - Number of rows in grid; must be at least 1
   * @param columns - Number of columns in grid; must be at least 1
   * @param predicate - Optional lambda function that takes a grid row number and grid column number pair and returns a boolean to indicate if the pair should be allowed. For example, if one wanted to constrain the random grid location to be along the diagonal, the predicate would be: (row, column) => row === column
   * @returns array of grid cells. Each cell is object in form of { row: number, column: number }). Grid cell locations are zero-based
   */
  public static FromGridWithoutReplacement(
    n: number,
    rows: number,
    columns: number,
    predicate?: (row: number, column: number) => boolean
  ): Array<{ row: number; column: number }> {
    const result = new Array<{ row: number; column: number }>();
    const maximumInclusive = rows * columns - 1;
    const draws = this.FromRangeWithoutReplacement(n, 0, maximumInclusive);

    // TODO: add some code to check if we're stuck in infinite loop, such as when impossible predicate or more draws requested than is possible
    let i = 0;
    let replacementCell = NaN;
    while (i < n) {
      const column = draws[i] % columns;
      const row = (draws[i] - column) / columns;
      if (predicate === undefined || predicate(row, column)) {
        result.push({ row, column });
        i++;
      } else {
        do {
          replacementCell = this.FromRangeWithoutReplacement(
            1,
            0,
            maximumInclusive
          )[0];
        } while (draws.includes(replacementCell));
        draws[i] = replacementCell;
      }
    }
    return result;
  }
}

//#endregion Core classes ------------------------------------------------------------

// https://stackoverflow.com/a/8809472
export const generateUUID = () => {
  let d = new Date().getTime(),
    d2 = (performance && performance.now && performance.now() * 1000) || 0;
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c == "x" ? r : (r & 0x7) | 0x8).toString(16);
  });
};

const dataURLtoArrayBuffer = (dataUrl: string): ArrayBuffer => {
  const arr = dataUrl.split(",");
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return u8arr.buffer;
};

// from https://medium.com/@konduruharish/topological-sort-in-typescript-and-c-6d5ecc4bad95
/**
 * For a given directed acyclic graph, topological ordering of the vertices will be identified using BFS
 * @param adjList Adjacency List that represent a graph with vertices and edges
 */
export const findTopologicalSort = (
  adjList: Map<string, string[]>
): string[] => {
  const tSort: string[] = [];
  const inDegree: Map<string, number> = new Map();

  // find in-degree for each vertex
  adjList.forEach((edges, vertex) => {
    // If vertex is not in the map, add it to the inDegree map
    if (!inDegree.has(vertex)) {
      inDegree.set(vertex, 0);
    }

    edges.forEach((edge) => {
      // Increase the inDegree for each edge
      if (inDegree.has(edge)) {
        inDegree.set(edge, inDegree.get(edge)! + 1);
      } else {
        inDegree.set(edge, 1);
      }
    });
  });

  // Queue for holding vertices that has 0 inDegree Value
  const queue: string[] = [];
  inDegree.forEach((degree, vertex) => {
    // Add vertices with inDegree 0 to the queue
    if (degree == 0) {
      queue.push(vertex);
    }
  });

  // Traverse through the leaf vertices
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) {
      throw "bad";
    }
    tSort.push(current);
    // Mark the current vertex as visited and decrease the inDegree for the edges of the vertex
    // Imagine we are deleting this current vertex from our graph
    if (adjList.has(current)) {
      adjList.get(current)?.forEach((edge) => {
        if (inDegree.has(edge) && inDegree.get(edge)! > 0) {
          // Decrease the inDegree for the adjacent vertex
          const newDegree = inDegree.get(edge)! - 1;
          inDegree.set(edge, newDegree);

          // if inDegree becomes zero, we found new leaf node.
          // Add to the queue to traverse through its edges
          if (newDegree == 0) {
            queue.push(edge);
          }
        }
      });
    }
  }
  return tSort;
};