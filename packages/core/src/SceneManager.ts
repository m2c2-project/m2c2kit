import { Action } from "./Action";
import { Canvas, Image } from "canvaskit-wasm";
import { Constants } from "./Constants";
import { Easings } from "./Easings";
import { Game } from "./Game";
import { M2c2KitHelpers } from "./M2c2KitHelpers";
import { M2Error } from "./M2Error";
import { M2Image, M2ImageStatus } from "./M2Image";
import { M2EventType, M2NodeNewEvent, ScenePresentEvent } from "./M2Event";
import { M2Node } from "./M2Node";
import { M2NodeType } from "./M2NodeType";
import { Scene } from "./Scene";
import { Sprite } from "./Sprite";
import {
  SceneTransition,
  SlideTransition,
  Transition,
  TransitionDirection,
  TransitionType,
} from "./Transition";
import { M2NodeEvent } from "./M2NodeEvent";
import { PendingScreenshot } from "./PendingScreenshot";

export class SceneManager {
  private game: Game;

  public scenes = new Array<Scene>();
  public freeNodesScene: Scene;
  public currentScene?: Scene;

  public incomingSceneTransitions = new Array<SceneTransition>();
  public snapshots = new Array<Image>();
  private currentSceneSnapshot?: Image;
  private pendingScreenshot?: PendingScreenshot;

  constructor(game: Game) {
    this.game = game;
    this.freeNodesScene = this.createFreeNodesScene();
  }

  /**
   * Clears the current game scene by setting it to undefined.
   */
  clearCurrentScene() {
    this.currentScene = undefined;
  }

  /**
   * Updates all active scenes and their children.
   */
  updateScenes() {
    this.scenes
      .filter((scene) => scene._active)
      .forEach((scene) => scene.update());
    this.freeNodesScene.update();
  }

