import { DrawableOptions } from "./DrawableOptions";
import { EntityOptions } from "./EntityOptions";
import { RgbaColor } from "./RgbaColor";
import { Rect } from "./Rect";

export interface ShapeOptions extends EntityOptions, DrawableOptions {
  circleOfRadius?: number;
  rect?: Rect;
  cornerRadius?: number;
  fillColor?: RgbaColor;
  strokeColor?: RgbaColor;
  lineWidth?: number;
}
