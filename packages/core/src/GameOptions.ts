import { RgbaColor } from "./RgbaColor";
import { BrowserImage } from "./BrowserImage";
import { TrialSchema } from "./TrialSchema";
import { GameParameters } from "./GameParameters";
import { FontAsset } from "./FontAsset";
import { ModuleMetadata } from "./ModuleMetadata";
import { SoundAsset } from "./SoundAsset";
import { LocalizationOptions } from "./LocalizationOptions";

/**
 * Options to specify HTML canvas, set game canvas size, and load game assets.
 */
export interface GameOptions extends LocalizationOptions {
  /** Human-friendly name of this game */
  name: string;
  /** Short identifier of this game; unique among published games and url-friendly (no spaces, special characters, or slashes). */
  id: string;
  /** Persistent unique identifier (UUID) of this game; unique among published games. The m2c2kit CLI will generate this property automatically, and you should not change it. If not using the CLI, use a website like https://www.uuidgenerator.net/version4 to generate this value. */
  publishUuid: string;
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
  /** Font assets to use. The first element will be the default font */
  fonts?: Array<FontAsset>;
  /** Array of BrowserImage objects to render and load */
  images?: Array<BrowserImage>;
  /** Array of SoundAsset objects to fetch and decode */
  sounds?: Array<SoundAsset>;
  /** Show FPS in upper left corner? Default is false */
  showFps?: boolean;
  /** Color of the html body, if the game does not fill the screen. Useful for showing scene boundaries. Default is the scene background color */
  bodyBackgroundColor?: RgbaColor;
  /** Maximum number of activity metrics to log. */
  maximumRecordedActivityMetrics?: number;
  /** The FPS will be logged in game metrics if the FPS is lower than this value. Default is 59, as defined in Constants.FPS_METRIC_REPORT_THRESHOLD */
  fpsMetricReportThreshold?: number;
  /** Advance through time step-by-step, for development and debugging */
  timeStepping?: boolean;
  /** Show controls for replaying and viewing the event store? Default is false */
  showEventStoreControls?: boolean;
  /** Should the game events be saved to the event store? Default is false */
  recordEvents?: boolean;
  /** Show logs for WebGl activity? */
  logWebGl?: boolean;
  /** Should games within a session share wasm and font assets that have identical filenames, in order to reduce bandwidth? Default is true. */
  shareAssets?: boolean;
  /** Game's module name, version, and dependencies. @internal For m2c2kit library use only */
  moduleMetadata?: ModuleMetadata;
}
