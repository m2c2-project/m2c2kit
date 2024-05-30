import { RgbaColor } from "./RgbaColor";
import { StringInterpolationMap } from "./StringInterpolationMap";

export interface IText {
  text?: string;
  fontName?: string;
  fontColor?: RgbaColor;
  fontSize?: number;
  interpolation?: StringInterpolationMap;
  localize?: boolean;
}
