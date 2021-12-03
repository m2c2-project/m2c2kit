import { Globals } from "./Globals";
import { ttfInfo } from "./ttfInfo.js";
import { FontMgr, Typeface } from "canvaskit-wasm";
import { FontData } from "./FontData";

export class FontManager {
  static _fontMgr?: FontMgr;
  private static _typefaces: Record<string, Typeface> = {};

  static _getTypeface(name: string): Typeface {
    return this._typefaces[name];
  }

  static FetchFontsAsArrayBuffers(
    fontUrls: Array<string>
  ): Promise<FontData>[] {
    const fetchFontsPromises = fontUrls.map((fontUrl) =>
      fetch(fontUrl)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => ({
          fontUrl: fontUrl,
          fontArrayBuffer: arrayBuffer,
        }))
    );
    return fetchFontsPromises;
  }

  static LoadFonts(fonts: Array<ArrayBuffer>): void {
    this._fontMgr = Globals.canvasKit.FontMgr.FromData(...fonts) ?? undefined;
    if (this._fontMgr === undefined) {
      throw new Error("error loading fonts");
    }
    fonts.forEach((font) => {
      const result = ttfInfo(new DataView(font));
      const fontFamily = result.meta.property
        .filter((p: { name: string; text: string }) => p.name === "font-family")
        .find(Boolean)?.text;
      if (fontFamily === undefined || this._fontMgr === undefined) {
        throw new Error("error loading fonts");
      }
      console.log("font loaded. font family: " + fontFamily);
      const typeface =
        Globals.canvasKit.Typeface.MakeFreeTypeFaceFromData(font);
      if (!typeface) {
        throw new Error("Can't make typeface");
      }
      //const typeface = this._fontMgr.MakeTypefaceFromData(font);
      this._typefaces[fontFamily] = typeface;
    });
  }
}
