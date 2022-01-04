import { RgbaColor } from "./RgbaColor";
import { SvgImage } from "./SvgImage";

/**
 * Options to specify HTML canvas, set game canvas size, and load game assets.
 */

export interface GameOptions {
  /** user-friendly name of this game */
  name: string;
  /** version of this game */
  version: string;
  /** Id of the HTML canvas that game will be drawn on. If not provided, the first canvas found will be used */
  canvasId?: string;
  /** Width of game canvas */
  width: number;
  /** Height of game canvas */
  height: number;
  /** Stretch to fill screen? Default is false */
  stretch?: boolean;
  /** Schema of trial data; JSON object where key is variable name, value is data type */
  trialSchema?: object;
  /** Default game parameters; JSON object where key is the game parameter, value is default value */
  parameters?: any;
  /** String array of urls from which to load fonts. The first element will be the default font */
  fontUrls?: Array<string>;
  /** Array of SvgImage objects to render and load */
  svgImages?: SvgImage[];
  /** Show FPS in upper left corner? Default is false */
  showFps?: boolean;
  /** Color of the html body, if the game does not fill the screen. Useful for showing scene boundaries. Default is the scene background color */
  bodyBackgroundColor?: RgbaColor;
  /** Adapt execution for unit testing? Default is false */
  _unitTesting?: boolean;
}
