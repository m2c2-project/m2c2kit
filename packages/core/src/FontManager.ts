import "./Globals";
import { ttfInfo } from "./ttfInfo.js";
import { CanvasKit, FontMgr, Typeface } from "canvaskit-wasm";
import { FontData } from "./FontData";

export class FontManager {
  canvasKit?: CanvasKit;
  _fontMgr?: FontMgr;
  private _typefaces: Record<string, Typeface> = {};

  _getTypeface(name: string): Typeface {
    return this._typefaces[name];
  }

  FetchFontsAsArrayBuffers(fontUrls: Array<string>): Promise<FontData>[] {
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

  LoadFonts(fonts: Array<ArrayBuffer>): void {
    if (!this.canvasKit) {
      throw new Error("canvasKit undefined");
    }
    this._fontMgr = this.canvasKit.FontMgr.FromData(...fonts) ?? undefined;
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
      if (!this.canvasKit) {
        throw new Error("canvasKit undefined");
      }
      const typeface = this.canvasKit.Typeface.MakeFreeTypeFaceFromData(font);
      if (!typeface) {
        throw new Error("Can't make typeface");
      }
      this._typefaces[fontFamily] = typeface;
    });
  }
}
