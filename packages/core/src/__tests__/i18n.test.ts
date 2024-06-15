import { Game, GameOptions, Label, Scene, Translation } from "..";
import { TestHelpers } from "./TestHelpers";

TestHelpers.createM2c2KitMock();

let g1: Game1;

const translation: Translation = {
  configuration: {
    baseLocale: "en-US",
  },
  "en-US": {
    localeName: "English",
    NEXT_BUTTON: "Next",
    EMOJI_WELCOME: {
      text: "👋 Hello",
      additionalFontName: ["emoji"],
    },
    OK_BUTTON: "OK",
    BYE: "Goodbye, {{name}}.",
    ERROR: "Error",
  },
  "es-MX": {
    localeName: "Español",
    NEXT_BUTTON: "Siguiente",
    EMOJI_WELCOME: {
      text: "👋 Hola",
      additionalFontName: ["emoji"],
    },
    OK_BUTTON: "OK",
    BYE: "Adiós, {{name}}.",
  },
  "hi-IN": {
    localeName: "Hindi",
    localeSvg: {
      // from https://commons.wikimedia.org/wiki/File:Hindi.svg, not copyrighted
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 304 168" xml:space="preserve"><path d="m45.223 56.091.547-.752h13.604c-2.734-3.418-4.375-7.383-4.375-11.895 0-9.639 7.861-19.004 22.832-19.004 15.654 0 30.283 8.75 44.365 24.814l-2.461 3.418h-.547c-11.211-12.51-23.242-20.439-36.641-20.439-12.578 0-19.756 7.178-19.756 15.654 0 3.418.82 5.811 2.119 7.451h10.801l3.281 6.631-.547.752H66.072l.273 62.617-.684.752-7.656-2.051.205-61.318h-9.707z"/><path d="m72.43 56.091.547-.752h60.771l3.281 6.631-.547.752h-12.578l.137 17.432-.82.957a339 339 0 0 0-12.1-.205c-8.818 0-15.654 1.367-18.525 3.896-2.188 1.846-3.008 4.102-3.008 6.289 0 3.076 1.162 5.537 3.35 7.451 5.537-4.717 11.895-7.725 19.824-7.725 5.742 0 9.639 2.188 12.852 5.332s5.195 7.656 5.195 11.963c0 6.357-5.195 11.006-13.057 14.629h-.479c-1.982-1.846-4.102-4.033-6.631-7.178 7.861-3.418 13.809-7.178 13.809-11.689 0-2.803-2.256-4.922-7.861-4.922-6.904 0-21.26 5.537-21.26 16.543 0 12.92 16.27 18.525 37.529 20.713l-5.059 8.135h-.479c-24.814-6.289-40.195-16.27-40.195-32.197 0-3.418.889-6.768 2.871-9.775-5.537-4.99-8.613-10.186-8.613-15.381 0-4.717 1.914-8.34 5.742-10.732 3.623-2.188 9.98-3.145 18.936-3.145h8.271c1.23 0 1.846-.684 1.846-1.777v-8.613H75.711z"/><path d="m130.467 56.091.547-.752h97.275l3.281 6.631-.547.752h-15.244l.068 20.303-.684.684h-10.049c-15.859 0-23.311 4.99-23.311 13.945 0 7.93 6.084 14.014 15.449 14.014 3.691 0 7.041-.957 10.527-2.666-1.777-1.777-2.666-3.965-2.666-6.699 0-4.033 3.486-7.93 8.271-7.93 2.734 0 4.922 1.025 6.836 2.939 2.051 2.119 3.145 4.58 3.145 7.383 0 3.691-1.982 6.768-5.811 9.365 7.109 6.494 9.844 11.826 9.844 16.064 0 5.605-3.281 9.57-8.066 12.852h-.547l-8.135-6.494c4.717-3.145 7.793-6.563 7.793-10.801 0-2.939-1.504-6.016-4.785-9.297-4.102 2.051-8.203 2.734-12.441 2.734-16.406 0-27.822-12.578-27.822-25.225 0-1.914.273-3.691.752-5.332-2.461-.205-4.922-.273-7.178-.273-4.512 0-8.408.41-11.279 1.299v5.605c0 3.008-.273 5.059-.684 5.879-1.025 1.777-2.598 2.598-4.58 2.598-3.076 0-11.963-9.023-11.963-14.971 0-2.393 1.572-4.58 4.854-6.084 3.691-1.641 8.066-2.051 12.51-2.051s15.039.615 22.148 1.436c4.102-4.102 10.664-6.221 18.594-6.221h9.502c1.367 0 2.051-.684 2.051-1.914V62.722h-74.375z"/><path d="m225.008 56.091.547-.752h12.441c-1.094-15.791-7.383-23.584-16.68-23.584-6.494 0-10.049 4.443-10.049 9.297 0 4.102 1.846 7.93 4.58 11.484l-.615.752-7.246-3.35c-3.145-3.76-5.195-7.793-5.195-12.1 0-7.178 5.127-12.988 14.697-12.988 13.125 0 25.84 12.578 28.164 30.488h9.844l3.281 6.631-.547.752h-12.373l.273 62.617-.684.752-7.656-2.051.205-61.318h-9.707z"/></svg>`,
      height: 44,
      width: 80,
    },
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

class Game1 extends Game {
  constructor() {
    const gameOptions: GameOptions = {
      name: "game1",
      id: "game1",
      publishUuid: "00000000-0000-0000-0000-000000000000",
      version: "0.1",
      showFps: true,
      width: 400,
      height: 800,
      translation: translation,
    };
    super(gameOptions);
  }

  async initialize() {
    await super.initialize();
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const game = this;
    const s = new Scene({
      name: "game1FirstScene",
    });
    game.addScene(s);

    const nextLabel = new Label({
      text: "NEXT",
    });
    s.addChild(nextLabel);
  }
}

describe("I18n locale detection", () => {
  beforeEach(async () => {
    g1 = new Game1();
    TestHelpers.setupDomAndGlobals();
  });

  it("specifies locale and fallback locales", async () => {
    g1.setParameters({ locale: "es-MX", fallbackLocale: "en-US" });
    await g1.initialize();
    expect(g1.i18n?.locale).toBe("es-MX");
    expect(g1.i18n?.fallbackLocale).toBe("en-US");
  });

  it("returns mocked es-MX locale on auto, and base locale en-us as fallback locale", async () => {
    Object.defineProperty(navigator, "languages", {
      value: ["es-MX"],
      writable: true,
    });
    g1.setParameters({ locale: "auto" });
    await g1.initialize();
    expect(g1.i18n?.locale).toBe("es-MX");
    expect(g1.i18n?.fallbackLocale).toBe("en-US");
  });

  it("returns en-US as locale when locale cannot be auto detected and no fallback provided", async () => {
    Object.defineProperty(navigator, "languages", {
      value: undefined,
      writable: true,
    });
    Object.defineProperty(navigator, "language", {
      value: undefined,
      writable: true,
    });
    g1.setParameters({ locale: "auto" });
    await g1.initialize();
    expect(g1.i18n?.locale).toBe("en-US");
    expect(g1.i18n?.fallbackLocale).toBe("en-US");
  });

  it("returns es-MX as fallback locale when locale cannot be auto detected and es-MX was specified as fallback locale", async () => {
    Object.defineProperty(navigator, "languages", {
      value: undefined,
      writable: true,
    });
    Object.defineProperty(navigator, "language", {
      value: undefined,
      writable: true,
    });
    g1.setParameters({ locale: "auto", fallback_locale: "es-MX" });
    await g1.initialize();
    expect(g1.i18n?.locale).toBe("es-MX");
    /**
     * expect en-US because the fallback locale es-MX is locale and base locale becomes fallback locale
     */
    expect(g1.i18n?.fallbackLocale).toBe("en-US");
  });

  it("returns es-MX as locale and en-US (base local) as fallback when locale cannot be auto detected", async () => {
    Object.defineProperty(navigator, "languages", {
      value: undefined,
      writable: true,
    });
    Object.defineProperty(navigator, "language", {
      value: undefined,
      writable: true,
    });
    g1.setParameters({ locale: "auto", fallback_locale: "es-MX" });
    await g1.initialize();
    expect(g1.i18n?.locale).toBe("es-MX");
    /**
     * expect en-US because the fallback locale es-MX is locale and base locale becomes fallback locale
     */
    expect(g1.i18n?.fallbackLocale).toBe("en-US");
  });

  it("returns en-US as locale and en-US (base locale) as fallback when locale cannot be auto detected and fallback provided is not supported", async () => {
    Object.defineProperty(navigator, "languages", {
      value: undefined,
      writable: true,
    });
    Object.defineProperty(navigator, "language", {
      value: undefined,
      writable: true,
    });
    g1.setParameters({ locale: "auto", fallback_locale: "zh-CN" });
    await g1.initialize();
    expect(g1.i18n?.locale).toBe("en-US");
    expect(g1.i18n?.fallbackLocale).toBe("en-US");
  });

  it("returns es-MX as locale and en-US as fallback locale when auto detected locale is not supported", async () => {
    Object.defineProperty(navigator, "languages", {
      value: ["fr-FR"],
      writable: true,
    });
    Object.defineProperty(navigator, "language", {
      value: undefined,
      writable: true,
    });
    g1.setParameters({ locale: "auto", fallback_locale: "es-MX" });
    await g1.initialize();
    expect(g1.i18n?.locale).toBe("es-MX");
    expect(g1.i18n?.fallbackLocale).toBe("en-US");
  });

  it("returns en-US as locale and fallback locale when auto detected locale and fallback locale are not supported", async () => {
    Object.defineProperty(navigator, "languages", {
      value: ["fr-FR"],
      writable: true,
    });
    Object.defineProperty(navigator, "language", {
      value: undefined,
      writable: true,
    });
    g1.setParameters({ locale: "auto", fallback_locale: "zh-CN" });
    await g1.initialize();
    expect(g1.i18n?.locale).toBe("en-US");
    expect(g1.i18n?.fallbackLocale).toBe("en-US");
  });
});

describe("I18n switchToLocale", () => {
  beforeEach(async () => {
    g1 = new Game1();
    TestHelpers.setupDomAndGlobals();
  });

  it("returns translated text for locale", async () => {
    g1.setParameters({ locale: "es-MX", fallbackLocale: "en-US" });
    await g1.initialize();
    g1.i18n?.switchToLocale("en-US");
    expect(g1.i18n?.locale).toEqual("en-US");
  });
});

describe("I18n getTextLocalization", () => {
  beforeEach(async () => {
    g1 = new Game1();
    TestHelpers.setupDomAndGlobals();
  });

  it("returns translated text for locale", async () => {
    g1.setParameters({ locale: "es-MX", fallbackLocale: "en-US" });
    await g1.initialize();
    const textLocalization = g1.i18n?.getTextLocalization("NEXT_BUTTON");
    expect(textLocalization?.text).toEqual("Siguiente");
  });

  it("returns fallback text when translation missing", async () => {
    g1.setParameters({ locale: "hi-IN", fallbackLocale: "en-US" });
    await g1.initialize();
    const textLocalization = g1.i18n?.getTextLocalization("ERROR");
    expect(textLocalization?.text).toEqual("Error");
    expect(textLocalization?.isFallbackOrMissingTranslation).toBe(true);
  });

  it("returns key when translation and fallback missing", async () => {
    g1.setParameters({ locale: "hi-IN", fallbackLocale: "en-US" });
    await g1.initialize();
    const textLocalization = g1.i18n?.getTextLocalization("LOGIN");
    expect(textLocalization?.text).toEqual("LOGIN");
    expect(textLocalization?.isFallbackOrMissingTranslation).toBe(true);
  });
});

describe("I18n t method", () => {
  beforeEach(async () => {
    g1 = new Game1();
    TestHelpers.setupDomAndGlobals();
  });

  it("returns translated text for en-US", async () => {
    g1.setParameters({ locale: "en-US" });
    await g1.initialize();
    expect(g1.i18n?.t("NEXT_BUTTON")).toBe("Next");
  });

  it("returns translated text and interpolation for en-US", async () => {
    g1.setParameters({ locale: "en-US" });
    await g1.initialize();
    expect(g1.i18n?.t("BYE", { name: "Jim" })).toBe("Goodbye, Jim.");
  });

  it("throws error when interpolations not provided to a key using placeholders", async () => {
    g1.setParameters({ locale: "en-US" });
    await g1.initialize();
    const t = () => g1.i18n?.t("BYE");
    expect(t).toThrow();
  });

  it("returns translated text for es-MX", async () => {
    g1.setParameters({ locale: "es-MX" });
    await g1.initialize();
    expect(g1.i18n?.t("NEXT_BUTTON")).toBe("Siguiente");
  });

  it("returns translated text for hi-IN", async () => {
    g1.setParameters({ locale: "hi-IN" });
    await g1.initialize();
    expect(g1.i18n?.t("NEXT_BUTTON")).toBe("अगला");
  });

  it("when missing locale de-DE is specified, it returns undefined", async () => {
    g1.setParameters({ locale: "de-DE", fallbackLocale: "en-US" });
    await g1.initialize();
    expect(g1.i18n?.t("NEXT_BUTTON")).toBe(undefined);
  });
});

describe("I18n tf method", () => {
  beforeEach(async () => {
    g1 = new Game1();
    TestHelpers.setupDomAndGlobals();
  });

  it("returns translated text and fonts for en-US", async () => {
    g1.setParameters({ locale: "en-US" });
    await g1.initialize();
    expect(g1.i18n?.tf("NEXT_BUTTON")?.text).toBe("Next");
    expect(g1.i18n?.tf("NEXT_BUTTON")?.fontName).toBe(undefined);
    expect(g1.i18n?.tf("NEXT_BUTTON")?.fontNames).toBe(undefined);
  });

  it("returns translated text and fonts and interpolation for en-US", async () => {
    g1.setParameters({ locale: "en-US" });
    await g1.initialize();
    expect(g1.i18n?.tf("BYE", { name: "Jim" })?.text).toBe("Goodbye, Jim.");
    expect(g1.i18n?.tf("NEXT_BUTTON")?.fontName).toBe(undefined);
    expect(g1.i18n?.tf("NEXT_BUTTON")?.fontNames).toBe(undefined);
  });

  it("returns translated text and fonts with font customization for en-US", async () => {
    g1.setParameters({ locale: "en-US" });
    await g1.initialize();
    expect(g1.i18n?.tf("EMOJI_WELCOME")?.text).toBe("👋 Hello");
    expect(g1.i18n?.tf("EMOJI_WELCOME")?.fontName).toBe("emoji");
  });

  it("returns translated text and fonts for es-MX", async () => {
    g1.setParameters({ locale: "es-MX" });
    await g1.initialize();
    expect(g1.i18n?.tf("NEXT_BUTTON")?.text).toBe("Siguiente");
    expect(g1.i18n?.tf("NEXT_BUTTON")?.fontName).toBe(undefined);
    expect(g1.i18n?.tf("NEXT_BUTTON")?.fontNames).toBe(undefined);
  });

  it("returns translated text and fonts with font customization for es-MX", async () => {
    g1.setParameters({ locale: "es-MX" });
    await g1.initialize();
    expect(g1.i18n?.tf("EMOJI_WELCOME")?.text).toBe("👋 Hola");
    expect(g1.i18n?.tf("EMOJI_WELCOME")?.fontName).toBe("emoji");
  });

  it("returns translated text and fonts for hi-IN", async () => {
    g1.setParameters({ locale: "hi-IN" });
    await g1.initialize();
    expect(g1.i18n?.tf("NEXT_BUTTON")?.text).toBe("अगला");
    expect(g1.i18n?.tf("NEXT_BUTTON")?.fontName).toBe("devanagari");
    expect(g1.i18n?.tf("NEXT_BUTTON")?.fontNames).toBe(undefined);
  });

  it("returns translated text and fonts with font customization for hi-IN", async () => {
    g1.setParameters({ locale: "hi-IN" });
    await g1.initialize();
    expect(g1.i18n?.tf("EMOJI_WELCOME")?.text).toBe("👋 नमस्कार");
    expect(g1.i18n?.tf("EMOJI_WELCOME")?.fontName).toBe(undefined);
    expect(g1.i18n?.tf("EMOJI_WELCOME")?.fontNames).toEqual([
      "devanagari",
      "emoji",
    ]);
  });

  it("when missing locale de-DE is specified, it returns undefined", async () => {
    g1.setParameters({ locale: "de-DE", fallbackLocale: "en-US" });
    await g1.initialize();
    expect(g1.i18n?.tf("NEXT_BUTTON")).toBe(undefined);
  });
});
