import { ttfInfo } from "./ttfInfo.js";
import { CanvasKit, FontMgr, Typeface } from "canvaskit-wasm";
import { FontData } from "./FontData";

/**
 * This class contains all the fonts for all the games in the activity.
 * Fonts have been converted to canvaskit Typeface
 */
class GameTypefaces {
  [gameUuid: string]: {
    [fontFamily: string]: Typeface;
  };
}

export class FontManager {
  canvasKit?: CanvasKit;
  fontMgr?: FontMgr;
  private gameTypefaces = new GameTypefaces();

  /**
   * Gets a typeface that was previously loaded for this game.
   *
   * @param gameUuid
   * @param fontFamily
   * @returns the requested Typeface
   */
  getTypeface(gameUuid: string, fontFamily: string): Typeface {
    return this.gameTypefaces[gameUuid][fontFamily];
  }

  /**
   * For the specified game, fetches all fonts in the array of urls and stores fonts as array buffers.
   *
   * @param gameUuid
   * @param fontUrls - array of font urls
   * @returns
   */
  FetchGameFontsAsArrayBuffers(
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
   * For the specified game, loads all fonts from array buffers and makes fonts available within canvaskit.
   *
   * @param gameUuid
   * @param fonts - array of fonts in array buffer form
   */
  LoadGameFonts(gameUuid: string, fonts: Array<ArrayBuffer>): void {
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
