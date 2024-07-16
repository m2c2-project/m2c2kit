import { Paint, Canvas } from "canvaskit-wasm";
import {
  CanvasKitHelpers,
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
  Equal,
  M2c2KitHelpers,
  M2NodeConstructor,
} from "@m2c2kit/core";

export interface ButtonOptions extends CompositeOptions, TextOptions {
  /** Size of button. Default is 200 wide by 50 high. */
  size?: Size;
  /** Corner radius of button; can be used to make rounded corners. Default is 9 */
  cornerRadius?: number;
  /** Background color of button. Default is WebColors.Black */
  backgroundColor?: RgbaColor;
  /** Color of button text. Default is WebColors.White */
  fontColor?: RgbaColor;
  /** Names of multiple fonts to use for text. For example, if a text font and an emoji font are to be used together. Must have been previously loaded */
  fontNames?: Array<string>;
  // Already defined in TextOptions, but redefined here to change documentation
  /** Size of button text. Default is 20. */
  fontSize?: number;
}

export class Button extends Composite implements IText, ButtonOptions {
  compositeType = "Button";
  isText = true;
  // Button options
  private _backgroundColor = WebColors.Black;
  private _cornerRadius = 9;
  private _fontSize = 20;
  private _text = "";
  private _fontColor = WebColors.White;
  private _fontName: string | undefined;
  private _fontNames: Array<string> | undefined;
  private _interpolation: StringInterpolationMap = {};
  private _localize = true;
  private backgroundPaint?: Paint;

  // TODO: add default "behaviors" (?) like button click animation?

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
    } else {
      this.size = { width: 200, height: 50 };
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

    this.saveNodeNewEvent();
  }

  override get completeNodeOptions() {
    return {
      ...this.options,
      ...this.getNodeOptions(),
      ...this.getDrawableOptions(),
      ...this.getTextOptions(),
      size: this.size,
      cornerRadius: this.cornerRadius,
      backgroundColor: this.backgroundColor,
      fontNames: this.fontNames,
    };
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
      name: "__" + this.name + "-buttonRectangle",
      rect: { size: this.size },
      cornerRadius: this.cornerRadius,
      fillColor: this._backgroundColor,
      suppressEvents: true,
    });
    this.addChild(buttonRectangle);

    const buttonLabel = new Label({
      name: "__" + this.name + "-buttonLabel",
      text: this.text,
      localize: this.localize,
      interpolation: this.interpolation,
      fontName: this.fontName,
      fontNames: this.fontNames,
      fontSize: this.fontSize,
      fontColor: this.fontColor,
      suppressEvents: true,
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
    if (Equal.value(this._text, text)) {
      return;
    }
    this._text = text;
    this.needsInitialization = true;
    this.savePropertyChangeEvent("text", text);
  }

  get backgroundColor(): RgbaColor {
    return this._backgroundColor;
  }
  set backgroundColor(backgroundColor: RgbaColor) {
    if (Equal.value(this._backgroundColor, backgroundColor)) {
      return;
    }
    this._backgroundColor = backgroundColor;
    this.needsInitialization = true;
    this.savePropertyChangeEvent("backgroundColor", backgroundColor);
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

  get fontName(): string | undefined {
    return this._fontName;
  }
  set fontName(fontName: string | undefined) {
    if (this._fontName === fontName) {
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

  get cornerRadius(): number {
    return this._cornerRadius;
  }
  set cornerRadius(cornerRadius: number) {
    if (Equal.value(this._cornerRadius, cornerRadius)) {
      return;
    }
    this._cornerRadius = cornerRadius;
    this.needsInitialization = true;
    this.savePropertyChangeEvent("cornerRadius", cornerRadius);
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

M2c2KitHelpers.registerM2NodeClass(Button as unknown as M2NodeConstructor);
