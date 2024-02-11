import { FontAsset } from "./FontAsset";
import { CanvasKit, Typeface, TypefaceFontProvider } from "canvaskit-wasm";
import { Game } from "./Game";
import { CanvasKitHelpers } from "./CanvasKitHelpers";
import { M2Font, M2FontStatus } from "./M2Font";
import { M2c2KitHelpers } from "./M2c2KitHelpers";
import { GameBaseUrls } from "./GameBaseUrls";

/**
 * Fetches, loads, and provides fonts to the game.
 *
 * @internal For m2c2kit library use only
 */
export class FontManager {
  fonts: Record<string, M2Font> = {};
  provider: TypefaceFontProvider;
  private canvasKit: CanvasKit;
  private game: Game;
  private baseUrls: GameBaseUrls;

  constructor(game: Game, baseUrls: GameBaseUrls) {
    this.game = game;
    this.baseUrls = baseUrls;
    this.canvasKit = game.canvasKit;
    this.provider = this.canvasKit.TypefaceFontProvider.Make();
  }

  /**
   * Loads font assets and makes them ready to use during the game initialization.
   *
   * @internal For m2c2kit library use only
   *
   * @remarks Typically, a user won't call this because the m2c2kit
   * framework will call this automatically.
   *
   * @param fonts - array of FontAsset objects (name and url)
   */
  initializeFonts(fonts: Array<FontAsset> | undefined): Promise<void> {
    return this.loadFonts(fonts ?? []);
  }

  /**
   * Loads an array of fonts and makes them ready for the game.
   *
   * @param fonts - an array of {@link FontAsset}
   * @returns A promise that completes when all fonts have loaded
   */
  async loadFonts(fonts: Array<FontAsset>): Promise<void> {
    if (fonts.length === 0) {
      return;
    }
    const prepareFontsPromises = fonts.map((font, i) => {
      /**
       * If the url has a scheme, then we do not alter the url. Otherwise, we
       * prepend the game assets base URL and look for the full URL in the
       * manifest.
       */
      let url = font.url;
      if (!M2c2KitHelpers.urlHasScheme(font.url)) {
        url = M2c2KitHelpers.getUrlFromManifest(
          this.game,
          `${this.baseUrls.assets}/${font.url}`,
        );
      }
      const m2Font: M2Font = {
        fontName: font.fontName,
        typeface: undefined,
        /**
         * sharedFont is undefined if the font is not shared with other games
         * in the session. Otherwise, it has the already loaded font data and
         * the url from which it was loaded.
         */
        data: font.sharedFont?.data,
        default: i === 0,
        url: font.sharedFont?.url ?? url,
        status: font.lazy ? M2FontStatus.Deferred : M2FontStatus.Loading,
      };
      this.fonts[font.fontName] = m2Font;
      if (m2Font.status === M2FontStatus.Loading) {
        return this.prepareFont(m2Font);
      }
      return;
    });
    await Promise.all(prepareFontsPromises);
  }

  private async prepareFont(font: M2Font) {
    /**
     * font.data will be defined if the font is shared with other games in
     * the session. A shared font's data was already loaded by the Session
     * object, and thus we do not need to fetch it again.
     */
    const arrayBuffer = font.data ?? (await this.fetchFontAsArrayBuffer(font));
    this.registerFont(arrayBuffer, font);
    console.log(
      `⚪ font ${font.fontName}${
        font.default ? " (default)" : ""
      } loaded for game ${this.game.id} from ${font.url}`,
    );
  }

  /**
   * Makes ready to the game a m2c2kit font ({@link M2Font}) that was
   * previously loaded, but whose processing was deferred.
   *
   * @internal For m2c2kit library use only
   *
   * @param font - M2Font to make ready
   * @returns A promise that completes when the font is ready
   */
  async prepareDeferredFont(font: M2Font): Promise<void> {
    font.status = M2FontStatus.Loading;
    return this.prepareFont(font);
  }

  private async fetchFontAsArrayBuffer(font: M2Font) {
    const response = await fetch(font.url);
    if (!response.ok) {
      throw new Error(
        `cannot fetch font ${font.fontName} at url ${font.url}: ${response.statusText}`,
      );
    }
    const arrayBuffer = await response.arrayBuffer();
    return arrayBuffer;
  }

  private registerFont(arrayBuffer: ArrayBuffer, font: M2Font) {
    this.provider.registerFont(arrayBuffer, font.fontName);
    const typeface =
      this.canvasKit.Typeface.MakeFreeTypeFaceFromData(arrayBuffer);
    if (!typeface) {
      throw new Error(
        `cannot make typeface for font ${font.fontName} at url ${font.url}`,
      );
    }
    font.typeface = typeface;
    font.status = M2FontStatus.Ready;
  }

  /**
   * Returns a m2c2kit font ({@link M2Font}) that has been loaded by the
   * FontManager.
   *
   * @internal For m2c2kit library use only
   *
   * @remarks Typically, a user won't need to call this because font
   * initialization and processing is handled by the framework.
   *
   * @param fontName - font's name as defined in the game's font assets
   * @returns a m2c2kit font
   */
  getFont(fontName: string): M2Font {
    const font = this.fonts[fontName];
    return font;
  }

  /**
   * Returns the m2c2kit default font ({@link M2Font}) that has been loaded
   * by the FontManager.
   *
   * @internal For m2c2kit library use only
   *
   * @remarks Typically, a user won't need to call this because font
   * initialization and processing is handled by the framework.
   *
   * @returns a m2c2kit font
   */
  getDefaultFont(): M2Font {
    const defaultFont = Object.values(this.fonts).find((font) => font.default);
    if (!defaultFont) {
      throw new Error(
        `no default font found; please make sure at least one font is loaded`,
      );
    }
    return defaultFont;
  }

  /**
   * Frees up resources allocated by the FontManager.
   *
   * @internal For m2c2kit library use only
   *
   * @remarks This will be done automatically by the m2c2kit library; the
   * end-user must not call this.
   */
  dispose(): void {
    const typefaces = Object.entries(this.fonts).map(([, val]) => val.typeface);
    CanvasKitHelpers.Dispose([...typefaces, this.provider]);
  }

  /**
   * Gets a CanvasKit Typeface that has been loaded.
   *
   * @internal For m2c2kit library use only
   *
   * @remarks Typically, a user won't need to call this because font
   * initialization and processing is handled by the framework.
   *
   * @param fontName - name as defined in the game's font assets
   * @returns the requested Typeface
   */
  getTypeface(fontName: string): Typeface {
    const typeface = this.fonts[fontName]?.typeface;
    if (!typeface) {
      throw new Error(`font ${fontName} not found`);
    }
    return typeface;
  }

  /**
   * Gets names of fonts loaded.
   *
   * @returns array of font names loaded from the game's font assets and
   * converted into M2Font objects. The names are the names as defined
   * in the game's font assets.
   */
  getFontNames(): Array<string> {
    return Object.keys(this.fonts);
  }
}
