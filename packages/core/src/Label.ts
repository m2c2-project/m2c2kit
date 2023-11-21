import "./Globals";
import {
  Canvas,
  Paragraph,
  EmbindEnumEntity,
  ParagraphStyle,
  ParagraphBuilder,
  Paint,
} from "canvaskit-wasm";
import { Constants } from "./Constants";
import { IDrawable } from "./IDrawable";
import { Entity, handleInterfaceOptions } from "./Entity";
import { EntityType } from "./EntityType";
import { RgbaColor } from "./RgbaColor";
import { IText } from "./IText";
import { LabelOptions } from "./LabelOptions";
import { LabelHorizontalAlignmentMode } from "./LabelHorizontalAlignmentMode";
import { Scene } from "./Scene";
import { CanvasKitHelpers } from "./CanvasKitHelpers";
import { M2c2KitHelpers } from "./M2c2KitHelpers";

export class Label extends Entity implements IDrawable, IText, LabelOptions {
  readonly type = EntityType.Label;
  isDrawable = true;
  isText = true;
  // Drawable options
  anchorPoint = { x: 0.5, y: 0.5 };
  zPosition = 0;
  // Text options
  private _text = ""; // public getter/setter is below
  private _fontName: string | undefined; // public getter/setter is below
  private _fontNames: Array<string> | undefined; // public getter/setter is below
  private _fontColor = Constants.DEFAULT_FONT_COLOR; // public getter/setter is below
  private _fontSize = Constants.DEFAULT_FONT_SIZE; // public getter/setter is below

  // Label options
  private _horizontalAlignmentMode = LabelHorizontalAlignmentMode.Center; // public getter/setter is below
  private _preferredMaxLayoutWidth: number | undefined; // public getter/setter is below
  private _backgroundColor?: RgbaColor | undefined; // public getter/setter is below

  private paragraph?: Paragraph;
  private paraStyle?: ParagraphStyle;
  private builder?: ParagraphBuilder;
  private _fontPaint?: Paint;
  private _backgroundPaint?: Paint;
  private _translatedText = "";

  /**
   * Single or multi-line text formatted and rendered on the screen.
   *
   * @remarks Label (in contrast to TextLine) has enhanced text support for line wrapping, centering/alignment, and background colors.
   *
   * @param options - {@link LabelOptions}
   */
  constructor(options: LabelOptions = {}) {
    super(options);
    handleInterfaceOptions(this, options);
    if (options.horizontalAlignmentMode) {
      this.horizontalAlignmentMode = options.horizontalAlignmentMode;
    }
    if (options.preferredMaxLayoutWidth !== undefined) {
      this.preferredMaxLayoutWidth = options.preferredMaxLayoutWidth;
    }
    if (options.backgroundColor) {
      this.backgroundColor = options.backgroundColor;
    }
    if (options.fontNames) {
      this.fontNames = options.fontNames;
    }
  }

