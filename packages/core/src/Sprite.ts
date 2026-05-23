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
import { M2Error } from "./M2Error";

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
      throw new M2Error(
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

  override dispose(): void {
    super.dispose();
    // use paint backing field since it may be undefined
    // Do not dispose of the sprite's image here because the image may be
    // used by other sprites. Images are disposed of in the ImageManager.
    CanvasKitHelpers.Dispose([this._paint]);
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
      throw new M2Error(
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
            throw new M2Error(
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
        throw new M2Error(
          `in Sprite.warmup(): Sprite node ${this.toString()}: image not loaded.`,
        );
      }
      if (!this.m2Image.canvaskitImage) {
        throw new M2Error(
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
   * Draws a filled rectangle at the image's position to indicate that a fallback
   * image is being used.
   *
   * @remarks The rectangle is expanded by a fixed number of pixels on all sides
   * and filled with the missing localization color. Since the rectangle is larger
   * than the image, it will be visible behind the image. The border scales with
   * the sprite's scale.
   *
   * @param canvas - CanvasKit canvas to draw on
   */
  private drawFallbackImageBorder(canvas: Canvas) {
    const paint = this.game.imageManager.missingLocalizationImagePaint;
    if (!paint) {
      return;
    }
    const drawScale = m2c2Globals.canvasScale / this.absoluteScale;
    const borderPixels = 4;
    const expandedWidth = this.size.width + borderPixels;
    const expandedHeight = this.size.height + borderPixels;
    const rect = this.canvasKit.RRectXY(
      this.canvasKit.LTRBRect(
        (this.absolutePosition.x -
          this.anchorPoint.x * expandedWidth * this.absoluteScale) *
          drawScale,
        (this.absolutePosition.y -
          this.anchorPoint.y * expandedHeight * this.absoluteScale) *
          drawScale,
        (this.absolutePosition.x +
          (1 - this.anchorPoint.x) * expandedWidth * this.absoluteScale) *
          drawScale,
        (this.absolutePosition.y +
          (1 - this.anchorPoint.y) * expandedHeight * this.absoluteScale) *
          drawScale,
      ),
      0,
      0,
    );
    canvas.drawRRect(rect, paint);
  }
}
