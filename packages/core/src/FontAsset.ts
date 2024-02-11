import { SharedFont } from "./SharedFontData";

/**
 * Font asset to use in the game.
 */
export interface FontAsset {
  /** Name of the font to use when referring to it within m2c2kit */
  fontName: string;
  /** URL of font (TrueType font) to load */
  url: string;
  /** If true, the font will not be fully loaded until it is needed. Default
   * is false. Lazy loading is useful for fonts involved in localization.
   * These should be lazy loaded because they may not be needed.
   */
  lazy?: boolean;
  /** Font url and raw data that has been shared with other games in the session. Undefined if this font was not shared. @internal For m2c2kit library use only */
  sharedFont?: SharedFont;
}
