import { Paint, Canvas } from "canvaskit-wasm";
import { EntityType } from "../../EntityType";
import { WebColors } from "../..";
import { Game } from "../../Game";
import { Rect } from "../../Rect";
import { Composite } from "../../Composite";
import { CompositeOptions } from "../../CompositeOptions";
import { Shape } from "../../Shape";
import { Label } from "../../Label";
import { TextOptions } from "../../TextOptions";
import { IText } from "../../IText";
import { RgbaColor } from "../../RgbaColor";
import { Size } from "../../Size";
import { Globals } from "../../Globals";

export interface ButtonOptions extends CompositeOptions, TextOptions {
  size?: Size;
  cornerRadius?: number;
  backgroundColor?: RgbaColor;
}

export class Button extends Composite implements IText {
  readonly type = EntityType.composite;
  compositeType = "button";
  // Button options
  private _backgroundColor = WebColors.RoyalBlue;
  size = new Size(200, 50);
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

    this.backgroundPaint = new Globals.canvasKit.Paint();
    this.backgroundPaint.setColor(
      Globals.canvasKit.Color(
        this.backgroundColor[0],
        this.backgroundColor[1],
        this.backgroundColor[2],
        this.backgroundColor[3]
      )
    );
    this.backgroundPaint.setStyle(Globals.canvasKit.PaintStyle.Fill);

    const buttonRectangle = new Shape({
      rect: new Rect({ size: this.size }),
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

  update(): void {
    super.update();
  }

  draw(canvas: Canvas): void {
    super.drawChildren(canvas);
  }
}
