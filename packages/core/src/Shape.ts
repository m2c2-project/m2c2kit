import "./Globals";
import { Canvas, Paint } from "canvaskit-wasm";
import { Constants } from "./Constants";
import { IDrawable } from "./IDrawable";
import { Entity, handleInterfaceOptions } from "./Entity";
import { EntityType } from "./EntityType";
import { RgbaColor } from "./RgbaColor";
import { ShapeOptions } from "./ShapeOptions";
import { Path } from "./Path";
import { RectOptions } from "./RectOptions";
import { ShapeType } from "./ShapeType";
import { CanvasKitHelpers } from "./CanvasKitHelpers";

export class Shape extends Entity implements IDrawable, ShapeOptions {
  readonly type = EntityType.Shape;
  isDrawable = true;
  isShape = true;
  // Drawable options
  anchorPoint = { x: 0.5, y: 0.5 };
  zPosition = 0;
  // Shape options
  // TODO: fix the Size issue; should be readonly (calculated value) in all entities, but Rectangle
  shapeType = ShapeType.Undefined;
  circleOfRadius?: number;
  rect?: RectOptions;
  path?: Path;
  cornerRadius = 0;
  private _fillColor = Constants.DEFAULT_SHAPE_FILL_COLOR;
  private _strokeColor?: RgbaColor | undefined;
  lineWidth?: number;
  private _isAntialiased = true;

  private _fillColorPaintAntialiased?: Paint;
  private _strokeColorPaintAntialiased?: Paint;
  private _fillColorPaintNotAntialiased?: Paint;
  private _strokeColorPaintNotAntialiased?: Paint;

  /**
   * Rectangular, circular, or path-based shape
   *
   * @param options - {@link ShapeOptions}
   */
  constructor(options: ShapeOptions = {}) {
    super(options);
    handleInterfaceOptions(this, options);
    if (options.path !== undefined) {
      this.path = options.path;
      this.size.width = options.path.size.width;
      this.size.height = options.path.size.height;
      if (!this.strokeColor) {
        this.strokeColor = Constants.DEFAULT_PATH_STROKE_COLOR;
      }
      if (!this.lineWidth) {
        this.lineWidth = Constants.DEFAULT_PATH_LINE_WIDTH;
      }
      this.shapeType = ShapeType.Path;
      if (options.circleOfRadius || options.rect) {
        throw new Error(
          "Shape must specify only one of: path, circleOfRadius, or rect"
        );
      }
    }
    if (options.circleOfRadius !== undefined) {
      this.circleOfRadius = options.circleOfRadius;
      this.shapeType = ShapeType.Circle;
      if (options.path || options.rect) {
        throw new Error(
          "Shape must specify only one of: path, circleOfRadius, or rect"
        );
      }
    }
    if (options.rect) {
      this.rect = options.rect;
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
        this.position = { x: options.rect.x, y: options.rect.y };
      }
      this.shapeType = ShapeType.Rectangle;
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
    if (options.isAntialiased !== undefined) {
      this.isAntialiased = options.isAntialiased;
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
      this.fillColorPaintAntialiased = CanvasKitHelpers.makePaint(
        this.canvasKit,
        this.fillColor,
        this.canvasKit.PaintStyle.Fill,
        true
      );
      this.fillColorPaintNotAntialiased = CanvasKitHelpers.makePaint(
        this.canvasKit,
        this.fillColor,
        this.canvasKit.PaintStyle.Fill,
        false
      );
    }

    if (this.strokeColor) {
      this.strokeColorPaintAntialiased = CanvasKitHelpers.makePaint(
        this.canvasKit,
        this.strokeColor,
        this.canvasKit.PaintStyle.Stroke,
        true
      );
      this.strokeColorPaintNotAntialiased = CanvasKitHelpers.makePaint(
        this.canvasKit,
        this.strokeColor,
        this.canvasKit.PaintStyle.Stroke,
        false
      );
    }
    this.needsInitialization = false;
  }

