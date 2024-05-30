import { RgbaColor } from "./RgbaColor";
import { StringInterpolationMap } from "./StringInterpolationMap";

export interface TextOptions {
  /** Text to be displayed */
  text?: string;
  /** Name of font to use for text. Must have been previously loaded */
  fontName?: string;
  /** Color of text. Default is Constants.DEFAULT_FONT_COLOR (WebColors.Black) */
  fontColor?: RgbaColor;
  /** Size of text. Default is Constants.DEFAULT_FONT_SIZE (16) */
  fontSize?: number;
  /** Map of placeholders to values for use in string interpolation during localization. */
  interpolation?: StringInterpolationMap;
  /** If true, try to use a localized version of the text. Default is true. */
  localize?: boolean;
}
