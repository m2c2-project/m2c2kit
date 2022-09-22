/**
 * Translations is a map of a locale to a map of keys to translations.
 *
 * @example
 * ```
 * const translations: Translations = {
 *   "en-US": {
 *     "NEXT_BUTTON": "Next"
 *   },
 *   "es-MX": {
 *     "NEXT_BUTTON": "Siguiente"
 *   }
 * }
 * ```
 */
export interface Translations {
  [locale: string]: {
    [key: string]: string;
  };
}
