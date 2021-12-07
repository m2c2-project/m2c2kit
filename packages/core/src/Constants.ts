import { WebColors } from "./WebColors";
import { RgbaColor } from "./RgbaColor";

/**
 * Reasonable defaults to use if values are not specified.
 */
export class Constants {
  public static readonly FPS_DISPLAY_TEXT_FONT_SIZE = 12;
  public static readonly FPS_DISPLAY_TEXT_COLOR: RgbaColor = [0, 0, 0, 0.5];
  public static readonly FPS_DISPLAY_UPDATE_INTERVAL = 500;
  public static readonly DEFAULT_SCENE_BACKGROUND_COLOR = WebColors.WhiteSmoke;
  public static readonly DEFAULT_SHAPE_FILL_COLOR = WebColors.Red;
  public static readonly DEFAULT_FONT_COLOR = WebColors.Black;
  public static readonly DEFAULT_FONT_SIZE = 16;
  public static readonly LIMITED_FPS_RATE = 5;
}