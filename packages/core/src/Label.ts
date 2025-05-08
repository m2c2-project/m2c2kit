import {
  Canvas,
  Paragraph,
  EmbindEnumEntity,
  ParagraphStyle,
  ParagraphBuilder,
  Paint,
  TextStyle,
} from "canvaskit-wasm";
import { Constants } from "./Constants";
import { IDrawable } from "./IDrawable";
import { M2Node, handleInterfaceOptions } from "./M2Node";
import { M2NodeType } from "./M2NodeType";
import { RgbaColor } from "./RgbaColor";
import { IText } from "./IText";
import { LabelOptions } from "./LabelOptions";
import { LabelHorizontalAlignmentMode } from "./LabelHorizontalAlignmentMode";
import { CanvasKitHelpers } from "./CanvasKitHelpers";
import { M2c2KitHelpers } from "./M2c2KitHelpers";
import { M2Font, M2FontStatus } from "./M2Font";
import { FontManager } from "./FontManager";
import { StringInterpolationMap } from "./StringInterpolationMap";
import { Equal } from "./Equal";
import { Point } from "./Point";
import { M2Error } from "./M2Error";

/** Style segment with styles */
interface StyleSegment {
  /** Start index in plain text */
  start: number;
  /** End index in plain text */
  end: number;
  /** Active styles for this segment ('b', 'i', 'u', 's', 'o') */
  styles: Set<string>;
}

/** Parsed text result */
interface ParsedText {
  /** Text with formatting tags removed */
  plainText: string;
  /** Array of text segments with style info */
  styleSegments: StyleSegment[];
}

/**
 * Supported tag names for text formatting.
 */
const TAG_NAME = {
  UNDERLINE: "u",
  ITALIC: "i",
  BOLD: "b",
  STRIKETHROUGH: "s",
  OVERLINE: "o",
} as const;

export class Label extends M2Node implements IDrawable, IText, LabelOptions {
  readonly type = M2NodeType.Label;
  isDrawable = true;
  isText = true;
  // Drawable options
  private _anchorPoint: Point = { x: 0.5, y: 0.5 };
  private _zPosition = 0;
  // Text options
  private _text = ""; // public getter/setter is below
  private _fontName: string | undefined; // public getter/setter is below
  private _fontNames: Array<string> | undefined; // public getter/setter is below
  private _fontColor = Constants.DEFAULT_FONT_COLOR; // public getter/setter is below
  private _fontSize = Constants.DEFAULT_FONT_SIZE; // public getter/setter is below
  private _interpolation: StringInterpolationMap = {};

  // Label options
  private _horizontalAlignmentMode = LabelHorizontalAlignmentMode.Center; // public getter/setter is below
  private _preferredMaxLayoutWidth: number | undefined; // public getter/setter is below
  private _backgroundColor?: RgbaColor | undefined; // public getter/setter is below
  private _localize = true;

  private paragraph?: Paragraph;
  private paraStyle?: ParagraphStyle;
  private builder?: ParagraphBuilder;
  private _fontPaint?: Paint;
  private _backgroundPaint?: Paint;
  private localizedFontSize: number | undefined;
  private localizedFontName: string | undefined;
  private localizedFontNames: Array<string> = [];
  private textAfterLocalization = "";
  private plainText = "";
  private styleSegments: StyleSegment[] = [];

  /**
   * Single or multi-line text formatted and rendered on the screen.
   *
   * @remarks Label (in contrast to TextLine) has enhanced text support for
   * line wrapping, centering/alignment, and background colors.
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
    this.saveNodeNewEvent();
  }

  override get completeNodeOptions() {
    return {
      ...this.options,
      ...this.getNodeOptions(),
      ...this.getDrawableOptions(),
      ...this.getTextOptions(),
      horizontalAlignmentMode: this.horizontalAlignmentMode,
      preferredMaxLayoutWidth: this.preferredMaxLayoutWidth,
      backgroundColor: this.backgroundColor,
      fontNames: this.fontNames,
    };
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
        throw new M2Error("unknown horizontalAlignmentMode");
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

    /** Text, including any localization, if provided. */
    const i18n = this.game.i18n;
    if (i18n && this.localize !== false) {
      const textLocalization = i18n.getTextLocalization(
        this.text,
        this.interpolation,
      );
      this.textAfterLocalization = textLocalization.text;
      this.localizedFontSize = textLocalization.fontSize;
      this.localizedFontName = textLocalization.fontName;
      this.localizedFontNames = textLocalization.fontNames ?? [];
      if (
        textLocalization.isFallbackOrMissingTranslation &&
        i18n.missingLocalizationColor
      ) {
        textColor = this.canvasKit.Color(
          i18n.missingLocalizationColor[0],
          i18n.missingLocalizationColor[1],
          i18n.missingLocalizationColor[2],
          i18n.missingLocalizationColor[3],
        );
      }
    } else {
      // if no localization, then textAfterLocalization is the same as the original text
      this.textAfterLocalization = this.text;
    }

