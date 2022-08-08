import { RgbaColor } from "./RgbaColor";
import { BrowserImage } from "./BrowserImage";
import { TrialSchema } from "./TrialSchema";
import { GameParameters } from "./GameParameters";

/**
 * Options to specify HTML canvas, set game canvas size, and load game assets.
 */
export interface GameOptions {
  /** Human-friendly name of this game */
  name: string;
  /** Short identifier of this game; unique among published games and url-friendly (no spaces, special characters, or slashes)*/
  id: string;
  /** Version of this game */
  version: string;
  /** Uri (repository, webpage, or other location where full information about the game can be found) */
  uri?: string;
  /** Brief description of game */
  shortDescription?: string;
  /** Full description of game */
  longDescription?: string;
  /** Id of the HTML canvas that game will be drawn on. If not provided, the first canvas found will be used */
  canvasId?: string;
  /** Width of game canvas */
  width: number;
  /** Height of game canvas */
  height: number;
  /** Stretch to fill screen? Default is false */
  stretch?: boolean;
  /** Schema of trial data; JSON object where key is variable name, value is data type */
  trialSchema?: TrialSchema;
  /** Default game parameters; JSON object where key is the game parameter, value is default value */
  parameters?: GameParameters;
  /** String array of urls from which to load fonts. The first element will be the default font */
  fontUrls?: Array<string>;
  /** Array of BrowserImage objects to render and load */
  images?: Array<BrowserImage>;
  /** Show FPS in upper left corner? Default is false */
  showFps?: boolean;
  /** Color of the html body, if the game does not fill the screen. Useful for showing scene boundaries. Default is the scene background color */
  bodyBackgroundColor?: RgbaColor;
  /** The FPS will be logged in game metrics if the FPS is lower than this value. Default is 59, as defined in Constants.FPS_METRIC_REPORT_THRESHOLD */
  fpsMetricReportThreshold?: number;
  /** Adapt execution for unit testing? Default is false */
  _unitTesting?: boolean;
}
