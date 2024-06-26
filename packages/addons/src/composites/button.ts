import { CanvasKitHelpers } from "@m2c2kit/core";
import { Paint, Canvas } from "canvaskit-wasm";
import {
  WebColors,
  Composite,
  CompositeOptions,
  Shape,
  Label,
  TextOptions,
  IText,
  RgbaColor,
  Size,
  IDrawable,
  StringInterpolationMap,
} from "@m2c2kit/core";
import "../Globals";

export interface ButtonOptions extends CompositeOptions, TextOptions {
  /** Size of button */
  size?: Size;
  /** Corner radius of button; can be used to make rounded corners */
  cornerRadius?: number;
  /** Background color of button. Default is WebColors.RoyalBlue */
  backgroundColor?: RgbaColor;
  /** Color of button text. Default is WebColors.White */
  fontColor?: RgbaColor;
  /** Names of multiple fonts to use for text. For example, if a text font and an emoji font are to be used together. Must have been previously loaded */
  fontNames?: Array<string>;
}

export class Button extends Composite implements IText {
  compositeType = "button";
  // Button options
  private _backgroundColor = WebColors.Black;
  size = { width: 200, height: 50 };
  cornerRadius = 9;
  fontSize = 20;
  private _text = "";
  private _fontColor = WebColors.White;
  private _fontName: string | undefined;
  private _fontNames: Array<string> | undefined;
  private _interpolation: StringInterpolationMap = {};
  private _localize = true;
  private backgroundPaint?: Paint;

  // todo: add getters/setters so button can respond to changes in its options
  // todo: add default "behaviors" (?) like button click animation?

  /**
   * A simple button of rectangle with text centered inside.
   *
   * @remarks This composite node is composed of a rectangle and text. To
   * respond to user taps, the isUserInteractionEnabled property must be set
   * to true and an appropriate callback must be set to handle the tap event.
   *
   * @param options - {@link ButtonOptions}
   */
  constructor(options: ButtonOptions) {
    super(options);
    if (options.text) {
      this.text = options.text;
    }
    if (options.size) {
      this.size = options.size;
    }
    if (options.cornerRadius !== undefined) {
      this.cornerRadius = options.cornerRadius;
    }
    if (options.fontName) {
      this.fontName = options.fontName;
    }
    if (options.fontNames) {
      this.fontNames = options.fontNames;
    }
    if (options.fontSize !== undefined) {
      this.fontSize = options.fontSize;
    }
    if (options.fontColor) {
      this.fontColor = options.fontColor;
    }
    if (options.backgroundColor) {
      this.backgroundColor = options.backgroundColor;
    }
    if (options.interpolation) {
      this.interpolation = options.interpolation;
    }
    if (options.localize !== undefined) {
      this.localize = options.localize;
    }
  }

  override initialize(): void {
    this.removeAllChildren();

    this.backgroundPaint = new this.canvasKit.Paint();
    this.backgroundPaint.setColor(
      this.canvasKit.Color(
        this.backgroundColor[0],
        this.backgroundColor[1],
        this.backgroundColor[2],
        this.backgroundColor[3],
      ),
    );
    this.backgroundPaint.setStyle(this.canvasKit.PaintStyle.Fill);

    const buttonRectangle = new Shape({
      rect: { size: this.size },
      cornerRadius: this.cornerRadius,
      fillColor: this._backgroundColor,
    });
    this.addChild(buttonRectangle);

    const buttonLabel = new Label({
      text: this.text,
      localize: this.localize,
      interpolation: this.interpolation,
      fontName: this.fontName,
      fontNames: this.fontNames,
      fontSize: this.fontSize,
      fontColor: this.fontColor,
    });
    buttonRectangle.addChild(buttonLabel);

    this.needsInitialization = false;
  }

  override dispose(): void {
    CanvasKitHelpers.Dispose([this.backgroundPaint]);
  }

  get text(): string {
    return this._text;
  }

  set text(text: string) {
    this._text = text;
    this.needsInitialization = true;
  }

  get backgroundColor(): RgbaColor {
    return this._backgroundColor;
  }
  set backgroundColor(backgroundColor: RgbaColor) {
    this._backgroundColor = backgroundColor;
    this.needsInitialization = true;
  }
  get fontColor(): RgbaColor {
    return this._fontColor;
  }
  set fontColor(fontColor: RgbaColor) {
    this._fontColor = fontColor;
    this.needsInitialization = true;
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

  get interpolation(): StringInterpolationMap {
    return this._interpolation;
  }
  set interpolation(interpolation: StringInterpolationMap) {
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
  }

  get localize(): boolean {
    return this._localize;
  }
  set localize(localize: boolean) {
    this._localize = localize;
    this.needsInitialization = true;
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
  override duplicate(newName?: string): Button {
    const dest = new Button({
      ...this.getNodeOptions(),
      ...this.getDrawableOptions(),
      ...this.getTextOptions(),
      size: this.size,
      cornerRadius: this.cornerRadius,
      backgroundColor: this.backgroundColor,
      fontColor: this.fontColor,
      name: newName,
      localize: this.localize,
      interpolation: JSON.parse(JSON.stringify(this.interpolation)),
      fontName: this.fontName,
      fontNames: JSON.parse(JSON.stringify(this.fontNames)),
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
    super.drawChildren(canvas);
  }

  warmup(canvas: Canvas): void {
    this.initialize();
    this.children
      .filter((child) => child.isDrawable)
      .forEach((child) => {
        (child as unknown as IDrawable).warmup(canvas);
      });
  }
}
