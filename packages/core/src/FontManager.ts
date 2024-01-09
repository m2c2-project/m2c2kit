import { FontAsset } from "./FontAsset";
import ttfInfo from "./ttfInfo";
import { CanvasKit, FontMgr, Typeface } from "canvaskit-wasm";
import { FontData } from "./FontData";
import { Game } from "./Game";
import { CanvasKitHelpers } from "./CanvasKitHelpers";

/**
 * Class for fetching, loading, and providing fonts to games.
 *
 * @remarks FOR INTERNAL USE ONLY
 */
export class FontManager {
  private canvasKit: CanvasKit;
  fontMgr?: FontMgr;
  readonly gameTypefaces: GameTypefaces = {};
  private fontData: Array<FontData> = new Array<FontData>();
  private game: Game;

  constructor(game: Game) {
    this.game = game;
    this.canvasKit = game.canvasKit;
  }

  /**
   * Frees up resources allocated by the FontManager
   *
   * @remarks This will be done automatically by the m2c2kit library; the
   * end-user must not call this. FOR INTERNAL USE ONLY.
   */
  dispose(): void {
    const typefaces = Object.entries(this.gameTypefaces).map(
      ([, val]) => val.typeface,
    );
    CanvasKitHelpers.Dispose([...typefaces, this.fontMgr]);
  }

  /**
   * Gets a typeface that was previously loaded.
   *
   * @param fontName
   * @returns the requested Typeface
   */
  getTypeface(fontName: string): Typeface {
    return this.gameTypefaces[fontName].typeface;
  }

  /**
   * Gets names of fonts loaded.
   *
   * @returns array of font names
   */
  getFontNames(): Array<string> {
    return Object.keys(this.gameTypefaces);
  }

  /**
   * Fetches all fonts.
   *
   * @remarks Uses browser fetch to get font data from the font assets' URLs.
   *
   * @param fontAssets - array of FontAsset objects (names and font urls)
   * @returns Promise<void[]>
   */
  fetchFonts(fontAssets: FontAsset[]) {
    /**
     * note: be careful to handle the case where a game has no fonts
     */
    const fontsToFetch = fontAssets
      .map((font, i) => {
        return {
          fontUrl: font.url,
          fontName: font.fontName,
          isDefault: i === 0,
        };
      })
      .filter((f) => f !== undefined);

    // no fonts to fetch
    if (fontsToFetch.length === 0) {
      /**
       * make sure the promise resolves in the same way as if we had fetched
       * fonts
       */
      return Promise.all([Promise.resolve()]);
    }

    const fetchFontsPromises = fontsToFetch.map(async (font) => {
      const fontUrl = this.game.prependAssetsGameIdUrl(font.fontUrl);

      const response = await fetch(fontUrl);
      const arrayBuffer = await response.arrayBuffer();
      this.fontData.push({
        fontFamilyName: "",
        fontName: font.fontName,
        fontUrl: font.fontUrl,
        fontArrayBuffer: arrayBuffer,
        isDefault: font.isDefault,
      });
    });
    return Promise.all(fetchFontsPromises);
  }

  /**
   * Loads raw font data into to canvaskit.
   *
   * @remarks Takes the fonts, which have been previously fetched and
   * converted into Array Buffers using FontManager.fetchFonts(), and
   * makes them available to canvaskit by creating Typefaces.
   */
  loadFonts() {
    // note: be careful to handle the case where no games in the session
    // have fonts to load
    if (this.fontData.length === 0) {
      return;
    }
    this.fontMgr =
      this.canvasKit.FontMgr.FromData(
        ...this.fontData.map((f) => f.fontArrayBuffer),
      ) ?? undefined;
    if (!this.fontMgr) {
      throw new Error("error creating FontMgr while loading fonts");
    }

    this.fontData.forEach((font) => {
      const result = ttfInfo(new DataView(font.fontArrayBuffer)) as any;
      /**
       * The TTF file contains metadata about the font, including the
       * font-family. The font-family, and other information such as
       * font-subfamily and version, is part of the "Name Table". Note that
       * the encoding of string values in the name table is not fixed(!),
       * but is specified by the Platform identifier code and Specific
       * identifier code. It seems like modern TTF files have the name
       * table strings encoded in UTF-16BE. Therefore, we will assume
       * this. However, older TTF fonts might have a different Platform
       * Identifier, e.g., if the Platform Identifier is 1, then that is
       * Macintosh and the encoding is MacRoman (but this is now discouraged).
       *
       * The ttfInfo function does not return the Platform Identifier, so if
       * we want to support or check for older TTF files, we will need to add
       * that functionality to ttfInfo.
       *
       * See the following for more information:
       * https://developer.apple.com/fonts/TrueType-Reference-Manual/RM06/Chap6name.html
       */
      const fontFamilyUtf16Be = result.meta.property
        .filter((p: { name: string; text: string }) => p.name === "font-family")
        .find(Boolean)?.text;
      if (fontFamilyUtf16Be === undefined) {
        throw new Error(
          `error loading fonts. could not get font-family name from font at ${font.fontUrl}`,
        );
      }

      // Decode font-family string value
      const arr = new Uint8Array(fontFamilyUtf16Be.length);
      for (let i = 0; i < arr.length; i++) {
        arr[i] = (fontFamilyUtf16Be as string).charCodeAt(i);
      }
      const fontFamily = new TextDecoder("utf-16be").decode(arr);

      const typeface = this.canvasKit.Typeface.MakeFreeTypeFaceFromData(
        font.fontArrayBuffer,
      );
      if (!typeface) {
        throw new Error("cannot make typeface from font array buffer");
      }

      const gameId = this.game.id;

      console.log(
        `⚪ typeface ${font.fontName} ${
          font.isDefault ? "(default) " : ""
        }created from font-family ${fontFamily} for game ${gameId}`,
      );

      this.gameTypefaces[font.fontName] = {
        fontFamily: fontFamily,
        typeface: typeface,
        isDefault: font.isDefault,
      };
    });
  }
}

/**
 * Contains all the fonts for the game, loaded into canvaskit Typefaces.
 *
 * @remarks `fontName` is how the user will refer to the font in the game.
 * `fontFamily` is the name of the font as it was specified within the TTF file.
 * We must retain the `fontFamily` name because we must provide `fontFamily` (not
 * `fontName`!) to canvaskit when rendering paragraphs.
 */
interface GameTypefaces {
  [fontName: string]: {
    fontFamily: string;
    typeface: Typeface;
    isDefault: boolean;
  };
}
