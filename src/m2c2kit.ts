import { WebColors } from "./WebColors";
import { CanvasKitInit } from "./canvaskit";
import {
  CanvasKit,
  Canvas,
  Surface,
  Font,
  FontMgr,
  Typeface,
  Image,
  Paragraph,
  Paint,
  EmbindEnumEntity,
  ParagraphStyle,
} from "canvaskit-wasm";
import ttfInfo from "./ttfInfo.js";
export { WebColors } from "./WebColors";

/**
 * Reasonable defaults to use if values are not specified.
 */
class Constants {
  public static readonly FPS_DISPLAY_TEXT_FONT_SIZE = 12;
  public static readonly FPS_DISPLAY_TEXT_COLOR: rgbaColor = [0, 0, 0, 0.5];
  public static readonly FPS_DISPLAY_UPDATE_INTERVAL = 500;
  public static readonly DEFAULT_SCENE_BACKGROUND_COLOR = WebColors.WhiteSmoke;
  public static readonly DEFAULT_SHAPE_FILL_COLOR = WebColors.Red;
  public static readonly DEFAULT_FONT_COLOR = WebColors.Black;
  public static readonly DEFAULT_FONT_SIZE = 16;
  public static readonly LIMITED_FPS_RATE = 5;
}

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
  /** String array of urls from which to load fonts. The first element will be the default font */
  fontUrls?: Array<string>;
  /** Array of SvgImage objects to render and load */
  svgImages?: SvgImage[];
  /** Show FPS in upper left corner? Default is false */
  showFps?: boolean;
  /** Color of the html body, if the game does not fill the screen. Useful for showing scene boundaries. Default is the scene background color */
  bodyBackgroundColor?: rgbaColor;
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

/**
 * Object passed to the tap event handler when the entity is tapped.
 */
export interface TapEvent {
  /** The entity that was tapped */
  tappedEntity: Entity;
  /** Point that was tapped on entity, relative to the entity coordinate system */
  point: Point;
}

/**
 * Position in two-dimensional space.
 */
export class Point {
  x: number;
  y: number;

  constructor(x?: number, y?: number) {
    if (x != null && y != null) {
      this.x = x;
      this.y = y;
    } else {
      this.x = 0;
      this.y = 0;
    }
  }
}

/**
 * Width and height on two-dimensional space
 */
export class Size {
  constructor(public width = 0, public height = 0) {
    this.width = width;
    this.height = height;
  }
}

/**
 * Color in red (0-255), green (0-255), blue (0-255), alpha (0-1) format. Must be numeric array of length 4.
 */
export type rgbaColor = [number, number, number, number];

// TODO: use entity uuid, not name, to prevent name conflicts/collisions
export class tapListener {
  entityName?: string;
  codeCallback?: (tapevent: TapEvent) => void;
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

export class Game {
  public static _canvasKit: CanvasKit;
  public static _now = NaN;
  public static _deltaTime = NaN;
  public static _canvasScale: number;
  // _rootScale is the scaling factor to be applied to scenes to scale up or
  // down to fit the device's window while preserving the aspect ratio the
  // game was designed for
  public _rootScale = 1.0;
  public entryScene?: Scene;

