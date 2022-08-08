import { WebColors } from "./WebColors";
import { RgbaColor } from "./RgbaColor";

/**
 * Reasonable defaults to use if values are not specified.
 */
export class Constants {
  public static readonly DEFAULT_CANVASKITWASM_URL = "assets/canvaskit.wasm";
  public static readonly FPS_DISPLAY_TEXT_FONT_SIZE = 12;
  public static readonly FPS_DISPLAY_TEXT_COLOR: RgbaColor = [0, 0, 0, 0.5];
  public static readonly FPS_DISPLAY_UPDATE_INTERVAL = 1000;
  /** The FPS will be logged in game metrics if the FPS is lower than this value */
  public static readonly FPS_METRIC_REPORT_THRESHOLD = 59;
  public static readonly DEFAULT_SCENE_BACKGROUND_COLOR = WebColors.White;
  public static readonly DEFAULT_SHAPE_FILL_COLOR = WebColors.Red;
  public static readonly DEFAULT_FONT_COLOR = WebColors.Black;
  public static readonly DEFAULT_FONT_SIZE = 16;
  public static readonly LIMITED_FPS_RATE = 5;
  public static readonly FREE_ENTITIES_SCENE_NAME = "__freeEntitiesScene";
  public static readonly OUTGOING_SCENE_NAME = "__outgoingScene";
  public static readonly OUTGOING_SCENE_SPRITE_NAME = "__outgoingSceneSprite";
  public static readonly OUTGOING_SCENE_IMAGE_NAME = "__outgoingSceneSnapshot";
}