    const parsedText = this.parseFormattedText(this.textAfterLocalization);
    this.plainText = parsedText.plainText;
    this.styleSegments = parsedText.styleSegments;

    if (this.fontName && this.fontNames) {
      throw new M2Error("cannot specify both fontName and fontNames");
    }
    const fontManager = this.game.fontManager;
    const requiredFonts = this.getRequiredLabelFonts(fontManager);
    requiredFonts.forEach((font) => {
      if (font.status === M2FontStatus.Deferred) {
        /**
         * prepareDeferredFont() is async, but we do not await it here. We
         * do not want to block the label's initialization while we wait for
         * fonts to be ready. Instead, we will check if the label still needs
         * initialization before we draw the label.
         */
        fontManager.prepareDeferredFont(font);
        return;
      }
    });
    if (!requiredFonts.every((font) => font.status === M2FontStatus.Ready)) {
      return;
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
    this.builder = this.canvasKit.ParagraphBuilder.MakeFromFontProvider(
      this.paraStyle,
      fontManager.provider,
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
    const defaultStyle: TextStyle = {
      fontFamilies: requiredFonts.map((font) => font.fontName),
      fontSize:
        (this.localizedFontSize ?? this.fontSize) * m2c2Globals.canvasScale,
      fontStyle: {
        weight: this.canvasKit.FontWeight.Normal,
        width: this.canvasKit.FontWidth.Normal,
        slant: this.canvasKit.FontSlant.Upright,
      }, // Normal font style
      decoration: 0, // No decoration
      decorationThickness: 1.0, // Default decoration thickness
      decorationStyle: this.canvasKit.DecorationStyle.Solid,
      heightMultiplier: -1, // Providing -1, rather than 1.0, gives default height multiplier
      halfLeading: false,
      letterSpacing: 0.0,
      wordSpacing: 0.0,
    };

    // Apply default style to builder
    this.builder.pushPaintStyle(
      defaultStyle,
      this.fontPaint,
      this.backgroundPaint,
    );
    this.addStyleSegmentsToParagraphBuilder(
      this.builder,
      this.styleSegments,
      defaultStyle,
    );

    if (this.paragraph) {
      this.paragraph.delete();
    }
    this.paragraph = this.builder.build();
    const preferredWidth =
      //this.preferredMaxLayoutWidth ?? this.parentScene.game.canvasCssWidth;
      this.preferredMaxLayoutWidth ?? m2c2Globals.canvasCssWidth;

    let calculatedWidth = preferredWidth;
    if (preferredWidth === 0 || this.layout.width === 0) {
      // match parent
      // TODO: implement match parent on more properties
      if (this.parent === undefined) {
        throw new M2Error(
          "width is set to match parent, but node has no parent",
        );
      }
      const marginStart = this.layout.marginStart ?? 0;
      const marginEnd = this.layout.marginEnd ?? 0;
      calculatedWidth = this.parent.size.width - (marginStart + marginEnd);
    }

    this.paragraph.layout(calculatedWidth * m2c2Globals.canvasScale);

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
      this.size.width = this.paragraph.getMaxWidth() / m2c2Globals.canvasScale;
    }

    this.size.height = this.paragraph.getHeight() / m2c2Globals.canvasScale;
    this.needsInitialization = false;
  }

