import { RgbaColor } from "./RgbaColor";

export interface TextOptions {
  /** Text to be displayed */
  text?: string;
  /** Name of font to use for text. Must have been previously loaded */
  fontName?: string;
  /** Color of text. Default is Constants.DEFAULT_FONT_COLOR (WebColors.Black) */
  fontColor?: RgbaColor;
  /** Size of text. Default is Constants.DEFAULT_FONT_SIZE (16) */
  fontSize?: number;
}
