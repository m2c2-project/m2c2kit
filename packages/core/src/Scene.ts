import { Canvas, Paint } from "canvaskit-wasm";
import { Constants } from "./Constants";
import { IDrawable } from "./IDrawable";
import { M2Node, handleInterfaceOptions } from "./M2Node";
import { M2NodeType } from "./M2NodeType";
import { RgbaColor } from "./RgbaColor";
import { SceneOptions } from "./SceneOptions";
import { Game } from "./Game";
import { CanvasKitHelpers } from "./CanvasKitHelpers";
import { M2c2KitHelpers } from "./M2c2KitHelpers";
import { M2NodeEvent } from "./M2NodeEvent";
import { CallbackOptions } from "./CallbackOptions";
import { Equal } from "./Equal";
import { Point } from "./Point";
import { M2KeyboardEvent } from "./M2KeyboardEvent";
import { M2EventType } from "./M2Event";
import { M2Error } from "./M2Error";

export class Scene extends M2Node implements IDrawable, SceneOptions {
  readonly type = M2NodeType.Scene;
  isDrawable = true;
  // Drawable options
  private _anchorPoint: Point = { x: 0, y: 0 };
  private _zPosition = 0;
  // Scene options
  private _backgroundColor = Constants.DEFAULT_SCENE_BACKGROUND_COLOR;

  _active = false;
  _transitioning = false;
  private backgroundPaint?: Paint;

  /**
   * Top-level node that holds all other nodes, such as sprites, rectangles, or labels, that will be displayed on the screen
   *
   * @remarks The scene is the game screen or stage, and fills the entire available screen. There are usually multiple screens to contain multiple stages of the game, such as various instruction pages or phases of a game.
   *
   * @param options - {@link SceneOptions}
   */
  constructor(options: SceneOptions = {}) {
    super(options);
    handleInterfaceOptions(this, options);
    if (options.backgroundColor) {
      this.backgroundColor = options.backgroundColor;
    }
    this.saveNodeNewEvent();
  }

  override get completeNodeOptions() {
    return {
      ...this.options,
      ...this.getNodeOptions(),
      ...this.getDrawableOptions(),
      backgroundColor: this.backgroundColor,
    };
  }

  override initialize(): void {
    this.scale = m2c2Globals.rootScale;
    this.size.width = this.game.canvasCssWidth;
    this.size.height = this.game.canvasCssHeight;
    if (this.backgroundPaint) {
      this.backgroundPaint.delete();
    }
    this.backgroundPaint = CanvasKitHelpers.makePaint(
      this.canvasKit,
      this.backgroundColor,
      this.canvasKit.PaintStyle.Fill,
      false,
    );
    this.needsInitialization = false;
  }

  dispose(): void {
    CanvasKitHelpers.Dispose([this.backgroundPaint]);
  }

  set game(game: Game) {
    this._game = game;
  }
  /**
   * The game which this scene is a part of.
   *
   * @remarks Throws error if scene is not part of the game object.
   */
  get game(): Game {
    if (this._game === undefined) {
      throw new M2Error(`Scene ${this} has not been added to a game.`);
    }
    return this._game;
  }

  get backgroundColor(): RgbaColor {
    return this._backgroundColor;
  }
  set backgroundColor(backgroundColor: RgbaColor) {
    if (Equal.value(this._backgroundColor, backgroundColor)) {
      return;
    }
    this._backgroundColor = backgroundColor;
    this.needsInitialization = true;
    this.savePropertyChangeEvent("backgroundColor", backgroundColor);
  }

  get anchorPoint(): Point {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const node = this;
    return {
      get x(): number {
        return node._anchorPoint.x;
      },
      set x(x: number) {
        if (Equal.value(node._anchorPoint.x, x)) {
          return;
        }
        node._anchorPoint.x = x;
        node.savePropertyChangeEvent("anchorPoint", node.anchorPoint);
      },
      get y(): number {
        return node._anchorPoint.y;
      },
      set y(y: number) {
        if (Equal.value(node._anchorPoint.y, y)) {
          return;
        }
        node._anchorPoint.y = y;
        node.savePropertyChangeEvent("anchorPoint", node.anchorPoint);
      },
    };
  }
  set anchorPoint(anchorPoint: Point) {
    if (Equal.value(this._anchorPoint, anchorPoint)) {
      return;
    }
    this._anchorPoint = anchorPoint;
    this.savePropertyChangeEvent("anchorPoint", this.anchorPoint);
  }

  get zPosition(): number {
    return this._zPosition;
  }
  set zPosition(zPosition: number) {
    if (Equal.value(this._zPosition, zPosition)) {
      return;
    }
    this._zPosition = zPosition;
    this.savePropertyChangeEvent("zPosition", zPosition);
  }

