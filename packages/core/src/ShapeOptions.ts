import { ShapeType } from "./ShapeType";
import { DrawableOptions } from "./DrawableOptions";
import { EntityOptions } from "./EntityOptions";
import { RgbaColor } from "./RgbaColor";
import { RectOptions } from "./RectOptions";
import { M2Path } from "./M2Path";
import { Size } from "./Size";
import { SvgStringPath } from "./SvgStringPath";

export interface ShapeOptions extends EntityOptions, DrawableOptions {
  shapeType?: ShapeType;
  /** If provided, shape will be a circle with given radius */
  circleOfRadius?: number;
  /** If provided, shape will be a rectangle as specified in {@link Rect} */
  rect?: RectOptions;
  /** Radius of rectangle's corners */
  cornerRadius?: number;
  /** Color with which to fill shape. Default is Constants.DEFAULT_SHAPE_FILL_COLOR (WebColors.Red)  */
  fillColor?: RgbaColor;
  /** Color with which to outline shape. Default is no color for rectangle and circle, red for path. */
  strokeColor?: RgbaColor;
  /** Width of outline. Default is undefined for rectangle and circle, 2 for path. */
  lineWidth?: number;
  /** A path from which to create the shape */
  path?: M2Path | SvgStringPath;
  /** Size of container "view box" for path shapes. Leave undefined for circle and rectangle shapes. */
  size?: Size;
  /** Should the shape be drawn with anti-aliasing. Default is yes. */
  isAntialiased?: boolean;
}