  /**
   * Parses text with formatting tags and returns plain text and style segments.
   * Supports <b> for bold, <i> for italics, and <u> for underline.
   * Properly handles nested tags like <b><u>bold and underlined</u></b>.
   * Throws errors for malformed tags, but treats unknown tags as plain text.
   *
   * @param text - The text with formatting tags
   * @returns The parsed text result
   * @throws Error if tags are improperly nested or unclosed
   */
  private parseFormattedText(text: string): ParsedText {
    let plainText = "";

    // Track style changes at each position
    interface StyleChange {
      position: number;
      style: string;
      isStart: boolean;
    }

    const styleChanges: StyleChange[] = [];
    const tagStack: string[] = []; // Stack to track open tags for validation
    const validTags: Set<string> = new Set([
      TAG_NAME.UNDERLINE,
      TAG_NAME.BOLD,
      TAG_NAME.ITALIC,
      TAG_NAME.STRIKETHROUGH,
      TAG_NAME.OVERLINE,
    ]);

    // Simple regex-based parser for tags
    const tagPattern = /<\/?([^>]+)>/g;
    let lastIndex = 0;
    let plainIndex = 0;
    let match: boolean | RegExpExecArray | null = null;

    // Calculate line and column for error messages
    const getPosition = (index: number): string => {
      let line = 1;
      let column = 1;
      for (let i = 0; i < index; i++) {
        if (text[i] === "\n") {
          line++;
          column = 1;
        } else {
          column++;
        }
      }
      return `line ${line}, column ${column}`;
    };

    while ((match = tagPattern.exec(text)) !== null) {
      const fullTag = match[0];
      const tagName = match[1];
      const isClosing = fullTag.charAt(1) === "/";
      const position = getPosition(match.index);

      // If it's not a valid tag, treat it as plain text
      if (!validTags.has(tagName)) {
        // Add the text before this tag
        const beforeTag = text.substring(lastIndex, match.index);
        plainText += beforeTag;
        plainIndex += beforeTag.length;

        // Add the tag itself as plain text
        plainText += fullTag;
        plainIndex += fullTag.length;

        // Update lastIndex to continue after this tag
        lastIndex = match.index + fullTag.length;
        continue;
      }

      // Add text before the tag
      const beforeTag = text.substring(lastIndex, match.index);
      plainText += beforeTag;
      plainIndex += beforeTag.length;

      if (isClosing) {
        // Check for closing tag without matching opening tag
        if (tagStack.length === 0) {
          throw new M2Error(
            `Label has closing tag </${tagName}> at ${position} without matching opening tag. Text is: ${text}`,
          );
        }

        // Check for improperly nested tags
        const lastOpenTag = tagStack.pop();
        if (lastOpenTag !== tagName) {
          throw new M2Error(
            `Label has improperly nested tags at ${position}. Expected </${lastOpenTag}> but found </${tagName}>. Tags must be properly nested. Text is: ${text}`,
          );
        }

        // Record this style change
        styleChanges.push({
          position: plainIndex,
          style: tagName,
          isStart: false,
        });
      } else {
        // Opening tag
        tagStack.push(tagName);

        // Record this style change
        styleChanges.push({
          position: plainIndex,
          style: tagName,
          isStart: true,
        });
      }

      lastIndex = match.index + fullTag.length;
    }

    // Add remaining text
    plainText += text.substring(lastIndex);

    // Check for unclosed tags
    if (tagStack.length > 0) {
      throw new M2Error(
        `Label has unclosed format tags: <${tagStack.join(">, <")}>. All tags must be closed. Text is: ${text}`,
      );
    }

    // Build segments with styling from the recorded changes
    const activeStyles = new Set<string>();
    const segments: StyleSegment[] = [];
    let lastPosition = 0;

    // Sort style changes by position
    styleChanges.sort((a, b) => a.position - b.position);

    // Process each style change to build segments
    for (const change of styleChanges) {
      // If styles changed since last position, create a segment
      if (change.position > lastPosition && activeStyles.size > 0) {
        segments.push({
          start: lastPosition,
          end: change.position,
          styles: new Set(activeStyles), // Create a copy of the current styles
        });
      }

      // Update active styles
      if (change.isStart) {
        activeStyles.add(change.style);
      } else {
        activeStyles.delete(change.style);
      }

      lastPosition = change.position;
    }

    return {
      plainText,
      styleSegments: segments,
    };
  }