  /**
   * Draws all active scenes and their children on the provided canvas.
   *
   * @param canvas - the canvas to draw the scenes on
   */
  public drawScenes(canvas: Canvas): void {
    this.scenes
      .filter((scene) => scene._active)
      .forEach((scene) => scene.draw(canvas));
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
    this.game.eventStore.addEvents(node.nodeEvents);
    node.nodeEvents.length = 0;
    for (const child of node.children) {
      this.addNodeEvents(child);
    }
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
  add(scene: Scene): void {
    if (this.scenes.includes(scene)) {
      console.warn(
        `Game.addScene(): scene ${scene.toString()} has already been added to the game. This will cause unpredictable behavior. This warning will become an error in a future release.`,
      );
    }
    scene.game = this.game;
    scene.needsInitialization = true;
    this.scenes.push(scene);
    this.addNodeEvents(scene);
  }

  /**
   * Removes a scene from the game.
   *
   * @param scene - the scene to remove or its name as a string
   */
  remove(scene: Scene | string): void {
    if (typeof scene === "object") {
      if (this.scenes.includes(scene)) {
        this.scenes = this.scenes.filter((s) => s !== scene);
      } else {
        throw new M2Error(
          `cannot remove scene ${scene} from game because the scene is not currently added to the game`,
        );
      }
    } else {
      if (this.scenes.map((s) => s.name).includes(scene)) {
        this.scenes = this.scenes.filter((s) => s.name !== scene);
      } else {
        throw new M2Error(
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
  present(scene: string | Scene, transition?: Transition): void {
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
        throw new M2Error(`scene ${scene} not found`);
      }
    } else {
      if (!this.scenes.some((scene_) => scene_ === scene)) {
        throw new M2Error(
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
    this.game.eventStore.addEvent(scenePresentEvent);
  }

  handleIncomingSceneTransitions(): void {
    if (this.incomingSceneTransitions.length === 0) {
      return;
    }
    /**
     * Only begin this scene transition if 1) we have a snapshot of the
     * current scene, OR 2) the incoming scene has transition type of
     * None and thus we don't need a snapshot.
     */
    if (
      this.snapshots.length > 0 ||
      this.incomingSceneTransitions[0].transition.type === TransitionType.None
    ) {
      const incomingSceneTransition = this.incomingSceneTransitions.shift();
      if (incomingSceneTransition === undefined) {
        // should not happen; checked this.incomingSceneTransitions.length > 0
        throw new M2Error("no incoming scene transition");
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
        throw new M2Error("No snapshot available for outgoing scene");
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
    outgoingScene.size.width = this.game.canvasCssWidth;
    outgoingScene.size.height = this.game.canvasCssHeight;

    this.add(outgoingScene);
    const image: M2Image = {
      imageName: Constants.OUTGOING_SCENE_IMAGE_NAME,
      canvaskitImage: outgoingSceneImage,
      width: this.game.canvasCssWidth,
      height: this.game.canvasCssHeight,
      status: M2ImageStatus.Ready,
      localize: false,
      isFallback: false,
    };
    this.game.imageManager.addImage(image);

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
        x: this.game.canvasCssWidth / m2c2Globals.rootScale / 2,
        y: this.game.canvasCssHeight / m2c2Globals.rootScale / 2,
      },
    });
    spr.scale = 1 / m2c2Globals.rootScale;
    outgoingScene.addChild(spr);
    return outgoingScene;
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
                    this.remove(Constants.OUTGOING_SCENE_NAME);
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
                    this.remove(Constants.OUTGOING_SCENE_NAME);
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
                    this.remove(Constants.OUTGOING_SCENE_NAME);
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
                    this.remove(Constants.OUTGOING_SCENE_NAME);
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
            throw new M2Error("unknown transition direction");
        }
        break;
      }
      default:
        throw new M2Error("unknown transition type");
    }
  }

  /**
   * Takes screenshot of canvas
   *
   * @remarks Coordinates should be provided unscaled; that is, the method
   * will handle any scaling that happened due to device pixel ratios
   * not equal to 1. This returns a promise because the screenshot request
   * must be queued and completed once a draw cycle has completed. See
   * the handleScreenshots() method.
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
    if (!this.game.surface) {
      throw new M2Error("no canvaskit surface. unable to take screenshot.");
    }

    const missingParametersCount = [sx, sy, sw, sh]
      .map((x) => (x === undefined ? 1 : 0) as number)
      .reduce((a, b) => a + b);

    return new Promise((resolve, reject) => {
      switch (missingParametersCount) {
        case 0: {
          if (
            sx === undefined ||
            sy === undefined ||
            sw === undefined ||
            sh === undefined
          ) {
            // should never get here because this case is 0 missing parameters
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

  /**
   * Handles game screenshots.
   *
   * @remarks This is called on every iteration of the game loop.
   * In prior versions, I took a snapshot only when needed, e.g.,
   * after a new scene transition was requested. From performance testing,
   * however, I found that taking a snapshot has negligible impact on
   * performance. It is only encoding the image to bytes, i.e.,
   * image.encodeToBytes(), that is expensive. Thus, we can take a snapshot
   * after every draw, in case we'll need the snapshot. IMPORTANT: snapshots
   * must be deleted when not needed, otherwise we will create a massive memory
   * leak because we are creating them 60 times per second.
   */
  handleScreenshots() {
    while (this.snapshots.length > 0) {
      this.snapshots.shift()?.delete();
    }
    this.snapshots.push(this.takeCurrentSceneSnapshot());

    if (this.pendingScreenshot) {
      this.handlePendingScreenshot(this.pendingScreenshot);
      this.pendingScreenshot = undefined;
    }
  }

  takeCurrentSceneSnapshot(): Image {
    if (this.game.surface === undefined) {
      throw new M2Error("CanvasKit surface is undefined");
    }
    return this.game.surface.makeImageSnapshot();
  }

  private handlePendingScreenshot(pendingScreenshot: PendingScreenshot) {
    if (!this.game.surface) {
      throw new M2Error("no surface");
    }
    let image: Image;
    if (pendingScreenshot.rect.length == 4) {
      const sx = pendingScreenshot.rect[0] * m2c2Globals.canvasScale;
      const sy = pendingScreenshot.rect[1] * m2c2Globals.canvasScale;
      const sw = pendingScreenshot.rect[2] * m2c2Globals.canvasScale;
      const sh = pendingScreenshot.rect[3] * m2c2Globals.canvasScale;
      const scaledRect = [sx, sy, sx + sw, sy + sh];
      image = this.game.surface.makeImageSnapshot(scaledRect);
    } else {
      image = this.game.surface.makeImageSnapshot();
    }

    const imageAsPngBytes = image.encodeToBytes();
    pendingScreenshot.promiseResolve(imageAsPngBytes);
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

  private createFreeNodesScene(): Scene {
    const freeNodesScene = new Scene({
      name: Constants.FREE_NODES_SCENE_NAME,
      backgroundColor: [255, 255, 255, 0],
    });
    freeNodesScene.game = this.game;
    freeNodesScene.needsInitialization = true;

    const freeNodeSceneOptions = {
      name: Constants.FREE_NODES_SCENE_NAME,
      backgroundColor: [255, 255, 255, 0],
      uuid: freeNodesScene.uuid,
    };
    const freeNodesSceneNewEvent: M2NodeNewEvent = {
      type: M2EventType.NodeNew,
      target: freeNodesScene,
      nodeType: M2NodeType.Scene,
      ...M2c2KitHelpers.createFrameUpdateTimestamps(),
      nodeOptions: freeNodeSceneOptions,
      sequence: m2c2Globals.eventSequence,
    };
    this.game.eventStore.addEvent(freeNodesSceneNewEvent);
    return freeNodesScene;
  }

  get freeNodes(): Array<M2Node> {
    return this.freeNodesScene.children;
  }

  addFreeNode(node: M2Node): void {
    this.freeNodesScene.addChild(node);
  }

  removeFreeNode(node: M2Node | string): void {
    if (typeof node === "string") {
      const child = this.freeNodesScene.children
        .filter((child) => child.name === node)
        .find(Boolean);
      if (!child) {
        throw new M2Error(
          `cannot remove free node named "${node}" because it is not currently part of the game's free nodes. `,
        );
      }
      this.freeNodesScene.removeChild(child);
    } else {
      this.freeNodesScene.removeChild(node);
    }
  }

  removeAllFreeNodes(): void {
    while (this.freeNodesScene.children.length) {
      this.freeNodesScene.children.pop();
    }
  }

  /**
   * Frees up resources allocated by the SceneManager.
   *
   * @internal For m2c2kit library use only
   *
   * @remarks This will be done automatically by the m2c2kit library; the
   * end-user must not call this.
   */
  dispose(): void {
    this.scenes = [];
    this.freeNodesScene.removeAllChildren();
    this.clearCurrentScene();
    this.snapshots.filter((s) => !s.isDeleted()).forEach((s) => s.delete());
    this.snapshots = [];
    this.incomingSceneTransitions = [];
  }
}
