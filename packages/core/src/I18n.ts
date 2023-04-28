import { GameParameters } from "./GameParameters";
import { LocalizationOptions } from "./LocalizationOptions";
import { Translations } from "./Translations";

export class I18n {
  private _translations: Translations;
  locale = "";
  fallbackLocale = "en";
  private environmentLocale = this.getEnvironmentLocale();
  options: LocalizationOptions;

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
        missing_translation_font_color: {
          type: ["array", "null"],
          default: null,
          description:
            "Font color for strings that are missing translation and use the fallback locale or untranslated string, [r,g,b,a].",
          items: {
            type: "number",
          },
        },
        translations: {
          type: ["object", "null"],
          default: null,
          description: "Additional translations for localization.",
        },
      })
    );
    return localizationParameters;
  }

  constructor(options: LocalizationOptions) {
    this.options = options;
    this._translations =
      this.mergeAdditionalTranslations(
        options.translations,
        options.additionalTranslations
      ) ?? {};

    if (options.locale.toLowerCase() === "auto") {
      this.locale = this.environmentLocale;
      if (!this.locale) {
        if (options.fallbackLocale) {
          this.fallbackLocale = options.fallbackLocale;
          console.warn(
            `auto locale requested, but environment cannot provide locale. Using fallback locale ${options.fallbackLocale}`
          );
        } else {
          console.warn(
            `auto locale requested, but environment cannot provide locale. Defaulting to "en".`
          );
        }
      }
    } else {
      this.locale = options.locale;
      if (options.fallbackLocale) {
        this.fallbackLocale = options.fallbackLocale;
      }
    }
  }

  t(key: string, useFallback = false): string | undefined {
    if (useFallback) {
      return this._translations[this.fallbackLocale]?.[key];
    }
    return this._translations[this.locale]?.[key];
  }

  get translations() {
    return this._translations;
  }

  set translations(value: Translations) {
    this._translations = value;
  }

  private getEnvironmentLocale(): string {
    return navigator.languages && navigator.languages.length
      ? navigator.languages[0]
      : navigator.language;
  }

  private mergeAdditionalTranslations(
    baseTranslations?: Translations,
    additionalTranslations?: Translations
  ): Translations | undefined {
    if (!baseTranslations && !additionalTranslations) {
      return undefined;
    }

    if (!additionalTranslations) {
      return baseTranslations;
    }

    if (!baseTranslations) {
      return additionalTranslations;
    }

    const result: Translations = {};
    const processedLocales = new Array<string>();
    for (const locale in baseTranslations) {
      processedLocales.push(locale);
      result[locale] = {
        ...baseTranslations[locale],
        ...additionalTranslations[locale],
      };
    }

    for (const locale in additionalTranslations) {
      if (processedLocales.includes(locale)) {
        continue;
      }
      result[locale] = additionalTranslations[locale];
    }

    return result;
  }
}
