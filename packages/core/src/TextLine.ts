import "./Globals";
import { Canvas, Font, Paint, Typeface } from "canvaskit-wasm";
import { Constants } from "./Constants";
import { IDrawable } from "./IDrawable";
import { M2Node, handleInterfaceOptions } from "./M2Node";
import { M2NodeType } from "./M2NodeType";
import { RgbaColor } from "./RgbaColor";
import { IText } from "./IText";
import { TextLineOptions } from "./TextLineOptions";
import { Scene } from "./Scene";
import { CanvasKitHelpers } from "./CanvasKitHelpers";
import { M2c2KitHelpers } from "./M2c2KitHelpers";
import { M2FontStatus } from "./M2Font";
import { FontManager } from "./FontManager";

export class TextLine
  extends M2Node
  implements IDrawable, IText, TextLineOptions
{
  readonly type = M2NodeType.TextLine;
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

  override update(): void {
    super.update();
  }

  override initialize(): void {
    const fontManager = this.game.fontManager;
    const requiredFont = this.getRequiredTextLineFont(fontManager);
    if (requiredFont.status === M2FontStatus.Deferred) {
      fontManager.prepareDeferredFont(requiredFont);
      return;
    }
    if (requiredFont.status === M2FontStatus.Loading) {
      return;
    }

    if (this.paint) {
      this.paint.delete();
    }
    this.paint = new this.canvasKit.Paint();
    this.paint.setColor(
      this.canvasKit.Color(
        this.fontColor[0],
        this.fontColor[1],
        this.fontColor[2],
        this.fontColor[3],
      ),
    );
    this.paint.setStyle(this.canvasKit.PaintStyle.Fill);
    this.paint.setAntiAlias(true);

    const i18n = (this.parentSceneAsNode as Scene).game.i18n;
    if (i18n && i18n.options.missingTranslationFontColor) {
      this.missingTranslationPaint = new this.canvasKit.Paint();
      this.missingTranslationPaint.setColor(
        this.canvasKit.Color(
          i18n.options.missingTranslationFontColor[0],
          i18n.options.missingTranslationFontColor[1],
          i18n.options.missingTranslationFontColor[2],
          i18n.options.missingTranslationFontColor[3],
        ),
      );
      this.paint.setStyle(this.canvasKit.PaintStyle.Fill);
      this.paint.setAntiAlias(true);
    }

    if (this.fontName) {
      this.typeface = fontManager.getTypeface(this.fontName);
    } else {
      const fontNames = fontManager.getFontNames();
      if (fontNames.length > 0) {
        this.typeface = fontManager.getTypeface(fontNames[0]);
      }
    }
    if (this.font) {
      this.font.delete();
    }
    this.font = new this.canvasKit.Font(
      this.typeface,
      this.fontSize * Globals.canvasScale,
    );
    this.needsInitialization = false;
  }

  /**
   * Determines the M2Font object that needs to be ready in order to draw
   * the TextLine.
   *
   * @remarks It needs a FontManager because it may need to look up the
   * default font.
   *
   * @param fontManager - {@link FontManager}
   * @returns a M2Font object that is required for the TextLine
   */
  private getRequiredTextLineFont(fontManager: FontManager) {
    if (this.fontName === undefined) {
      return fontManager.getDefaultFont();
    }
    return fontManager.getFont(this.fontName);
  }

  dispose(): void {
    CanvasKitHelpers.Dispose([this.font, this.typeface, this.paint]);
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
  override duplicate(newName?: string): TextLine {
    const dest = new TextLine({
      ...this.getNodeOptions(),
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
    if (this.parent && this.text && !this.needsInitialization) {
      canvas.save();
      const drawScale = Globals.canvasScale / this.absoluteScale;
      canvas.scale(1 / drawScale, 1 / drawScale);
      M2c2KitHelpers.rotateCanvasForDrawableNode(canvas, this);

      const x = this.absolutePosition.x * drawScale;
      const y =
        (this.absolutePosition.y +
          this.size.height * this.anchorPoint.y * this.absoluteScale) *
        drawScale;

      let textForDraw: string;
      let paintForDraw = this.paint;
      const i18n = (this.parentSceneAsNode as Scene).game.i18n;
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
            `warning: empty translated text in TextLine "${this.name}"`,
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
          `in TextLine node ${this}, Paint or Font is undefined.`,
        );
      }

      if (this.absoluteAlphaChange !== 0) {
        paintForDraw.setAlphaf(this.absoluteAlpha);
      }

      canvas.drawText(textForDraw, x, y, paintForDraw, this.font);
      canvas.restore();
    }

    super.drawChildren(canvas);
  }

  warmup(canvas: Canvas): void {
    /**
     * If this TextLine uses a deferred font, then we cannot warm it up.
     */
    const requiredFont = this.getRequiredTextLineFont(this.game.fontManager);
    if (requiredFont.status === M2FontStatus.Deferred) {
      return;
    }
    this.initialize();
    if (this.paint === undefined || this.font === undefined) {
      throw new Error(
        `warmup TextLine node ${this.toString()}: Paint or Font is undefined.`,
      );
    }
    canvas.drawText(this.text, 0, 0, this.paint, this.font);
  }
}
