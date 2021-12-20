import { DrawableOptions } from "./DrawableOptions";
import { EntityOptions } from "./EntityOptions";
import { RgbaColor } from "./RgbaColor";
import { TextOptions } from "./TextOptions";
import { LabelHorizontalAlignmentMode } from "./LabelHorizontalAlignmentMode";

export interface LabelOptions
  extends EntityOptions,
    DrawableOptions,
    TextOptions {
  /** Horizontal alignment of label text. see {@link LabelHorizontalAlignmentMode}. Default is LabelHorizontalAlignmentMode.center  */
  horizontalAlignmentMode?: LabelHorizontalAlignmentMode;
  /** Maximum width of label text before wrapping occurs. Default is the canvas width */
  preferredMaxLayoutWidth?: number;
  /** Background color  of label text. Default is no background color */
  backgroundColor?: RgbaColor;
}
