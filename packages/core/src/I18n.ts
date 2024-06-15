import { Game } from "./Game";
import { GameParameters } from "./GameParameters";
import { LocalizationOptions } from "./LocalizationOptions";
import { RgbaColor } from "./RgbaColor";
import { StringInterpolationMap } from "./StringInterpolationMap";
import {
  LocaleSvg,
  TextAndFont,
  TextWithFontCustomization,
  Translation,
} from "./Translation";

export interface TranslationOptions {
  [key: string]: unknown;
}

export interface TextLocalizationResult {
  text: string;
  fontName?: string;
  fontNames?: string[];
  isFallbackOrMissingTranslation: boolean;
}

export class I18n {
  private _translation: Translation;
  locale = "";
  fallbackLocale = "en-US";
  baseLocale = "en-US";
  missingLocalizationColor: RgbaColor | undefined;
  game: Game;

  /**
   * The I18n class localizes text and images.
   *
   * @param game - game instance
   * @param options - {@link LocalizationOptions}
   */
  constructor(game: Game, options: LocalizationOptions) {
    this.game = game;
    this._translation =
      this.mergeAdditionalTranslation(
        options.translation,
        options.additionalTranslation,
      ) ?? {};

    if (this.translation.configuration?.baseLocale) {
      this.baseLocale = this.translation.configuration.baseLocale;
    }

    if (options.missingLocalizationColor) {
      this.missingLocalizationColor = options.missingLocalizationColor;
    }

    if (options.locale) {
      this.locale = options.locale;
    }

    if (options.fallbackLocale) {
      this.fallbackLocale = options.fallbackLocale;
    }
  }

  /**
   * Initializes the I18n instance and sets the initial locale.
   *
   * @remarks If the game instance has been configured to use a data store,
   * the previously used locale and fallback locale will be retrieved from the
   * data store if they have been previously set.
   */
  async initialize() {
    await this.configureInitialLocale();
  }

  private async configureInitialLocale() {
    if (this.game.hasDataStores()) {
      const locale = await this.game.storeGetItem("locale");
      const fallbackLocale = await this.game.storeGetItem("fallbackLocale");
      if (typeof locale === "string" && typeof fallbackLocale === "string") {
        this.locale = locale;
        this.fallbackLocale = fallbackLocale;
        return;
      }
    }

    if (this.locale?.toLowerCase() === "auto") {
      const attemptedLocale = this.getEnvironmentLocale();

      if (attemptedLocale) {
        if (this.localeTranslationAvailable(attemptedLocale)) {
          this.locale = attemptedLocale;
          if (!this.localeTranslationAvailable(this.fallbackLocale)) {
            this.fallbackLocale = this.baseLocale;
          }
        } else {
          if (
            this.fallbackLocale &&
            this.localeTranslationAvailable(this.fallbackLocale)
          ) {
            console.warn(
              `auto locale requested, but detected locale ${attemptedLocale} does not have translation. Setting locale to fallback locale ${this.fallbackLocale}`,
            );
            this.locale = this.fallbackLocale;
            this.fallbackLocale = this.baseLocale;
          } else {
            console.warn(
              `auto locale requested, but detected locale ${attemptedLocale} does not have translation, and fallback locale does not have translation or was not specified (fallback locale is ${this.fallbackLocale}). Setting locale to base locale ${this.baseLocale}.`,
            );
            this.locale = this.baseLocale;
            this.fallbackLocale = this.baseLocale;
          }
        }
      } else {
        if (
          this.fallbackLocale &&
          this.localeTranslationAvailable(this.fallbackLocale)
        ) {
          console.warn(
            `auto locale requested, but environment cannot detect locale. Setting locale to fallback locale ${this.fallbackLocale}`,
          );
          this.locale = this.fallbackLocale;
          this.fallbackLocale = this.baseLocale;
        } else {
          console.warn(
            `auto locale requested, but environment cannot detect locale, and fallback locale does not have translation or was not specified (fallback locale is ${this.fallbackLocale}). Setting locale to base locale ${this.baseLocale}.`,
          );
          this.locale = this.baseLocale;
          this.fallbackLocale = this.baseLocale;
        }
      }
    } else {
      this.locale = this.locale ?? "";
      if (!this.fallbackLocale) {
        this.fallbackLocale = this.baseLocale;
      }
    }
  }

  private localeTranslationAvailable(locale: string) {
    return this.translation[locale] !== undefined || locale === this.baseLocale;
  }

