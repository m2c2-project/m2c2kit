import {
  M2NodeEvent,
  CompositeOptions,
  RgbaColor,
  Size,
  Composite,
  WebColors,
  Sprite,
  CallbackOptions,
  M2NodeEventListener,
  M2EventType,
  Shape,
  Point,
  Label,
  TapEvent,
  IDrawable,
  Timer,
  CompositeEvent,
} from "@m2c2kit/core";
import { Canvas } from "canvaskit-wasm";

export interface LocalePickerOptions extends CompositeOptions {
  /** Background color of dialog box. Default is WebColors.White */
  backgroundColor?: RgbaColor;
  /** Locales to choose from in the dialog box. Default is the locales in the game's `Translation`. */
  localeOptions?: Array<LocaleOption>;
  /** What to show as the currently selected locale in the picker. Default is the game's current locale. */
  currentLocale?: string;
  /** Alpha level for the overlay that dims the scene underneath the dialog box. Default is .5 */
  overlayAlpha?: number;
  /** Size of dialog box. Default is automatically sized to fit the number of locale options. */
  size?: Size;
  /** Corner radius of dialog box; can be used to make rounded corners */
  cornerRadius?: number;
  /** Font size of locale options in dialog box. Default is 24. */
  fontSize?: number;
  /** Font color of locale options in dialog box. Default is WebColors.Black */
  fontColor?: RgbaColor;
  /** Image to use for LocalePicker. Default is a globe SVG, 32x32. */
  icon?: LocalePickerIcon;
  /** Position of the LocalePicker icon. Default is &#123; x: 32, y: 32 &#125; */
  iconPosition: Point;
  /** Should the selection in the LocalePicker automatically switch the game's locale? Default is true. */
  automaticallyChangeLocale?: boolean;
}

export interface LocalePickerIcon {
  /** The HTML SVG tag, in string form, that will be rendered to display the locale.
   * Must begin with &#60;svg> and end with &#60;/svg> */
  svgString?: string;
  /** Name of image to use for LocalePicker. Must have been previously loaded */
  imageName?: string;
  /** Height to scale image to */
  height: number;
  /** Width to scale image to */
  width: number;
}

export interface LocaleOption {
  /** Human-readable text description of the locale. */
  text: string;
  /** SVG of the locale. */
  svg?: LocaleSvg;
  /** Locale in language-country format, xx-YY. */
  locale: string;
}

export interface LocalePickerResult {
  /** Locale that was selected. Is undefined if dialog was dismissed. */
  locale?: string;
}

export interface LocalePickerEvent extends CompositeEvent {
  type: "Composite";
  compositeType: "LocalePicker";
  compositeEventType: "LocalePickerResult";
  result: LocalePickerResult;
}

interface LocaleSvg {
  /** The HTML SVG tag, in string form, that will be rendered to display the locale.
   * Must begin with &#60;svg> and end with &#60;/svg> */
  svgString: string;
  /** Height to scale image to */
  height: number;
  /** Width to scale image to */
  width: number;
}

