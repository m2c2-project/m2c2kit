import ttfInfo from "./ttfInfo";
import { CanvasKit, FontMgr, Typeface } from "canvaskit-wasm";
import { FontData } from "./FontData";
import { Game } from "./Game";
import { Session } from "./Session";

/**
 * This class contains all the fonts for all the games in the activity.
 * Fonts have been converted to canvaskit Typeface.
 *
 * @remarks fontName is how the user will refer to the font in the game.
 * fontFamily is the name of the font as it was specified within the TTF file.
 * We must retain the fontFamily name because we must provide fontFamily (not
 * fontName!) to canvaskit when rendering paragraphs.
 */
class GameTypefaces {
  [gameUuid: string]: {
    [fontName: string]: {
      fontFamily: string;
      typeface: Typeface;
      isDefault: boolean;
    };
  };
}

/**
 * Class for loading, preparing, and providing fonts to games.
 *
 * @remarks FOR INTERNAL USE ONLY
 */
export class FontManager {
  canvasKit?: CanvasKit;
  fontMgr?: FontMgr;
  gameTypefaces = new GameTypefaces();
  fontData: Array<FontData> = new Array<FontData>();
  session: Session;
  games?: Array<Game>;

  constructor(session: Session) {
    this.session = session;
  }

  /**
   * Gets a typeface that was previously loaded for the specified game.
   *
   * @param gameUuid
   * @param fontName
   * @returns the requested Typeface
   */
  getTypeface(gameUuid: string, fontName: string): Typeface {
    return this.gameTypefaces[gameUuid][fontName].typeface;
  }

  /**
   * Gets names of fonts loaded for the specified game.
   *
   * @param gameUuid
   * @returns array of font names
   */
  getFontNames(gameUuid: string): Array<string> {
    if (!this.gameTypefaces[gameUuid]) {
      return new Array<string>();
    }
    return Object.keys(this.gameTypefaces[gameUuid]);
  }

  /**
   * Fetches all fonts games.
   *
   * @param games - array of games
   * @returns
   */
  fetchFonts(games: Array<Game>) {
    this.games = games;
    /**
     * note: be careful to handle the case where a game has no fonts
     */
    const fontsToFetch = games
      .flatMap((game) =>
        // no fonts in game if game.options.fonts is undefined
        game.options.fonts?.map((font, i) => {
          return {
            gameUuid: game.uuid,
            fontUrl: font.url,
            fontName: font.fontName,
            isDefault: i === 0,
          };
        })
      )
      .filter((f) => f !== undefined);

    // no fonts to fetch
    if (fontsToFetch.length === 0) {
      /**
       * make sure the promise resolves in the same way as if we had fetched
       * fonts
       */
      return Promise.all([Promise.resolve()]);
    }

    const fetchFontsPromises = fontsToFetch.map((font) => {
      const game = games.filter((g) => g.uuid === font.gameUuid).find(Boolean);
      const fontUrl = game.prependAssetsGameIdUrl(font.fontUrl);

      return fetch(fontUrl)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => {
          this.fontData.push({
            gameUuid: font.gameUuid,
            fontFamilyName: "",
            fontName: font.fontName,
            fontUrl: font.fontUrl,
            fontArrayBuffer: arrayBuffer,
            isDefault: font.isDefault,
          });
        });
    });
    return Promise.all(fetchFontsPromises);
  }

  /**
   * Takes the fonts, which have been previously fetched and converted into
   * Array Buffers using FontManager.fetchFonts(), and makes them available
   * to our engine by creating canvaskit Typefaces.
   */
  loadAllGamesFontData() {
    // note: be careful to handle the case where no games in the session
    // have fonts to load
    if (this.fontData.length === 0) {
      return;
    }
    if (!this.canvasKit) {
      throw new Error("canvasKit undefined");
    }
    this.fontMgr =
      this.canvasKit.FontMgr.FromData(
        ...this.fontData.map((f) => f.fontArrayBuffer)
      ) ?? undefined;
    if (!this.fontMgr) {
      throw new Error("error creating FontMgr while loading fonts");
    }

    this.fontData.forEach((font) => {
      const result = ttfInfo(new DataView(font.fontArrayBuffer));
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
          `error loading fonts. could not get font-family name from font at ${font.fontUrl}`
        );
      }

      // Decode font-family string value
      const arr = new Uint8Array(fontFamilyUtf16Be.length);
      for (let i = 0; i < arr.length; i++) {
        arr[i] = (fontFamilyUtf16Be as string).charCodeAt(i);
      }
      const fontFamily = new TextDecoder("utf-16be").decode(arr);

      if (!this.canvasKit) {
        throw new Error("canvasKit undefined");
      }
      const typeface = this.canvasKit.Typeface.MakeFreeTypeFaceFromData(
        font.fontArrayBuffer
      );
      if (!typeface) {
        throw new Error("cannot make typeface from font array buffer");
      }

      const gameId = this.games?.find((g) => g.uuid === font.gameUuid)?.id;

      console.log(
        `⚪ typeface ${font.fontName} ${
          font.isDefault ? "(default) " : ""
        }created from font-family ${fontFamily} for game ${gameId}`
      );

      if (!this.gameTypefaces[font.gameUuid]) {
        this.gameTypefaces[font.gameUuid] = {};
      }
      this.gameTypefaces[font.gameUuid][font.fontName] = {
        fontFamily: fontFamily,
        typeface: typeface,
        isDefault: font.isDefault,
      };
    });
  }
}