  override initialize(): void {
    let ckTextAlign: EmbindEnumEntity = this.canvasKit.TextAlign.Center;
    switch (this.horizontalAlignmentMode) {
      case LabelHorizontalAlignmentMode.Center:
        ckTextAlign = this.canvasKit.TextAlign.Center;
        break;
      case LabelHorizontalAlignmentMode.Left:
        ckTextAlign = this.canvasKit.TextAlign.Left;
        break;
      case LabelHorizontalAlignmentMode.Right:
        ckTextAlign = this.canvasKit.TextAlign.Right;
        break;
      default:
        throw new Error("unknown horizontalAlignmentMode");
    }

    if (!this.text) {
      this.text = "";
    }

    /**
     * We use a local variable, textColor, rather than this.fontColor, because
     * because we will override this.fontColor to another color
     * (missingTranslationFontColor) if the translation is missing. We don't
     * want to change this.fontColor, because that would be a side effect.
     */
    let textColor = this.canvasKit.Color(
      this.fontColor[0],
      this.fontColor[1],
      this.fontColor[2],
      this.fontColor[3],
    );

    let textForParagraph: string;
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
        if (i18n.options.missingTranslationFontColor) {
          textColor = this.canvasKit.Color(
            i18n.options.missingTranslationFontColor[0],
            i18n.options.missingTranslationFontColor[1],
            i18n.options.missingTranslationFontColor[2],
            i18n.options.missingTranslationFontColor[3],
          );
        }
      }
      this._translatedText = translated;
      textForParagraph = this._translatedText;
      if (this._translatedText === "") {
        console.warn(`warning: empty translated text in label "${this.name}"`);
      }
    } else {
      textForParagraph = this.text;
      this._translatedText = "";
    }

    const session = (this.parentSceneAsEntity as Scene).game.session;
    if (!session) {
      throw new Error("session is undefined");
    }
    const fontManager = session.fontManager;
    if (fontManager.fontMgr === undefined) {
      throw new Error("no fonts loaded");
    }

    if (this.fontName && this.fontNames) {
      throw new Error("cannot specify both fontName and fontNames");
    }
    const fontFamilies = new Array<string>();
    if (this.fontNames) {
      this.fontNames.forEach((fn) => {
        if (fontManager.gameTypefaces[this.game.uuid][fn] === undefined) {
          throw new Error(`font ${fn} not found.`);
        }
        fontFamilies.push(
          fontManager.gameTypefaces[this.game.uuid][fn].fontFamily,
        );
      });
    } else if (this.fontName) {
      if (
        fontManager.gameTypefaces[this.game.uuid][this.fontName] === undefined
      ) {
        throw new Error(`font ${this.fontName} not found.`);
      }
      fontFamilies.push(
        fontManager.gameTypefaces[this.game.uuid][this.fontName].fontFamily,
      );
    } else {
      // if no fontName provided, use default fontName, which is the
      // first in the list of fontAssets for this game.

      const typefaces = Object.values(
        fontManager.gameTypefaces[this.game.uuid],
      );
      const defaultTypeface = typefaces
        .filter((f) => f.isDefault)
        .find(Boolean);
      if (!defaultTypeface) {
        throw new Error("no default font");
      }
      fontFamilies.push(defaultTypeface.fontFamily);
    }

    /**
     * Previously, we set color, backgroundColor, fontFamilies, and fontSize
     * in the textStyle property of the ParagraphStyle. However, to support
     * alpha, we must now set the alpha on the Paint objects used in
     * pushPaintStyle(), not the textStyle here. But we must still pass in the
     * textStyle to the ParagraphStyle constructor, otherwise we get errors.
     */
    this.paraStyle = new this.canvasKit.ParagraphStyle({
      textStyle: {},
      textAlign: ckTextAlign,
    });

    /**
     * If we are doing a fadeAlpha action, we will create a new builder for
     * each different alpha value. Thus, delete the old builder if it exists
     * to avoid memory leaks. Same for paragraph, several lines below.
     */
    if (this.builder) {
      this.builder.delete();
    }
    this.builder = this.canvasKit.ParagraphBuilder.Make(
      this.paraStyle,
      fontManager.fontMgr,
    );

    if (!this._backgroundPaint) {
      this._backgroundPaint = new this.canvasKit.Paint();
    }
    if (!this._fontPaint) {
      this._fontPaint = new this.canvasKit.Paint();
    }

    this.fontPaint.setColor(textColor);
    this.fontPaint.setAlphaf(this.absoluteAlpha);
    if (this.backgroundColor) {
      this.backgroundPaint.setColor(this.backgroundColor);
      this.backgroundPaint.setAlphaf(this.absoluteAlpha);
    } else {
      this.backgroundPaint.setColor(this.canvasKit.Color(0, 0, 0, 0));
    }

    /**
     * fontFamilies and fontSize are the properties that we must set because
     * we are not using the defaults. However, there are other properties
     * that we must set as well, otherwise we get errors. So we set them to
     * the defaults.
     */
    this.builder.pushPaintStyle(
      {
        fontFamilies: fontFamilies,
        fontSize: this.fontSize * Globals.canvasScale,
        // set default values for below properties as well.
        fontStyle: {
          weight: this.canvasKit.FontWeight.Normal,
          width: this.canvasKit.FontWidth.Normal,
          slant: this.canvasKit.FontSlant.Oblique,
        }, // Normal font style
        decoration: 0, // No decoration
        decorationThickness: 1.0, // Default decoration thickness
        decorationStyle: this.canvasKit.DecorationStyle.Solid, // Solid decoration style
        heightMultiplier: -1, // Providing -1, rather than 1.0, gives default height multiplier
        halfLeading: false, // Default half leading
        letterSpacing: 0.0, // Default letter spacing
        wordSpacing: 0.0, // Default word spacing
      },
      this.fontPaint,
      this.backgroundPaint,
    );

    this.builder.addText(textForParagraph);
    if (this.paragraph) {
      this.paragraph.delete();
    }
    this.paragraph = this.builder.build();
    const preferredWidth =
      //this.preferredMaxLayoutWidth ?? this.parentScene.game.canvasCssWidth;
      this.preferredMaxLayoutWidth ?? Globals.canvasCssWidth;

    let calculatedWidth = preferredWidth;
    if (preferredWidth === 0 || this.layout.width === 0) {
      // match parent
      // TODO: implement match parent on more properties
      if (this.parent === undefined) {
        throw new Error(
          "width is set to match parent, but entity has no parent",
        );
      }
      const marginStart = this.layout.marginStart ?? 0;
      const marginEnd = this.layout.marginEnd ?? 0;
      calculatedWidth = this.parent.size.width - (marginStart + marginEnd);
    }

    this.paragraph.layout(calculatedWidth * Globals.canvasScale);

    /**
     * If label has a relative layout, then use the calculated width as the
     * label's size. Otherwise, we have to do the layout again to find out
     * the true size of this paragraph: the first paragraph.layout() (above)
     * computed the longest line length based on the max width constraint given.
     * We do the layout again with the (now) known longest line length
     * as the max width constraint. Use Math.ceil() to round up because it
     * seems like fractional widths are not respected. Now when we call
     * this.paragraph.getMaxWidth() again, it returns the max width of the
     * paragraph based on the actual wrapping of the text shown. We need to
     * know the actual width for proper positioning.
     */
    if (preferredWidth === 0 || this.layout.width === 0) {
      this.size.width = calculatedWidth;
    } else {
      this.paragraph.layout(Math.ceil(this.paragraph.getLongestLine()));
      this.size.width = this.paragraph.getMaxWidth() / Globals.canvasScale;
    }

    this.size.height = this.paragraph.getHeight() / Globals.canvasScale;
    this.needsInitialization = false;
  }

  dispose(): void {
    CanvasKitHelpers.Dispose([
      this.paragraph,
      this.builder,
      this._fontPaint, // use backing field since it may be undefined
      this._backgroundPaint, // use backing field since it may be undefined
    ]);
    // Note: ParagraphStyle has no delete() method, so nothing to dispose
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

  get fontNames(): Array<string> | undefined {
    return this._fontNames;
  }
  set fontNames(fontNames: Array<string> | undefined) {
    this._fontNames = fontNames;
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

  get horizontalAlignmentMode(): LabelHorizontalAlignmentMode {
    return this._horizontalAlignmentMode;
  }
  set horizontalAlignmentMode(
    horizontalAlignmentMode: LabelHorizontalAlignmentMode,
  ) {
    this._horizontalAlignmentMode = horizontalAlignmentMode;
    this.needsInitialization = true;
  }

  get preferredMaxLayoutWidth(): number | undefined {
    return this._preferredMaxLayoutWidth;
  }
  set preferredMaxLayoutWidth(preferredMaxLayoutWidth: number | undefined) {
    this._preferredMaxLayoutWidth = preferredMaxLayoutWidth;
    this.needsInitialization = true;
  }

  get backgroundColor(): RgbaColor | undefined {
    return this._backgroundColor;
  }
  set backgroundColor(backgroundColor: RgbaColor | undefined) {
    this._backgroundColor = backgroundColor;
    this.needsInitialization = true;
  }

  private get backgroundPaint(): Paint {
    if (!this._backgroundPaint) {
      throw new Error("backgroundPaint cannot be undefined");
    }
    return this._backgroundPaint;
  }
  private set backgroundPaint(backgroundPaint: Paint) {
    this._backgroundPaint = backgroundPaint;
  }

  private get fontPaint(): Paint {
    if (!this._fontPaint) {
      throw new Error("fontPaint cannot be undefined");
    }
    return this._fontPaint;
  }
  private set fontPaint(fontPaint: Paint) {
    this._fontPaint = fontPaint;
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
  override duplicate(newName?: string): Label {
    const dest = new Label({
      ...this.getEntityOptions(),
      ...this.getDrawableOptions(),
      ...this.getTextOptions(),
      horizontalAlignmentMode: this.horizontalAlignmentMode,
      preferredMaxLayoutWidth: this.preferredMaxLayoutWidth,
      backgroundColor: this.backgroundColor,
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
    /**
     * In most cases, when a property on an entity changes such that the
     * entity must be initialized again, we set needsInitialization = true in
     * the entity's setter for that property. However, in the case of alpha,
     * the entity's absolute alpha change may be caused by a change in an
     * ancestor alpha (not a setter on this entity). To ensure that these
     * absolute alpha changes are handled on this update cycle, we must
     * check for them here and run the initialization if needed (if we only
     * set needsInitialization = true, it would not be run until the next
     * update cycle).
     */
    if (this.absoluteAlphaChange !== 0) {
      this.initialize();
    }
  }

  draw(canvas: Canvas): void {
    if (this.parent && this.text !== "") {
      canvas.save();
      const drawScale = Globals.canvasScale / this.absoluteScale;
      canvas.scale(1 / drawScale, 1 / drawScale);
      M2c2KitHelpers.rotateCanvasForDrawableEntity(canvas, this);

      const x =
        (this.absolutePosition.x -
          this.size.width * this.anchorPoint.x * this.absoluteScale) *
        drawScale;
      const y =
        (this.absolutePosition.y -
          this.size.height * this.anchorPoint.y * this.absoluteScale) *
        drawScale;

      if (this.paragraph === undefined) {
        throw new Error("no paragraph");
      }

      canvas.drawParagraph(this.paragraph, x, y);
      canvas.restore();
    }

    super.drawChildren(canvas);
  }

  warmup(canvas: Canvas): void {
    /**
     * If this label is part of a relative layout, then we cannot
     * warm it up because a label uses word wrapping, and that
     * would not yet have been calculated
     */
    if (Object.keys(this.layout).length === 0) {
      this.initialize();
      if (!this.paragraph) {
        throw new Error(
          `warmup Label entity ${this.toString()}: paragraph is undefined`,
        );
      }
      canvas.drawParagraph(this.paragraph, 0, 0);
    }
  }
}
