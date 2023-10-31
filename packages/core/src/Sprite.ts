import "./Globals";
import { Canvas, Paint } from "canvaskit-wasm";
import { IDrawable } from "./IDrawable";
import { Entity, handleInterfaceOptions } from "./Entity";
import { EntityType } from "./EntityType";
import { SpriteOptions } from "./SpriteOptions";
import { LoadedImage } from "./LoadedImage";
import { Scene } from "./Scene";
import { CanvasKitHelpers } from "./CanvasKitHelpers";

export class Sprite extends Entity implements IDrawable, SpriteOptions {
  readonly type = EntityType.Sprite;
  isDrawable = true;
  // Drawable options
  anchorPoint = { x: 0.5, y: 0.5 };
  zPosition = 0;
  // Sprite options
  private _imageName = ""; // public getter/setter is below

  private loadedImage?: LoadedImage;
  private _paint?: Paint;

  /**
   * Visual image displayed on the screen.
   *
   * @remarks Images that will be used to create the sprite must be loaded during the Game.initialize() method prior to their use.
   *
   * @param options - {@link SpriteOptions}
   */
  constructor(options: SpriteOptions = {}) {
    super(options);
    handleInterfaceOptions(this, options);
    if (options.imageName !== undefined) {
      this.imageName = options.imageName;
    }
  }

  override initialize(): void {
    const activity = (this.parentSceneAsEntity as unknown as Scene).game
      .session;
    if (!activity) {
      throw new Error("activity is undefined");
    }
    const imageManager = activity.imageManager;
    const gameUuid = (this.parentSceneAsEntity as unknown as Scene).game.uuid;
    this.loadedImage = imageManager.getLoadedImage(gameUuid, this._imageName);
    if (!this.loadedImage) {
      throw new Error(
        `could not create sprite. the image named ${this._imageName} has not been loaded`
      );
    }
    this.size.width = this.loadedImage.width;
    this.size.height = this.loadedImage.height;
    if (!this._paint) {
      this.paint = new this.canvasKit.Paint();
    }
    this.needsInitialization = false;
  }

  dispose(): void {
    // use paint backing field since it may be undefined
    CanvasKitHelpers.Dispose([this.loadedImage?.image, this._paint]);
  }

  set imageName(imageName: string) {
    this._imageName = imageName;
    this.needsInitialization = true;
  }

  get imageName(): string {
    return this._imageName;
  }

  private set paint(paint: Paint) {
    this._paint = paint;
  }
  private get paint(): Paint {
    if (!this._paint) {
      throw new Error(
        `in paint getter: Sprite entity ${this.toString()} paint is undefined.`
      );
    }
    return this._paint;
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
  override duplicate(newName?: string): Sprite {
    const dest = new Sprite({
      ...this.getEntityOptions(),
      ...this.getDrawableOptions(),
      imageName: this.imageName,
      name: newName,
    });

    if (this.children.length > 0) {
      dest.children = this.children.map((child) => {
        const clonedChild = child.duplicate();
        clonedChild.parent = dest;
        return clonedChild;
      });
    }

    return dest;
  }

  override update(): void {
    super.update();
  }

  draw(canvas: Canvas): void {
    if (!this.hidden) {
      if (this.loadedImage) {
        canvas.save();
        const drawScale = Globals.canvasScale / this.absoluteScale;
        canvas.scale(1 / drawScale, 1 / drawScale);

        const x =
          (this.absolutePosition.x -
            this.size.width * this.anchorPoint.x * this.absoluteScale) *
          drawScale;
        const y =
          (this.absolutePosition.y -
            this.size.height * this.anchorPoint.y * this.absoluteScale) *
          drawScale;

        if (this.absoluteAlphaChange !== 0) {
          this.paint.setAlphaf(this.absoluteAlpha);
        }

        canvas.drawImage(this.loadedImage.image, x, y, this.paint);
        canvas.restore();
      }

      super.drawChildren(canvas);
    }
  }

  warmup(canvas: Canvas): void {
    this.initialize();
    if (!this.loadedImage) {
      throw new Error(
        `warmup Sprite entity ${this.toString()}: image not loaded.`
      );
    }
    canvas.drawImage(this.loadedImage.image, 0, 0);
    this.children.forEach((child) => {
      if (child.isDrawable) {
        (child as unknown as IDrawable).warmup(canvas);
      }
    });
  }
}
