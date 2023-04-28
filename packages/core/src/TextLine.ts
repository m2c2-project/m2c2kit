import "./Globals";
import { Canvas, Font, Paint, Typeface } from "canvaskit-wasm";
import { Constants } from "./Constants";
import { IDrawable } from "./IDrawable";
import { Entity, handleInterfaceOptions } from "./Entity";
import { EntityType } from "./EntityType";
import { RgbaColor } from "./RgbaColor";
import { IText } from "./IText";
import { TextLineOptions } from "./TextLineOptions";
import { Scene } from "./Scene";
import { CanvasKitHelpers } from "./CanvasKitHelpers";

export class TextLine
  extends Entity
  implements IDrawable, IText, TextLineOptions
{
  readonly type = EntityType.TextLine;
  isDrawable = true;
  isText = true;
  // Drawable options
  zPosition = 0;
  //   We don't know TextLine width in advance, so we must text align left,
  //   and so anchorPoint is (0, .5). (we do know height, which is fontSize)
  anchorPoint = { x: 0, y: 0.5 };
  // Text options
  private _text = ""; // public getter/setter is below
  private _fontName: string | undefined; // public getter/setter is below
  private _fontColor = Constants.DEFAULT_FONT_COLOR; // public getter/setter is below
  private _fontSize = Constants.DEFAULT_FONT_SIZE; // public getter/setter is below

  private paint?: Paint;
  private font?: Font;
  private typeface: Typeface | null = null;

  private _translatedText = "";
  private missingTranslationPaint?: Paint;

  /**
   * Single-line text rendered on the screen.
   *
   * @remarks TextLine has no paragraph formatting options; Label will be preferred in most use cases.
   *
   * @param options - {@link TextLineOptions}
   */
  constructor(options: TextLineOptions = {}) {
    super(options);
    handleInterfaceOptions(this, options);

    this.size.height = this.fontSize;
    // width is merely for bounds when checking onTap
    // TextLine will be drawn without regards to the setting for width
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

  get translatedText(): string {
    return this._translatedText;
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
    this.paint = new this.canvasKit.Paint();
    this.paint.setColor(
      this.canvasKit.Color(
        this.fontColor[0],
        this.fontColor[1],
        this.fontColor[2],
        this.fontColor[3]
      )
    );
    this.paint.setStyle(this.canvasKit.PaintStyle.Fill);
    this.paint.setAntiAlias(true);

    const i18n = (this.parentSceneAsEntity as Scene).game.i18n;
    if (i18n && i18n.options.missingTranslationFontColor) {
      this.missingTranslationPaint = new this.canvasKit.Paint();
      this.missingTranslationPaint.setColor(
        this.canvasKit.Color(
          i18n.options.missingTranslationFontColor[0],
          i18n.options.missingTranslationFontColor[1],
          i18n.options.missingTranslationFontColor[2],
          i18n.options.missingTranslationFontColor[3]
        )
      );
      this.paint.setStyle(this.canvasKit.PaintStyle.Fill);
      this.paint.setAntiAlias(true);
    }

    const session = (this.parentSceneAsEntity as unknown as Scene).game.session;
    if (!session) {
      throw new Error("session is undefined");
    }
    const fontManager = session.fontManager;

    const gameUuid = (this.parentSceneAsEntity as unknown as Scene).game.uuid;
    if (this.fontName) {
      this.typeface = fontManager.getTypeface(gameUuid, this.fontName);
    } else {
      const fontNames = fontManager.getFontNames(gameUuid);
      if (fontNames.length > 0) {
        this.typeface = fontManager.getTypeface(gameUuid, fontNames[0]);
      }
    }
    this.font = new this.canvasKit.Font(
      this.typeface,
      this.fontSize * Globals.canvasScale
    );
    this.needsInitialization = false;
  }

  dispose(): void {
    CanvasKitHelpers.Dispose([this.font, this.typeface, this.paint]);
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
  override duplicate(newName?: string): TextLine {
    const dest = new TextLine({
      ...this.getEntityOptions(),
      ...this.getDrawableOptions(),
      ...this.getTextOptions(),
      width: this.size.width,
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

      let textForDraw: string;
      let paintForDraw = this.paint;
      const i18n = (this.parentSceneAsEntity as Scene).game.i18n;
      if (i18n) {
        let translated = i18n.t(this.text);
        if (translated === undefined) {
          const fallbackTranslated = i18n.t(this.text, true);
          if (fallbackTranslated === undefined) {
            translated = this.text;
          } else {
            translated = fallbackTranslated;
          }
          if (this.missingTranslationPaint) {
            paintForDraw = this.missingTranslationPaint;
          }
        }
        this._translatedText = translated;
        textForDraw = this._translatedText;
        if (this._translatedText === "") {
          console.warn(
            `warning: empty translated text in TextLine "${this.name}"`
          );
        }
      } else {
        textForDraw = this.text;
        this._translatedText = "";
        if (this.text === "") {
          console.warn(`warning: empty text in TextLine "${this.name}"`);
        }
      }

      if (paintForDraw === undefined || this.font === undefined) {
        throw new Error(
          `in TextLine entity ${this}, Paint or Font is undefined.`
        );
      }

      canvas.drawText(textForDraw, x, y, paintForDraw, this.font);
      canvas.restore();
    }

    super.drawChildren(canvas);
  }

  warmup(canvas: Canvas): void {
    this.initialize();
    if (this.paint === undefined || this.font === undefined) {
      throw new Error(
        `warmup TextLine entity ${this.toString()}: Paint or Font is undefined.`
      );
    }
    canvas.drawText(this.text, 0, 0, this.paint, this.font);
  }
}
