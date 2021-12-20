import "./Globals";
import { Canvas, Paint } from "canvaskit-wasm";
import { Constants } from "./Constants";
import { IDrawable } from "./IDrawable";
import { Entity, handleInterfaceOptions } from "./Entity";
import { EntityType } from "./EntityType";
import { Point } from "./Point";
import { RgbaColor } from "./RgbaColor";
import { SceneOptions } from "./SceneOptions";
import { Game } from "./Game";

export class Scene extends Entity implements IDrawable, SceneOptions {
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
    this.backgroundPaint = new Globals.canvasKit.Paint();
    this.backgroundPaint.setColor(
      Globals.canvasKit.Color(
        this.backgroundColor[0],
        this.backgroundColor[1],
        this.backgroundColor[2],
        this.backgroundColor[3]
      )
    );
    this.backgroundPaint.setStyle(Globals.canvasKit.PaintStyle.Fill);
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
    const drawScale = Globals.canvasScale / this.absoluteScale;
    canvas.scale(1 / drawScale, 1 / drawScale);
    const rr = Globals.canvasKit.RRectXY(
      Globals.canvasKit.LTRBRect(
        this.position.x * drawScale * Globals.rootScale,
        this.position.y * drawScale * Globals.rootScale,
        (this.position.x + this.size.width) * drawScale * Globals.rootScale,
        (this.position.y + this.size.height) * drawScale * Globals.rootScale
      ),
      0,
      0
    );
    canvas.drawRRect(rr, this.backgroundPaint!);
    canvas.restore();

    super.drawChildren(canvas);
  }
}
