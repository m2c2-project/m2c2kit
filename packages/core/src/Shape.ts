import { Canvas, Paint, Path } from "canvaskit-wasm";
import { Constants } from "./Constants";
import { IDrawable } from "./IDrawable";
import { M2Node, handleInterfaceOptions } from "./M2Node";
import { M2NodeType } from "./M2NodeType";
import { RgbaColor } from "./RgbaColor";
import { ShapeOptions } from "./ShapeOptions";
import { M2Path } from "./M2Path";
import { M2ColorfulPath } from "./M2ColorfulPath";
import { SvgStringPath } from "./SvgStringPath";
import { RectOptions } from "./RectOptions";
import { ShapeType } from "./ShapeType";
import { CanvasKitHelpers } from "./CanvasKitHelpers";
import { M2c2KitHelpers } from "./M2c2KitHelpers";
import { Equal } from "./Equal";
import { Size } from "./Size";
import { Point } from "./Point";

export class Shape extends M2Node implements IDrawable, ShapeOptions {
  readonly type = M2NodeType.Shape;
  isDrawable = true;
  isShape = true;
  // Drawable options
  private _anchorPoint: Point = { x: 0.5, y: 0.5 };
  private _zPosition = 0;
  // Shape options
  // TODO: fix the Size issue; should be readonly (calculated value) in all nodes, but Rectangle
  shapeType = ShapeType.Undefined;
  private _circleOfRadius?: number;
  private _rect?: RectOptions;
  private _path?: M2Path | M2ColorfulPath | SvgStringPath;
  ckPath: Path | null = null;
  ckPathWidth?: number;
  ckPathHeight?: number;
  private _cornerRadius = 0;
  private _fillColor = Constants.DEFAULT_SHAPE_FILL_COLOR;
  private _strokeColor?: RgbaColor | undefined;
  private _lineWidth?: number;
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
  private svgPreviousAbsoluteX = NaN;
  private svgPreviousAbsoluteY = NaN;
  private svgFirstPathDraw = true;

  private colorfulPathPaints = new Map<string, Paint>();
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
      this.shapeType = ShapeType.Path;

      if (this.shapeIsM2Path()) {
        if (options.size !== undefined) {
          this.size = options.size;
        }
      }

      if (this.shapeIsSvgStringPath()) {
        if (options.size !== undefined) {
          throw new Error(
            "Size cannot be specified when path is SVG string path",
          );
        }
      }

      this.svgPathRequestedWidth = (options.path as SvgStringPath).width;
      this.svgPathRequestedHeight = (options.path as SvgStringPath).height;

      if (
        this.svgPathRequestedHeight !== undefined &&
        this.svgPathRequestedWidth !== undefined
      ) {
        throw new Error(
          "Cannot specify both width and height for SVG string path.",
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
          "Shape must specify only one of: path, circleOfRadius, or rect",
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
          "Shape must specify only one of: path, circleOfRadius, or rect",
        );
      }
      /**
       * Layout system needs the circle's size to be set.
       */
      this.size.width = this.circleOfRadius * 2;
      this.size.height = this.circleOfRadius * 2;
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

    if (options.cornerRadius !== undefined) {
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
    if (options.strokeColor && !options.lineWidth) {
      console.warn(
        `warning: for node ${this}, strokeColor = ${options.strokeColor} but lineWidth is non-zero. In normal usage, both would be set or both would be undefined.`,
      );
    }
    if (options.strokeColor === undefined && options.lineWidth) {
      console.warn(
        `warning: for node ${this}, lineWidth = ${options.lineWidth} but strokeColor is undefined. In normal usage, both would be set or both would be undefined.`,
      );
    }

    this.saveNodeNewEvent();
  }

  override get completeNodeOptions() {
    let size: Size | undefined = undefined;
    if (this.shapeIsM2Path()) {
      size = this.size;
    }
    return {
      ...this.options,
      ...this.getNodeOptions(),
      ...this.getDrawableOptions(),
      circleOfRadius: this.circleOfRadius,
      rect: this.rect,
      cornerRadius: this.cornerRadius,
      fillColor: this.fillColor,
      strokeColor: this.strokeColor,
      lineWidth: this.lineWidth,
      path: this.path,
      size: size,
      isAntialiased: this.isAntialiased,
    };
  }