  switchToLocale(locale: string) {
    this.locale = locale;
    this.game.nodes
      .filter((node) => node.isText)
      .forEach((node) => (node.needsInitialization = true));
    this.game.imageManager.reinitializeLocalizedImages();

    if (this.game && this.game.hasDataStores()) {
      /**
       * Do not await the storeSetItem() calls. We don't need to wait for them
       * to complete before continuing. We'll assume they will complete
       * successfully, and if not, these are just locale preferences, not
       * critical data.
       */
      this.game.storeSetItem("locale", this.locale);
      this.game.storeSetItem("fallbackLocale", this.fallbackLocale);
    }
  }

  /**
   *
   * @param key - Translation key
   * @param interpolation - Interpolation keys and values to replace
   * placeholders in the translated text
   * @returns a `TextLocalizationResult` object with the localized text, font
   * information, and whether the translation is a fallback.
   */
  getTextLocalization(key: string, interpolation?: StringInterpolationMap) {
    let localizedText = "";
    let isFallbackOrMissingTranslation = false;
    let tf = this.tf(key, interpolation);
    if (tf?.text !== undefined) {
      localizedText = tf.text;
    } else {
      tf = this.tf(key, {
        useFallbackLocale: true,
        ...interpolation,
      });
      if (tf === undefined || tf.text === undefined) {
        localizedText = key;
      } else {
        localizedText = tf.text;
      }
      isFallbackOrMissingTranslation = true;
    }

    return {
      text: localizedText,
      fontName: tf?.fontName,
      fontNames: tf?.fontNames,
      isFallbackOrMissingTranslation: isFallbackOrMissingTranslation,
    } as TextLocalizationResult;
  }

  /**
   * Returns the translation text for the given key in the current locale.
   *
   * @remarks Optional interpolation keys and values can be provided to replace
   * placeholders in the translated text. Placeholders are denoted by double
   * curly braces.
   *
   * @param key - key to look up in the translation
   * @param options - `TranslationOptions`, such as interpolation keys/values
   * and whether to translate using the fallback locale
   * @returns the translation text for the key in the current locale, or
   * undefined if the key is not found
   *
   * @example
   *
   * ```
   * const translation: Translation = {
   *   "en-US": {
   *     "GREETING": "Hello, {{name}}."
   *   }
   * }
   * ...
   * i18n.t("GREETING", { name: "World" }); // returns "Hello, World."
   *
   * ```
   */
  t(key: string, options?: TranslationOptions) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { useFallbackLocale, ...interpolationMap } = options ?? {};

    if (useFallbackLocale !== true) {
      const t = this.translation[this.locale]?.[key];
      if (this.isStringOrTextWithFontCustomization(t)) {
        return this.insertInterpolations(
          this.getKeyText(t),
          interpolationMap as StringInterpolationMap,
        );
      }
      return undefined;
    }

    const fallbackT = this.translation[this.fallbackLocale]?.[key];
    if (this.isStringOrTextWithFontCustomization(fallbackT)) {
      return this.insertInterpolations(
        this.getKeyText(fallbackT),
        interpolationMap as StringInterpolationMap,
      );
    }

