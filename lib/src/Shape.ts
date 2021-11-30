import { Canvas, Paint } from "canvaskit-wasm";
import { Constants } from "./Constants";
import { IDrawable } from "./IDrawable";
import { Entity, handleInterfaceOptions } from "./Entity";
import { EntityType } from "./EntityType";
import { Point } from "./Point";
import { RgbaColor } from "./RgbaColor";
import { ShapeOptions } from "./ShapeOptions";
import { Game } from "./Game";
import { Rect } from "./Rect";
import { ShapeType } from "./ShapeType";
import { Globals } from "./Globals";

export class Shape extends Entity implements IDrawable {
  readonly type = EntityType.shape;
  isDrawable = true;
  isShape = true;
  // Drawable options
  anchorPoint = new Point(0.5, 0.5);
  zPosition = 0;
  // Shape options
  // TODO: fix the Size issue; should be readonly (calculated value) in all entities, but Rectangle
  shapeType = ShapeType.undefined;
  circleOfRadius?: number;
  rect?: Rect;
  cornerRadius = 0;
  private _fillColor = Constants.DEFAULT_SHAPE_FILL_COLOR; // public getter/setter is below
  private _strokeColor?: RgbaColor | undefined; // public getter/setter is below
  lineWidth?: number;

  private fillColorPaint?: Paint;
  private strokeColorPaint?: Paint;

  /**
   * Rectangular shape
   *
   * @param options
   */
  constructor(options: ShapeOptions = {}) {
    super(options);
    handleInterfaceOptions(this, options);
    if (options.circleOfRadius !== undefined) {
      this.circleOfRadius = options.circleOfRadius;
      this.shapeType = ShapeType.circle;
    }
    if (options.rect) {
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
        this.position = new Point(options.rect.x, options.rect.y);
      }
      this.shapeType = ShapeType.rectangle;
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
      const canvasKit = Globals.canvasKit;
      this.fillColorPaint = new canvasKit.Paint();
      this.fillColorPaint.setColor(
        canvasKit.Color(
          this.fillColor[0],
          this.fillColor[1],
          this.fillColor[2],
          this.fillColor[3]
        )
      );
      this.fillColorPaint.setStyle(canvasKit.PaintStyle.Fill);
      this.fillColorPaint.setAntiAlias(true);
    }

    if (this.strokeColor) {
      const canvasKit = Globals.canvasKit;
      this.strokeColorPaint = new canvasKit.Paint();
      this.strokeColorPaint.setColor(
        canvasKit.Color(
          this.strokeColor[0],
          this.strokeColor[1],
          this.strokeColor[2],
          this.strokeColor[3]
        )
      );
      this.strokeColorPaint.setStyle(canvasKit.PaintStyle.Stroke);
      this.strokeColorPaint.setAntiAlias(true);
    }
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

  update(): void {
    super.update();
  }

  draw(canvas: Canvas): void {
    canvas.save();
    const drawScale = Globals.canvasScale / this.absoluteScale;
    canvas.scale(1 / drawScale, 1 / drawScale);

    const canvasKit = Globals.canvasKit;

    if (
      this.shapeType === ShapeType.circle &&
      this.circleOfRadius !== undefined
    ) {
      const cx = this.absolutePosition.x * drawScale;
      const cy = this.absolutePosition.y * drawScale;
      const radius = this.circleOfRadius * this.absoluteScale * drawScale;

      if (this.fillColor && this.fillColorPaint) {
        canvas.drawCircle(cx, cy, radius, this.fillColorPaint);
      }

      if (this.strokeColor && this.strokeColorPaint && this.lineWidth) {
        // draw scale may change due to scaling, thus we must call setStrokeWidth() on every draw cycle
        this.strokeColorPaint.setStrokeWidth(this.lineWidth * drawScale);
        canvas.drawCircle(cx, cy, radius, this.strokeColorPaint);
      }
    }

    if (this.shapeType === ShapeType.rectangle) {
      const rr = canvasKit.RRectXY(
        canvasKit.LTRBRect(
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

      if (this.fillColor && this.fillColorPaint) {
        canvas.drawRRect(rr, this.fillColorPaint);
      }

      if (this.strokeColor && this.strokeColorPaint && this.lineWidth) {
        // draw scale may change due to scaling, thus we must call setStrokeWidth() on every draw cycle
        this.strokeColorPaint.setStrokeWidth(this.lineWidth * drawScale);
        canvas.drawRRect(rr, this.strokeColorPaint);
      }
    }

    canvas.restore();
    super.drawChildren(canvas);
  }
}
