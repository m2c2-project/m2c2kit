import { Canvas, Paint } from "canvaskit-wasm";
import { IDrawable } from "./IDrawable";
import { M2Node, handleInterfaceOptions } from "./M2Node";
import { M2NodeType } from "./M2NodeType";
import { SpriteOptions } from "./SpriteOptions";
import { M2Image, M2ImageStatus } from "./M2Image";
import { CanvasKitHelpers } from "./CanvasKitHelpers";
import { M2c2KitHelpers } from "./M2c2KitHelpers";
import { Equal } from "./Equal";
import { Point } from "./Point";

export class Sprite extends M2Node implements IDrawable, SpriteOptions {
  readonly type = M2NodeType.Sprite;
  isDrawable = true;
  // Drawable options
  private _anchorPoint: Point = { x: 0.5, y: 0.5 };
  private _zPosition = 0;
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

    this.saveNodeNewEvent();
  }

  override get completeNodeOptions() {
    return {
      ...this.options,
      ...this.getNodeOptions(),
      ...this.getDrawableOptions(),
      imageName: this.imageName,
    };
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

  get imageName(): string {
    return this._imageName;
  }
  set imageName(imageName: string) {
    if (Equal.value(this._imageName, imageName)) {
      return;
    }
    this._imageName = imageName;
    this.needsInitialization = true;
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

  private set paint(paint: Paint) {
    this._paint = paint;
  }
  private get paint(): Paint {
    if (!this._paint) {
      throw new Error(
        `in paint getter: Sprite node ${this.toString()} paint is undefined.`,
      );
    }
    return this._paint;
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
  override duplicate(newName?: string): Sprite {
    const dest = new Sprite({
      ...this.getNodeOptions(),
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
        const drawScale = m2c2Globals.canvasScale / this.absoluteScale;
        canvas.scale(1 / drawScale, 1 / drawScale);
        M2c2KitHelpers.rotateCanvasForDrawableNode(canvas, this);

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
          if (this.m2Image.isFallback) {
            this.drawFallbackImageBorder(canvas);
          }
          canvas.drawImage(this.m2Image.canvaskitImage, x, y, this.paint);
        } else {
          if (this.m2Image.status === M2ImageStatus.Deferred) {
            console.log(
              `begin loading lazy image ${this.m2Image.imageName} for Sprite node ${this.toString()}`,
            );
            this.game.imageManager.prepareDeferredImage(this.m2Image);
          }
          if (this.m2Image.status === M2ImageStatus.Error) {
            throw new Error(
              `error status on image ${this.m2Image.imageName} for Sprite node ${this.toString()}`,
            );
          }
        }
        canvas.restore();
      }

      super.drawChildren(canvas);
    }
  }

  warmup(canvas: Canvas): void {
    if (this.m2Image?.status === M2ImageStatus.Ready) {
      this.initialize();
      if (!this.m2Image) {
        throw new Error(
          `in Sprite.warmup(): Sprite node ${this.toString()}: image not loaded.`,
        );
      }
      if (!this.m2Image.canvaskitImage) {
        throw new Error(
          `in Sprite.warmup(): Sprite node ${this.toString()} image ${this.m2Image.imageName} is undefined.`,
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

  /**
   * Draws a rectangle border around the image to indicate that a fallback
   * image is being used.
   *
   * @remarks The size of the rectangle is the same as the image, but because
   * the stroke width of the paint is wider than 1 pixel (see method
   * `configureImageLocalization()` in `ImageManager.ts`), the rectangle will
   * be larger than the image and thus be visible.
   *
   * @param canvas - CanvasKit canvas to draw on
   */
  private drawFallbackImageBorder(canvas: Canvas) {
    const paint = this.game.imageManager.missingLocalizationImagePaint;
    if (!paint) {
      return;
    }
    const drawScale = m2c2Globals.canvasScale / this.absoluteScale;
    const rect = this.canvasKit.RRectXY(
      this.canvasKit.LTRBRect(
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
          drawScale,
      ),
      0,
      0,
    );
    canvas.drawRRect(rect, paint);
  }
}
