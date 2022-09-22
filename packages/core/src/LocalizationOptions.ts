import { Translations } from "./Translations";
import { RgbaColor } from "./RgbaColor";

/**
 * Localization information that is passed to the I18n constructor.
 */
export interface LocalizationOptions {
  /** Locale to use for localization, or "auto" to request from the environment. */
  locale: string;
  /** Locale to use if requested locale translation is not availble, or if "auto" locale was requested and environment cannot provide a locale. */
  fallbackLocale?: string;
  /** Font color for strings that are missing translation and use the fallback locale or untranslated string. */
  missingTranslationFontColor?: RgbaColor;
  /** Translations for localization. */
  translations?: Translations;
  /** Additional translations for localization provided through game parameters. These will be merged into existing translations. */
  additionalTranslations?: Translations;
}
