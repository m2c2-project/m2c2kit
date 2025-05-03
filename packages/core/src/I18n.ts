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
  fontSize?: number;
  fontName?: string;
  fontNames?: string[];
  isFallbackOrMissingTranslation: boolean;
}

interface TranslatePlaceholderResult {
  text: string;
  isFallback: boolean;
}

interface FontPropertiesSets {
  size: Set<number>;
  name: Set<string>;
  names: Set<string>;
}

const STRING_INTERPOLATION_CHARACTERS = "{{}}";
const TRANSLATION_INTERPOLATION_CHARACTERS = "[[]]";

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
   * Returns the localized text and font information for the given key in the
   * current locale.
   *
   * @param key - Translation key
   * @param interpolation - Interpolation keys and values to replace
   * string interpolation placeholders in the translated text
   * @returns object with the localized text, font information, and whether the
   * translation is a fallback.
   */
  getTextLocalization(
    key: string,
    interpolation?: StringInterpolationMap,
  ): TextLocalizationResult {
    // First, try to get translation in current locale
    const primaryResult = this.attemptTranslation(key, interpolation);

    // It may be that "key" is not a missing translation key, but a string
    // with placeholders that are themselves the keys for translation. In this
    // case, we need to check if the text contains any placeholder keys to be
    // translated, e.g., "The translated word is [[RED]]", and RED is a key
    // for translation. Note that the key's translation value may contain
    // interpolation placeholders itself, so we need to handle that as well.
    if (primaryResult.isFallbackOrMissingTranslation) {
      const placeholdersResult = this.handleTranslationPlaceholders(
        key,
        primaryResult,
        interpolation,
      );
      if (placeholdersResult) {
        if (interpolation !== undefined) {
          placeholdersResult.text = this.insertInterpolations(
            STRING_INTERPOLATION_CHARACTERS,
            placeholdersResult.text,
            interpolation,
          );
        }
        return placeholdersResult;
      }
    }

    return primaryResult;
  }

  /**
   *
   * @param key - Translation key to be translated
   * @param interpolation - String interpolation keys and values to replace
   * @returns result object with the localized text, font
   */
  private attemptTranslation(
    key: string,
    interpolation?: StringInterpolationMap,
  ): TextLocalizationResult {
    // Try with current locale
    let tf = this.tf(key, interpolation);
    let isFallbackOrMissingTranslation = false;

    // If not found, try with fallback locale
    if (tf?.text === undefined) {
      tf = this.tf(key, {
        useFallbackLocale: true,
        ...interpolation,
      });
      isFallbackOrMissingTranslation = true;
    }

    // Handle case when translation is missing entirely
    const text = tf?.text ?? key;

    return {
      text,
      fontSize: tf?.fontSize,
      fontName: tf?.fontName,
      fontNames: tf?.fontNames,
      isFallbackOrMissingTranslation,
    };
  }

  /**
   * Handles translation placeholders in a string.
   *
   * @remarks The value of a translation placeholder (text within `[[]]`)
   * may also contain string interpolation placeholders (`{{}}`), so we need
   * to handle that as well.
   *
   * @param key - Translation key for the string to be localized
   * @param initialResult - Initial translation result for the string
   * @param interpolation - Interpolation keys and values to replace
   * interpolation placeholders in the translated text
   * @returns result object with the localized text,
   */
  private handleTranslationPlaceholders(
    key: string,
    initialResult: TextLocalizationResult,
    interpolation?: StringInterpolationMap,
  ): TextLocalizationResult | null {
    const placeholders = this.getTranslationPlaceholders(key);
    if (placeholders.length === 0) {
      return null;
    }

    // we will collect font properties from the placeholders
    // in sets, so that we can warn about conflicting properties, e.g.,
    // when a set size is greater than 1, it means that multiple
    // placeholders specified different font sizes, font names, or font names
    // arrays.
    const fontProps: FontPropertiesSets = {
      size: new Set<number>(),
      name: new Set<string>(),
      names: new Set<string>(),
    };

    const interpolationMap: StringInterpolationMap = {};
    let isFallbackOrMissingTranslation = false;

    // Process each translation placeholder
    placeholders.forEach((placeholderKey) => {
      const placeholderResult = this.translatePlaceholder(
        placeholderKey,
        fontProps,
        interpolation,
      );
      interpolationMap[placeholderKey] = placeholderResult.text;
      isFallbackOrMissingTranslation =
        isFallbackOrMissingTranslation || placeholderResult.isFallback;
    });

    this.warnConflictingFontProperties(key, fontProps);

    const text = this.insertInterpolations(
      TRANSLATION_INTERPOLATION_CHARACTERS,
      key,
      interpolationMap,
    );
    const fontSize =
      initialResult.fontSize ||
      (fontProps.size.size > 0 ? [...fontProps.size][0] : undefined);
    const fontName =
      initialResult.fontName ||
      (fontProps.name.size > 0 ? [...fontProps.name][0] : undefined);
    const fontNames =
      initialResult.fontNames ||
      (fontProps.names.size > 0
        ? [...fontProps.names][0].split(",")
        : undefined);

    return {
      text,
      fontSize,
      fontName,
      fontNames,
      isFallbackOrMissingTranslation,
    };
  }

  /**
   * Translates a translation placeholder key to its text and collects font properties.
   *
   * @param placeholderKey - Translation key for the placeholder
   * @param fontProps - Font properties sets to collect font information
   * @param interpolation - Interpolation keys and values to replace
   * string interpolation placeholders in the translated text
   * @returns result object with the translated text and whether it is a fallback translation
   */
  private translatePlaceholder(
    placeholderKey: string,
    fontProps: FontPropertiesSets,
    interpolation?: StringInterpolationMap,
  ): TranslatePlaceholderResult {
    // Try current locale
    let tf = this.tf(placeholderKey, interpolation);
    let isFallback = false;

    if (tf?.text === undefined) {
      // Try fallback locale
      tf = this.tf(placeholderKey, {
        useFallbackLocale: true,
        ...interpolation,
      });
      isFallback = true;
    }

    // Collect font properties
    if (tf?.fontSize !== undefined) {
      fontProps.size.add(tf.fontSize);
    }

    if (tf?.fontName !== undefined) {
      fontProps.name.add(tf.fontName);
    }

    if (tf?.fontNames !== undefined) {
      fontProps.names.add(tf.fontNames.sort().join(","));
    }

    return {
      text: tf?.text ?? placeholderKey,
      isFallback,
    };
  }

  /**
   * Extracts translation key placeholders from a string.
   *
   * @remarks Translation key placeholders are denoted by double square brackets,
   * e.g., "The translated word is [[RED]]", and RED is a key for translation.
   *
   * @param s - string to search for placeholders
   * @returns an array of placeholders found in the string, without the square
   * brackets
   */
  private getTranslationPlaceholders(s: string): string[] {
    const [open, close] = [
      TRANSLATION_INTERPOLATION_CHARACTERS.slice(0, 2),
      TRANSLATION_INTERPOLATION_CHARACTERS.slice(2),
    ];

    // Escape special characters for safe use in regex
    const escapedOpen = open.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const escapedClose = close.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const regex = new RegExp(`${escapedOpen}(.*?)${escapedClose}`, "g");
    const matches = s.match(regex);

    if (!matches) {
      return [];
    }

    return matches.map((placeholder) =>
      placeholder.slice(open.length, -close.length).trim(),
    );
  }

  /**
   * Logs warnings if the string to be localized has conflicting font
   * properties.
   *
   * @remarks This can happen due to multiple placeholders in the string
   * that specify different font sizes, font names, or font names arrays.
   *
   * @param key - Translation key for which the string is being localized
   * @param fontProps - font properties sets collected from the placeholders
   */
  private warnConflictingFontProperties(
    key: string,
    fontProps: FontPropertiesSets,
  ) {
    if (fontProps.size.size > 1) {
      console.warn(
        `i18n: placeholders set multiple different font sizes in string to be localized. Only one will be used. String: ${key}`,
      );
    }
    if (fontProps.name.size > 1) {
      console.warn(
        `i18n: placeholders set multiple different font names within string to be localized. Only one will be used. String: ${key}`,
      );
    }
    if (fontProps.names.size > 1) {
      console.warn(
        `i18n: placeholders set multiple different font names arrays within string to be localized. Only one will be used. String: ${key}`,
      );
    }
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
    const { useFallbackLocale, ...interpolationMap } = options ?? {};

    if (useFallbackLocale !== true) {
      const t = this.translation[this.locale]?.[key];
      if (this.isStringOrTextWithFontCustomization(t)) {
        return this.insertInterpolations(
          STRING_INTERPOLATION_CHARACTERS,
          this.getKeyText(t),
          interpolationMap as StringInterpolationMap,
        );
      }
      return undefined;
    }

    const fallbackT = this.translation[this.fallbackLocale]?.[key];
    if (this.isStringOrTextWithFontCustomization(fallbackT)) {
      return this.insertInterpolations(
        STRING_INTERPOLATION_CHARACTERS,
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
    const { useFallbackLocale, ...interpolationMap } = options ?? {};

    if (useFallbackLocale !== true) {
      const t = this.translation[this.locale]?.[key];
      if (this.isStringOrTextWithFontCustomization(t)) {
        const tf = this.getKeyTextAndFont(t, this.locale);
        if (tf.text) {
          tf.text = this.insertInterpolations(
            STRING_INTERPOLATION_CHARACTERS,
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
          STRING_INTERPOLATION_CHARACTERS,
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
    let fontSize: number | undefined = undefined;
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
      fontSize = t.fontSize;
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
        return { text: text, fontSize: fontSize };
      case 1:
        return { text: text, fontSize: fontSize, fontName: fontNames[0] };
      default:
        return { text: text, fontSize: fontSize, fontNames: fontNames };
    }
  }

  private insertInterpolations(
    specialChars: string,
    text: string,
    options?: StringInterpolationMap,
  ): string {
    if (!options) {
      return text;
    }

    const [open, close] = [specialChars.slice(0, 2), specialChars.slice(2)]; // Extract "{{" and "}}" or "[[", "]]"

    // Escape special characters for safe use in regex
    const escapedOpen = open.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const escapedClose = close.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`${escapedOpen}(.*?)${escapedClose}`, "g"); // Create regex dynamically

    return text.replace(regex, (_match, key) => {
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
