import { WebColors } from "./WebColors";
import { RgbaColor } from "./RgbaColor";
import { ModuleMetadata } from "./ModuleMetadata";

/**
 * Reasonable defaults to use if values are not specified.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Constants {
  /** Size of the font showing frames per second */
  public static readonly FPS_DISPLAY_TEXT_FONT_SIZE = 12;
  /** Color of the font showing frames per second */
  public static readonly FPS_DISPLAY_TEXT_COLOR: RgbaColor = [0, 0, 0, 0.5];
  /** Frequency, in milliseconds, at which to update frames per second metric shown on the screen */
  public static readonly FPS_DISPLAY_UPDATE_INTERVAL = 1000;
  /** Maximum number of activity metrics to log. */
  public static readonly MAXIMUM_RECORDED_ACTIVITY_METRICS = 32;
  /** The frames per second will be logged in game metrics if the FPS is lower than this value */
  public static readonly FPS_METRIC_REPORT_THRESHOLD = 59;
  /** Scene color, if none is specified. */
  public static readonly DEFAULT_SCENE_BACKGROUND_COLOR = WebColors.White;
  /** Shape fill color, if none is specified. */
  public static readonly DEFAULT_SHAPE_FILL_COLOR = WebColors.Red;
  /** Color of paths in a shape, if none is specified. */
  public static readonly DEFAULT_PATH_STROKE_COLOR = WebColors.Red;
  /** Line width of paths in a shape, if none is specified. */
  public static readonly DEFAULT_PATH_LINE_WIDTH = 2;
  /** Color of text in Label and TextLine, if none is specified. */
  public static readonly DEFAULT_FONT_COLOR = WebColors.Black;
  /** Font size in Label and TextLine, if none is specified. */
  public static readonly DEFAULT_FONT_SIZE = 16;
  public static readonly LIMITED_FPS_RATE = 5;
  public static readonly FREE_NODES_SCENE_NAME = "__freeNodesScene";
  public static readonly OUTGOING_SCENE_NAME = "__outgoingScene";
  public static readonly OUTGOING_SCENE_SPRITE_NAME = "__outgoingSceneSprite";
  public static readonly OUTGOING_SCENE_IMAGE_NAME = "__outgoingSceneSnapshot";
  public static readonly SESSION_INITIALIZATION_POLLING_INTERVAL_MS = 50;
  /** Placeholder that will be populated during the build process. */
  public static readonly MODULE_METADATA_PLACEHOLDER: ModuleMetadata = {
    name: "",
    version: "",
    dependencies: {},
  };
  public static readonly DEFAULT_ROOT_ELEMENT_ID = "m2c2kit";
}
