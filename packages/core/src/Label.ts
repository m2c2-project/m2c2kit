import "./Globals";
import {
  Canvas,
  Paragraph,
  EmbindEnumEntity,
  ParagraphStyle,
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
  private _fontColor = Constants.DEFAULT_FONT_COLOR; // public getter/setter is below
  private _fontSize = Constants.DEFAULT_FONT_SIZE; // public getter/setter is below

  // Label options
  private _horizontalAlignmentMode = LabelHorizontalAlignmentMode.Center; // public getter/setter is below
  private _preferredMaxLayoutWidth: number | undefined; // public getter/setter is below
  private _backgroundColor?: RgbaColor | undefined; // public getter/setter is below

  private paragraph?: Paragraph;
  private paraStyle?: ParagraphStyle;

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

    this.paraStyle = new this.canvasKit.ParagraphStyle({
      textStyle: {
        color: this.canvasKit.Color(
          this.fontColor[0],
          this.fontColor[1],
          this.fontColor[2],
          this.fontColor[3]
        ),
        backgroundColor: this.backgroundColor
          ? this.canvasKit.Color(
              this.backgroundColor[0],
              this.backgroundColor[1],
              this.backgroundColor[2],
              this.backgroundColor[3]
            )
          : undefined,
        fontFamilies: this.fontName ? [this.fontName] : undefined,
        fontSize: this.fontSize * Globals.canvasScale,
      },
      textAlign: ckTextAlign,
    });

    const activity = (this.parentSceneAsEntity as unknown as Scene).game
      .session;
    if (!activity) {
      throw new Error("activity is undefined");
    }
    const fontManager = activity.fontManager;

    if (fontManager.fontMgr === undefined) {
      throw new Error("no fonts loaded");
    }

    const builder = this.canvasKit.ParagraphBuilder.Make(
      this.paraStyle,
      fontManager.fontMgr
    );
    if (!this.text) {
      this.text = "";
    }
    builder.addText(this.text);
    if (this.text === "") {
      console.warn(`warning: empty text in label "${this.name}"`);
    }
    this.paragraph = builder.build();
    const preferredWidth =
      //this.preferredMaxLayoutWidth ?? this.parentScene.game.canvasCssWidth;
      this.preferredMaxLayoutWidth ?? Globals.canvasCssWidth;

    let calculatedWidth = preferredWidth;
    if (preferredWidth === 0 || this.layout.width === 0) {
      // match parent
      // TODO: implement match parent on more properties
      if (this.parent === undefined) {
        throw new Error(
          "width is set to match parent, but entity has no parent"
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
     * computed the longest line length based on the max width contraint given.
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

  get horizontalAlignmentMode(): LabelHorizontalAlignmentMode {
    return this._horizontalAlignmentMode;
  }
  set horizontalAlignmentMode(
    horizontalAlignmentMode: LabelHorizontalAlignmentMode
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

  update(): void {
    super.update();
  }

  draw(canvas: Canvas): void {
    if (this.parent && this.text !== "") {
      canvas.save();
      const drawScale = Globals.canvasScale / this.absoluteScale;
      canvas.scale(1 / drawScale, 1 / drawScale);

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
      /**
       * On older Android devices (and/or older versions of Chrome?), text is
       * distorted. The problem looks identical to the issue raised here:
       * https://github.com/flutter/flutter/issues/75327
       * It may be tied to some Adreno GPUs, because it is referenced in a
       * fix here: https://skia-review.googlesource.com/c/skia/+/571418/,
       * which should be part of canvaskit-wasm 0.36.1. However, this
       * bug still appears.
       * By manually calling flush(), it corrects the problem. When a full
       * fix is added to canvaskit-wasm, the below line should be removed.
       */
      this.game.surface?.flush();
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
    if (!this.layout) {
      this.initialize();
      if (!this.paragraph) {
        throw new Error(
          `warmup Label entity ${this.toString()}: paragraph is undefined`
        );
      }
      canvas.drawParagraph(this.paragraph, 0, 0);
    }
  }
}