    return undefined;
  }

  /**
   * Returns the translation text and font information for the given key in the
   * current locale.
   *
   * @remarks Optional interpolation keys and values can be provided to replace
   * placeholders in the translated text. Placeholders are denoted by double
   * curly braces. See method {@link I18n.t()} for interpolation example.
   *
   * @param key - key to look up in the translation
   * @param options - `TranslationOptions`, such as interpolation keys/values
   * and whether to translate using the fallback locale
   * @returns the translation text and font information for the key in the
   * current locale, or undefined if the key is not found
   */
  tf(key: string, options?: TranslationOptions): TextAndFont | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { useFallbackLocale, ...interpolationMap } = options ?? {};

    if (useFallbackLocale !== true) {
      const t = this.translation[this.locale]?.[key];
      if (this.isStringOrTextWithFontCustomization(t)) {
        const tf = this.getKeyTextAndFont(t, this.locale);
        if (tf.text) {
          tf.text = this.insertInterpolations(
            tf.text,
            interpolationMap as StringInterpolationMap,
          );
        }
        return tf;
      }
      return undefined;
    }

    const fallbackTranslation = this.translation[this.fallbackLocale]?.[key];
    if (this.isStringOrTextWithFontCustomization(fallbackTranslation)) {
      const tf = this.getKeyTextAndFont(
        fallbackTranslation,
        this.fallbackLocale,
      );
      if (tf.text) {
        tf.text = this.insertInterpolations(
          tf.text,
          interpolationMap as StringInterpolationMap,
        );
      }
      return tf;
    }
    return undefined;
  }

  private getKeyText(t: string | TextWithFontCustomization) {
    if (this.isTextWithFontCustomization(t)) {
      return t.text;
    }
    return t;
  }

  private getKeyTextAndFont(
    t: string | TextWithFontCustomization,
    locale: string,
  ): TextAndFont {
    let fontNames = new Array<string>();
    if (this.isString(this.translation[locale]?.fontName)) {
      fontNames.push(this.translation[locale].fontName as string);
    } else if (this.isStringArray(this.translation[locale]?.fontName)) {
      fontNames.push(...(this.translation[locale].fontName as Array<string>));
    } else {
      fontNames.push("default");
    }
    let text: string | undefined;
    if (this.isTextWithFontCustomization(t)) {
      text = t.text;
      if (this.isString(t.additionalFontName)) {
        fontNames.push(t.additionalFontName);
      }
      if (this.isStringArray(t.additionalFontName)) {
        fontNames.push(...t.additionalFontName);
      }
      if (t.overrideFontName) {
        fontNames.length = 0;
        if (this.isString(t.overrideFontName)) {
          fontNames.push(t.overrideFontName);
        }
        if (this.isStringArray(t.overrideFontName)) {
          fontNames.push(...t.overrideFontName);
        }
      }
    } else {
      text = t;
    }

    fontNames = fontNames.filter((f) => f !== "default");

    switch (fontNames.length) {
      case 0:
        return { text: text };
      case 1:
        return { text: text, fontName: fontNames[0] };
      default:
        return { text: text, fontNames: fontNames };
    }
  }

  private insertInterpolations(
    text: string,
    options?: StringInterpolationMap,
  ): string {
    if (!options) {
      return text;
    }
    return text.replace(/\{\{(.*?)\}\}/g, (_match, key) => {
      if (Object.prototype.hasOwnProperty.call(options, key)) {
        return options[key];
      } else {
        throw new Error(
          `insertInterpolations(): placeholder "${key}" not found. Text was ${text}, provided interpolation was ${JSON.stringify(options)}`,
        );
      }
    });
  }

  get translation() {
    return this._translation;
  }

  set translation(value: Translation) {
    this._translation = value;
  }

  private getEnvironmentLocale(): string {
    return (
      (navigator.languages && navigator.languages.length
        ? navigator.languages[0]
        : navigator.language) ?? ""
    );
  }

  private mergeAdditionalTranslation(
    baseTranslation?: Translation,
    additionalTranslation?: Translation,
  ) {
    if (!baseTranslation && !additionalTranslation) {
      return undefined;
    }

    if (!additionalTranslation) {
      return baseTranslation;
    }

    if (!baseTranslation) {
      return additionalTranslation;
    }

    const result: Translation = {};
    const processedLocales = new Array<string>();
    for (const locale in baseTranslation) {
      processedLocales.push(locale);
      result[locale] = {
        ...baseTranslation[locale],
        ...additionalTranslation[locale],
      };
    }

    for (const locale in additionalTranslation) {
      if (processedLocales.includes(locale)) {
        continue;
      }
      result[locale] = additionalTranslation[locale];
    }

    return result;
  }

  static makeLocalizationParameters(): GameParameters {
    /**
     * @remarks makeLocalizationParameters is static because we use it before we know
     * if we need an I18n instance. Because it's static, we need to
     * return a new copy of the localizationParameters each time it's called,
     * otherwise all the games would share the same localizationParameters.
     */
    const localizationParameters: GameParameters = JSON.parse(
      JSON.stringify({
        locale: {
          type: ["string", "null"],
          default: null,
          description: `Locale to use for localization, or "auto" to request from the environment.`,
        },
        fallback_locale: {
          type: ["string", "null"],
          default: null,
          description: `Locale to use if requested locale translation is not available, or if "auto" locale was requested and environment cannot provide a locale.`,
        },
        missing_localization_color: {
          type: ["array", "null"],
          default: null,
          description:
            "Font color for strings that are missing translation and outline color for images that are missing localization, [r,g,b,a].",
          items: {
            type: "number",
          },
        },
        translation: {
          type: ["object", "null"],
          default: null,
          description: "Additional translation for localization.",
        },
      }),
    );
    return localizationParameters;
  }

  private isTextWithFontCustomization(
    value: string | TextWithFontCustomization | LocaleSvg | undefined,
  ): value is TextWithFontCustomization {
    return (value as TextWithFontCustomization)?.text !== undefined;
  }

  private isStringOrTextWithFontCustomization(
    value: string | TextWithFontCustomization | LocaleSvg | undefined,
  ): value is string | TextWithFontCustomization {
    return typeof value === "string" || this.isTextWithFontCustomization(value);
  }

  private isStringArray(value: unknown): value is string[] {
    return (
      Array.isArray(value) && value.every((item) => typeof item === "string")
    );
  }

  private isString(value: unknown): value is string {
    return typeof value === "string";
  }
}
