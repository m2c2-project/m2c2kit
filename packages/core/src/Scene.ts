import "./Globals";
import { Canvas, Paint } from "canvaskit-wasm";
import { Constants } from "./Constants";
import { IDrawable } from "./IDrawable";
import { Entity, handleInterfaceOptions } from "./Entity";
import { EntityType } from "./EntityType";
import { RgbaColor } from "./RgbaColor";
import { SceneOptions } from "./SceneOptions";
import { Game } from "./Game";
import { CanvasKitHelpers } from "./CanvasKitHelpers";
import { M2c2KitHelpers } from "./M2c2KitHelpers";

export class Scene extends Entity implements IDrawable, SceneOptions {
  readonly type = EntityType.Scene;
  isDrawable = true;
  // Drawable options
  anchorPoint = { x: 0, y: 0 };
  zPosition = 0;
  // Scene options
  private _backgroundColor = Constants.DEFAULT_SCENE_BACKGROUND_COLOR;

  _active = false;
  _transitioning = false;
  _setupCallback?: (scene: Scene) => void;
  _appearCallback?: (scene: Scene) => void;
  private backgroundPaint?: Paint;

  /**
   * Top-level entity that holds all other entities, such as sprites, rectangles, or labels, that will be displayed on the screen
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
  }

  override initialize(): void {
    this.scale = Globals.rootScale;
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
      throw new Error(`Scene ${this} has not been added to a game.`);
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
   * Duplicates an entity using deep copy.
   *
   * @remarks This is a deep recursive clone (entity and children).
   * The uuid property of all duplicated entities will be newly created,
   * because uuid must be unique.
   *
   * @param newName - optional name of the new, duplicated entity. If not
   * provided, name will be the new uuid
   */
  override duplicate(newName?: string): Scene {
    const dest = new Scene({
      ...this.getEntityOptions(),
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
   * @remarks Use this callback to set entities to their initial state, if
   * that state might be changed later. For example, if a scene allows
   * players to place dots on a grid, the setup() method should ensure the
   * grid is clear of any prior dots from previous times this scene may
   * have been displayed. In addition, if entities should vary in each
   * iteration, that should be done here.
   *
   * @param callback
   */
  onSetup(callback: (scene: Scene) => void): void {
    this._setupCallback = callback;
  }

  /**
   *
   * Code that will be called after the scene has finished any transitions
   * and has fully appeared on the screen.
   *
   * @param callback
   */
  onAppear(callback: (scene: Scene) => void): void {
    this._appearCallback = callback;
  }

  override update(): void {
    super.update();
  }

  draw(canvas: Canvas): void {
    // Except for its children, a scene itself only draws a background rectangle to "clear" the screen
    // Due to transition animations, this background rectangle may be beyond the viewable canvas bounds
    canvas.save();
    const drawScale = Globals.canvasScale / this.absoluteScale;
    canvas.scale(1 / drawScale, 1 / drawScale);
    M2c2KitHelpers.rotateCanvasForDrawableEntity(canvas, this);

    if (!this.backgroundPaint) {
      throw new Error(`in Scene ${this}, background paint is undefined.`);
    }

    if (this.absoluteAlphaChange !== 0) {
      this.backgroundPaint.setAlphaf(this.absoluteAlpha);
    }

    canvas.drawRect(
      [
        this.position.x * drawScale * Globals.rootScale,
        this.position.y * drawScale * Globals.rootScale,
        (this.position.x + this.size.width) * drawScale * Globals.rootScale,
        (this.position.y + this.size.height) * drawScale * Globals.rootScale,
      ],
      this.backgroundPaint,
    );
    canvas.restore();

    super.drawChildren(canvas);
  }

  warmup(canvas: Canvas): void {
    this.initialize();

    canvas.save();
    const drawScale = Globals.canvasScale / this.absoluteScale;
    canvas.scale(1 / drawScale, 1 / drawScale);
    if (!this.backgroundPaint) {
      throw new Error(`in Scene ${this}, background paint is undefined.`);
    }
    canvas.drawRect(
      [
        this.position.x * drawScale * Globals.rootScale,
        this.position.y * drawScale * Globals.rootScale,
        (this.position.x + this.size.width) * drawScale * Globals.rootScale,
        (this.position.y + this.size.height) * drawScale * Globals.rootScale,
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
