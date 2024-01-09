/**
 * FontData holds metadata about the font (names, url) and the raw bytes of
 * the font TTF in an ArrayBuffer. This ArrayBuffer font data cannot be used
 * by canvaskit directly. These data are later used to create a canvaskit
 * TypeFace in FontManager.loadFonts().
 */
export interface FontData {
  fontUrl: string;
  fontName: string;
  fontFamilyName: string;
  fontArrayBuffer: ArrayBuffer;
  isDefault: boolean;
}
