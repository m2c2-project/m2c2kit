import { ttfInfo } from "./ttfInfo.js";
import { CanvasKit, FontMgr, Typeface } from "canvaskit-wasm";
import { FontData } from "./FontData";
import { GameFontUrls } from "./GameFontUrls";

/**
 * This class contains all the fonts for all the games in the activity.
 * Fonts have been converted to canvaskit Typeface
 */
class GameTypefaces {
  [gameUuid: string]: {
    [fontFamily: string]: Typeface;
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
  private gameTypefaces = new GameTypefaces();
  private allGamesFontData?: FontData[];

  /**
   * Gets a typeface that was previously loaded for the specified game.
   *
   * @param gameUuid
   * @param fontFamily
   * @returns the requested Typeface
   */
  getTypeface(gameUuid: string, fontFamily: string): Typeface {
    return this.gameTypefaces[gameUuid][fontFamily];
  }

  /**
   * Gets names of fonts loaded for the specified game.
   *
   * @param gameUuid
   * @returns array of font family names
   */
  getFontNames(gameUuid: string): Array<string> {
    if (!this.gameTypefaces[gameUuid]) {
      return new Array<string>();
    }
    return Object.keys(this.gameTypefaces[gameUuid]);
  }

  /**
   * Fetches all fonts for all games.
   *
   * @param allGamesFontUrls
   * @returns
   */
  fetchFonts(allGamesFontUrls: Array<GameFontUrls>) {
    const fetchFontsPromises = new Array<Promise<FontData[]>>();
    allGamesFontUrls.forEach((gameFontUrls) => {
      const fetchOneGameFontsPromise = this.fetchGameFontsAsArrayBuffers(
        gameFontUrls.uuid,
        gameFontUrls.fontUrls
      );
      fetchFontsPromises.push(fetchOneGameFontsPromise);
    });
    return Promise.all(fetchFontsPromises).then((nestedAllGamesFontData) => {
      this.allGamesFontData = nestedAllGamesFontData.flat();
    });
  }

  /**
   * Takes the fonts, which have been previously fetched and converted into
   * Array Buffers using FontManager.fetchFonts(), and makes them available
   * to our engine
   */
  loadAllGamesFontData() {
    if (!this.allGamesFontData) {
      throw new Error("allGamesFontData is undefined");
    }
    const gameUuids = Array.from(
      new Set(this.allGamesFontData.map((fd) => fd.gameUuid))
    );
    gameUuids.forEach((gameUuid) => {
      if (!this.allGamesFontData) {
        throw new Error("allGamesFontData is undefined");
      }
      const gameFontData = this.allGamesFontData
        .filter((fd) => fd.gameUuid === gameUuid)
        .map((fd) => fd.fontArrayBuffer);
      this.loadGameFonts(gameUuid, gameFontData);
    });
  }

  /**
   * For the specified game, fetches all fonts in the array of urls and
   * stores fonts as array buffers.
   *
   * @param gameUuid
   * @param fontUrls - array of font urls
   * @returns
   */
  private fetchGameFontsAsArrayBuffers(
    gameUuid: string,
    fontUrls: Array<string>
  ): Promise<FontData[]> {
    const fetchFontsPromises = fontUrls.map((fontUrl) =>
      fetch(fontUrl)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => ({
          gameUuid: gameUuid,
          fontUrl: fontUrl,
          fontArrayBuffer: arrayBuffer,
        }))
    );
    return Promise.all(fetchFontsPromises);
  }

  /**
   * For the specified game, loads all fonts from array buffers and makes
   * fonts available within canvaskit as a Typeface
   *
   * @param gameUuid
   * @param fonts - array of fonts in array buffer form
   */
  private loadGameFonts(gameUuid: string, fonts: Array<ArrayBuffer>): void {
    if (!this.canvasKit) {
      throw new Error("canvasKit undefined");
    }
    this.fontMgr = this.canvasKit.FontMgr.FromData(...fonts) ?? undefined;
    if (!this.fontMgr) {
      throw new Error("error creating FontMgr while loading fonts");
    }
    fonts.forEach((font) => {
      const result = ttfInfo(new DataView(font));
      const fontFamily = result.meta.property
        .filter((p: { name: string; text: string }) => p.name === "font-family")
        .find(Boolean)?.text;
      if (fontFamily === undefined) {
        throw new Error(
          "error loading fonts. could not get font-family from font array buffer"
        );
      }
      console.log("font loaded. font family: " + fontFamily);
      if (!this.canvasKit) {
        throw new Error("canvasKit undefined");
      }
      const typeface = this.canvasKit.Typeface.MakeFreeTypeFaceFromData(font);
      if (!typeface) {
        throw new Error("cannot make typeface from font array buffer");
      }

      if (!this.gameTypefaces[gameUuid]) {
        this.gameTypefaces[gameUuid] = {};
      }
      this.gameTypefaces[gameUuid][fontFamily] = typeface;
    });
  }
}