  override initialize(): void {
    if (this.shapeType === ShapeType.Path) {
      if (this.shapeIsSvgStringPath()) {
        const pathString =
          (this.path as SvgStringPath).pathString ??
          (this.path as SvgStringPath).svgPathString;
        if (!pathString) {
          throw new Error("SVG Path string is null/undefined");
        }
        if ((this.path as SvgStringPath).svgPathString !== undefined) {
          console.warn(
            `warning: svgPathString is deprecated. Use pathString instead.`,
          );
        }

        this.ckPath = this.canvasKit.Path.MakeFromSVGString(pathString);
        if (!this.ckPath) {
          throw new Error("could not make CanvasKit Path from SVG string");
        }

        const bounds = this.ckPath.getBounds();
        this.svgPathWidth =
          bounds[2] + (bounds[0] < 0 ? Math.abs(bounds[0]) : 0);
        this.svgPathHeight =
          bounds[3] + (bounds[1] < 0 ? Math.abs(bounds[1]) : 0);

        if (this.svgPathRequestedHeight !== undefined) {
          this.svgPathScaleForResizing =
            this.svgPathRequestedHeight / this.svgPathHeight;
        } else if (this.svgPathRequestedWidth !== undefined) {
          this.svgPathScaleForResizing =
            this.svgPathRequestedWidth / this.svgPathWidth;
        }

        this.size.width = this.svgPathWidth * this.svgPathScaleForResizing;
        this.size.height = this.svgPathHeight * this.svgPathScaleForResizing;

        this.svgPreviousAbsoluteX = 0;
        this.svgPreviousAbsoluteY = 0;
      }
    }

    if (this.shapeIsM2Path()) {
      if (
        this.size.width === 0 ||
        this.size.height === 0 ||
        this.size.width === undefined ||
        this.size.height === undefined
      ) {
        throw new Error(
          "Size of shape must have non-zero height and width when path is M2Path",
        );
      }
    }

    if (this.fillColor) {
      this.fillColorPaintAntialiased = CanvasKitHelpers.makePaint(
        this.canvasKit,
        this.fillColor,
        this.canvasKit.PaintStyle.Fill,
        true,
      );
      this.fillColorPaintNotAntialiased = CanvasKitHelpers.makePaint(
        this.canvasKit,
        this.fillColor,
        this.canvasKit.PaintStyle.Fill,
        false,
      );
    }

    if (this.strokeColor) {
      this.strokeColorPaintAntialiased = CanvasKitHelpers.makePaint(
        this.canvasKit,
        this.strokeColor,
        this.canvasKit.PaintStyle.Stroke,
        true,
      );
      this.strokeColorPaintNotAntialiased = CanvasKitHelpers.makePaint(
        this.canvasKit,
        this.strokeColor,
        this.canvasKit.PaintStyle.Stroke,
        false,
      );
    }
    this.svgFirstPathDraw = true;
    this.needsInitialization = false;
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

  dispose(): void {
    CanvasKitHelpers.Dispose([
      // use backing fields, since paints may be undefined
      this._strokeColorPaintAntialiased,
      this._strokeColorPaintNotAntialiased,
      this._fillColorPaintAntialiased,
      this._fillColorPaintNotAntialiased,
      this.ckPath,
      ...Array.from(this.colorfulPathPaints.values()),
    ]);
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
  override duplicate(newName?: string): Shape {
    const dest = new Shape({
      ...this.getNodeOptions(),
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

  override update(): void {
    super.update();
  }

  draw(canvas: Canvas): void {
    canvas.save();
    const drawScale = m2c2Globals.canvasScale / this.absoluteScale;
    canvas.scale(1 / drawScale, 1 / drawScale);
    M2c2KitHelpers.rotateCanvasForDrawableNode(canvas, this);

    /**
     * Not all paints may be used, and thus some paints may not be initialized,
     * so we reference the backing field.
     */
    if (this.absoluteAlphaChange !== 0) {
      this.applyAlphaToPaints(this.absoluteAlpha, [
        this._fillColorPaintAntialiased,
        this._fillColorPaintNotAntialiased,
        this._strokeColorPaintAntialiased,
        this._strokeColorPaintNotAntialiased,
      ]);
    }

    if (this.shapeIsM2Path()) {
      this.drawPathFromM2Path(canvas);
    }

    if (this.shapeIsSvgStringPath()) {
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

  private applyAlphaToPaints(
    alpha: number,
    paints: (Paint | undefined)[],
  ): void {
    paints.forEach((paint) => {
      if (paint) {
        paint.setAlphaf(alpha);
      }
    });
  }

  private drawPathFromM2Path(canvas: Canvas) {
    const drawScale = m2c2Globals.canvasScale / this.absoluteScale;
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

    if (this.pathIsM2ColorfulPath(this.path)) {
      const linePresentations = this.path.linePresentations;
      let lp = 0;
      const subpaths = this.path.subpaths;

      let paint: Paint | undefined;
      for (let s = 0; s < subpaths.length; s++) {
        const subpath = subpaths[s];
        const points = subpath.flat();
        for (let i = 0; i < points.length - 1; i++) {
          if (
            linePresentations[lp].subpathIndex === s &&
            linePresentations[lp].pointIndex === i
          ) {
            /**
             * A M2ColorfulPath may have many different colors and line widths.
             * We cache paints for each color and line width combination.
             * The cache key is a string of the form "r,g,b,a,lineWidth".
             * These paints are later deleted in dispose().
             */
            const strokeColor = linePresentations[lp].strokeColor;
            const lineWidth = linePresentations[lp].lineWidth;
            const paintKey = [...strokeColor, lineWidth].toString();
            paint = this.colorfulPathPaints.get(paintKey);
            if (paint === undefined) {
              paint = CanvasKitHelpers.makePaint(
                this.canvasKit,
                strokeColor,
                this.canvasKit.PaintStyle.Stroke,
                true,
              );
              paint.setStrokeWidth(lineWidth * m2c2Globals.canvasScale);
              this.colorfulPathPaints.set(paintKey, paint);
            }
            if (lp < linePresentations.length - 1) {
              lp++;
            }
          }
          if (paint === undefined) {
            throw new Error("paint is undefined");
          }

          canvas.drawLine(
            pathOriginX + points[i].x * m2c2Globals.canvasScale,
            pathOriginY + points[i].y * m2c2Globals.canvasScale,
            pathOriginX + points[i + 1].x * m2c2Globals.canvasScale,
            pathOriginY + points[i + 1].y * m2c2Globals.canvasScale,
            paint,
          );
        }
      }
      return;
    }

    if (
      this.strokeColor &&
      this.strokeColorPaintAntialiased &&
      this.lineWidth
    ) {
      // draw scale may change due to scaling, thus we must call setStrokeWidth() on every draw cycle
      this.strokeColorPaintAntialiased.setStrokeWidth(
        this.lineWidth * m2c2Globals.canvasScale,
      );

      const subpaths = (this.path as M2Path).subpaths;
      for (const subpath of subpaths) {
        const points = subpath.flat();
        for (let i = 0; i < points.length - 1; i++) {
          canvas.drawLine(
            pathOriginX + points[i].x * m2c2Globals.canvasScale,
            pathOriginY + points[i].y * m2c2Globals.canvasScale,
            pathOriginX + points[i + 1].x * m2c2Globals.canvasScale,
            pathOriginY + points[i + 1].y * m2c2Globals.canvasScale,
            this.strokeColorPaintAntialiased,
          );
        }
      }
    }
  }

  private drawPathFromSvgString(canvas: Canvas): void {
    if (!this.ckPath) {
      return;
    }

    /**
     * A canvaskit path made from an SVG string is initialized to start at
     * position (0, 0) and is unscaled.
     * We calculate what should be the position of the path, taking into
     * consideration scaling, anchor point, and device pixel ratio.
     */
    const x = this.calculateSvgPathX();
    const y = this.calculateSvgPathY();

    /**
     * The path will need a transformation if any of the following is true:
     *   - this is the first time the path is drawn
     *   - the path has moved since the last draw
     */
    if (this.pathNeedsTransform(x, y)) {
      const drawScale = m2c2Globals.canvasScale / this.absoluteScale;
      const pathScale =
        drawScale * this.svgPathScaleForResizing * m2c2Globals.rootScale;
      const matrix = this.calculateTransformationMatrix(pathScale, x, y);
      this.ckPath = this.ckPath.transform(matrix);
      this.saveSvgPathAbsolutePosition(x, y);
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
    const drawScale = m2c2Globals.canvasScale / this.absoluteScale;
    return (
      (this.absolutePosition.y - (this.size.height * this.absoluteScale) / 2) *
      drawScale
    );
  }

  private calculateSvgPathX() {
    const drawScale = m2c2Globals.canvasScale / this.absoluteScale;
    return (
      (this.absolutePosition.x - (this.size.width * this.absoluteScale) / 2) *
      drawScale
    );
  }

  private saveSvgPathAbsolutePosition(x: number, y: number) {
    this.svgPreviousAbsoluteX = x;
    this.svgPreviousAbsoluteY = y;
  }

  private calculateTransformationMatrix(
    pathScale: number,
    x: number,
    y: number,
  ) {
    let dScale: number;
    if (this.svgFirstPathDraw) {
      /**
       * The first time the path is drawn, we need to scale it to the correct
       * size to account for device pixel ratio and other "global" scaling
       * factors.
       */
      dScale = pathScale;
      this.svgFirstPathDraw = false;
    } else {
      /**
       * Scaling related to the **scale action** is handled in
       * the draw() loop with the canvas.scale() method. Thus, for
       * transformations after the first draw, the dScale is always 1
       * (no scaling applied).
       */
      dScale = 1;
    }

    const dX = x - this.svgPreviousAbsoluteX;
    const dY = y - this.svgPreviousAbsoluteY;
    return [dScale, 0, dX, 0, dScale, dY, 0, 0, 1];
  }

  private pathNeedsTransform(x: number, y: number) {
    return (
      this.svgFirstPathDraw === true ||
      x !== this.svgPreviousAbsoluteX ||
      y !== this.svgPreviousAbsoluteY
    );
  }

  private shapeIsSvgStringPath() {
    return (
      (this.path as SvgStringPath)?.pathString !== undefined ||
      (this.path as SvgStringPath)?.svgPathString !== undefined
    );
  }
  private shapeIsM2Path() {
    return (this.path as M2Path)?.subpaths !== undefined;
  }

  private pathIsM2ColorfulPath(
    path: M2Path | M2ColorfulPath | SvgStringPath | undefined,
  ): path is M2ColorfulPath {
    return path !== undefined && "linePresentations" in path;
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
    const drawScale = m2c2Globals.canvasScale / this.absoluteScale;
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
    const drawScale = m2c2Globals.canvasScale / this.absoluteScale;
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
          drawScale,
      ),
      this.cornerRadius * drawScale,
      this.cornerRadius * drawScale,
    );
  }

  private getFillPaint(): Paint {
    /**
     * If the shape is involved in a running animation action (e.g., move,
     * scale), then do not use an antialiased paint while the action is
     * running, because it can cause visible jank. I found that a new shader
     * program might be created for antialiased circles as they are animated.
     * (This was not the case for rectangles, though. Skia uses different
     * anti-aliasing techniques, depending on the shape primitive:
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
    const drawScale = m2c2Globals.canvasScale / this.absoluteScale;
    paint.setStrokeWidth(lineWidth * drawScale);
    return paint;
  }

  warmup(canvas: Canvas): void {
    this.initialize();

    canvas.save();
    const drawScale = m2c2Globals.canvasScale / this.absoluteScale;
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
    const drawScale = m2c2Globals.canvasScale / this.absoluteScale;
    this.strokeColorPaintAntialiased.setStrokeWidth(this.lineWidth * drawScale);
    this.drawCircleWithCanvasKit(canvas, this.strokeColorPaintAntialiased);
    this.strokeColorPaintNotAntialiased.setStrokeWidth(
      this.lineWidth * drawScale,
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
    const drawScale = m2c2Globals.canvasScale / this.absoluteScale;
    this.strokeColorPaintAntialiased.setStrokeWidth(this.lineWidth * drawScale);
    this.drawRectangleWithCanvasKit(canvas, this.strokeColorPaintAntialiased);
    this.strokeColorPaintNotAntialiased.setStrokeWidth(
      this.lineWidth * drawScale,
    );
    this.drawRectangleWithCanvasKit(
      canvas,
      this.strokeColorPaintNotAntialiased,
    );
  }

  get circleOfRadius(): number | undefined {
    return this._circleOfRadius;
  }
  set circleOfRadius(circleOfRadius: number | undefined) {
    if (Equal.value(circleOfRadius, this._circleOfRadius)) {
      return;
    }
    this._circleOfRadius = circleOfRadius;
    this.needsInitialization = true;
    this.savePropertyChangeEvent("circleOfRadius", circleOfRadius);
  }

  get rect(): RectOptions | undefined {
    return this._rect;
  }
  set rect(rect: RectOptions | undefined) {
    if (Equal.value(rect, this._rect)) {
      return;
    }
    this._rect = rect;
    this.needsInitialization = true;
    this.savePropertyChangeEvent("rect", rect);
  }

  get cornerRadius(): number {
    return this._cornerRadius;
  }
  set cornerRadius(cornerRadius: number | undefined) {
    if (Equal.value(cornerRadius, this._cornerRadius)) {
      return;
    }
    this._cornerRadius = cornerRadius ?? 0;
    this.needsInitialization = true;
    this.savePropertyChangeEvent("cornerRadius", cornerRadius ?? 0);
  }

  get lineWidth(): number | undefined {
    return this._lineWidth;
  }
  set lineWidth(lineWidth: number | undefined) {
    if (Equal.value(lineWidth, this._lineWidth)) {
      return;
    }
    this._lineWidth = lineWidth;
    this.needsInitialization = true;
    this.savePropertyChangeEvent("lineWidth", lineWidth);
  }

  get path(): M2Path | M2ColorfulPath | SvgStringPath | undefined {
    return this._path;
  }
  set path(path: M2Path | M2ColorfulPath | SvgStringPath | undefined) {
    if (Equal.value(path, this._path)) {
      return;
    }
    this._path = path;
    this.needsInitialization = true;
    this.savePropertyChangeEvent("path", path);
  }

  get fillColor(): RgbaColor {
    return this._fillColor;
  }
  set fillColor(fillColor: RgbaColor) {
    if (Equal.value(fillColor, this._fillColor)) {
      return;
    }
    this._fillColor = fillColor;
    this.needsInitialization = true;
    this.savePropertyChangeEvent("fillColor", fillColor);
  }

  get strokeColor(): RgbaColor | undefined {
    return this._strokeColor;
  }
  set strokeColor(strokeColor: RgbaColor | undefined) {
    if (Equal.value(strokeColor, this._strokeColor)) {
      return;
    }
    this._strokeColor = strokeColor;
    this.needsInitialization = true;
    this.savePropertyChangeEvent("strokeColor", strokeColor);
  }

  get isAntialiased(): boolean {
    return this._isAntialiased;
  }
  set isAntialiased(isAntialiased: boolean) {
    if (Equal.value(isAntialiased, this._isAntialiased)) {
      return;
    }
    this._isAntialiased = isAntialiased;
    this.needsInitialization = true;
    this.savePropertyChangeEvent("isAntialiased", isAntialiased);
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
