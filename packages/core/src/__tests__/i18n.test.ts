import { Translation } from "../Translation";
import { LocalizationOptions } from "../LocalizationOptions";
import { I18n } from "..";

let translation: Translation;
let localizationOptions: LocalizationOptions;

beforeEach(() => {
  translation = {
    configuration: {
      baseLocale: "en-US",
    },
    "en-US": {
      NEXT_BUTTON: "Next",
      EMOJI_WELCOME: {
        text: "👋 Hello",
        additionalFontName: ["emoji"],
      },
      OK_BUTTON: "OK",
      BYE: "Goodbye, {{name}}.",
    },
    "es-MX": {
      NEXT_BUTTON: "Siguiente",
      EMOJI_WELCOME: {
        text: "👋 Hola",
        additionalFontName: ["emoji"],
      },
      OK_BUTTON: "OK",
      BYE: "Adiós, {{name}}.",
    },
    "hi-IN": {
      fontName: "devanagari",
      NEXT_BUTTON: "अगला",
      EMOJI_WELCOME: {
        text: "👋 नमस्कार",
        additionalFontName: ["emoji"],
      },
      OK_BUTTON: {
        text: "OK",
        overrideFontName: "default",
      },
      BYE: "अलविदा {{name}}.",
    },
  };

  localizationOptions = {
    locale: "en-US",
    translation: translation,
  };
});

describe("I18n locale detection", () => {
  it("specifies locale and fallback locales", () => {
    localizationOptions.locale = "es-MX";
    localizationOptions.fallbackLocale = "en-US";
    const i18n = new I18n(localizationOptions);
    expect(i18n.locale).toBe("es-MX");
    expect(i18n.fallbackLocale).toBe("en-US");
  });

  it("returns mocked es-MX locale on auto, and base locale en-us as fallback locale", () => {
    Object.defineProperty(navigator, "languages", {
      value: ["es-MX"],
      writable: true,
    });
    localizationOptions.locale = "auto";
    const i18n = new I18n(localizationOptions);
    expect(i18n.locale).toBe("es-MX");
    expect(i18n.fallbackLocale).toBe("en-US");
  });

  it("returns en-US as locale when locale cannot be auto detected and no fallback provided", () => {
    Object.defineProperty(navigator, "languages", {
      value: undefined,
      writable: true,
    });
    Object.defineProperty(navigator, "language", {
      value: undefined,
      writable: true,
    });
    localizationOptions.locale = "auto";
    const i18n = new I18n(localizationOptions);
    expect(i18n.locale).toBe("en-US");
    /**
     * expect "" because the base locale, which would be the fallback locale, is the same as the locale
     */
    expect(i18n.fallbackLocale).toBe("");
  });

  it("returns es-MX as fallback locale when locale cannot be auto detected and es-MX was specified as fallback locale", () => {
    Object.defineProperty(navigator, "languages", {
      value: undefined,
      writable: true,
    });
    Object.defineProperty(navigator, "language", {
      value: undefined,
      writable: true,
    });
    localizationOptions.locale = "auto";
    localizationOptions.fallbackLocale = "es-MX";
    const i18n = new I18n(localizationOptions);
    expect(i18n.locale).toBe("es-MX");
    /**
     * expect en-US because the fallback locale es-MX is locale and base locale becomes fallback locale
     */
    expect(i18n.fallbackLocale).toBe("en-US");
  });
});

