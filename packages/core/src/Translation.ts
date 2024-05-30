/**
 * A map of a locale to a map of keys to translated text and font information.
 *
 * @remarks When it comes to fonts, the `Translation` object only specifies
 * which fonts to use for text. The actual fonts must be provided as part of
 * the `GameOptions` object with names that match the names specified in the
 * `Translation` object.
 *
 * The below example defines a translation object for use in three locales:
 * en-US, es-MX, and hi-IN.
 *
 * In the `configuration` object, the `baseLocale` property is en-US. This
 * means that the en-US locale is the locale from which the "native"
 * resources originate.
 *
 * The property `localeName` is human-readable text of the locale that can
 * be displayed to the user. For example, `en-US` might have the locale name
 * `English`. The property `localeSvg` is an image of the locale, as an SVG
 * string and its height and width. This is so the locale can be displayed to
 * the user if the locale uses a script that is not supported in the default
 * font, and a locale-specific font is not yet loaded.
 *
 * For en-US and es-MX, the game's default font will be used for all text
 * because the `fontName` property is not specified for these locales. For
 * hi-IN, the `devanagari` font will be used for all text.
 *
 * `EMOJI_WELCOME` uses an emoji, and it will not display properly unless an
 * `emoji` font is added. The `additionalFontName` property is used to
 * specify an additional font or fonts to use as well as the locale's font.
 * For en-US and es-MX, the `emoji` font plus the game's default font will be
 * used for the `EMOJI_WELCOME` text. For hi-IN, the `emoji` font plus the
 * `devanagari` font will be used for the `EMOJI_WELCOME` text.
 *
 * `OK_BUTTON` uses the game's default font for all locales. Because hi-IN
 * specified a font name, the `overrideFontName` property with a value of
 * `default` is used to specify that the game's default font should be used
 * instead of the locale's font, devanagari.
 *
 * `BYE` uses interpolation. `{{name}}` is a placeholder that will be replaced,
 * at runtime, with the value of the `name` key in the `options` object passed
 * to the `t` or `tf` methods of the `I18n` object. If the placeholder is not
 * found in `options`, an error will be thrown.
 *
 * @example
 *
 * ```
 * const translation: Translation = {
 *   "configuration": {
 *    "baseLocale": "en-US"
 *   },
 *   "en-US": {
 *     localeName: "English",
 *     "NEXT_BUTTON": "Next"
 *     "EMOJI_WELCOME": {
 *       text: "👋 Hello",
 *       additionalFontName: ["emoji"]
 *     },
 *     "OK_BUTTON": "OK",
 *     "BYE": "Goodbye, {{name}}."
 *   },
 *   "es-MX": {
 *     localeName: "Español",
 *     "NEXT_BUTTON": "Siguiente"
 *     "EMOJI_WELCOME": {
 *       text: "👋 Hola",
 *       additionalFontName: ["emoji"]
 *     },
 *     "OK_BUTTON": "OK",
 *     "BYE": "Adiós, {{name}}."
 *   },
 *   "hi-IN": {
 *     localeName: "Hindi",
 *     localeSvg: {
 *       // from https://commons.wikimedia.org/wiki/File:Hindi.svg, not copyrighted
 *       // note: To save space, the next line is not the full, working SVG string from the above URL.
 *       svgString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 304 168" xml:space="preserve"><path d="m45.223..."/></svg>`,
 *       height: 44,
 *       width: 80,
 *     },
 *     fontName: "devanagari",
 *     "NEXT_BUTTON": "अगला"
 *     "EMOJI_WELCOME": {
 *       text: "👋 नमस्कार",
 *       additionalFontName: ["emoji"]
 *     },
 *     "OK_BUTTON": {
 *       text: "OK",
 *       overrideFontName: "default"
 *     },
 *    "BYE": "अलविदा {{name}}."
 *   }
 * }
 *
 * ...
 *
 * const nextButton = new Button({
 *  text: "NEXT_BUTTON"
 *  ...
 * })
 *
 * const byeLabel = new Label({
 *  text: "BYE",
 *  interpolation: {
 *    name: "Alice"
 *  }
 *  ...
 * }
 * ```
 */
export type Translation = LocaleTranslationMap & {
  configuration?: TranslationConfiguration;
};

export interface TranslationConfiguration {
  /** The locale from which translations and adaptations are made to adjust to different regions and languages. This is the locale from which the base or unlocalized resources originate. */
  baseLocale: string;
}

export interface LocaleSvg {
  /** The HTML SVG tag, in string form, that will be rendered and loaded.
   * Must begin with &#60;svg> and end with &#60;/svg> */
  svgString: string;
  /** Height to scale image to */
  height: number;
  /** Width to scale image to */
  width: number;
}

type LocaleTranslationMap = {
  [locale: string]: {
    /** The font name or names to use for all text in the locale. If omitted,
     * the game's default font will be used. */
    fontName?: string | string[];
    /** Human-readable text of the locale that can be displayed to the user. For example, `en-US` might have the locale name `English` */
    localeName?: string;
    /** Image of the locale, as an SVG string, that can be displayed to the user. Some locales, in their native script, might not be supported in the default font. For example, Hindi script cannot be displayed in Roboto font. It would be inefficient to load all the possible extra fonts simply to display the locale to the user. Thus, in lieu of a string, the locale can be displayed to the user as an SVG. Only if that locale is selected, the font supporting that locale will be loaded. */
    localeSvg?: LocaleSvg;
  } & {
    /** The translated text or the translated text with custom font information. Note: `LocaleSvg` is included in the union only to satisfy TypeScript compiler. */
    [key: string]: string | TextWithFontCustomization | LocaleSvg;
  };
};

/**
 * A translated string with custom font information to be applied only to this
 * string.
 */
export interface TextWithFontCustomization {
  /** The translated string. */
  text: string;
  /** Font name(s) to _add to_ the locale's font name(s) when displaying text. */
  additionalFontName?: string | Array<string>;
  /** Font name(s) to use _in place of_ the locale's font name(s) when
   * displaying text. Use `default` to indicate that the game's default font
   * should be used instead of the locale's font names(s) */
  overrideFontName?: string | Array<string>;
}

export interface TextAndFont {
  /** The translated string. */
  text?: string;
  /** Font name to use when displaying the text. */
  fontName?: string;
  /** Font names to use when displaying the text. */
  fontNames?: Array<string>;
}