  /**
   * Adds text segments with consistent styling to the paragraph builder.
   *
   * @param builder - {@link ParagraphBuilder}
   * @param styleSegments - Segments of text with consistent styling
   * @param defaultStyle - Default style to apply
   */
  private addStyleSegmentsToParagraphBuilder(
    builder: ParagraphBuilder,
    styleSegments: StyleSegment[],
    defaultStyle: TextStyle,
  ) {
    // If there are no style segments, add the entire text
    if (styleSegments.length === 0) {
      builder.addText(this.plainText);
    } else {
      // Process text by segments with consistent styling
      let lastIndex = 0;

      for (const segment of styleSegments) {
        // Add any unstyled text before this segment
        if (segment.start > lastIndex) {
          this.addTextWithStyle(
            builder,
            this.plainText.substring(lastIndex, segment.start),
            defaultStyle,
          );
        }

        // Prepare style modifiers for this segment
        const styleModifiers: TextStyle = {};

        if (segment.styles.has(TAG_NAME.BOLD)) {
          // Combine with existing fontStyle if it exists
          styleModifiers.fontStyle = {
            ...(styleModifiers.fontStyle || defaultStyle.fontStyle),
            weight: this.canvasKit.FontWeight.Black,
          };
        }

        if (segment.styles.has(TAG_NAME.ITALIC)) {
          // Combine with existing fontStyle if it exists
          styleModifiers.fontStyle = {
            ...(styleModifiers.fontStyle || defaultStyle.fontStyle),
            slant: this.canvasKit.FontSlant.Italic,
          };
        }

        if (segment.styles.has(TAG_NAME.UNDERLINE)) {
          styleModifiers.decoration = this.canvasKit.UnderlineDecoration;
          styleModifiers.decorationThickness = 1;
          styleModifiers.decorationStyle = this.canvasKit.DecorationStyle.Solid;
          styleModifiers.decorationColor = this.fontColor;
        }

        if (segment.styles.has(TAG_NAME.STRIKETHROUGH)) {
          styleModifiers.decoration = this.canvasKit.LineThroughDecoration;
          styleModifiers.decorationThickness = 1;
          styleModifiers.decorationStyle = this.canvasKit.DecorationStyle.Solid;
          styleModifiers.decorationColor = this.fontColor;
        }

        if (segment.styles.has(TAG_NAME.OVERLINE)) {
          styleModifiers.decoration = this.canvasKit.OverlineDecoration;
          styleModifiers.decorationThickness = 1;
          styleModifiers.decorationStyle = this.canvasKit.DecorationStyle.Solid;
          styleModifiers.decorationColor = this.fontColor;
        }

        const numberOfDecorations = [
          TAG_NAME.UNDERLINE,
          TAG_NAME.STRIKETHROUGH,
          TAG_NAME.OVERLINE,
        ].filter((tag) => segment.styles.has(tag)).length;
        if (numberOfDecorations > 1) {
          throw new M2Error(
            `Label does not support multiple text decorations (underline, overline, or strikethrough) on a single text segment. Text is: ${this.textAfterLocalization}`,
          );
        }

        // Add the styled text segment
        this.addTextWithStyle(
          builder,
          this.plainText.substring(segment.start, segment.end),
          defaultStyle,
          styleModifiers,
        );

        lastIndex = segment.end;
      }

      // Add any remaining unstyled text
      if (lastIndex < this.plainText.length) {
        this.addTextWithStyle(
          builder,
          this.plainText.substring(lastIndex),
          defaultStyle,
        );
      }
    }
  }

  /**
   * Helper that adds text to the paragraph builder with the specified style.
   *
   * @param builder - {@link ParagraphBuilder}
   * @param text - The text to add
   * @param defaultStyle - The default style to apply
   * @param styleModifiers - Additional style modifications
   * @returns void
   */
  private addTextWithStyle(
    builder: ParagraphBuilder,
    text: string,
    defaultStyle: TextStyle,
    styleModifiers: TextStyle = {},
  ) {
    if (!text) return;

    // Create modified style with default values and overrides
    const style = {
      ...defaultStyle,
      ...styleModifiers,
    };

    builder.pushPaintStyle(style, this.fontPaint, this.backgroundPaint);
    builder.addText(text);
    builder.pop(); // Remove the style because it is only for this text
  }

