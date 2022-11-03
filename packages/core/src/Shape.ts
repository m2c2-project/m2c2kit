import "./Globals";
import { Canvas, Paint, Path } from "canvaskit-wasm";
import { Constants } from "./Constants";
import { IDrawable } from "./IDrawable";
import { Entity, handleInterfaceOptions } from "./Entity";
import { EntityType } from "./EntityType";
import { RgbaColor } from "./RgbaColor";
import { ShapeOptions } from "./ShapeOptions";
import { M2Path } from "./M2Path";
import { SvgStringPath } from "./SvgStringPath";
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
  path?: M2Path | SvgStringPath;
  ckPath: Path | null = null;
  ckPathWidth?: number;
  ckPathHeight?: number;
  pathSvgString?: string;
  cornerRadius = 0;
  private _fillColor = Constants.DEFAULT_SHAPE_FILL_COLOR;
  private _strokeColor?: RgbaColor | undefined;
  lineWidth?: number;
  private _isAntialiased = true;

  private _fillColorPaintAntialiased?: Paint;
  private _strokeColorPaintAntialiased?: Paint;
  private _fillColorPaintNotAntialiased?: Paint;
  private _strokeColorPaintNotAntialiased?: Paint;

  private svgPathRequestedWidth?: number;
  private svgPathRequestedHeight?: number;
  private svgPathScaleForResizing = 1;
  private svgPathWidth = 0;
  private svgPathHeight = 0;
  private svgPreviousAbsoluteScale = NaN;
  private svgPreviousAbsoluteX = NaN;
  private svgPreviousAbsoluteY = NaN;
  private pathIsSvgStringPath = false;

  /**
   * Rectangular, circular, or path-based shape
   *
   * @param options - {@link ShapeOptions}
   */
  constructor(options: ShapeOptions = {}) {
    super(options);
    handleInterfaceOptions(this, options);

    if ((options?.path as SvgStringPath)?.svgString !== undefined) {
      this.shapeType = ShapeType.Path;
      this.pathIsSvgStringPath = true;

      this.pathSvgString = (options.path as SvgStringPath).svgString;
      this.svgPathRequestedWidth = (options.path as SvgStringPath).width;
      this.svgPathRequestedHeight = (options.path as SvgStringPath).height;

      if (
        this.svgPathRequestedHeight !== undefined &&
        this.svgPathRequestedWidth !== undefined
      ) {
        throw new Error(
          "Cannot specify both width and height for SVG string path."
        );
      }

      if (!this.strokeColor) {
        this.strokeColor = Constants.DEFAULT_PATH_STROKE_COLOR;
      }
      if (this.lineWidth === undefined) {
        this.lineWidth = Constants.DEFAULT_PATH_LINE_WIDTH;
      }
      if (options.circleOfRadius || options.rect) {
        throw new Error(
          "Shape must specify only one of: path, circleOfRadius, or rect"
        );
      }
    }

    if (options.circleOfRadius !== undefined) {
      this.circleOfRadius = options.circleOfRadius;
      this.shapeType = ShapeType.Circle;
      if (options.size !== undefined) {
        throw new Error("Size cannot be specified for circle shape");
      }
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
      if (options.size !== undefined) {
        throw new Error("Size cannot be specified for rectangle shape");
      }
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
    if (options.lineWidth !== undefined) {
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
    if (this.shapeType === ShapeType.Path && this.pathIsSvgStringPath) {
      if (!this.pathSvgString) {
        throw new Error("SVG Path string is null/undefined");
      }
      this.ckPath = this.canvasKit.Path.MakeFromSVGString(this.pathSvgString);
      if (!this.ckPath) {
        throw new Error("could not make CanvasKit Path from SVG string");
      }

      const bounds = this.ckPath.getBounds();
      this.svgPathWidth = bounds[2] + (bounds[0] < 0 ? Math.abs(bounds[0]) : 0);
      this.svgPathHeight =
        bounds[3] + (bounds[1] < 0 ? Math.abs(bounds[1]) : 0);

      this.size.width = this.size.width ?? this.svgPathWidth;
      this.size.height = this.size.height ?? this.svgPathHeight;

      if (this.svgPathRequestedHeight !== undefined) {
        this.svgPathScaleForResizing =
          this.svgPathRequestedHeight / this.svgPathHeight;
      } else if (this.svgPathRequestedWidth !== undefined) {
        this.svgPathScaleForResizing =
          this.svgPathRequestedWidth / this.svgPathWidth;
      }

      this.svgPreviousAbsoluteScale = 1;
      this.svgPreviousAbsoluteX = 0;
      this.svgPreviousAbsoluteY = 0;
    }

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
      this.ckPath,
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

    if (this.shapeType === ShapeType.Path && !this.pathIsSvgStringPath) {
      this.drawPathFromM2Path(canvas);
    }

    if (this.shapeType === ShapeType.Path && this.pathIsSvgStringPath) {
      this.drawPathFromSvgString(canvas);
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

  private drawPathFromM2Path(canvas: Canvas) {
    const drawScale = Globals.canvasScale / this.absoluteScale;
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

      const subpaths = (this.path as M2Path).subpaths;
      for (const subpath of subpaths) {
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

  private drawPathFromSvgString(canvas: Canvas): void {
    if (!this.ckPath) {
      return;
    }

    const x = this.calculateSvgPathX();
    const y = this.calculateSvgPathY();
    const drawScale = Globals.canvasScale / this.absoluteScale;
    const pathScale =
      drawScale * this.svgPathScaleForResizing * Globals.rootScale;

    if (this.pathNeedsTransform(pathScale, x, y)) {
      const matrix = this.calculateTransformationMatrix(pathScale, x, y);
      this.ckPath = this.ckPath.transform(matrix);
      this.saveSvgPathDrawParameters(pathScale, x, y);
    }

    if (this.fillColor) {
      const paint = this.getFillPaint();
      canvas.drawPath(this.ckPath, paint);
    }

    if (this.strokeColor && this.lineWidth) {
      const paint = this.getStrokePaint(this.lineWidth);
      canvas.drawPath(this.ckPath, paint);
    }
  }

  private calculateSvgPathY() {
    const drawScale = Globals.canvasScale / this.absoluteScale;
    return (
      (this.absolutePosition.y +
        (this.size.height -
          this.svgPathHeight *
            this.svgPathScaleForResizing *
            Globals.rootScale) /
          2 -
        this.anchorPoint.y * this.size.height) *
      drawScale
    );
  }

  private calculateSvgPathX() {
    const drawScale = Globals.canvasScale / this.absoluteScale;
    return (
      (this.absolutePosition.x +
        (this.size.width -
          this.svgPathWidth *
            this.svgPathScaleForResizing *
            Globals.rootScale) /
          2 -
        this.anchorPoint.x * this.size.width) *
      drawScale
    );
  }

  private saveSvgPathDrawParameters(pathScale: number, x: number, y: number) {
    this.svgPreviousAbsoluteScale = pathScale;
    this.svgPreviousAbsoluteX = x;
    this.svgPreviousAbsoluteY = y;
  }

  private calculateTransformationMatrix(
    pathScale: number,
    x: number,
    y: number
  ) {
    const dScale = pathScale / this.svgPreviousAbsoluteScale;
    const dX = x - this.svgPreviousAbsoluteX;
    const dY = y - this.svgPreviousAbsoluteY;
    return [dScale, 0, dX, 0, dScale, dY, 0, 0, 1];
  }

  private pathNeedsTransform(pathScale: number, x: number, y: number) {
    return (
      pathScale !== this.svgPreviousAbsoluteScale ||
      x !== this.svgPreviousAbsoluteX ||
      y !== this.svgPreviousAbsoluteY
    );
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
