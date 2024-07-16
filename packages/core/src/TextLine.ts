import { Canvas, Font, Paint, Typeface } from "canvaskit-wasm";
import { Constants } from "./Constants";
import { IDrawable } from "./IDrawable";
import { M2Node, handleInterfaceOptions } from "./M2Node";
import { M2NodeType } from "./M2NodeType";
import { RgbaColor } from "./RgbaColor";
import { IText } from "./IText";
import { TextLineOptions } from "./TextLineOptions";
import { CanvasKitHelpers } from "./CanvasKitHelpers";
import { M2c2KitHelpers } from "./M2c2KitHelpers";
import { M2Font, M2FontStatus } from "./M2Font";
import { FontManager } from "./FontManager";
import { I18n } from "./I18n";
import { StringInterpolationMap } from "./StringInterpolationMap";
import { Equal } from "./Equal";
import { Point } from "./Point";

export class TextLine
  extends M2Node
  implements IDrawable, IText, TextLineOptions
{
  readonly type = M2NodeType.TextLine;
  isDrawable = true;
  isText = true;
  // Drawable options
  private _zPosition = 0;
  //   We don't know TextLine width in advance, so we must text align left,
  //   and so anchorPoint is (0, .5). (we do know height, which is fontSize)
  private _anchorPoint: Point = { x: 0, y: 0.5 };
  // Text options
  private _text = ""; // public getter/setter is below
  private _fontName: string | undefined; // public getter/setter is below
  private _fontColor = Constants.DEFAULT_FONT_COLOR; // public getter/setter is below
  private _fontSize = Constants.DEFAULT_FONT_SIZE; // public getter/setter is below
  private _interpolation: StringInterpolationMap = {};
  private _localize = true;

  private paint?: Paint;
  private font?: Font;
  private typeface: Typeface | null = null;
  private tryMissingTranslationPaint = false;
  private textForDraw = "";
  private fontForDraw?: M2Font;
  private localizedFontName: string | undefined;
  private localizedFontNames: Array<string> = [];

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

    this.saveNodeNewEvent();
  }

  override get completeNodeOptions() {
    return {
      ...this.options,
      ...this.getNodeOptions(),
      ...this.getDrawableOptions(),
      ...this.getTextOptions(),
      width: this.size.width,
    };
  }

  override initialize(): void {
    const i18n = this.game.i18n;
    this.tryMissingTranslationPaint = false;
    if (i18n && this.localize !== false) {
      const textLocalization = i18n.getTextLocalization(
        this.text,
        this.interpolation,
      );
      this.textForDraw = textLocalization.text;
      this.localizedFontName = textLocalization.fontName;
      this.localizedFontNames = textLocalization.fontNames ?? [];
      if (textLocalization.isFallbackOrMissingTranslation) {
        this.tryMissingTranslationPaint = true;
      }
    } else {
      this.textForDraw = this.text;
    }

    const fontManager = this.game.fontManager;
    this.fontForDraw = this.getRequiredTextLineFont(fontManager);
    if (this.fontForDraw.status === M2FontStatus.Deferred) {
      fontManager.prepareDeferredFont(this.fontForDraw);
      return;
    }
    if (this.fontForDraw.status === M2FontStatus.Loading) {
      return;
    }

    this.createFontPaint(i18n);
    this.createFont(fontManager);
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
    if (this.game.i18n) {
      if (
        (this.localizedFontName !== undefined &&
          this.localizedFontNames.length !== 0) ||
        this.localizedFontNames.length > 1
      ) {
        throw new Error(
          `TextLine supports only one font, but multiple fonts are specified in translation.`,
        );
      }

      if (this.localizedFontName !== undefined) {
        return fontManager.fonts[this.localizedFontName];
      } else if (this.localizedFontNames.length == 1) {
        return fontManager.fonts[this.localizedFontNames[0]];
      }
    }

    if (this.fontName === undefined) {
      return fontManager.getDefaultFont();
    }
    return fontManager.getFont(this.fontName);
  }

  private createFontPaint(i18n: I18n | undefined) {
    if (this.paint) {
      this.paint.delete();
    }
    this.paint = new this.canvasKit.Paint();
    if (this.tryMissingTranslationPaint && this.localize !== false) {
      if (i18n?.missingLocalizationColor) {
        this.paint.setColor(
          this.canvasKit.Color(
            i18n.missingLocalizationColor[0],
            i18n.missingLocalizationColor[1],
            i18n.missingLocalizationColor[2],
            i18n.missingLocalizationColor[3],
          ),
        );
      }
    } else {
      this.paint.setColor(
        this.canvasKit.Color(
          this.fontColor[0],
          this.fontColor[1],
          this.fontColor[2],
          this.fontColor[3],
        ),
      );
    }
    this.paint.setStyle(this.canvasKit.PaintStyle.Fill);
    this.paint.setAntiAlias(true);
  }

  private createFont(fontManager: FontManager) {
    if (this.fontForDraw) {
      this.typeface = fontManager.getTypeface(this.fontForDraw.fontName);
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
      this.fontSize * m2c2Globals.canvasScale,
    );
  }

  get text(): string {
    return this._text;
  }
  set text(text: string) {
    if (Equal.value(this._text, text)) {
      return;
    }
    this._text = text;
    this.needsInitialization = true;
    this.savePropertyChangeEvent("text", text);
  }

  get fontName(): string | undefined {
    return this._fontName;
  }
  set fontName(fontName: string | undefined) {
    if (Equal.value(this._fontName, fontName)) {
      return;
    }
    this._fontName = fontName;
    this.needsInitialization = true;
    this.savePropertyChangeEvent("fontName", fontName);
  }

  get fontColor(): RgbaColor {
    return this._fontColor;
  }
  set fontColor(fontColor: RgbaColor) {
    if (Equal.value(this._fontColor, fontColor)) {
      return;
    }
    this._fontColor = fontColor;
    this.needsInitialization = true;
    this.savePropertyChangeEvent("fontColor", fontColor);
  }

  get fontSize(): number {
    return this._fontSize;
  }
  set fontSize(fontSize: number) {
    if (Equal.value(this._fontSize, fontSize)) {
      return;
    }
    this._fontSize = fontSize;
    this.needsInitialization = true;
    this.savePropertyChangeEvent("fontSize", fontSize);
  }

  get interpolation(): StringInterpolationMap {
    return this._interpolation;
  }
  set interpolation(interpolation: StringInterpolationMap) {
    if (Equal.value(this._interpolation, interpolation)) {
      return;
    }
    /**
     * If a new interpolation object is set, then we must re-initialize the
     * label. But, we will not know if a property of the interpolation object
     * has changed. Therefore, freeze the interpolation object to prevent it
     * from being modified (attempting to modify it will throw an error).
     * If a user wants to change a property of the interpolation object, they
     * must instead create a new interpolation object and set it.
     */
    this._interpolation = interpolation;
    Object.freeze(this._interpolation);
    this.needsInitialization = true;
    this.savePropertyChangeEvent("interpolation", interpolation);
  }

  get localize(): boolean {
    return this._localize;
  }
  set localize(localize: boolean) {
    if (Equal.value(this._localize, localize)) {
      return;
    }
    this._localize = localize;
    this.needsInitialization = true;
    this.savePropertyChangeEvent("localize", localize);
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

  override update(): void {
    super.update();
  }

  draw(canvas: Canvas): void {
    if (this.parent && this.text && !this.needsInitialization) {
      canvas.save();
      const drawScale = m2c2Globals.canvasScale / this.absoluteScale;
      canvas.scale(1 / drawScale, 1 / drawScale);
      M2c2KitHelpers.rotateCanvasForDrawableNode(canvas, this);

      const x = this.absolutePosition.x * drawScale;
      const y =
        (this.absolutePosition.y +
          this.size.height * this.anchorPoint.y * this.absoluteScale) *
        drawScale;

      if (this.paint === undefined || this.font === undefined) {
        throw new Error(
          `in TextLine node ${this}, Paint or Font is undefined.`,
        );
      }

      if (this.absoluteAlphaChange !== 0) {
        this.paint.setAlphaf(this.absoluteAlpha);
      }

      canvas.drawText(this.textForDraw, x, y, this.paint, this.font);
      canvas.restore();
    }

    super.drawChildren(canvas);
  }

  warmup(canvas: Canvas): void {
    const i18n = this.game.i18n;
    if (i18n && this.localize !== false) {
      const textLocalization = i18n.getTextLocalization(
        this.text,
        this.interpolation,
      );
      this.localizedFontName = textLocalization.fontName;
      this.localizedFontNames = textLocalization.fontNames ?? [];
    }
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
