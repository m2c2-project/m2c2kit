import "./Globals";
import { Canvas, Paint } from "canvaskit-wasm";
import { IDrawable } from "./IDrawable";
import { Entity, handleInterfaceOptions } from "./Entity";
import { EntityType } from "./EntityType";
import { SpriteOptions } from "./SpriteOptions";
import { M2Image, M2ImageStatus } from "./M2Image";
import { CanvasKitHelpers } from "./CanvasKitHelpers";
import { M2c2KitHelpers } from "./M2c2KitHelpers";

export class Sprite extends Entity implements IDrawable, SpriteOptions {
  readonly type = EntityType.Sprite;
  isDrawable = true;
  // Drawable options
  anchorPoint = { x: 0.5, y: 0.5 };
  zPosition = 0;
  // Sprite options
  private _imageName = ""; // public getter/setter is below

  private m2Image?: M2Image;
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
    this.m2Image = this.game.imageManager.getImage(this._imageName);
    if (!this.m2Image) {
      throw new Error(
        `could not create sprite. the image named ${this._imageName} has not been loaded`,
      );
    }
    this.size.width = this.m2Image.width;
    this.size.height = this.m2Image.height;
    if (!this._paint) {
      this.paint = new this.canvasKit.Paint();
    }
    this.needsInitialization = false;
  }

  dispose(): void {
    // use paint backing field since it may be undefined
    CanvasKitHelpers.Dispose([this.m2Image?.canvaskitImage, this._paint]);
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
        `in paint getter: Sprite entity ${this.toString()} paint is undefined.`,
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
      if (this.m2Image) {
        canvas.save();
        const drawScale = Globals.canvasScale / this.absoluteScale;
        canvas.scale(1 / drawScale, 1 / drawScale);
        M2c2KitHelpers.rotateCanvasForDrawableEntity(canvas, this);

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

        if (
          this.m2Image.status === M2ImageStatus.Ready &&
          this.m2Image.canvaskitImage
        ) {
          canvas.drawImage(this.m2Image.canvaskitImage, x, y, this.paint);
        } else {
          if (this.m2Image.status === M2ImageStatus.Deferred) {
            console.log(
              `begin loading lazy image ${this.m2Image.imageName} for Sprite entity ${this.toString()}`,
            );
            this.game.imageManager.renderDeferredImage(this._imageName);
          }
          if (this.m2Image.status === M2ImageStatus.Error) {
            throw new Error(
              `error status on image ${this.m2Image.imageName} for Sprite entity ${this.toString()}`,
            );
          }
        }
        canvas.restore();
      }

      super.drawChildren(canvas);
    }
  }

  warmup(canvas: Canvas): void {
    if (this.m2Image?.status !== M2ImageStatus.Deferred) {
      this.initialize();
      if (!this.m2Image) {
        throw new Error(
          `in Sprite.warmup(): Sprite entity ${this.toString()}: image not loaded.`,
        );
      }
      if (!this.m2Image.canvaskitImage) {
        throw new Error(
          `in Sprite.warmup(): Sprite entity ${this.toString()} image ${this.m2Image.imageName} is undefined.`,
        );
      }
      canvas.drawImage(this.m2Image.canvaskitImage, 0, 0);
    }
    this.children.forEach((child) => {
      if (child.isDrawable) {
        (child as unknown as IDrawable).warmup(canvas);
      }
    });
  }
}
