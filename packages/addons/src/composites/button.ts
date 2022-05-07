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
}

export class Button extends Composite implements IText {
  compositeType = "button";
  // Button options
  private _backgroundColor = WebColors.RoyalBlue;
  size = { width: 200, height: 50 };
  cornerRadius = 9;
  fontSize = 20;
  text = "";
  private _fontColor = WebColors.White;

  private backgroundPaint?: Paint;

  // todo: add getters/setters so button can respond to changes in its options
  // todo: add default "behaviors" (?) like button click animation?
  constructor(options: ButtonOptions) {
    super(options);
    if (options.text) {
      this.text = options.text;
    }
    if (options.size) {
      this.size = options.size;
    }
    if (options.cornerRadius) {
      this.cornerRadius = options.cornerRadius;
    }
    if (options.fontSize) {
      this.fontSize = options.fontSize;
    }
    if (options.fontColor) {
      this.fontColor = options.fontColor;
    }
    if (options.backgroundColor) {
      this.backgroundColor = options.backgroundColor;
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
        this.backgroundColor[3]
      )
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
      fontSize: this.fontSize,
      fontColor: this.fontColor,
    });
    buttonRectangle.addChild(buttonLabel);

    this.needsInitialization = false;
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
  override duplicate(newName?: string): Button {
    const dest = new Button({
      ...this.getEntityOptions(),
      ...this.getDrawableOptions(),
      ...this.getTextOptions(),
      size: this.size,
      cornerRadius: this.cornerRadius,
      backgroundColor: this.backgroundColor,
      fontColor: this.fontColor,
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