  private htmlCanvas?: HTMLCanvasElement;
  private scratchHtmlCanvas?: HTMLCanvasElement;
  private surface?: Surface;
  private showFps?: boolean;
  private bodyBackgroundColor?: rgbaColor;

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
    const initStartedTimeStamp = window.performance.now();

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
      console.log(
        `Game.init() took ${(
          window.performance.now() - initStartedTimeStamp
        ).toFixed(0)} ms`
      );
    });
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
      if (this.entryScene === undefined) {
        throw new Error(
          `cannot start game. the game object's entryScene has not been assigned`
        );
      }
      startingScene = this.entryScene;
    }

    this.presentScene(startingScene);
    // @ts-ignore (because CanvasKit types are incomplete)
    this.surface.requestAnimationFrame(this.loop.bind(this));
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

        const spr = new Sprite({
          name: "outgoingSceneSprite",
          imageName: "outgoingSceneSnapshot",
          position: new Point(
            this.canvasCssWidth / 2,
            this.canvasCssHeight / 2
          ),
        });
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
            // runDuringTransition to "true" for the Move and Code actions.
            // These transitions actions will move the screens and then set the scene's transitioning property
            // to false. It's important to set the transitioning property to false because then the regular,
            // non-transition actions previously set on the scene will then begin.
            // Also, very important to execute currentSceneSnapshot.delete() to prevent memory leaks
            incomingScene.run(
              Action.Sequence([
                Action.Move(new Point(0, 0), duration, true),
                Action.Code<Scene>((scene) => {
                  scene._transitioning = false;
                }, true),
              ])
            );
            outgoingScene.run(
              Action.Sequence([
                Action.Move(
                  new Point(-outgoingScene.size.width, 0),
                  duration,
                  true
                ),
                Action.Code<Scene>((scene) => {
                  scene._active = false;
                  scene._transitioning = false;
                  if (scene.game.currentSceneSnapshot) {
                    scene.game.currentSceneSnapshot.delete();
                  }
                }, true),
              ])
            );
            break;
          case TransitionDirection.right:
            incomingScene.position.x = -incomingScene.size.width;
            incomingScene.run(
              Action.Sequence([
                Action.Move(new Point(0, 0), duration, true),
                Action.Code<Scene>((scene) => {
                  scene._transitioning = false;
                }, true),
              ])
            );
            outgoingScene.run(
              Action.Sequence([
                Action.Move(
                  new Point(outgoingScene.size.width, 0),
                  duration,
                  true
                ),
                Action.Code<Scene>((scene) => {
                  scene._active = false;
                  scene._transitioning = false;
                  if (scene.game.currentSceneSnapshot) {
                    scene.game.currentSceneSnapshot.delete();
                  }
                }, true),
              ])
            );
            break;
          case TransitionDirection.up:
            incomingScene.position.y = incomingScene.size.height;
            incomingScene.run(
              Action.Sequence([
                Action.Move(new Point(0, 0), duration, true),
                Action.Code<Scene>((scene) => {
                  scene._transitioning = false;
                }, true),
              ])
            );
            outgoingScene.run(
              Action.Sequence([
                Action.Move(
                  new Point(0, -outgoingScene.size.height),
                  duration,
                  true
                ),
                Action.Code<Scene>((scene) => {
                  scene._active = false;
                  scene._transitioning = false;
                  if (scene.game.currentSceneSnapshot) {
                    scene.game.currentSceneSnapshot.delete();
                  }
                }, true),
              ])
            );
            break;
          case TransitionDirection.down:
            incomingScene.position.y = -incomingScene.size.height;
            incomingScene.run(
              Action.Sequence([
                Action.Move(new Point(0, 0), duration, true),
                Action.Code<Scene>((scene) => {
                  scene._transitioning = false;
                }, true),
              ])
            );
            outgoingScene.run(
              Action.Sequence([
                Action.Move(
                  new Point(0, outgoingScene.size.height),
                  duration,
                  true
                ),
                Action.Code<Scene>((scene) => {
                  scene._active = false;
                  scene._transitioning = false;
                  if (scene.game.currentSceneSnapshot) {
                    scene.game.currentSceneSnapshot.delete();
                  }
                }, true),
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

class LoadedImage {
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
export abstract class Action {
  abstract type: ActionType;

  startOffset = -1;
  endOffset = -1;
  started = false;
  running = false;
  completed = false;
  runStartTime = -1;
  duration = 0;
  runDuringTransition = false;

  parent?: Action;
  isParent = false;
  isChild = false;

  constructor(runDuringTransition = false) {
    this.runDuringTransition = runDuringTransition;
  }

  /**
   * Creates an action that will move an entity to a point on the screen.
   *
   * @remarks The point is relative to the entity's parent coordinate system.
   *
   * @param point - Destination point
   * @param durationMillis - Duration of move, in milliseconds
   * @param runDuringTransition - Should the action run during screen transitions? Default is no
   * @returns The move action
   */
  public static Move(
    point: Point,
    durationMillis: number,
    runDuringTransition = false
  ): Action {
    return new MoveAction(point, durationMillis, runDuringTransition);
  }

  /**
   * Creates an action that will wait a given duration before it is considered complete.
   *
   * @param durationMillis - Duration of wait, in milliseconds
   * @param runDuringTransition - Should the action run during screen transitions? Default is no
   * @returns The wait action
   */
  public static Wait(
    durationMillis: number,
    runDuringTransition = false
  ): Action {
    return new WaitAction(durationMillis, runDuringTransition);
  }

  /**
   * Creates an action that will execute a code callback function.
   *
   * @param codeCallback - The callback function to be executed
   * @param runDuringTransition - Should the action run during screen transitions? Default is no
   * @returns The code action
   */
  public static Code<T>(
    codeCallback: (entity: T) => void,
    runDuringTransition = false
  ): Action {
    return new CodeAction(codeCallback, runDuringTransition);
  }

  /**
   * Creates an action that will scale the entity's size.
   *
   * @remarks Scaling is relative to any inherited scaling, which is multiplicative. For example, if the entity's parent is scaled to 2.0 and this entity's action scales to 3.0, then the entity will appear 6 times as large as original.
   *
   * @param scale - The scaling ratio. 1 is no change, greater than 1 is make bigger, less than 1 is make smaller
   * @param durationMillis - Duration of scaling, in milliseconds
   * @param runDuringTransition - Should the action run during screen transitions? Default is no
   * @returns The scale action
   */
  public static Scale(
    scale: number,
    durationMillis: number,
    runDuringTransition = false
  ): Action {
    return new ScaleAction(scale, durationMillis, runDuringTransition);
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

  initialize(entity: Entity): Array<Action> {
    // entity.runStartTime = -1;
    this.assignParents(this, this);
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
        return Action.cloneAction(action);
      });

    return clonedActions;
  }

  static cloneAction(action: Action): Action {
    let cloned: Action;

    switch (action.type) {
      case ActionType.sequence: {
        const sequence = action as SequenceAction;
        const sequenceChildren = sequence.children.map(Action.cloneAction);
        cloned = Action.Sequence(sequenceChildren);
        break;
      }
      case ActionType.group: {
        const group = action as SequenceAction;
        const groupChildren = group.children.map(Action.cloneAction);
        cloned = Action.Sequence(groupChildren);
        break;
      }
      case ActionType.move: {
        const move = action as MoveAction;
        cloned = Action.Move(
          move.point,
          move.duration,
          move.runDuringTransition
        );
        break;
      }
      case ActionType.code: {
        const code = action as CodeAction<Entity>;
        cloned = Action.Code(code.codeCallback, code.runDuringTransition);
        break;
      }
      case ActionType.scale: {
        const scale = action as ScaleAction;
        cloned = Action.Scale(
          scale.scale,
          scale.duration,
          scale.runDuringTransition
        );
        break;
      }
      case ActionType.wait: {
        const wait = action as WaitAction;
        cloned = Action.Wait(wait.duration, wait.runDuringTransition);
        break;
      }
      default:
        throw new Error("unknown action");
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

    if (action.type === ActionType.code) {
      const codeAction = action as CodeAction<Entity>;
      codeAction.codeCallback(entity);
      codeAction.running = false;
      codeAction.completed = true;
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

  private assignParents(action: Action, rootAction: Action): void {
    if (!rootAction) {
      rootAction = action;
      rootAction.parent = undefined;
    }
    if (action.isParent) {
      const parent = action as IActionContainer;
      const children = parent.children!;
      children.forEach((child) => {
        child.parent = action;
        // child.entity = rootAction.entity;
      });
      parent
        .children!.filter((child) => child.isParent)
        .forEach((child: Action) => this.assignParents(child, rootAction));
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

class CodeAction<T> extends Action {
  type = ActionType.code;
  codeCallback: (entity: T) => void;
  constructor(codeCallback: (entity: T) => void, runDuringTransition = false) {
    super(runDuringTransition);
    this.codeCallback = codeCallback;
    this.isParent = false;
    this.duration = 0;
  }
}

class WaitAction extends Action {
  type = ActionType.wait;
  constructor(duration: number, runDuringTransition = false) {
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
  constructor(point: Point, duration: number, runDuringTransition = false) {
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
  code = "Code",
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
class LayoutConstraint {
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
enum ConstraintType {
  topToTopOf = "topToTopOf",
  topToBottomOf = "topToBottomOf",
  bottomToTopOf = "bottomToTopOf",
  bottomToBottomOf = "bottomToBottomOf",
  startToStartOf = "startToStartOf",
  startToEndOf = "startToEndOf",
  endToEndOf = "endToEndOf",
  endToStartOf = "endToStartOf",
}

export interface Layout {
  marginStart?: number;
  marginEnd?: number;
  marginTop?: number;
  marginBottom?: number;
  constraints?: Constraints;
}

export interface EntityOptions {
  name?: string;
  position?: Point;
  scale?: number;
  isUserInteractionEnabled?: boolean;
  hidden?: boolean;
  layout?: Layout;
}

export interface SceneOptions extends EntityOptions, DrawableOptions {
  backgroundColor?: rgbaColor;
}

export interface DrawableOptions {
  anchorPoint?: Point;
  zPosition?: number;
}

export interface TextOptions {
  text?: string;
  fontName?: string;
  fontColor?: rgbaColor;
  fontSize?: number;
}

export interface TextLineOptions
  extends EntityOptions,
    DrawableOptions,
    TextOptions {
  width?: number;
}

export interface LabelOptions
  extends EntityOptions,
    DrawableOptions,
    TextOptions {
  horizontalAlignmentMode?: LabelHorizontalAlignmentMode;
  preferredMaxLayoutWidth?: number;
  backgroundColor?: rgbaColor;
}

export interface SpriteOptions extends EntityOptions, DrawableOptions {
  imageName?: string;
}

export interface ShapeOptions extends EntityOptions, DrawableOptions {
  circleOfRadius?: number;
  rect?: Rect;
  cornerRadius?: number;
  fillColor?: rgbaColor;
  strokeColor?: rgbaColor;
  lineWidth?: number;
}

function handleDrawableOptions(
  drawable: IDrawable,
  options: DrawableOptions
): void {
  if (options.anchorPoint) {
    drawable.anchorPoint = options.anchorPoint;
  }
  if (options.zPosition) {
    drawable.zPosition = options.zPosition;
  }
}

function handleTextOptions(text: IText, options: TextOptions): void {
  if (options.text) {
    text.text = options.text;
  }
  if (options.fontName) {
    text.fontName = options.fontName;
  }
  if (options.fontColor) {
    text.fontColor = options.fontColor;
  }
  if (options.fontSize) {
    text.fontSize = options.fontSize;
  }
}

function handleInterfaceOptions(entity: Entity, options: EntityOptions): void {
  if (entity.isDrawable) {
    handleDrawableOptions(
      entity as unknown as IDrawable,
      options as DrawableOptions
    );
  }
  if (entity.isText) {
    handleTextOptions(entity as unknown as IText, options as TextOptions);
  }
}
//#endregion Interface options

//#region Interfaces ------------------------------------------------------------
export interface IDrawable {
  draw(canvas: Canvas): void;
  anchorPoint: Point;
  zPosition: number;
}

export interface IText {
  text?: string;
  fontName?: string;
  fontColor?: rgbaColor;
  fontSize?: number;
}
//#endregion Interfaces

//#region Core classes ------------------------------------------------------------

export enum EntityType {
  entity = "Entity",
  scene = "Scene",
  sprite = "Sprite",
  label = "Label",
  textline = "TextLine",
  shape = "Shape",
  composite = "Composite",
}

export abstract class Entity {
  type = EntityType.entity;
  isDrawable = false;
  isShape = false;
  isText = false;
  // Entity Options
  name: string;
  position = new Point(0, 0); // position of the entity in the parent coordinate system
  scale = 1.0;
  isUserInteractionEnabled = false;
  hidden = false;
  layout: Layout = {};

  parent?: Entity;
  children = new Array<Entity>();
  absolutePosition = new Point(0, 0); // position within the root coordinate system
  size = new Size(0, 0);
  absoluteScale = 1.0;
  actions = new Array<Action>();
  queuedAction?: Action;
  originalActions = new Array<Action>();
  tapListeners = new Array<tapListener>();
  uuid = generateUUID();
  needsInitialization = true;
  userData: any = {};
  loopMessages = new Set<string>();

  constructor(options: EntityOptions = {}) {
    if (options.name === undefined) {
      this.name = this.uuid;
    } else {
      this.name = options.name;
    }
    if (options.position) {
      this.position = options.position;
    }
    if (options.scale) {
      this.scale = options.scale;
    }
    if (options.isUserInteractionEnabled) {
      this.isUserInteractionEnabled = options.isUserInteractionEnabled;
    }
    if (options.layout) {
      this.layout = options.layout;
    }
  }

  // we will override this in each derived class. This method will never be called.
  initialize(): void {
    throw new Error("initialize() called in abstract base class Entity.");
  }

  /**
   * Overrides toString() and returns a human-friendly description of the entity.
   *
   * @remarks Inspiration from https://stackoverflow.com/a/35361695
   */
  public toString = (): string => {
    if (this.name !== this.uuid) {
      return `"${this.name}" (${this.type}, ${this.uuid})`;
    } else {
      return `"${this.type} (${this.uuid})`;
    }
  };

  /**
   * Adds a child to this parent entity. Thows exception if the child's name is not unique with respect to other children of this parent.
   *
   * @param child - The child entity to add
   */
  addChild(child: Entity): void {
    // Do not allow a scene to be child of another entity.
    if (child.type == EntityType.scene) {
      throw new Error(
        "A scene cannot be the child of an entity. A scene can only be added to a game object"
      );
    }
    child.parent = this;
    if (this.children.map((child) => child.name).includes(child.name)) {
      throw new Error(
        `Cannot add child entity ${child.toString()} to parent entity ${this.toString()}. A child with name "${
          child.name
        }" already exists on parent.`
      );
    }
    this.children.push(child);
  }

  /**
   * Removes all children from the entity
   */
  removeAllChildren(): void {
    while (this.children.length) {
      this.children.pop();
    }
  }

  /**
   * Removes the specific child from this parent entity. Throws exception if this parent does not contain the child.
   *
   * @param child
   */
  removeChild(child: Entity): void {
    if (this.children.includes(child)) {
      this.children = this.children.filter((child) => child !== child);
    } else {
      throw new Error(
        `cannot remove entity ${child} from parent ${this} because the entity is not currently a child of the parent`
      );
    }
  }

  /**
   * Searches all descendants by name and returns first matching entity. Descendants are children and children of children, recursively.
   *
   * @param name - Name of the descendant entity to return
   * @returns
   */
  descendant<T extends Entity>(name: string): T {
    const descendant = this.descendants
      .filter((child) => child.name === name)
      .find(Boolean);
    if (descendant === undefined) {
      throw new Error(
        `descendant with name ${name} not found on parent ${this.toString()}`
      );
    }
    return descendant as T;
  }

  /**
   * Returns all descendant entities. Descendants are children and children of children, recursively.
   */
  get descendants(): Array<Entity> {
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
    this.children.forEach((child) =>
      getChildEntitiesRecursive(child, entities)
    );
    return entities;
  }

  onTap(
    codeCallback: (tapEvent: TapEvent) => void,
    replaceExistingCodeCallback = true
  ): void {
    // By default, we'll replace the existing callback if there is one
    // Why? If the same setup code is called more than once for a scene that repeats, it could
    // add the same callback again. Usually, this is not the intent.
    const listener = new tapListener();
    listener.entityName = this.name;

    listener.codeCallback = codeCallback;
    if (replaceExistingCodeCallback) {
      this.tapListeners = this.tapListeners.filter(
        (tapListener) => tapListener.entityName !== listener.entityName
      );
    }
    this.tapListeners.push(listener);
  }

  private parseLayoutConstraints(
    constraints: Constraints,
    allGameEntities: Array<Entity>
  ): Array<LayoutConstraint> {
    const layoutConstraints = new Array<LayoutConstraint>();

    // create an array of all possible constraintType enum values
    const constraintTypes = Object.values(ConstraintType);

    // for every possible constraint type, check if the provided
    // constraints object has that type. If it does, create a
    // LayoutConstraint object that describes it.
    // (a layoutConstraint object, which is an instance of the
    // LayoutConstraintr CLASS, is easier to work with than the values in
    // the constraints object, which is defined by the Constraints INTERFACE)
    //
    constraintTypes.forEach((constraintType) => {
      if (constraints[constraintType] !== undefined) {
        let entity: Entity | undefined;
        let additionalExceptionMessage = "";

        if (constraints[constraintType] instanceof Entity) {
          entity = constraints[constraintType] as Entity;
        } else {
          const entityName = constraints[constraintType] as string;
          entity = allGameEntities
            .filter((e) => e.name === entityName)
            .find(Boolean);
          additionalExceptionMessage = `. sibling entity named "${entityName}" has not been added to the game object`;
        }

        if (entity === undefined) {
          throw new Error(
            "could not find sibling entity for constraint" +
              additionalExceptionMessage
          );
        }

        const layoutConstraint = new LayoutConstraint(constraintType, entity);
        layoutConstraints.push(layoutConstraint);
      }
    });

    return layoutConstraints;
  }

  private calculateYFromConstraint(
    constraint: LayoutConstraint,
    marginTop: number,
    marginBottom: number,
    scale: number
  ): number {
    // no matter what the constraint, we start with the alter's position
    let y = constraint.alterEntity.absolutePosition.y;

    if (constraint.alterEntityMinimum) {
      // we're constraining to the alter's minimum (top)
      // if the alter is NOT a scene, then to get the top of the alter
      // we have to subtract half of the alter's height because positions
      // are relative to the alter's anchor
      // TODO: don't assume .5 ANCHOR
      // But if the alter IS a scene, there's no need to make this
      // calculate because the scene is the root coordinate system and
      // it's top by definition is 0
      if (!(constraint.alterEntity instanceof Scene)) {
        y = y - constraint.alterEntity.size.height * 0.5 * scale;
      }
    } else {
      if (!(constraint.alterEntity instanceof Scene)) {
        y = y + constraint.alterEntity.size.height * 0.5 * scale;
      } else {
        y = y + constraint.alterEntity.size.height * scale;
      }
    }
    if (constraint.focalEntityMinimum) {
      y = y + this.size.height * 0.5 * scale;
      y = y + marginTop * scale;
    } else {
      y = y - this.size.height * 0.5 * scale;
      y = y - marginBottom * scale;
    }
    return y;
  }

  private calculateXFromConstraint(
    constraint: LayoutConstraint,
    marginStart: number,
    marginEnd: number,
    scale: number
  ): number {
    let x = constraint.alterEntity.absolutePosition.x;

    if (constraint.alterEntityMinimum) {
      if (!(constraint.alterEntity instanceof Scene)) {
        x = x - constraint.alterEntity.size.width * 0.5 * scale;
      }
    } else {
      if (!(constraint.alterEntity instanceof Scene)) {
        x = x + constraint.alterEntity.size.width * 0.5 * scale;
      } else {
        x = x + constraint.alterEntity.size.width * scale;
      }
    }
    if (constraint.focalEntityMinimum) {
      x = x + this.size.width * 0.5 * scale;
      x = x + marginStart * scale;
    } else {
      x = x - this.size.width * 0.5 * scale;
      x = x - marginEnd * scale;
    }
    return x;
  }

  update(): void {
    if (this.needsInitialization) {
      // note: the below initialize() function will be called on the DERIVED CLASS's initialize(),
      // never this base abstract Entity
      this.initialize();
      this.needsInitialization = false;
    }

    if (this.parent === undefined) {
      // if there's no parent, then this entity is a screen
      this.absolutePosition.x = this.position.x * this.scale;
      this.absolutePosition.y = this.position.y * this.scale;
      this.absoluteScale = this.scale;
    } else {
      // this entity has a parent; it inherits the parent's scale
      this.absoluteScale = this.parent.absoluteScale * this.scale;

      if (this.layout?.constraints === undefined) {
        // entity sets its position directly using its position property
        this.absolutePosition.x =
          this.parent.absolutePosition.x +
          this.position.x * this.parent.absoluteScale;
        this.absolutePosition.y =
          this.parent.absolutePosition.y +
          this.position.y * this.parent.absoluteScale;
      } else {
        // entity sets its position using layout approach, with constraints.
        // this is much more complicated than using only the entity's
        // position property.

        const horizontalBias = this.layout?.constraints?.horizontalBias ?? 0.5;
        const verticalBias = this.layout?.constraints?.verticalBias ?? 0.5;
        const marginTop = this.layout?.marginTop ?? 0;
        const marginBottom = this.layout?.marginBottom ?? 0;
        const marginStart = this.layout?.marginStart ?? 0;
        const marginEnd = this.layout?.marginEnd ?? 0;

        const layoutConstraints = this.parseLayoutConstraints(
          this.layout?.constraints,
          this.parentScene.game.entities
        );

        const scale = this.parent.absoluteScale;

        const yPositions = layoutConstraints
          .filter((constraint) => constraint.verticalConstraint)
          .map((constraint) =>
            this.calculateYFromConstraint(
              constraint,
              marginTop,
              marginBottom,
              scale
            )
          );

        if (yPositions.length === 0) {
          // log a warning of there being no y constraint
        } else if (yPositions.length === 1) {
          this.absolutePosition.y = yPositions[0];
        } else if (yPositions.length === 2) {
          this.absolutePosition.y =
            Math.min(yPositions[0], yPositions[1]) +
            verticalBias * Math.abs(yPositions[0] - yPositions[1]);
        } else {
          // log a warning of there being too many y constraints
        }

        const xPositions = layoutConstraints
          .filter((constraint) => !constraint.verticalConstraint)
          .map((constraint) =>
            this.calculateXFromConstraint(
              constraint,
              marginStart,
              marginEnd,
              scale
            )
          );

        if (xPositions.length === 0) {
          // log a warning of there being no x constraint
        } else if (xPositions.length === 1) {
          this.absolutePosition.x = xPositions[0];
        } else if (xPositions.length === 2) {
          this.absolutePosition.x =
            Math.min(xPositions[0], xPositions[1]) +
            horizontalBias * Math.abs(xPositions[0] - xPositions[1]);
        } else {
          // log a warning of there being too many x constraints
        }
      }
    }

    // We must distinguish actions that run during a scene transition and those that do not.
    // We must first handle all the actions that run during a scene transition, and only when those are
    // complete can we start the regular actions
    const uncompletedTransitionActions = this.actions.filter(
      (action) => action.runDuringTransition && !action.completed
    );
    const uncompletedRegularActions = this.actions.filter(
      (action) => !action.runDuringTransition && !action.completed
    );

    // First, evaluate all uncompleted actions that can run during a transition
    if (uncompletedTransitionActions.length > 0) {
      uncompletedTransitionActions.forEach((action) => {
        if (action.runStartTime === -1) {
          // if there are any and they have not started yet, set their run time to now
          action.runStartTime = Game._now;
        }
      });
      uncompletedTransitionActions.forEach((action) =>
        Action.evaluateAction(action, this, Game._now, Game._deltaTime)
      );
    } else if (uncompletedRegularActions.length > 0) {
      // Now that we've completed at the actions that run during a transition,
      // we can set the start time for any uncompleted regular actions
      uncompletedRegularActions.forEach((action) => {
        if (action.runStartTime === -1) {
          action.runStartTime = Game._now;
        }
      });
      uncompletedRegularActions.forEach((action) =>
        Action.evaluateAction(action, this, Game._now, Game._deltaTime)
      );
    }

    // Update the entity's children
    //
    // If an entity uses positioning based only on the position property,
    // it does not matter in what order the children are updated. If the
    // entity uses layout constraints, however, one sibling's position
    // may depend on another (e.g., the top of entity A is the bottom of
    // entity B). The update of siblings must be properly ordered so that
    // dependencies are resolved prior to the positioning calculations (e.g.,
    // we must update entity B before we update entity A).
    //
    // We can solve this by modeling sibling constraint dependencies as a
    // Directed acyclic graph (DAG) and applying a topological sort.
    // We then update the siblings in the topolgical sort reverse order
    // (Why reverse order? The topological sort is ordered so that vertexes
    // with in degree 0 come first; these are the vertexes whose positions
    // depend on others, but no other vertexes depend on them for
    // positioning. We must update these last).
    //

    /**
     * Get the uuids of all the sibling entities that this focal
     * entity's constraints depend on. Ignore parent constraints, because
     * the parent will have been updated already.
     *
     * @param parent - The focal entity's parent
     * @param constraints - The focal entity's constraints
     * @returns Array<string> - the uuids of the siblings the focal entity depends on
     */
    function getSiblingConstraintUuids(
      parent: Entity,
      constraints: Constraints | undefined
    ): Array<string> {
      const uuids = new Array<string>();
      if (constraints === undefined) {
        return uuids;
      }
      const constraintTypes = Object.values(ConstraintType);
      constraintTypes.forEach((constraint) => {
        if (constraints[constraint] !== undefined) {
          let siblingConstraint: Entity | undefined;
          let additionalExceptionMessage = "";

          if (constraints[constraint] instanceof Entity) {
            siblingConstraint = constraints[constraint] as Entity;
          } else {
            const entityName = constraints[constraint] as string;
            let allGameEntities: Array<Entity>;
            if (parent instanceof Scene) {
              allGameEntities = (parent as Scene).game.entities;
            } else {
              allGameEntities = parent.parentScene.game.entities;
            }
            siblingConstraint = allGameEntities
              .filter((e) => e.name === entityName)
              .find(Boolean);
            if (siblingConstraint === undefined) {
              additionalExceptionMessage = `. sibling entity named "${entityName}" has not been added to the game object`;
            }
          }

          if (siblingConstraint === undefined) {
            throw new Error(
              "error getting uuid of sibling contraint" +
                additionalExceptionMessage
            );
          }

          // as of now, we only need to get uuids of siblings because
          // we don't allow nested layouts
          // TODO: allow nested layouts.
          if (siblingConstraint !== parent) {
            uuids.push(siblingConstraint.uuid);
          }
        }
      });
      return uuids;
    }

    // Model the DAG in a Map where the key is the uuid of the focal entity,
    // and the value is an array of other entity uuids that this focal entity
    // depends on for layout
    const adjList = new Map<string, string[]>();
    this.children.forEach((child) => {
      adjList.set(
        child.uuid,
        getSiblingConstraintUuids(this, child.layout?.constraints)
      );
    });

    const sortedUuids = findTopologicalSort(adjList);
    if (sortedUuids.length > 0) {
      const uuidsInUpdateOrder = sortedUuids.reverse();
      const childrenInUpdateOrder = new Array<Entity>();

      uuidsInUpdateOrder.forEach((uuid) => {
        const child = this.children
          .filter((c) => c.uuid === uuid)
          .find(Boolean);
        if (child === undefined) {
          throw new Error("error in dag topological sort");
        }
        childrenInUpdateOrder.push(child);
      });
      childrenInUpdateOrder.forEach((child) => child.update());
    } else {
      this.children.forEach((child) => child.update());
    }
  }

  /**
   * Draws each child entity that is Drawable and is not hidden, by zPosition order (highest zPosition on top).
   *
   * @param canvas - CanvasKit canvas
   */
  drawChildren(canvas: Canvas): void {
    this.children
      .filter((child) => !child.hidden && child.isDrawable)
      .map((child) => child as unknown as IDrawable)
      .sort((a, b) => a.zPosition - b.zPosition)
      .forEach((child) => child.draw(canvas));
  }

  /**
   * Runs an action on this entity.
   *
   * @remarks If the entity is part of an active scene, the action runs immediately. Otherwise, the action will run when the entity's scene becomes active. Calling run() multiple times on an entity will add to existing actions, not replace them.
   *
   * @param action - The action to run
   */
  run(action: Action): void {
    //this.actions = action.initialize(this);
    this.actions.push(...action.initialize(this));
    this.originalActions = this.actions
      .filter((action) => action.runDuringTransition === false)
      .map(Action.cloneAction);
  }

  // TODO: don't make static!
  // TODO: change uuid for all child elements that are duplicated
  // TODO: add composite
  static duplicate<T extends Entity>(source: T, newName?: string): T {
    let dest: Entity;

    switch (source.type) {
      case EntityType.scene: {
        const scene = source as unknown as Scene;
        const options: SceneOptions = {
          ...this.getEntityOptions(scene),
          backgroundColor: scene.backgroundColor,
        };
        dest = new Scene(options);
        break;
      }
      case EntityType.sprite: {
        const sprite = source as unknown as Sprite;
        const options: SpriteOptions = {
          ...this.getEntityOptions(sprite),
          ...this.getDrawableOptions(sprite),
          imageName: sprite.imageName,
        };
        dest = new Sprite(options);
        break;
      }
      case EntityType.label: {
        const label = source as unknown as Label;
        const options: LabelOptions = {
          ...this.getEntityOptions(label),
          ...this.getDrawableOptions(label),
          ...this.getTextOptions(label),
          horizontalAlignmentMode: label.horizontalAlignmentMode,
          preferredMaxLayoutWidth: label.preferredMaxLayoutWidth,
          backgroundColor: label.backgroundColor,
        };
        dest = new Label(options);
        break;
      }
      case EntityType.textline: {
        const textline = source as unknown as TextLine;
        const options: TextLineOptions = {
          ...this.getEntityOptions(textline),
          ...this.getDrawableOptions(textline),
          ...this.getTextOptions(textline),
          width: textline.size.width,
        };
        dest = new TextLine(options);
        break;
      }
      case EntityType.shape: {
        const shape = source as unknown as Shape;
        const options: ShapeOptions = {
          ...this.getEntityOptions(shape),
          ...this.getDrawableOptions(shape),
          circleOfRadius: shape.circleOfRadius,
          rect: shape.rect,
          cornerRadius: shape.cornerRadius,
          fillColor: shape.fillColor,
          strokeColor: shape.strokeColor,
          lineWidth: shape.lineWidth,
        };
        dest = new Shape(options);
        break;
      }
      default:
        throw new Error("unknown entity type");
    }

    if (source.type === EntityType.scene) {
      (dest as Scene).game = (source as unknown as Scene).game;
    }

    if (source.children.length > 0) {
      dest.children = source.children.map((child) => {
        const clonedChild = Entity.duplicate<Entity>(child);
        clonedChild.parent = dest;
        return clonedChild;
      });
    }

    if (newName) {
      dest.name = newName;
    } else if (source.name === source.uuid) {
      dest.name = dest.uuid;
    }

    return dest as unknown as T;
  }

  private static getEntityOptions(entity: Entity): EntityOptions {
    const entityOptions = {
      name: entity.name,
      position: entity.position,
      scale: entity.scale,
      isUserInteractionEnabled: entity.isUserInteractionEnabled,
      hidden: entity.hidden,
    };
    return entityOptions;
  }

  private static getDrawableOptions(drawable: IDrawable): DrawableOptions {
    const drawableOptions = {
      anchorPoint: drawable.anchorPoint,
      zPosition: drawable.zPosition,
    };
    return drawableOptions;
  }

  private static getTextOptions(text: IText): TextOptions {
    const textOptions = {
      text: text.text,
      fontName: text.fontName,
      fontColor: text.fontColor,
      fontSize: text.fontSize,
    };
    return textOptions;
  }

  /**
   * Gets the scene that contains this entity by searching up the ancestor tree recursively. Throws exception if entity is not part of a scene.
   *
   * @returns Scene that contains this entity
   */
  get parentScene(): Scene {
    if (this.type === EntityType.scene) {
      throw new Error(
        `Entity ${this} is a scene and cannot have a parent scene`
      );
    }
    if (this.parent && this.parent.type === EntityType.scene) {
      return this.parent as Scene;
    } else if (this.parent) {
      return this.parent.parentScene;
    }
    throw new Error(`Entity ${this} has not been added to a scene`);
  }
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
  get backgroundColor(): rgbaColor {
    return this._backgroundColor;
  }
  set backgroundColor(backgroundColor: rgbaColor) {
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

export class Sprite extends Entity implements IDrawable {
  readonly type = EntityType.sprite;
  isDrawable = true;
  // Drawable options
  anchorPoint = new Point(0.5, 0.5);
  zPosition = 0;
  // Sprite options
  private _imageName = ""; // public getter/setter is below

  private loadedImage?: LoadedImage;

  /**
   * Visual image displayed on the screen.
   *
   * @remarks Sprites must be loaded during the Game.init() method prior to their use.
   *
   * @param options
   */
  constructor(options: SpriteOptions = {}) {
    super(options);
    handleInterfaceOptions(this, options);
    if (options.imageName) {
      this.imageName = options.imageName;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  override initialize(): void {}

  set imageName(imageName: string) {
    if (!Object.keys(ImageManager._loadedImages).includes(imageName)) {
      throw new Error(`an image with name ${imageName} has not been loaded`);
    }
    this._imageName = imageName;
    this.loadedImage = ImageManager._loadedImages[this.imageName];
    this.size.width = this.loadedImage.width;
    this.size.height = this.loadedImage.height;
  }

  get imageName(): string {
    return this._imageName;
  }

  update(): void {
    super.update();
  }

  draw(canvas: Canvas): void {
    if (!this.hidden) {
      if (this.loadedImage) {
        canvas.save();
        const drawScale = Game._canvasScale / this.absoluteScale;
        canvas.scale(1 / drawScale, 1 / drawScale);

        const x =
          (this.absolutePosition.x -
            this.size.width * this.anchorPoint.x * this.absoluteScale) *
          drawScale;
        const y =
          (this.absolutePosition.y -
            this.size.height * this.anchorPoint.y * this.absoluteScale) *
          drawScale;

        canvas.drawImage(this.loadedImage.image, x, y);
        canvas.restore();
      }

      super.drawChildren(canvas);
    }
  }
}

export enum LabelHorizontalAlignmentMode {
  center,
  left,
  right,
}

export class Label extends Entity implements IDrawable, IText {
  readonly type = EntityType.label;
  isDrawable = true;
  isText = true;
  // Drawable options
  anchorPoint = new Point(0.5, 0.5);
  zPosition = 0;
  // Text options
  private _text = ""; // public getter/setter is below
  private _fontName: string | undefined; // public getter/setter is below
  private _fontColor = Constants.DEFAULT_FONT_COLOR; // public getter/setter is below
  private _fontSize = Constants.DEFAULT_FONT_SIZE; // public getter/setter is below
  // Label options
  private _horizontalAlignmentMode = LabelHorizontalAlignmentMode.center; // public getter/setter is below
  private _preferredMaxLayoutWidth: number | undefined; // public getter/setter is below
  private _backgroundColor?: rgbaColor | undefined; // public getter/setter is below

  private paragraph?: Paragraph;
  private paraStyle?: ParagraphStyle;

  /**
   * Single or multi-line text formatted and rendered on the screen.
   *
   * @remarks  Label (in contrast to TextLine) has enhanced text support for line wrapping, centering/alignment, and background colors.
   *
   * @param options
   */
  constructor(options: LabelOptions = {}) {
    super(options);
    handleInterfaceOptions(this, options);
    if (options.horizontalAlignmentMode) {
      this.horizontalAlignmentMode = options.horizontalAlignmentMode;
    }
    if (options.preferredMaxLayoutWidth) {
      this.preferredMaxLayoutWidth = options.preferredMaxLayoutWidth;
    }
    if (options.backgroundColor) {
      this.backgroundColor = options.backgroundColor;
    }
  }

  override initialize(): void {
    let ckTextAlign: EmbindEnumEntity = Game._canvasKit.TextAlign.Center;
    switch (this.horizontalAlignmentMode) {
      case LabelHorizontalAlignmentMode.center:
        ckTextAlign = Game._canvasKit.TextAlign.Center;
        break;
      case LabelHorizontalAlignmentMode.left:
        ckTextAlign = Game._canvasKit.TextAlign.Left;
        break;
      case LabelHorizontalAlignmentMode.right:
        ckTextAlign = Game._canvasKit.TextAlign.Right;
        break;
      default:
        throw new Error("unknown horizontalAlignmentMode");
    }

    this.paraStyle = new Game._canvasKit.ParagraphStyle({
      textStyle: {
        color: Game._canvasKit.Color(
          this.fontColor[0],
          this.fontColor[1],
          this.fontColor[2],
          this.fontColor[3]
        ),
        fontSize: this.fontSize * Game._canvasScale,
      },
      textAlign: ckTextAlign,
    });
    if (this.fontName && this.paraStyle.textStyle) {
      this.paraStyle.textStyle.fontFamilies = [this.fontName];
    }
    if (this.backgroundColor && this.paraStyle.textStyle) {
      this.paraStyle.textStyle.backgroundColor = this.backgroundColor;
    }

    if (FontManager._fontMgr === undefined) {
      throw new Error("no fonts loaded");
    }

    const builder = Game._canvasKit.ParagraphBuilder.Make(
      this.paraStyle,
      FontManager._fontMgr
    );
    if (!this.text) {
      this.text = "";
    }
    builder.addText(this.text);
    if (this.text === "") {
      console.warn(`warning: empty text in label "${this.name}"`);
    }
    this.paragraph = builder.build();
    const preferredWidth =
      this.preferredMaxLayoutWidth ?? this.parentScene.game.canvasCssWidth;
    this.paragraph.layout(preferredWidth * Game._canvasScale);
    this.size.width = preferredWidth;
    this.size.height = this.paragraph.getHeight() / Game._canvasScale;
  }

  get text(): string {
    return this._text;
  }
  set text(text: string) {
    this._text = text;
    this.needsInitialization = true;
  }

  get fontName(): string | undefined {
    return this._fontName;
  }
  set fontName(fontName: string | undefined) {
    this._fontName = fontName;
    this.needsInitialization = true;
  }

  get fontColor(): rgbaColor {
    return this._fontColor;
  }
  set fontColor(fontColor: rgbaColor) {
    this._fontColor = fontColor;
    this.needsInitialization = true;
  }

  get fontSize(): number {
    return this._fontSize;
  }
  set fontSize(fontSize: number) {
    this._fontSize = fontSize;
    this.needsInitialization = true;
  }

  get horizontalAlignmentMode(): LabelHorizontalAlignmentMode {
    return this._horizontalAlignmentMode;
  }
  set horizontalAlignmentMode(
    horizontalAlignmentMode: LabelHorizontalAlignmentMode
  ) {
    this._horizontalAlignmentMode = horizontalAlignmentMode;
    this.needsInitialization = true;
  }

  get preferredMaxLayoutWidth(): number | undefined {
    return this._preferredMaxLayoutWidth;
  }
  set preferredMaxLayoutWidth(preferredMaxLayoutWidth: number | undefined) {
    this._preferredMaxLayoutWidth = preferredMaxLayoutWidth;
    this.needsInitialization = true;
  }

  get backgroundColor(): rgbaColor | undefined {
    return this._backgroundColor;
  }
  set backgroundColor(backgroundColor: rgbaColor | undefined) {
    this._backgroundColor = backgroundColor;
    this.needsInitialization = true;
  }

  update(): void {
    super.update();
  }

  draw(canvas: Canvas): void {
    if (this.parent && this.text !== "") {
      canvas.save();
      const drawScale = Game._canvasScale / this.absoluteScale;
      canvas.scale(1 / drawScale, 1 / drawScale);

      const x =
        (this.absolutePosition.x -
          this.size.width * this.anchorPoint.x * this.absoluteScale) *
        drawScale;
      const y =
        (this.absolutePosition.y -
          this.size.height * this.anchorPoint.y * this.absoluteScale) *
        drawScale;

      if (this.paragraph === undefined) {
        throw new Error("no paragraph");
      }

      canvas.drawParagraph(this.paragraph, x, y);
      canvas.restore();
    }

    super.drawChildren(canvas);
  }
}

export class TextLine extends Entity implements IDrawable, IText {
  readonly type = EntityType.textline;
  isDrawable = true;
  isText = true;
  // Drawable options
  zPosition = 0;
  //   We don't know TextLine width in advance, so we must text align left,
  //   and so anchorPoint is (0, .5). (we do know height, which is fontSize)
  anchorPoint = new Point(0, 0.5);
  // Text options
  private _text = ""; // public getter/setter is below
  private _fontName: string | undefined; // public getter/setter is below
  private _fontColor = Constants.DEFAULT_FONT_COLOR; // public getter/setter is below
  private _fontSize = Constants.DEFAULT_FONT_SIZE; // public getter/setter is below

  private paint?: Paint;
  private font?: Font;

  /**
   * Single-line text rendered on the screen.
   *
   * @remarks TextLine has no paragraph formatting options; Label will be preferred in most use cases.
   *
   * @param options
   */
  constructor(options: TextLineOptions = {}) {
    super(options);
    handleInterfaceOptions(this, options);

    this.size.height = this.fontSize;
    // width is merely for bounds when checking onTap
    // textline will be drawn without regards to the setting for wiedth
    // TODO: explore using ShapedText in canvas.drawText(), because
    // ShapedText will report its own bounds?
    this.size.width = options.width ?? NaN;
  }

  get text(): string {
    return this._text;
  }
  set text(text: string) {
    this._text = text;
    this.needsInitialization = true;
  }

  get fontName(): string | undefined {
    return this._fontName;
  }
  set fontName(fontName: string | undefined) {
    this._fontName = fontName;
    this.needsInitialization = true;
  }

  get fontColor(): rgbaColor {
    return this._fontColor;
  }
  set fontColor(fontColor: rgbaColor) {
    this._fontColor = fontColor;
    this.needsInitialization = true;
  }

  get fontSize(): number {
    return this._fontSize;
  }
  set fontSize(fontSize: number) {
    this._fontSize = fontSize;
    this.needsInitialization = true;
  }

  update(): void {
    super.update();
  }

  override initialize(): void {
    this.paint = new Game._canvasKit.Paint();
    this.paint.setColor(
      Game._canvasKit.Color(
        this.fontColor[0],
        this.fontColor[1],
        this.fontColor[2],
        this.fontColor[3]
      )
    );
    this.paint.setStyle(Game._canvasKit.PaintStyle.Fill);
    this.paint.setAntiAlias(true);

    if (this.fontName) {
      this.font = new Game._canvasKit.Font(
        FontManager._getTypeface(this.fontName),
        this.fontSize * Game._canvasScale
      );
    } else {
      this.font = new Game._canvasKit.Font(
        null,
        this.fontSize * Game._canvasScale
      );
    }
  }

  draw(canvas: Canvas): void {
    if (this.parent && this.text) {
      canvas.save();
      const drawScale = Game._canvasScale / this.absoluteScale;
      canvas.scale(1 / drawScale, 1 / drawScale);

      const x = this.absolutePosition.x * drawScale;
      const y =
        (this.absolutePosition.y +
          this.size.height * this.anchorPoint.y * this.absoluteScale) *
        drawScale;

      if (this.paint === undefined || this.font === undefined) {
        throw new Error(
          `in TextLine entity ${this}, Paint or Font is undefined.`
        );
      }
      canvas.drawText(this.text, x, y, this.paint, this.font);
      canvas.restore();
    }

    super.drawChildren(canvas);
  }
}

enum ShapeType {
  undefined = "Undefined",
  rectangle = "Rectangle",
  circle = "Circle",
}

export interface RectOptions {
  origin?: Point;
  size?: Size;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class Rect implements RectOptions {
  origin?: Point;
  size?: Size;
  x?: number;
  y?: number;
  width?: number;
  height?: number;

  constructor(options: RectOptions) {
    this.origin = options.origin;
    this.size = options.size;
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
  }
}
export class Shape extends Entity implements IDrawable {
  readonly type = EntityType.shape;
  isDrawable = true;
  isShape = true;
  // Drawable options
  anchorPoint = new Point(0.5, 0.5);
  zPosition = 0;
  // Shape options
  // TODO: fix the Size issue; should be readonly (calculated value) in all entities, but Rectangle
  shapeType = ShapeType.undefined;
  circleOfRadius?: number;
  rect?: Rect;
  cornerRadius = 0;
  private _fillColor = Constants.DEFAULT_SHAPE_FILL_COLOR; // public getter/setter is below
  private _strokeColor?: rgbaColor | undefined; // public getter/setter is below
  lineWidth?: number;

  private fillColorPaint?: Paint;
  private strokeColorPaint?: Paint;

  /**
   * Rectangular shape
   *
   * @param options
   */
  constructor(options: ShapeOptions = {}) {
    super(options);
    handleInterfaceOptions(this, options);
    if (options.circleOfRadius !== undefined) {
      this.circleOfRadius = options.circleOfRadius;
      this.shapeType = ShapeType.circle;
    }
    if (options.rect) {
      if (options.rect.size) {
        this.size.width = options.rect.size.width;
        this.size.height = options.rect.size.height;
      } else if (
        options.rect.width !== undefined &&
        options.rect.height !== undefined
      ) {
        this.size.width = options.rect.width;
        this.size.height = options.rect.height;
      }
      if (options.rect.origin) {
        this.position = options.rect.origin;
      } else if (options.rect.x !== undefined && options.rect.y !== undefined) {
        this.position = new Point(options.rect.x, options.rect.y);
      }
      this.shapeType = ShapeType.rectangle;
    }
    if (options.cornerRadius) {
      this.cornerRadius = options.cornerRadius;
    }
    if (options.fillColor) {
      this.fillColor = options.fillColor;
    }
    if (options.strokeColor) {
      this.strokeColor = options.strokeColor;
    }
    if (options.lineWidth) {
      this.lineWidth = options.lineWidth;
    }
    if (options.strokeColor && options.lineWidth === undefined) {
      console.warn(
        `warning: for entity ${this}, strokeColor = ${options.strokeColor} but lineWidth is undefined. In normal usage, both would be set or both would be undefined.`
      );
    }
    if (options.strokeColor === undefined && options.lineWidth) {
      console.warn(
        `warning: for entity ${this}, lineWidth = ${options.lineWidth} but strokeColor is undefined. In normal usage, both would be set or both would be undefined.`
      );
    }
  }

  override initialize(): void {
    if (this.fillColor) {
      const canvasKit = Game._canvasKit;
      this.fillColorPaint = new canvasKit.Paint();
      this.fillColorPaint.setColor(
        canvasKit.Color(
          this.fillColor[0],
          this.fillColor[1],
          this.fillColor[2],
          this.fillColor[3]
        )
      );
      this.fillColorPaint.setStyle(canvasKit.PaintStyle.Fill);
      this.fillColorPaint.setAntiAlias(true);
    }

    if (this.strokeColor) {
      const canvasKit = Game._canvasKit;
      this.strokeColorPaint = new canvasKit.Paint();
      this.strokeColorPaint.setColor(
        canvasKit.Color(
          this.strokeColor[0],
          this.strokeColor[1],
          this.strokeColor[2],
          this.strokeColor[3]
        )
      );
      this.strokeColorPaint.setStyle(canvasKit.PaintStyle.Stroke);
      this.strokeColorPaint.setAntiAlias(true);
    }
  }

  get fillColor(): rgbaColor {
    return this._fillColor;
  }
  set fillColor(fillColor: rgbaColor) {
    this._fillColor = fillColor;
    this.needsInitialization = true;
  }

  get strokeColor(): rgbaColor | undefined {
    return this._strokeColor;
  }
  set strokeColor(strokeColor: rgbaColor | undefined) {
    this._strokeColor = strokeColor;
    this.needsInitialization = true;
  }

  update(): void {
    super.update();
  }

  draw(canvas: Canvas): void {
    canvas.save();
    const drawScale = Game._canvasScale / this.absoluteScale;
    canvas.scale(1 / drawScale, 1 / drawScale);

    const canvasKit = Game._canvasKit;

    if (
      this.shapeType === ShapeType.circle &&
      this.circleOfRadius !== undefined
    ) {
      const cx = this.absolutePosition.x * drawScale;
      const cy = this.absolutePosition.y * drawScale;
      const radius = this.circleOfRadius * this.absoluteScale * drawScale;

      if (this.fillColor && this.fillColorPaint) {
        canvas.drawCircle(cx, cy, radius, this.fillColorPaint);
      }

      if (this.strokeColor && this.strokeColorPaint && this.lineWidth) {
        // draw scale may change due to scaling, thus we must call setStrokeWidth() on every draw cycle
        this.strokeColorPaint.setStrokeWidth(this.lineWidth * drawScale);
        canvas.drawCircle(cx, cy, radius, this.strokeColorPaint);
      }
    }

    if (this.shapeType === ShapeType.rectangle) {
      const rr = canvasKit.RRectXY(
        canvasKit.LTRBRect(
          (this.absolutePosition.x -
            this.anchorPoint.x * this.size.width * this.absoluteScale) *
            drawScale,
          (this.absolutePosition.y -
            this.anchorPoint.y * this.size.height * this.absoluteScale) *
            drawScale,
          (this.absolutePosition.x +
            this.size.width * this.absoluteScale -
            this.anchorPoint.x * this.size.width * this.absoluteScale) *
            drawScale,
          (this.absolutePosition.y +
            this.size.height * this.absoluteScale -
            this.anchorPoint.y * this.size.height * this.absoluteScale) *
            drawScale
        ),
        this.cornerRadius * drawScale,
        this.cornerRadius * drawScale
      );

      if (this.fillColor && this.fillColorPaint) {
        canvas.drawRRect(rr, this.fillColorPaint);
      }

      if (this.strokeColor && this.strokeColorPaint && this.lineWidth) {
        // draw scale may change due to scaling, thus we must call setStrokeWidth() on every draw cycle
        this.strokeColorPaint.setStrokeWidth(this.lineWidth * drawScale);
        canvas.drawRRect(rr, this.strokeColorPaint);
      }
    }

    canvas.restore();
    super.drawChildren(canvas);
  }
}

export interface CompositeOptions extends EntityOptions, DrawableOptions {}

export abstract class Composite extends Entity implements IDrawable {
  readonly type = EntityType.composite;
  compositeType = "<compositeType>";
  isDrawable = true;
  // Drawable options
  anchorPoint = new Point(0.5, 0.5);
  zPosition = 0;

  /**
   * Base Drawable object for creating custom entities ("composites") composed of primitive entities.
   *
   * @param options
   */
  constructor(options: CompositeOptions = {}) {
    super(options);
    handleInterfaceOptions(this, options);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  override initialize(): void {}

  update(): void {
    super.update();
  }

  draw(canvas: Canvas): void {
    super.drawChildren(canvas);
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
const generateUUID = () => {
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
const findTopologicalSort = (adjList: Map<string, string[]>): string[] => {
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
