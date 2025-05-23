import { DrawableOptions } from "./DrawableOptions";
import { M2NodeOptions } from "./M2NodeOptions";
import { RgbaColor } from "./RgbaColor";
import { TextOptions } from "./TextOptions";
import { LabelHorizontalAlignmentMode } from "./LabelHorizontalAlignmentMode";

export interface LabelOptions
  extends M2NodeOptions,
    DrawableOptions,
    TextOptions {
  /** Text to be displayed. When operating with localization, text within double square brackets will be replaced with the value of the key in the translation. For example, if the text is `The translated word is [[RED]]`, `[[RED]]` will be replaced with the translation. If no localization is used, or a translation for the key is missing, then the text will be rendered as is. Tags for bold (`b`), italic (`i`), underline (`u`), overline(`o`), and strikethrough (`s`) are supported, e.g., `<b><u>Bold and underline</u></b>`. Note that while bold and italic and be combined, only one of underline, overline, and strikethrough can be used on a text segment. */
  text?: string;
  /** Horizontal alignment of label text. see {@link LabelHorizontalAlignmentMode}. Default is LabelHorizontalAlignmentMode.center  */
  horizontalAlignmentMode?: LabelHorizontalAlignmentMode;
  /** Maximum width of label text before wrapping occurs. Default is the canvas width */
  preferredMaxLayoutWidth?: number;
  /** Background color  of label text. Default is no background color */
  backgroundColor?: RgbaColor;
  /** Names of multiple fonts to use for text. For example, if a text font and an emoji font are to be used together. Must have been previously loaded */
  fontNames?: Array<string>;
}