  /**
   * Determines the M2Font objects that need to be ready in order to draw
   * the Label.
   *
   * @remarks It needs a FontManager because it may need to look up the
   * default font.
   *
   * @param fontManager - {@link FontManager}
   * @returns an array of M2Font objects that are required for the Label
   */
  private getRequiredLabelFonts(fontManager: FontManager) {
    let requiredFonts: Array<M2Font>;

    if (this.game.i18n && this.localize !== false) {
      if (this.localizedFontName) {
        requiredFonts = [fontManager.fonts[this.localizedFontName]];
        return requiredFonts;
      } else if (this.localizedFontNames.length > 0) {
        requiredFonts = this.localizedFontNames.map(
          (font) => fontManager.fonts[font],
        );
        return requiredFonts;
      }
    }

    if (this.fontName === undefined && this.fontNames === undefined) {
      requiredFonts = [fontManager.getDefaultFont()];
    } else if (this.fontName !== undefined) {
      requiredFonts = [fontManager.fonts[this.fontName]];
    } else if (this.fontNames !== undefined && this.fontNames.length > 0) {
      requiredFonts = this.fontNames.map((font) => fontManager.fonts[font]);
    } else {
      throw new M2Error("cannot determine required fonts");
    }
    return requiredFonts;
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
    if (Equal.value(this._text, text)) {
      return;
    }
    this._text = text;
    this.needsInitialization = true;
    this.savePropertyChangeEvent("text", text);
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

  get fontNames(): Array<string> | undefined {
    return this._fontNames;
  }
  set fontNames(fontNames: Array<string> | undefined) {
    if (Equal.value(this._fontNames, fontNames)) {
      return;
    }
    this._fontNames = fontNames;
    this.needsInitialization = true;
    this.savePropertyChangeEvent("fontNames", fontNames);
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

  get horizontalAlignmentMode(): LabelHorizontalAlignmentMode {
    return this._horizontalAlignmentMode;
  }
  set horizontalAlignmentMode(
    horizontalAlignmentMode: LabelHorizontalAlignmentMode,
  ) {
    if (Equal.value(this._horizontalAlignmentMode, horizontalAlignmentMode)) {
      return;
    }
    this._horizontalAlignmentMode = horizontalAlignmentMode;
    this.needsInitialization = true;
    this.savePropertyChangeEvent(
      "horizontalAlignmentMode",
      horizontalAlignmentMode,
    );
  }

  get preferredMaxLayoutWidth(): number | undefined {
    return this._preferredMaxLayoutWidth;
  }
  set preferredMaxLayoutWidth(preferredMaxLayoutWidth: number | undefined) {
    if (Equal.value(this._preferredMaxLayoutWidth, preferredMaxLayoutWidth)) {
      return;
    }
    this._preferredMaxLayoutWidth = preferredMaxLayoutWidth;
    this.needsInitialization = true;
    this.savePropertyChangeEvent(
      "preferredMaxLayoutWidth",
      preferredMaxLayoutWidth,
    );
  }

  get backgroundColor(): RgbaColor | undefined {
    return this._backgroundColor;
  }
  set backgroundColor(backgroundColor: RgbaColor | undefined) {
    if (Equal.value(this._backgroundColor, backgroundColor)) {
      return;
    }
    this._backgroundColor = backgroundColor;
    this.needsInitialization = true;
    this.savePropertyChangeEvent("backgroundColor", backgroundColor);
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

  private get backgroundPaint(): Paint {
    if (!this._backgroundPaint) {
      throw new M2Error("backgroundPaint cannot be undefined");
    }
    return this._backgroundPaint;
  }
  private set backgroundPaint(backgroundPaint: Paint) {
    this._backgroundPaint = backgroundPaint;
  }

  private get fontPaint(): Paint {
    if (!this._fontPaint) {
      throw new M2Error("fontPaint cannot be undefined");
    }
    return this._fontPaint;
  }
  private set fontPaint(fontPaint: Paint) {
    this._fontPaint = fontPaint;
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
  override duplicate(newName?: string): Label {
    const dest = new Label({
      ...this.getNodeOptions(),
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
     * In most cases, when a property on a node changes such that the
     * node must be initialized again, we set needsInitialization = true in
     * the node's setter for that property. However, in the case of alpha,
     * the node's absolute alpha change may be caused by a change in an
     * ancestor alpha (not a setter on this node). To ensure that these
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
    if (this.parent && this.text !== "" && !this.needsInitialization) {
      canvas.save();
      const drawScale = m2c2Globals.canvasScale / this.absoluteScale;
      canvas.scale(1 / drawScale, 1 / drawScale);
      M2c2KitHelpers.rotateCanvasForDrawableNode(canvas, this);

      const x =
        (this.absolutePosition.x -
          this.size.width * this.anchorPoint.x * this.absoluteScale) *
        drawScale;
      const y =
        (this.absolutePosition.y -
          this.size.height * this.anchorPoint.y * this.absoluteScale) *
        drawScale;

      if (this.paragraph === undefined) {
        throw new M2Error("no paragraph");
      }

      canvas.drawParagraph(this.paragraph, x, y);

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
     * If this label uses a deferred font, then we cannot warm it up.
     */
    const requiredFonts = this.getRequiredLabelFonts(this.game.fontManager);
    if (requiredFonts.some((font) => font.status === M2FontStatus.Deferred)) {
      return;
    }
    /**
     * If this label is part of a relative layout, then we cannot
     * warm it up because a label uses word wrapping, and that
     * would not yet have been calculated
     */
    if (Object.keys(this.layout).length !== 0) {
      return;
    }
    this.initialize();
    if (!this.paragraph) {
      throw new M2Error(
        `warmup Label node ${this.toString()}: paragraph is undefined`,
      );
    }
    canvas.drawParagraph(this.paragraph, 0, 0);
  }
}
