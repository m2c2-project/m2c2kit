import "./Globals";
import { Canvas, Font, Paint } from "canvaskit-wasm";
import { Constants } from "./Constants";
import { IDrawable } from "./IDrawable";
import { Entity, handleInterfaceOptions } from "./Entity";
import { EntityType } from "./EntityType";
import { Point } from "./Point";
import { RgbaColor } from "./RgbaColor";
import { IText } from "./IText";
import { TextLineOptions } from "./TextLineOptions";

export class TextLine extends Entity implements IDrawable, IText {
  readonly type = EntityType.textline;
  isDrawable = true;
  isText = true;
  // Drawable options
  zPosition = 0;
  //   We don't know TextLine width in advance, so we must text align left,
  //   and so anchorPoint is (0, .5). (we do know height, which is fontSize)
  anchorPoint = new Point(0, 0.5);
  // Text options
  private _text = ""; // public getter/setter is below
  private _fontName: string | undefined; // public getter/setter is below
  private _fontColor = Constants.DEFAULT_FONT_COLOR; // public getter/setter is below
  private _fontSize = Constants.DEFAULT_FONT_SIZE; // public getter/setter is below

  private paint?: Paint;
  private font?: Font;

  /**
   * Single-line text rendered on the screen.
   *
   * @remarks TextLine has no paragraph formatting options; Label will be preferred in most use cases.
   *
   * @param options
   */
  constructor(options: TextLineOptions = {}) {
    super(options);
    handleInterfaceOptions(this, options);

    this.size.height = this.fontSize;
    // width is merely for bounds when checking onTap
    // textline will be drawn without regards to the setting for wiedth
    // TODO: explore using ShapedText in canvas.drawText(), because
    // ShapedText will report its own bounds?
    this.size.width = options.width ?? NaN;
  }

  get text(): string {
    return this._text;
  }
  set text(text: string) {
    this._text = text;
    this.needsInitialization = true;
  }

  get fontName(): string | undefined {
    return this._fontName;
  }
  set fontName(fontName: string | undefined) {
    this._fontName = fontName;
    this.needsInitialization = true;
  }

  get fontColor(): RgbaColor {
    return this._fontColor;
  }
  set fontColor(fontColor: RgbaColor) {
    this._fontColor = fontColor;
    this.needsInitialization = true;
  }

  get fontSize(): number {
    return this._fontSize;
  }
  set fontSize(fontSize: number) {
    this._fontSize = fontSize;
    this.needsInitialization = true;
  }

  update(): void {
    super.update();
  }

  override initialize(): void {
    this.paint = new Globals.canvasKit.Paint();
    this.paint.setColor(
      Globals.canvasKit.Color(
        this.fontColor[0],
        this.fontColor[1],
        this.fontColor[2],
        this.fontColor[3]
      )
    );
    this.paint.setStyle(Globals.canvasKit.PaintStyle.Fill);
    this.paint.setAntiAlias(true);

    if (this.fontName) {
      this.font = new Globals.canvasKit.Font(
        Globals.fontManager._getTypeface(this.fontName),
        this.fontSize * Globals.canvasScale
      );
    } else {
      this.font = new Globals.canvasKit.Font(
        null,
        this.fontSize * Globals.canvasScale
      );
    }
  }

  draw(canvas: Canvas): void {
    if (this.parent && this.text) {
      canvas.save();
      const drawScale = Globals.canvasScale / this.absoluteScale;
      canvas.scale(1 / drawScale, 1 / drawScale);

      const x = this.absolutePosition.x * drawScale;
      const y =
        (this.absolutePosition.y +
          this.size.height * this.anchorPoint.y * this.absoluteScale) *
        drawScale;

      if (this.paint === undefined || this.font === undefined) {
        throw new Error(
          `in TextLine entity ${this}, Paint or Font is undefined.`
        );
      }
      canvas.drawText(this.text, x, y, this.paint, this.font);
      canvas.restore();
    }

    super.drawChildren(canvas);
  }
}
