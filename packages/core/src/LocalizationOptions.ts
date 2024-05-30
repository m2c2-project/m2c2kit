import { Translation } from "./Translation";
import { RgbaColor } from "./RgbaColor";

/**
 * Localization information that is passed to the I18n constructor.
 */
export interface LocalizationOptions {
  /** Locale to use for localization when running the game, or "auto" to request from the environment. */
  locale?: string;
  /** Locale to use if requested locale translation is not available, or if "auto" locale was requested and environment cannot provide a locale. Default is `en-US`.*/
  fallbackLocale?: string;
  /** Font color for strings or outline color for images when a requested locale's translation or image is missing. This is useful in development to call attention to missing localization assets. */
  missingLocalizationColor?: RgbaColor;
  /** Translation for localization. */
  translation?: Translation;
  /** Additional translation for localization. This will typically be provided through `setParameters()` at runtime. This translation be merged into the existing translation and will overwrite any existing translation with the same key-value pairs. Thus, this can be used to modify an existing translation, either in whole or in part. */
  additionalTranslation?: Translation;
}