  /**
   * Duplicates a node using deep copy.
   *
   * @remarks This is a deep recursive clone (node and children).
   * The uuid property of all duplicated nodes will be newly created,
   * because uuid must be unique.
   *
   * @param newName - optional name of the new, duplicated node. If not
   * provided, name will be the new uuid
   */
  override duplicate(newName?: string): Scene {
    const dest = new Scene({
      ...this.getNodeOptions(),
      ...this.getDrawableOptions(),
      backgroundColor: this.backgroundColor,
      name: newName,
    });
    dest.game = this.game;

    if (this.children.length > 0) {
      dest.children = this.children.map((child) => {
        const clonedChild = child.duplicate();
        clonedChild.parent = dest;
        return clonedChild;
      });
    }

    return dest;
  }

  /**
   * Code that will be called every time the scene is presented.
   *
   * @remarks Use this callback to set nodes to their initial state, if
   * that state might be changed later. For example, if a scene allows
   * players to place dots on a grid, the setup() method should ensure the
   * grid is clear of any prior dots from previous times this scene may
   * have been displayed. In addition, if nodes should vary in each
   * iteration, that should be done here.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onSetup(
    callback: (nodeEvent: M2NodeEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener("SceneSetup", callback, options);
  }

  /**
   *
   * Code that will be called after the scene has finished any transitions
   * and has fully appeared on the screen.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onAppear(
    callback: (nodeEvent: M2NodeEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener("SceneAppear", callback, options);
  }

  /**
   * Code that will be called after a key is pressed on the device's
   * built-in keyboard.
   *
   * @remarks The built-in keyboard is defined as the hardware keyboard on a
   * desktop/laptop or the built-in soft keyboard on a tablet or phone. The
   * latter is not used in m2c2kit. On tablet or phone, the `VirtualKeyboard`
   * in the `@m2c2kit/addons` package should be used for key events.
   * @remarks Key events can occur only on a `Scene` node.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onKeyDown(
    callback: (m2KeyboardEvent: M2KeyboardEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(M2EventType.KeyDown, callback, options);
  }

  /**
   * Code that will be called after a key is released on the device's
   * built-in keyboard.
   *
   * @remarks The built-in keyboard is defined as the hardware keyboard on a
   * desktop/laptop or the built-in soft keyboard on a tablet or phone. The
   * latter is not used in m2c2kit. On tablet or phone, the `VirtualKeyboard`
   * in the `@m2c2kit/addons` package should be used for key events.
   * @remarks Key events can occur only on a `Scene` node.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onKeyUp(
    callback: (m2KeyboardEvent: M2KeyboardEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(M2EventType.KeyUp, callback, options);
  }

  override update(): void {
    super.update();
  }

  draw(canvas: Canvas): void {
    // Except for its children, a scene itself only draws a background rectangle to "clear" the screen
    // Due to transition animations, this background rectangle may be beyond the viewable canvas bounds
    canvas.save();
    const drawScale = m2c2Globals.canvasScale / this.absoluteScale;
    canvas.scale(1 / drawScale, 1 / drawScale);
    M2c2KitHelpers.rotateCanvasForDrawableNode(canvas, this);

    if (!this.backgroundPaint) {
      throw new M2Error(`in Scene ${this}, background paint is undefined.`);
    }

    if (this.absoluteAlphaChange !== 0) {
      this.backgroundPaint.setAlphaf(this.absoluteAlpha);
    }

    canvas.drawRect(
      [
        this.position.x * drawScale * m2c2Globals.rootScale,
        this.position.y * drawScale * m2c2Globals.rootScale,
        (this.position.x + this.size.width) * drawScale * m2c2Globals.rootScale,
        (this.position.y + this.size.height) *
          drawScale *
          m2c2Globals.rootScale,
      ],
      this.backgroundPaint,
    );
    canvas.restore();

    super.drawChildren(canvas);
  }

  warmup(canvas: Canvas): void {
    this.initialize();

    canvas.save();
    const drawScale = m2c2Globals.canvasScale / this.absoluteScale;
    canvas.scale(1 / drawScale, 1 / drawScale);
    if (!this.backgroundPaint) {
      throw new M2Error(`in Scene ${this}, background paint is undefined.`);
    }
    canvas.drawRect(
      [
        this.position.x * drawScale * m2c2Globals.rootScale,
        this.position.y * drawScale * m2c2Globals.rootScale,
        (this.position.x + this.size.width) * drawScale * m2c2Globals.rootScale,
        (this.position.y + this.size.height) *
          drawScale *
          m2c2Globals.rootScale,
      ],
      this.backgroundPaint,
    );
    canvas.restore();

    this.children.forEach((child) => {
      if (child.isDrawable) {
        (child as unknown as IDrawable).warmup(canvas);
      }
    });
  }
}
