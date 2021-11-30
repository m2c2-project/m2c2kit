import { DrawableOptions } from "./DrawableOptions";
import { EntityOptions } from "./EntityOptions";
import { RgbaColor } from "./RgbaColor";
import { TextOptions } from "./TextOptions";
import { LabelHorizontalAlignmentMode } from ".";

export interface LabelOptions
  extends EntityOptions,
    DrawableOptions,
    TextOptions {
  horizontalAlignmentMode?: LabelHorizontalAlignmentMode;
  preferredMaxLayoutWidth?: number;
  backgroundColor?: RgbaColor;
}