export class LocalePicker extends Composite {
  readonly compositeType = "LocalePicker";
  private readonly DEFAULT_FONT_SIZE = 24;
  automaticallyChangeLocale = true;
  private _localeOptions = new Array<LocaleOption>();
  private _backgroundColor = WebColors.White;
  private _fontSize = this.DEFAULT_FONT_SIZE;
  private _fontColor = WebColors.Black;
  private _currentLocale?: string;
  private _cornerRadius = 8;
  private _overlayAlpha = 0.5;
  private _icon: LocalePickerIcon = {
    // public domain SVG from https://commons.wikimedia.org/wiki/File:Globe_icon.svg
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="420" stroke="#000" fill="none"><path stroke-width="26" d="M209 15a195 195 0 1 0 2 0z"/><path stroke-width="18" d="M210 15v390m195-195H15M59 90a260 260 0 0 0 302 0m0 240a260 260 0 0 0-302 0M195 20a250 250 0 0 0 0 382m30 0a250 250 0 0 0 0-382"/></svg>`,
    height: 32,
    width: 32,
  };
  private _iconPosition: Point = { x: 32, y: 32 };
  private iconSprite?: Sprite;
  /**
   * Wrap displayed locale in double angle quotes if it is the current locale.
   * Note: Although the code editor will allow us to enter almost any
   * unicode character, it will not render correctly if the font does
   * not support the character. Thus, be careful to use characters that
   * are supported by the font. For example, check a page like
   * https://www.fontspace.com/roboto-font-f13281 to see which characters
   * are supported by Roboto Regular, which is often the default font in
   * m2c2kit. Emoji or checkmarks like ✓ are not in Roboto Regular!
   */
  private readonly LEFT_SELECTION_INDICATOR = "«";
  private readonly RIGHT_SELECTION_INDICATOR = "»";

  /**
   * An icon and dialog box for selecting a locale from a list of options.
   *
   * @remarks This composite node is composed of a dialog box that appears
   * when the user taps a globe icon. Typically, the `LocalePicker` will be
   * added as a free node to the game so that it exists independently of
   * the game's scenes. The dialog box contains a list of locales that the
   * user can choose from. By default, this list is populated with the locales
   * in the game's `Translation` object. When the user selects a locale, the
   * dialog box disappears and the locale is set as the game's current locale.
   *  The dialog box is automatically sized to fit the number of locale
   * options.
   *
   * @example
   * let localePicker: LocalePicker;
   * if (game.getParameter<boolean>("show_locale_picker")) {
   *   localePicker = new LocalePicker();
   *   game.addFreeNode(localePicker);
   * }
   *
   * @param options - {@link LocalePickerOptions}
   */
  constructor(options?: LocalePickerOptions) {
    super(options);
    // set zPosition to max value so it is always on top
    this.zPosition = Number.MAX_VALUE;

    if (!options) {
      return;
    }

    if (options.localeOptions) {
      this.localeOptions = options.localeOptions;
    }

    if (options.backgroundColor) {
      this.backgroundColor = options.backgroundColor;
    }

    if (options.overlayAlpha !== undefined) {
      this.overlayAlpha = options.overlayAlpha;
    }

    if (options.fontSize !== undefined) {
      this.fontSize = options.fontSize;
    }

    if (options.fontColor) {
      this.fontColor = options.fontColor;
    }

    if (options.cornerRadius) {
      this.cornerRadius = options.cornerRadius;
    }

    if (options.currentLocale !== undefined) {
      this.currentLocale = options.currentLocale;
    }

    if (options.icon) {
      this.icon = options.icon;
    }

    if (options.automaticallyChangeLocale !== undefined) {
      this.automaticallyChangeLocale = options.automaticallyChangeLocale;
    }
  }

  /**
   * Executes a callback when the user selects a locale.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onResult(
    callback: (localePickerEvent: LocalePickerEvent) => void,
    options?: CallbackOptions,
  ): void {
    const eventListener: M2NodeEventListener<LocalePickerEvent> = {
      type: M2EventType.Composite,
      compositeType: "LocalePickerResult",
      nodeUuid: this.uuid,
      callback: callback,
    };

    if (options?.replaceExisting) {
      this.eventListeners = this.eventListeners.filter(
        (listener) =>
          !(
            listener.nodeUuid === eventListener.nodeUuid &&
            listener.type === "LocalePickerResult"
          ),
      );
    }
    this.eventListeners.push(eventListener as M2NodeEventListener<M2NodeEvent>);
  }

  override initialize(): void {
    if (this.currentLocale === undefined) {
      this.currentLocale = this.game.i18n?.locale;
    }

    if (this.localeOptions.length === 0) {
      const locales = Object.keys(this.game.i18n?.translation || {});
      locales
        .filter((locale) => locale !== "configuration")
        .forEach((locale) => {
          this.localeOptions.push({
            text: this.game.i18n?.translation[locale].localeName || locale,
            locale: locale,
            svg: this.game.i18n?.translation[locale].localeSvg,
          });
        });
    }

    if (this.localeOptions.length === 0) {
      throw new Error("No locales available for LocalePicker");
    }

    /**
     * Rather than `this.removeAllChildren()`, we remove all children except
     * the icon. Otherwise, the icon will flicker when the dialog is shown.
     */
    this.children
      .filter((child) => child.name !== "localePickerIcon")
      .forEach((child) => this.removeChild(child));

    // it is OK not to await this.
    this.game.imageManager.loadImages([
      {
        imageName: "__localePickerIcon",
        svgString: this.icon.svgString,
        height: this.icon.height,
        width: this.icon.width,
      },
    ]);

    if (!this.iconSprite) {
      this.iconSprite = new Sprite({
        // name is how we refer to this sprite, as a node.
        name: "localePickerIcon",
        // imageName is the loaded image that we can assign to the sprite
        imageName: "__localePickerIcon",
        position: this.iconPosition,
        isUserInteractionEnabled: true,
      });
      this.addChild(this.iconSprite);

      this.iconSprite.onTapDown(() => {
        this.setDialogVisibility(true);
      });
    }

    const overlay = new Shape({
      rect: {
        width: m2c2Globals.canvasCssWidth,
        height: m2c2Globals.canvasCssHeight,
        x: m2c2Globals.canvasCssWidth / 2,
        y: m2c2Globals.canvasCssHeight / 2,
      },
      fillColor: [0, 0, 0, this.overlayAlpha],
      zPosition: -1,
      isUserInteractionEnabled: true,
      hidden: true,
    });
    overlay.onTapDown((e) => {
      e.handled = true;
      if (this.eventListeners.length > 0) {
        this.eventListeners
          .filter((listener) => listener.type === "LocalePickerResult")
          .forEach((listener) => {
            const languagePickerEvent: LocalePickerEvent = {
              type: M2EventType.Composite,
              compositeType: this.compositeType,
              compositeEventType: "LocalePickerResult",
              target: this,
              handled: false,
              result: {
                locale: undefined,
              },
              timestamp: Timer.now(),
              iso8601Timestamp: new Date().toISOString(),
            };
            listener.callback(languagePickerEvent);
          });
      }
      this.setDialogVisibility(false);
    });
    this.addChild(overlay);

    /**
     * Because the locale options in the dialog box could be a mix of text and
     * SVGs, we cannot use a label that automatically takes care of text
     * placement. We must manually calculate the lineHeight based on the
     * fontSize. With a default fontSize of 24, the lineHeight is 50. If the
     * fontSize is changed, the lineHeight will be scaled based on the
     * fontSize.
     */
    const lineHeight = (this.fontSize / this.DEFAULT_FONT_SIZE) * 50;
    const dialogHeight = this.localeOptions.length * lineHeight;
    const dialogWidth = m2c2Globals.canvasCssWidth / 2;

    const sceneCenter: Point = {
      x: m2c2Globals.canvasCssWidth / 2,
      y: m2c2Globals.canvasCssHeight / 2,
    };

    const localeDialog = new Shape({
      rect: {
        width: dialogWidth,
        height: dialogHeight,
        x: sceneCenter.x,
        y: sceneCenter.y,
      },
      cornerRadius: this.cornerRadius,
      fillColor: this.backgroundColor,
      isUserInteractionEnabled: true,
      hidden: true,
    });
    localeDialog.onTapDown((e) => {
      e.handled = true;
    });
    this.addChild(localeDialog);

    for (let i = 0; i < this.localeOptions.length; i++) {
      const localeOption = this.localeOptions[i];

      if (!localeOption.svg) {
        let labelText = localeOption.text;
        if (this.currentLocale === localeOption.locale) {
          labelText = `${this.LEFT_SELECTION_INDICATOR} ${labelText} ${this.RIGHT_SELECTION_INDICATOR}`;
        }
        const text = new Label({
          text: labelText,
          fontSize: this.fontSize,
          fontColor: this.fontColor,
          position: {
            x: sceneCenter.x,
            y:
              sceneCenter.y +
              i * lineHeight -
              dialogHeight / 2 +
              lineHeight / 2,
          },
          isUserInteractionEnabled: true,
          zPosition: 1,
          hidden: true,
          // do not localize the text of each language option
          localize: false,
        });
        text.onTapDown((e) => {
          this.handleLocaleSelection(e, localeOption);
        });
        this.addChild(text);
      } else {
        // it is OK not to await this.
        this.game.imageManager.loadImages([
          {
            imageName: localeOption.text,
            svgString: localeOption.svg.svgString,
            height: localeOption.svg.height,
            width: localeOption.svg.width,
          },
        ]);
        const localeSprite = new Sprite({
          imageName: localeOption.text,
          position: {
            x: sceneCenter.x,
            y:
              sceneCenter.y +
              i * lineHeight -
              dialogHeight / 2 +
              lineHeight / 2,
          },
          isUserInteractionEnabled: true,
          zPosition: 1,
          hidden: true,
        });
        this.addChild(localeSprite);

        if (this.currentLocale === localeOption.locale) {
          const leftSelectionIndicator = new Label({
            text: this.LEFT_SELECTION_INDICATOR,
            fontSize: this.fontSize,
            fontColor: this.fontColor,
            position: {
              x: sceneCenter.x - localeOption.svg.width / 2,
              y:
                sceneCenter.y +
                i * lineHeight -
                dialogHeight / 2 +
                lineHeight / 2,
            },
            hidden: true,
            // do not localize the left selection indicator
            localize: false,
          });
          this.addChild(leftSelectionIndicator);
          const rightSelectionIndicator = new Label({
            text: this.RIGHT_SELECTION_INDICATOR,
            fontSize: this._fontSize,
            fontColor: this.fontColor,
            position: {
              x: sceneCenter.x + localeOption.svg.width / 2,
              y:
                sceneCenter.y +
                i * lineHeight -
                dialogHeight / 2 +
                lineHeight / 2,
            },
            hidden: true,
            // do not localize the left selection indicator
            localize: false,
          });
          this.addChild(rightSelectionIndicator);
        }

        localeSprite.onTapDown((e) => {
          this.handleLocaleSelection(e, localeOption);
        });
      }
    }

    this.needsInitialization = false;
  }

  private handleLocaleSelection(e: TapEvent, localeOption: LocaleOption) {
    e.handled = true;
    if (this.eventListeners.length > 0) {
      this.eventListeners
        .filter(
          (listener) =>
            listener.type === M2EventType.Composite &&
            listener.compositeType === "LocalePickerResult" &&
            listener.nodeUuid == this.uuid,
        )
        .forEach((listener) => {
          const languagePickerEvent: LocalePickerEvent = {
            type: M2EventType.Composite,
            compositeType: this.compositeType,
            compositeEventType: "LocalePickerResult",
            target: this,
            handled: false,
            result: {
              locale: localeOption.locale,
            },
            timestamp: Timer.now(),
            iso8601Timestamp: new Date().toISOString(),
          };
          listener.callback(languagePickerEvent);
        });
    }
    this.setDialogVisibility(false);
    if (this.automaticallyChangeLocale) {
      this.game.i18n?.switchToLocale(localeOption.locale);
      this.currentLocale = localeOption.locale;
    }
  }

  private setDialogVisibility(visible: boolean) {
    this.children
      .filter((child) => child.name !== "localePickerIcon")
      .forEach((child) => {
        child.hidden = !visible;
      });
  }

  get backgroundColor(): RgbaColor {
    return this._backgroundColor;
  }
  set backgroundColor(backgroundColor: RgbaColor) {
    this._backgroundColor = backgroundColor;
    this.needsInitialization = true;
  }

  get fontSize(): number {
    return this._fontSize;
  }
  set fontSize(fontSize: number) {
    this._fontSize = fontSize;
    this.needsInitialization = true;
  }

  get fontColor(): RgbaColor {
    return this._fontColor;
  }
  set fontColor(fontColor: RgbaColor) {
    this._fontColor = fontColor;
    this.needsInitialization = true;
  }

  get cornerRadius(): number {
    return this._cornerRadius;
  }
  set cornerRadius(cornerRadius: number) {
    this._cornerRadius = cornerRadius;
    this.needsInitialization = true;
  }

  get overlayAlpha(): number {
    return this._overlayAlpha;
  }
  set overlayAlpha(alpha: number) {
    this._overlayAlpha = alpha;
    this.needsInitialization = true;
  }

  get icon(): LocalePickerIcon {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const localePicker = this;
    /**
     * We return an object with getters and setters for the icon properties
     * so that we can update the icon and trigger a re-initialization of the
     * LocalePicker if icon properties are changed.
     */
    return {
      get svgString(): string | undefined {
        return localePicker._icon.svgString;
      },
      set svgString(svgString: string) {
        localePicker._icon.svgString = svgString;
        localePicker.needsInitialization = true;
      },
      get imageName(): string | undefined {
        return localePicker._icon.imageName;
      },
      set imageName(imageName: string) {
        localePicker._icon.imageName = imageName;
        localePicker.needsInitialization = true;
      },
      get height(): number {
        return localePicker._icon.height;
      },
      set height(height: number) {
        localePicker._icon.height = height;
        localePicker.needsInitialization = true;
      },
      get width(): number {
        return localePicker._icon.width;
      },
      set width(width: number) {
        localePicker._icon.width = width;
        localePicker.needsInitialization = true;
      },
    };
  }
  set icon(icon: LocalePickerIcon) {
    this._icon = icon;
    this.needsInitialization = true;
  }

  get iconPosition(): Point {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const localePicker = this;
    return {
      get x(): number {
        return localePicker._iconPosition.x;
      },
      set x(x: number) {
        localePicker._iconPosition.x = x;
        if (localePicker.iconSprite) {
          localePicker.iconSprite.position = localePicker._iconPosition;
        }
        localePicker.needsInitialization = true;
      },
      get y(): number {
        return localePicker._iconPosition.y;
      },
      set y(y: number) {
        localePicker._iconPosition.y = y;
        if (localePicker.iconSprite) {
          localePicker.iconSprite.position = localePicker._iconPosition;
        }
        localePicker.needsInitialization = true;
      },
    };
  }
  set iconPosition(position: Point) {
    this._iconPosition = position;
    if (this.iconSprite) {
      this.iconSprite.position = position;
    }
    this.needsInitialization = true;
  }

  get localeOptions(): Array<LocaleOption> {
    return this._localeOptions;
  }

  set localeOptions(options: Array<LocaleOption>) {
    this._localeOptions = options;
    this.needsInitialization = true;
  }

  get currentLocale(): string | undefined {
    return this._currentLocale;
  }
  set currentLocale(locale: string | undefined) {
    if (locale === this.currentLocale) {
      return;
    }
    this._currentLocale = locale;
    this.needsInitialization = true;
  }

  update(): void {
    super.update();
  }

  draw(canvas: Canvas): void {
    super.drawChildren(canvas);
  }

  warmup(canvas: Canvas): void {
    this.initialize();
    this.children
      .filter((child) => child.isDrawable)
      .forEach((child) => {
        (child as unknown as IDrawable).warmup(canvas);
      });
  }

  /**
   * Duplicates a node using deep copy.
   *
   * @remarks This is a deep recursive clone (node and children).
   * The uuid property of all duplicated nodes will be newly created,
   * because uuid must be unique.
   *
   * @param newName - optional name of the new, duplicated node. If not
   * provided, name will be the new uuid
   */
  override duplicate(newName?: string): LocalePicker {
    throw new Error(`duplicate not implemented. ${newName}`);
  }
}
