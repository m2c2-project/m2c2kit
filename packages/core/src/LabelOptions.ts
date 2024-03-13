import { DrawableOptions } from "./DrawableOptions";
import { M2NodeOptions } from "./M2NodeOptions";
import { RgbaColor } from "./RgbaColor";
import { TextOptions } from "./TextOptions";
import { LabelHorizontalAlignmentMode } from "./LabelHorizontalAlignmentMode";

export interface LabelOptions
  extends M2NodeOptions,
    DrawableOptions,
    TextOptions {
  /** Horizontal alignment of label text. see {@link LabelHorizontalAlignmentMode}. Default is LabelHorizontalAlignmentMode.center  */
  horizontalAlignmentMode?: LabelHorizontalAlignmentMode;
  /** Maximum width of label text before wrapping occurs. Default is the canvas width */
  preferredMaxLayoutWidth?: number;
  /** Background color  of label text. Default is no background color */
  backgroundColor?: RgbaColor;
  /** Names of multiple fonts to use for text. For example, if a text font and an emoji font are to be used together. Must have been previously loaded */
  fontNames?: Array<string>;
}