describe("I18n t method", () => {
  it("returns translated text for en-US", () => {
    const i18n = new I18n(localizationOptions);
    expect(i18n.t("NEXT_BUTTON")).toBe("Next");
  });

  it("returns translated text and interpolation for en-US", () => {
    const i18n = new I18n(localizationOptions);
    expect(i18n.t("BYE", { name: "Jim" })).toBe("Goodbye, Jim.");
  });

  it("returns translated text for es-MX", () => {
    localizationOptions.locale = "es-MX";
    const i18n = new I18n(localizationOptions);
    expect(i18n.t("NEXT_BUTTON")).toBe("Siguiente");
  });

  it("returns translated text for hi-IN", () => {
    localizationOptions.locale = "hi-IN";
    const i18n = new I18n(localizationOptions);
    expect(i18n.t("NEXT_BUTTON")).toBe("अगला");
  });

  it("when missing locale de-DE is specified, it returns undefined", () => {
    localizationOptions.locale = "de-DE";
    localizationOptions.fallbackLocale = "en-US";
    const i18n = new I18n(localizationOptions);
    expect(i18n.t("NEXT_BUTTON")).toBe(undefined);
  });
});

describe("I18n tf method", () => {
  it("returns translated text and fonts for en-US", () => {
    const i18n = new I18n(localizationOptions);
    expect(i18n.tf("NEXT_BUTTON")?.text).toBe("Next");
    expect(i18n.tf("NEXT_BUTTON")?.fontName).toBe(undefined);
    expect(i18n.tf("NEXT_BUTTON")?.fontNames).toBe(undefined);
  });

  it("returns translated text and fonts and interpolation for en-US", () => {
    const i18n = new I18n(localizationOptions);
    expect(i18n.tf("BYE", { name: "Jim" })?.text).toBe("Goodbye, Jim.");
    expect(i18n.tf("NEXT_BUTTON")?.fontName).toBe(undefined);
    expect(i18n.tf("NEXT_BUTTON")?.fontNames).toBe(undefined);
  });

  it("returns translated text and fonts with font customization for en-US", () => {
    const i18n = new I18n(localizationOptions);
    expect(i18n.tf("EMOJI_WELCOME")?.text).toBe("👋 Hello");
    expect(i18n.tf("EMOJI_WELCOME")?.fontName).toBe("emoji");
  });

  it("returns translated text and fonts for es-MX", () => {
    localizationOptions.locale = "es-MX";
    const i18n = new I18n(localizationOptions);
    expect(i18n.tf("NEXT_BUTTON")?.text).toBe("Siguiente");
    expect(i18n.tf("NEXT_BUTTON")?.fontName).toBe(undefined);
    expect(i18n.tf("NEXT_BUTTON")?.fontNames).toBe(undefined);
  });

  it("returns translated text and fonts with font customization for es-MX", () => {
    localizationOptions.locale = "es-MX";
    const i18n = new I18n(localizationOptions);
    expect(i18n.tf("EMOJI_WELCOME")?.text).toBe("👋 Hola");
    expect(i18n.tf("EMOJI_WELCOME")?.fontName).toBe("emoji");
  });

  it("returns translated text and fonts for hi-IN", () => {
    localizationOptions.locale = "hi-IN";
    const i18n = new I18n(localizationOptions);
    expect(i18n.tf("NEXT_BUTTON")?.text).toBe("अगला");
    expect(i18n.tf("NEXT_BUTTON")?.fontName).toBe("devanagari");
    expect(i18n.tf("NEXT_BUTTON")?.fontNames).toBe(undefined);
  });

  it("returns translated text and fonts with font customization for hi-IN", () => {
    localizationOptions.locale = "hi-IN";
    const i18n = new I18n(localizationOptions);
    expect(i18n.tf("EMOJI_WELCOME")?.text).toBe("👋 नमस्कार");
    expect(i18n.tf("EMOJI_WELCOME")?.fontName).toBe(undefined);
    expect(i18n.tf("EMOJI_WELCOME")?.fontNames).toEqual([
      "devanagari",
      "emoji",
    ]);
  });

  it("when missing locale de-DE is specified, it returns undefined", () => {
    localizationOptions.locale = "de-DE";
    localizationOptions.fallbackLocale = "en-US";
    const i18n = new I18n(localizationOptions);
    expect(i18n.tf("NEXT_BUTTON")).toBe(undefined);
  });
});