  dispose(): void {
    CanvasKitHelpers.Dispose([
      this._strokeColorPaintAntialiased,
      this._strokeColorPaintNotAntialiased,
      this._fillColorPaintAntialiased,
      this._fillColorPaintNotAntialiased,
    ]);
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
  override duplicate(newName?: string): Shape {
    const dest = new Shape({
      ...this.getEntityOptions(),
      ...this.getDrawableOptions(),
      shapeType: this.shapeType,
      circleOfRadius: this.circleOfRadius,
      rect: this.rect,
      cornerRadius: this.cornerRadius,
      fillColor: this.fillColor,
      strokeColor: this.strokeColor,
      lineWidth: this.lineWidth,
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

  update(): void {
    super.update();
  }

  draw(canvas: Canvas): void {
    canvas.save();
    const drawScale = Globals.canvasScale / this.absoluteScale;
    canvas.scale(1 / drawScale, 1 / drawScale);

    if (this.shapeType === ShapeType.Path && this.path) {
      /** paths use origin with anchor point at 0,0 (upper left) */
      const pathOriginX =
        (this.absolutePosition.x -
          this.anchorPoint.x * this.size.width * this.absoluteScale) *
        drawScale;
      /** paths use origin with anchor point at 0,0 (upper left) */
      const pathOriginY =
        (this.absolutePosition.y -
          this.anchorPoint.y * this.size.height * this.absoluteScale) *
        drawScale;

      if (
        this.strokeColor &&
        this.strokeColorPaintAntialiased &&
        this.lineWidth
      ) {
        // draw scale may change due to scaling, thus we must call setStrokeWidth() on every draw cycle
        this.strokeColorPaintAntialiased.setStrokeWidth(
          this.lineWidth * drawScale
        );

        for (const subpath of this.path.subpaths) {
          const points = subpath.flat();
          for (let i = 0; i < points.length - 1; i++) {
            canvas.drawLine(
              pathOriginX + points[i].x * drawScale,
              pathOriginY + points[i].y * drawScale,
              pathOriginX + points[i + 1].x * drawScale,
              pathOriginY + points[i + 1].y * drawScale,
              this.strokeColorPaintAntialiased
            );
          }
        }
      }
    }

    if (this.shapeType === ShapeType.Circle) {
      this.drawCircle(canvas);
    }

    if (this.shapeType === ShapeType.Rectangle) {
      this.drawRectangle(canvas);
    }

    canvas.restore();
    super.drawChildren(canvas);
  }

  private drawCircle(canvas: Canvas) {
    if (!this.circleOfRadius) {
      return;
    }

    if (this.fillColor) {
      const paint = this.getFillPaint();
      this.drawCircleWithCanvasKit(canvas, paint);
    }

    if (this.strokeColor && this.lineWidth) {
      const paint = this.getStrokePaint(this.lineWidth);
      this.drawCircleWithCanvasKit(canvas, paint);
    }
  }

  private drawRectangle(canvas: Canvas) {
    if (this.fillColor) {
      const paint = this.getFillPaint();
      this.drawRectangleWithCanvasKit(canvas, paint);
    }

    if (this.strokeColor && this.lineWidth) {
      const paint = this.getStrokePaint(this.lineWidth);
      this.drawRectangleWithCanvasKit(canvas, paint);
    }
  }

  private drawCircleWithCanvasKit(canvas: Canvas, paint: Paint): void {
    if (!this.circleOfRadius) {
      return;
    }
    const drawScale = Globals.canvasScale / this.absoluteScale;
    const cx = this.absolutePosition.x * drawScale;
    const cy = this.absolutePosition.y * drawScale;
    const radius = this.circleOfRadius * this.absoluteScale * drawScale;
    canvas.drawCircle(cx, cy, radius, paint);
  }

  private drawRectangleWithCanvasKit(canvas: Canvas, paint: Paint): void {
    const rr = this.calculateCKRoundedRectangle();
    canvas.drawRRect(rr, paint);
  }

  private calculateCKRoundedRectangle() {
    const drawScale = Globals.canvasScale / this.absoluteScale;
    return this.canvasKit.RRectXY(
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
          drawScale
      ),
      this.cornerRadius * drawScale,
      this.cornerRadius * drawScale
    );
  }

  private getFillPaint(): Paint {
    /**
     * If the shape is involved in a running animation action (e.g., move,
     * scale), then do not use an antialiased paint while the action is
     * running, because it can cause visible jank. I found that a new shader
     * program might be created for antialiased circles as they are animated.
     * (This was not the case for rectangles, though. Skia uses different
     * antialiasing techniques, depending on the shape primitive:
     * https://groups.google.com/g/skia-discuss/c/OUzwQqxsCmo/m/P_BroOJBDgAJ
     * https://groups.google.com/g/skia-discuss/c/TuRfkQ7u_kU/m/ZEhxAT0zBAAJ)
     */
    if (this.involvedInActionAffectingAppearance()) {
      return this.fillColorPaintNotAntialiased;
    }
    return this.isAntialiased
      ? this.fillColorPaintAntialiased
      : this.fillColorPaintNotAntialiased;
  }

  private getStrokePaint(lineWidth: number) {
    let paint: Paint;
    if (this.involvedInActionAffectingAppearance()) {
      paint = this.strokeColorPaintNotAntialiased;
    } else {
      paint = this.isAntialiased
        ? this.strokeColorPaintAntialiased
        : this.strokeColorPaintNotAntialiased;
    }

    // draw scale may change due to scaling, thus we must call setStrokeWidth() on every draw cycle
    const drawScale = Globals.canvasScale / this.absoluteScale;
    paint.setStrokeWidth(lineWidth * drawScale);
    return paint;
  }

  warmup(canvas: Canvas): void {
    this.initialize();

    canvas.save();
    const drawScale = Globals.canvasScale / this.absoluteScale;
    canvas.scale(1 / drawScale, 1 / drawScale);

    if (this.shapeType === ShapeType.Circle) {
      if (this.fillColor) {
        this.warmupFilledCircle(canvas);
      }
      if (this.strokeColor && this.lineWidth) {
        this.warmupStrokedCircle(canvas);
      }
    }

    if (this.shapeType === ShapeType.Rectangle) {
      if (this.fillColor) {
        this.warmupFilledRectangle(canvas);
      }
      if (this.strokeColor && this.lineWidth) {
        this.warmupStrokedRectangle(canvas);
      }
    }

    canvas.restore();

    this.children.forEach((child) => {
      if (child.isDrawable) {
        (child as unknown as IDrawable).warmup(canvas);
      }
    });
  }

  private warmupFilledCircle(canvas: Canvas) {
    if (!this.circleOfRadius) {
      return;
    }
    this.drawCircleWithCanvasKit(canvas, this.fillColorPaintAntialiased);
    this.drawCircleWithCanvasKit(canvas, this.fillColorPaintNotAntialiased);
  }

  private warmupStrokedCircle(canvas: Canvas) {
    if (!this.lineWidth || !this.circleOfRadius) {
      return;
    }
    const drawScale = Globals.canvasScale / this.absoluteScale;
    this.strokeColorPaintAntialiased.setStrokeWidth(this.lineWidth * drawScale);
    this.drawCircleWithCanvasKit(canvas, this.strokeColorPaintAntialiased);
    this.strokeColorPaintNotAntialiased.setStrokeWidth(
      this.lineWidth * drawScale
    );
    this.drawCircleWithCanvasKit(canvas, this.strokeColorPaintNotAntialiased);
  }

  private warmupFilledRectangle(canvas: Canvas) {
    this.drawRectangleWithCanvasKit(canvas, this.fillColorPaintAntialiased);
    this.drawRectangleWithCanvasKit(canvas, this.fillColorPaintNotAntialiased);
  }

  private warmupStrokedRectangle(canvas: Canvas) {
    if (!this.lineWidth || !this.circleOfRadius) {
      return;
    }
    const drawScale = Globals.canvasScale / this.absoluteScale;
    this.strokeColorPaintAntialiased.setStrokeWidth(this.lineWidth * drawScale);
    this.drawRectangleWithCanvasKit(canvas, this.strokeColorPaintAntialiased);
    this.strokeColorPaintNotAntialiased.setStrokeWidth(
      this.lineWidth * drawScale
    );
    this.drawRectangleWithCanvasKit(
      canvas,
      this.strokeColorPaintNotAntialiased
    );
  }

  get fillColor(): RgbaColor {
    return this._fillColor;
  }
  set fillColor(fillColor: RgbaColor) {
    this._fillColor = fillColor;
    this.needsInitialization = true;
  }

  get strokeColor(): RgbaColor | undefined {
    return this._strokeColor;
  }
  set strokeColor(strokeColor: RgbaColor | undefined) {
    this._strokeColor = strokeColor;
    this.needsInitialization = true;
  }

  get isAntialiased(): boolean {
    return this._isAntialiased;
  }
  set isAntialiased(isAntialiased: boolean) {
    this._isAntialiased = isAntialiased;
    this.needsInitialization = true;
  }

  public get fillColorPaintAntialiased(): Paint {
    if (!this._fillColorPaintAntialiased) {
      throw new Error("fillColorPaintAntiAliased is undefined");
    }
    return this._fillColorPaintAntialiased;
  }
  public set fillColorPaintAntialiased(value: Paint) {
    this._fillColorPaintAntialiased = value;
  }

  public get strokeColorPaintAntialiased(): Paint {
    if (!this._strokeColorPaintAntialiased) {
      throw new Error("strokeColorPaintAntiAliased is undefined");
    }
    return this._strokeColorPaintAntialiased;
  }
  public set strokeColorPaintAntialiased(value: Paint) {
    this._strokeColorPaintAntialiased = value;
  }

  public get fillColorPaintNotAntialiased(): Paint {
    if (!this._fillColorPaintNotAntialiased) {
      throw new Error("fillColorPaintNotAntiAliased is undefined");
    }
    return this._fillColorPaintNotAntialiased;
  }
  public set fillColorPaintNotAntialiased(value: Paint) {
    this._fillColorPaintNotAntialiased = value;
  }

  public get strokeColorPaintNotAntialiased(): Paint {
    if (!this._strokeColorPaintNotAntialiased) {
      throw new Error("strokeColorPaintNotAntiAliased is undefined");
    }
    return this._strokeColorPaintNotAntialiased;
  }
  public set strokeColorPaintNotAntialiased(value: Paint) {
    this._strokeColorPaintNotAntialiased = value;
  }
}
