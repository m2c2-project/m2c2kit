import {
  Shape,
  Label,
  WebColors,
  Point,
  Size,
  RgbaColor,
  Composite,
  CompositeOptions,
  M2Node,
  M2NodeEvent,
  M2EventType,
  IDrawable,
  M2NodeEventListener,
  ShapeOptions,
  CallbackOptions,
  M2c2KitHelpers,
  M2NodeConstructor,
  CompositeEvent,
  EventStoreMode,
  TapEvent,
} from "@m2c2kit/core";
import { Canvas } from "canvaskit-wasm";

/**
 * Additional, optional properties for a key in the `VirtualKeyboard`.
 *
 * @remarks This is used to define special keys (e.g., Shift, Backspace),
 * keys with icons, and keys of custom size.
 */
export interface KeyConfiguration {
  /** Width of the key in units of a regular key width. Default is 1. */
  widthRatio?: number;
  /** Width of the key in units of a regular key height. Default is 1. */
  heightRatio?: number;
  /** Identifier for the key. */
  code: string;
  /** Label to be shown on the key. */
  labelText?: string;
  /** Label to be shown on the key when shift is activated. */
  labelTextShifted?: string;
  /** True is the key should be hidden. */
  blank?: boolean;
  /** True is the key is a shift key. */
  isShift?: boolean;
  /** ShapeOptions of the optional icon to show on the key. */
  keyIconShapeOptions?: ShapeOptions;
}

/**
 * A row in the `VirtualKeyboard`.
 *
 * @remarks Each row is an array of objects that defines a key, where each
 * object can be one of the following:
 * -  a string, e.g., `a`. The string is the key in the keyboard's unshifted
 * state (`a`), and the string's value after applying `toUpperCase()` is the key
 * in the keyboard's shifted state (`A`).
 * - an array of two strings, e.g., `["1", "!"]`. The first string is the key
 * in the keyboard's unshifted state (`1`), and the second string is the key
 * in the keyboard's shifted state (`!`).
 * - A `KeyConfiguration` object, which can be used to further customize the
 * key's appearance and behavior.
 */
export type VirtualKeyboardRow = Array<
  string | Array<string> | KeyConfiguration
>;

export interface VirtualKeyboardOptions extends CompositeOptions {
  size: Size;
  /** Percent of the keyboard width that should be used for padding on the left and right sides. Default is .02 */
  keyboardHorizontalPaddingPercent?: number;
  /** Percent of the keyboard height that should be used for padding on the top and bottom sides. Default is .025 */
  keyboardVerticalPaddingPercent?: number;
  /** Percent of each key's width that should be used for padding on the left and right sides. Default is .10 */
  keyHorizontalPaddingPercent?: number;
  /** Percent of each key's height that should be used for padding on the top and bottom sides. Default is .10 */
  keyVerticalPaddingPercent?: number;
  /** Configuration of keyboard rows. Order is from top to bottom rows. */
  rows?: Array<VirtualKeyboardRow>;
  /** How many regular-sized keys should fit in a row? This is used for scaling purposes. If not provided, it will be inferred from the row configuration. */
  keysPerRow?: number;
  /** Size of font for keys. */
  fontSize?: number;
  /** The fonts for the key labels, if not the default font. */
  fontNames?: Array<string> | undefined;
  /** Comma-separated list of keys to hide. */
  hiddenKeys?: string;
  /** If true, only capital letters will be shown. */
  capitalLettersOnly?: boolean;
  /** Color of keys. */
  keyColor?: RgbaColor;
  /** Color of keys when pressed. */
  keyDownColor?: RgbaColor;
  /** Color of special keys when pressed. */
  specialKeyDownColor?: RgbaColor;
  /** Background color of keyboard. */
  backgroundColor?: RgbaColor;
  /** If true, a preview of the key that will be pressed will be shown. */
  showKeyDownPreview?: boolean;
}

export interface VirtualKeyboardEvent extends CompositeEvent {
  type: "Composite";
  compositeType: "VirtualKeyboard";
  compositeEventType:
    | "VirtualKeyboardKeyUp"
    | "VirtualKeyboardKeyDown"
    | "VirtualKeyboardKeyLeave";
  target: VirtualKeyboard | string;
  /** String that is generated when key is pressed, with any modifiers (e.g., Shift) applied. */
  key: string;
  /** Code for the key, not taking into account any modifiers. */
  code: string;
  /** True if the Shift key is pressed. */
  shiftKey: boolean;
  /** Metadata related to the key tap. */
  keyTapMetadata: KeyTapMetadata;
}

export interface KeyTapMetadata {
  /** Size of the key. */
  size: Size;
  /** Point on the key where the tap event occurred. */
  point: Point;
  /** Buttons pressed when the key was tapped. */
  buttons: number;
}

/**
 * `KeyConfigurationWithShape` is a `KeyConfiguration` with an optional m2c2kit
 * instantiated `Shape` for the key's icon, instead of a `ShapeOptions`
 * object.
 */
interface KeyConfigurationWithShape
  extends KeyConfiguration,
    Omit<KeyConfiguration, "keyIconShapeOptions"> {
  /** Icon to show on the key. */
  keyIcon?: Shape;
}

/**
 * The complete keyboard configuration for internal use, with all keys
 * represented as `KeyConfigurationWithShape` objects.
 */
type InternalKeyboardConfiguration = Array<Array<KeyConfigurationWithShape>>;

/**
 * `InternalKeyboardRow` is a `VirtualKeyboardRow`, but with the optional
 * `KeyConfiguration` objects replaced with `KeyConfigurationWithShape`
 * objects. Note: keys that are strings or arrays of strings are not changed.
 */
type InternalKeyboardRow = Array<
  KeyConfigurationWithShape | string | Array<string>
>;

export class VirtualKeyboard extends Composite {
  readonly compositeType = "VirtualKeyboard";
  private keyboardHorizontalPaddingPercent: number;
  private keyboardVerticalPaddingPercent: number;
  private keyHorizontalPaddingPercent: number;
  private keyVerticalPaddingPercent: number;
  private keyboardRows = new Array<InternalKeyboardRow>();
  private keysPerRow: number;
  private fontSize: number;
  private fontNames: Array<string> | undefined;
  private hiddenKeys: string;
  private capitalLettersOnly: boolean;
  private keyColor: RgbaColor;
  private keyDownColor: RgbaColor;
  private specialKeyDownColor: RgbaColor;
  private backgroundColor: RgbaColor;
  private showKeyDownPreview: boolean;
  private originalOptions: VirtualKeyboardOptions;

  private shiftActivated = false;
  private keyShapes = new Array<Shape>();
  private keyLabels = new Array<Label>();

  private letterCircle?: Shape;
  private letterCircleLabel?: Label;

  /**
   * An on-screen keyboard that can be used to enter text.
   *
   * @param options - {@link VirtualKeyboardOptions}
   */
  constructor(options: VirtualKeyboardOptions) {
    super(options);
    this.originalOptions = JSON.parse(JSON.stringify(options));
    if (options.isUserInteractionEnabled === undefined) {
      // VirtualKeyboard defaults to being user interactive.
      this._isUserInteractionEnabled = true;
    }
    this.size = options.size;
    this.position = options.position ?? { x: 0, y: 0 };
    this.keyboardHorizontalPaddingPercent =
      options.keyboardHorizontalPaddingPercent ?? 0.02;
    this.keyboardVerticalPaddingPercent =
      options.keyboardVerticalPaddingPercent ?? 0.025;
    this.keyHorizontalPaddingPercent =
      options.keyHorizontalPaddingPercent ?? 0.1;
    this.keyVerticalPaddingPercent = options.keyVerticalPaddingPercent ?? 0.1;
    if (options.rows !== undefined) {
      /**
       * Map the KeyConfiguration objects to InternalKeyConfiguration objects.
       * KeyConfiguration objects are used by the user to configure the
       * keyboard. The icon, optionally, is provided as a ShapeOptions
       * object. InternalKeyConfiguration has the icon as a ready-to-use Shape
       * object.
       */
      this.keyboardRows = options.rows.map((row) => {
        const internalRow = row.map((key) => {
          if (key instanceof Object && !Array.isArray(key)) {
            const internalKeyConfig = key as KeyConfigurationWithShape;
            if (key.keyIconShapeOptions) {
              key.keyIconShapeOptions.suppressEvents = true;
              internalKeyConfig.keyIcon = new Shape(key.keyIconShapeOptions);
              (internalKeyConfig as KeyConfiguration).keyIconShapeOptions =
                undefined;
            }
            return internalKeyConfig;
          } else {
            return key;
          }
        });
        return internalRow;
      });
    }
    this.keysPerRow = options.keysPerRow ?? NaN;
    this.fontSize = options.fontSize ?? NaN;
    this.fontNames = options.fontNames;
    this.hiddenKeys = options.hiddenKeys ?? "";
    this.capitalLettersOnly = options.capitalLettersOnly ?? false;
    this.keyColor = options.keyColor ?? WebColors.White;
    this.keyDownColor = options.keyDownColor ?? WebColors.Transparent;
    this.specialKeyDownColor =
      options.specialKeyDownColor ?? WebColors.LightSteelBlue;
    this.backgroundColor = options.backgroundColor ?? [242, 240, 244, 1];
    this.showKeyDownPreview = options.showKeyDownPreview ?? true;

    this.saveNodeNewEvent();
  }

  override get completeNodeOptions() {
    return {
      ...this.options,
      ...this.getNodeOptions(),
      ...this.getDrawableOptions(),
      ...this.originalOptions,
    };
  }

  override initialize(): void {
    /**
     * VirtualKeyboard defaults to being user interactive, but disable this
     * if we are in replay mode.
     */
    if (this.game.eventStore.mode === EventStoreMode.Replay) {
      this._isUserInteractionEnabled = false;
    }

    if (this.keyboardRows.length === 0) {
      this.keyboardRows = this.createDefaultKeyboardRows();
      this.keysPerRow = this.keyboardRows.reduce(
        (max, row) => Math.max(max, row.length),
        0,
      );
      this.fontSize = this.size.height / this.keyboardRows.length / 2.5;
    }

    const keyboardRectangle = new Shape({
      rect: { size: this.size },
      fillColor: this.backgroundColor,
      suppressEvents: true,
    });
    this.addChild(keyboardRectangle);

    const keyboard = this.internalKeyboardRowsToInternalKeyboardConfiguration(
      this.keyboardRows,
    );

    const keyboardOrigin: Point = {
      x: -keyboardRectangle.size.width / 2,
      y: -keyboardRectangle.size.height / 2,
    };

    const keyboardVerticalPadding =
      (this.keyboardVerticalPaddingPercent ?? 0.025) * this.size.height;
    const keyboardHorizontalPadding =
      (this.keyboardHorizontalPaddingPercent ?? 0.02) * this.size.width;
    const keyBoxHeight =
      (this.size.height - 2 * keyboardVerticalPadding) / keyboard.length;
    const keyBoxWidth =
      (this.size.width - 2 * keyboardHorizontalPadding) / this.keysPerRow;

    this.keyShapes = [];

    for (let r = 0; r < keyboard.length; r++) {
      const row = keyboard[r];
      const rowSumKeyWidths = row.reduce(
        (sum, key) => sum + (key.widthRatio ?? 1),
        0,
      );

      // extraPadding is additional padding to center the keys in the row
      // if the row is not full.
      let extraPadding = 0;
      if (rowSumKeyWidths < this.keysPerRow) {
        extraPadding =
          (this.size.width -
            2 * keyboardHorizontalPadding -
            keyBoxWidth * rowSumKeyWidths) /
          2;
      }

      for (let k = 0; k < row.length; k++) {
        const key = row[k];
        if (
          this.hiddenKeys
            ?.split(",")
            // " " is a special case for the space key code
            .map((s) => (s === " " ? " " : s.trim()))
            .includes(key.code)
        ) {
          continue;
        }
        const keyBoxWidthsSoFar =
          row.slice(0, k).reduce((sum, key) => sum + (key.widthRatio ?? 1), 0) *
          keyBoxWidth;
        const keyBox = new Shape({
          rect: {
            size: {
              width: keyBoxWidth * (key.widthRatio ?? 1),
              height: keyBoxHeight,
            },
          },
          fillColor: WebColors.Transparent,
          strokeColor: WebColors.Transparent,
          lineWidth: 1,
          position: {
            x:
              extraPadding +
              keyboardOrigin.x +
              keyboardHorizontalPadding +
              keyBoxWidthsSoFar +
              ((key.widthRatio ?? 1) * keyBoxWidth) / 2,
            y:
              keyboardOrigin.y +
              keyboardVerticalPadding +
              r * keyBoxHeight +
              keyBoxHeight / 2,
          },
          suppressEvents: true,
        });

        const keyWidth =
          keyBoxWidth * (key.widthRatio ?? 1) -
          2 * this.keyHorizontalPaddingPercent * keyBoxWidth;
        const keyHeight =
          keyBoxHeight -
          (key.heightRatio ?? 1) -
          2 * this.keyVerticalPaddingPercent * keyBoxHeight;
        const keyShape = new Shape({
          rect: { size: { width: keyWidth, height: keyHeight } },
          cornerRadius: 4,
          fillColor: this.keyColor,
          lineWidth: 0,
          isUserInteractionEnabled: this.isUserInteractionEnabled,
          suppressEvents: true,
        });
        // so we can reference keyShape by key code in handleCompositeEvent()
        keyShape.userData = { code: key.code };
        keyBox.addChild(keyShape);
        this.keyShapes.push(keyShape);

        const keyLabel = new Label({
          text: key.labelText,
          fontSize: this.fontSize,
          fontNames: this.fontNames,
          suppressEvents: true,
        });
        // so we can reference keyLabel by key code in handleCompositeEvent()
        keyLabel.userData = { code: key.code };
        keyBox.addChild(keyLabel);
        this.keyLabels.push(keyLabel);

        if (key.keyIcon) {
          keyBox.addChild(key.keyIcon);
        }

        keyboardRectangle.addChild(keyBox);

        keyShape.onTapUp((tapEvent) => {
          this.handleKeyShapeTapUp(key, keyShape, tapEvent);
        });

        keyShape.onTapDown((tapEvent) => {
          this.handleKeyShapeTapDown(key, keyShape, tapEvent);
        });

        keyShape.onTapLeave((tapEvent) => {
          this.handleKeyShapeTapLeave(key, keyShape, tapEvent);
        });
      }
    }

    this.letterCircle = new Shape({
      circleOfRadius: 28,
      fillColor: WebColors.Silver,
      hidden: true,
      suppressEvents: true,
    });
    keyboardRectangle.addChild(this.letterCircle);
    this.letterCircleLabel = new Label({
      text: "",
      fontSize: this.fontSize,
      fontNames: this.fontNames,
      suppressEvents: true,
    });
    this.letterCircle.addChild(this.letterCircleLabel);

    this.needsInitialization = false;
  }

  /**
   * Executes a callback when the user presses down on a key.
   *
   * @param callback - function to execute
   * @param options
   */
  onKeyDown(
    callback: (virtualKeyboardEvent: VirtualKeyboardEvent) => void,
    options?: CallbackOptions,
  ): void {
    const eventListener: M2NodeEventListener<VirtualKeyboardEvent> = {
      type: M2EventType.Composite,
      compositeEventType: "VirtualKeyboardKeyDown",
      compositeType: this.compositeType,
      nodeUuid: this.uuid,
      callback: <(ev: M2NodeEvent) => void>callback,
    };

    this.addVirtualKeyboardEventListener(eventListener, options);
  }

  /**
   * Executes a callback when the user releases a key.
   *
   * @param callback - function to execute
   * @param options
   */
  onKeyUp(
    callback: (virtualKeyboardEvent: VirtualKeyboardEvent) => void,
    options?: CallbackOptions,
  ): void {
    const eventListener: M2NodeEventListener<VirtualKeyboardEvent> = {
      type: M2EventType.Composite,
      compositeEventType: "VirtualKeyboardKeyUp",
      compositeType: this.compositeType,
      nodeUuid: this.uuid,
      callback: <(ev: M2NodeEvent) => void>callback,
    };

    this.addVirtualKeyboardEventListener(eventListener, options);
  }

  /**
   * Executes a callback when the user has pressed a key with the pointer, but
   * moves the pointer outside the key bounds before releasing the pointer.
   *
   * @remarks Typically, this event will not be used, since it is a user's
   * inaccurate interaction with the keyboard. However, it can be used to
   * provide feedback to the user that they have moved the pointer outside the
   * key bounds, and thus the key stroke will not be registered.
   *
   * @param callback - function to execute
   * @param options
   */
  onKeyLeave(
    callback: (virtualKeyboardEvent: VirtualKeyboardEvent) => void,
    options?: CallbackOptions,
  ): void {
    const eventListener: M2NodeEventListener<VirtualKeyboardEvent> = {
      type: M2EventType.Composite,
      compositeEventType: "VirtualKeyboardKeyLeave",
      compositeType: this.compositeType,
      nodeUuid: this.uuid,
      callback: <(ev: M2NodeEvent) => void>callback,
    };

    this.addVirtualKeyboardEventListener(eventListener, options);
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

  duplicate(newName?: string | undefined): M2Node {
    throw new Error(`Method not implemented. ${newName}`);
  }

  private handleKeyShapeTapDown(
    key: KeyConfigurationWithShape,
    keyShape: Shape,
    tapEvent: TapEvent,
  ) {
    if (key.isShift) {
      this.shiftActivated = !this.shiftActivated;
    }
    const keyAsString = this.getKeyAsString(key);
    const virtualKeyboardEvent: VirtualKeyboardEvent = {
      type: M2EventType.Composite,
      compositeType: "VirtualKeyboard",
      compositeEventType: "VirtualKeyboardKeyDown",
      target: this,
      handled: false,
      key: keyAsString,
      code: key.code,
      shiftKey: this.shiftActivated,
      keyTapMetadata: {
        size: keyShape.size,
        point: tapEvent.point,
        buttons: tapEvent.buttons,
      },
      ...M2c2KitHelpers.createTimestamps(),
    };
    this.handleCompositeEvent(virtualKeyboardEvent);
    this.saveEvent(virtualKeyboardEvent);
    if (this.eventListeners.length > 0) {
      this.eventListeners
        .filter(
          (listener) =>
            listener.type === M2EventType.Composite &&
            listener.compositeType === "VirtualKeyboard" &&
            listener.compositeEventType === "VirtualKeyboardKeyDown",
        )
        .forEach((listener) => {
          listener.callback(virtualKeyboardEvent);
        });
    }
  }

  private handleKeyShapeTapUp(
    key: KeyConfigurationWithShape,
    keyShape: Shape,
    tapEvent: TapEvent,
  ) {
    const keyAsString = this.getKeyAsString(key);
    const virtualKeyboardEvent: VirtualKeyboardEvent = {
      type: M2EventType.Composite,
      compositeType: "VirtualKeyboard",
      compositeEventType: "VirtualKeyboardKeyUp",
      target: this,
      handled: false,
      key: keyAsString,
      code: key.code,
      shiftKey: this.shiftActivated,
      keyTapMetadata: {
        size: keyShape.size,
        point: tapEvent.point,
        buttons: tapEvent.buttons,
      },
      ...M2c2KitHelpers.createTimestamps(),
    };
    this.handleCompositeEvent(virtualKeyboardEvent);
    this.saveEvent(virtualKeyboardEvent);
    if (this.eventListeners.length > 0) {
      this.eventListeners
        .filter(
          (listener) =>
            listener.type === M2EventType.Composite &&
            listener.compositeType === "VirtualKeyboard" &&
            listener.compositeEventType === "VirtualKeyboardKeyUp",
        )
        .forEach((listener) => {
          listener.callback(virtualKeyboardEvent);
        });
    }
  }

  private handleKeyShapeTapLeave(
    key: KeyConfigurationWithShape,
    keyShape: Shape,
    tapEvent: TapEvent,
  ) {
    const keyAsString = this.getKeyAsString(key);
    const virtualKeyboardEvent: VirtualKeyboardEvent = {
      type: M2EventType.Composite,
      compositeType: "VirtualKeyboard",
      compositeEventType: "VirtualKeyboardKeyLeave",
      target: this,
      handled: false,
      key: keyAsString,
      code: key.code,
      shiftKey: this.shiftActivated,
      keyTapMetadata: {
        size: keyShape.size,
        point: tapEvent.point,
        buttons: tapEvent.buttons,
      },
      ...M2c2KitHelpers.createTimestamps(),
    };
    this.handleCompositeEvent(virtualKeyboardEvent);
    this.saveEvent(virtualKeyboardEvent);
    if (this.eventListeners.length > 0) {
      this.eventListeners
        .filter(
          (listener) =>
            listener.type === M2EventType.Composite &&
            listener.compositeType === "VirtualKeyboard" &&
            listener.compositeEventType === "VirtualKeyboardKeyLeave",
        )
        .forEach((listener) => {
          listener.callback(virtualKeyboardEvent);
        });
    }
  }

  private getKeyAsString(key: KeyConfigurationWithShape): string {
    if (key.isShift || key.code === " " || key.code === "Backspace") {
      return key.code;
    } else {
      if (this.shiftActivated) {
        return key.labelTextShifted ?? key.code;
      } else {
        return key.labelText ?? key.code;
      }
    }
  }

  /**
   * Converts the keyboard rows to the internal keyboard configuration.
   *
   * @remarks This normalizes the keyboard rows so that each key is a
   * full `KeyConfigurationWithShape` object, instead of a string or array of
   * strings.
   *
   * @param keyboardRows
   * @returns the keyboard for internal use
   */
  private internalKeyboardRowsToInternalKeyboardConfiguration(
    keyboardRows: Array<InternalKeyboardRow>,
  ): InternalKeyboardConfiguration {
    return keyboardRows.map((row) => {
      return row.map((key) => {
        let widthRatio = 1;
        const heightRatio = 1;
        let code: string;
        let label: string;
        let labelShifted: string;
        let keyIcon: Shape | undefined;
        let isShift = false;
        if (typeof key === "string") {
          code = key;
          if (this.capitalLettersOnly) {
            label = code.toUpperCase();
          } else {
            label = code;
          }
          labelShifted = code.toUpperCase();
        } else if (Array.isArray(key)) {
          code = key[0];
          label = code;
          labelShifted = key[1];
        } else {
          code = key.code;
          label = key.labelText ?? "";
          labelShifted = key.labelTextShifted ?? label;
          widthRatio = key.widthRatio ?? 1;
          keyIcon = key.keyIcon;
          isShift = key.isShift ?? false;
        }
        return {
          widthRatio,
          heightRatio,
          code,
          labelText: label,
          labelTextShifted: labelShifted,
          keyIcon,
          isShift,
        } as KeyConfigurationWithShape;
      });
    });
  }

  override handleCompositeEvent(event: VirtualKeyboardEvent): void {
    const keyboard = this.internalKeyboardRowsToInternalKeyboardConfiguration(
      this.keyboardRows,
    );
    const keyShape = this.keyShapes.find((k) => k.userData.code === event.code);
    if (!keyShape) {
      throw new Error("keyShape is not defined");
    }

    this.shiftActivated = event.shiftKey;

    switch (event.compositeEventType) {
      case "VirtualKeyboardKeyDown": {
        this.handleKeyDownEvent(event, keyboard, keyShape);
        break;
      }
      case "VirtualKeyboardKeyUp": {
        this.handleKeyUpEvent(event, keyboard, keyShape);
        break;
      }
      case "VirtualKeyboardKeyLeave": {
        this.handleKeyLeaveEvent(event, keyboard, keyShape);
        break;
      }
      default: {
        throw new Error(
          `Unknown VirtualKeyboardEvent: ${event.compositeEventType}`,
        );
      }
    }
  }

  private handleKeyDownEvent(
    event: VirtualKeyboardEvent,
    keyboard: InternalKeyboardConfiguration,
    keyShape: Shape,
  ) {
    if (event.code.toLowerCase().includes("shift")) {
      if (event.shiftKey) {
        this.showKeyboardShifted(keyboard);
      } else {
        this.showKeyboardNotShifted(keyboard);
      }
    } else if (event.code === " " || event.code === "Backspace") {
      keyShape.fillColor = this.specialKeyDownColor;
    } else {
      keyShape.fillColor = this.keyDownColor;
      if (this.showKeyDownPreview) {
        if (!this.letterCircle || !this.letterCircleLabel) {
          throw new Error("letterCircle is not defined");
        }
        this.letterCircle.hidden = false;
        const keyBox = keyShape.parent as Shape;
        this.letterCircle.position.x = keyBox.position.x;
        if (keyShape.rect?.size?.height === undefined) {
          throw new Error("keyShape.rect.height is undefined");
        }
        this.letterCircle.position.y =
          keyBox.position.y - keyShape.rect.size.height * 1.2;
        const keyboard =
          this.internalKeyboardRowsToInternalKeyboardConfiguration(
            this.keyboardRows,
          );
        const key = keyboard.flat().find((k) => k.code === event.code);
        if (!key) {
          throw new Error("key is not defined");
        }
        if (this.shiftActivated) {
          this.letterCircleLabel.text = key.labelTextShifted ?? key.code;
        } else {
          this.letterCircleLabel.text = key.labelText ?? key.code;
        }
      }
    }
  }

  private handleKeyUpEvent(
    event: VirtualKeyboardEvent,
    keyboard: InternalKeyboardConfiguration,
    keyShape: Shape,
  ) {
    /**
     * If shift key was released, and shift was activated, this is a simple
     * shift key activation. Shift was activated on the key down event, so
     * do nothing.
     */
    if (event.code.toLowerCase().includes("shift") && event.shiftKey) {
      return;
    }

    /**
     * If shift key was released, and shift was not activated, this is a simple
     * shift key deactivation.
     */
    if (event.code.toLowerCase().includes("shift") && !event.shiftKey) {
      this.shiftActivated = false;
      this.showKeyboardNotShifted(keyboard);
      return;
    }

    keyShape.fillColor = this.keyColor;
    if (!this.letterCircle) {
      throw new Error("letterCircle is not defined");
    }
    this.letterCircle.hidden = true;

    /**
     * A non-shift key was released, and shift was activated. This means that
     * we need to deactivate shift and show the keyboard in the non-shifted
     * state. This is because our behavior is to deactivate shift when a
     * non-shift key is released.
     */
    if (!event.code.toLowerCase().includes("shift") && event.shiftKey) {
      this.shiftActivated = false;
      this.showKeyboardNotShifted(keyboard);
    }
  }

  private handleKeyLeaveEvent(
    event: VirtualKeyboardEvent,
    keyboard: InternalKeyboardConfiguration,
    keyShape: Shape,
  ) {
    if (event.code.toLowerCase().includes("shift")) {
      if (event.shiftKey) {
        this.showKeyboardNotShifted(keyboard);
        this.shiftActivated = false;
      } else {
        this.showKeyboardShifted(keyboard);
        this.shiftActivated = true;
      }
      return;
    }
    keyShape.fillColor = this.keyColor;
    if (!this.letterCircle) {
      throw new Error("letterCircle is not defined");
    }
    this.letterCircle.hidden = true;
  }

  private showKeyboardShifted(keyboard: InternalKeyboardConfiguration) {
    // change shift keys to special key color
    const shiftKeyShapes = this.keyShapes.filter((shape) =>
      (shape.userData.code as string).toLowerCase().includes("shift"),
    );
    shiftKeyShapes.forEach((shape) => {
      shape.fillColor = this.specialKeyDownColor;
    });

    // if shift keys have icons, change fill to black
    const shiftKeys = keyboard.flat().filter((k) => k.isShift);
    shiftKeys.forEach((k) => {
      if (k.keyIcon) {
        k.keyIcon.fillColor = WebColors.Black;
      }
    });

    // change key labels to shifted text
    keyboard
      .flatMap((k) => k)
      .forEach((k) => {
        const keyLabel = this.keyLabels.find((l) => l.userData.code === k.code);
        if (!keyLabel) {
          throw new Error("keyLabel is not defined");
        }
        if (keyLabel.text !== undefined) {
          keyLabel.text = k.labelTextShifted ?? "";
        }
      });
  }

  private showKeyboardNotShifted(keyboard: InternalKeyboardConfiguration) {
    // change shift keys back to regular color
    const shiftKeyShapes = this.keyShapes.filter((shape) =>
      (shape.userData.code as string).toLowerCase().includes("shift"),
    );
    shiftKeyShapes.forEach((shape) => {
      shape.fillColor = this.keyColor;
    });

    // if shift keys have icons, change fill back to transparent
    const shiftKeys = keyboard.flat().filter((k) => k.isShift);
    shiftKeys.forEach((k) => {
      if (k.keyIcon) {
        k.keyIcon.fillColor = WebColors.Transparent;
      }
    });

    // change key labels to regular text
    keyboard
      .flatMap((k) => k)
      .forEach((k) => {
        const keyLabel = this.keyLabels.find((l) => l.userData.code === k.code);
        if (!keyLabel) {
          throw new Error("keyLabel is not defined");
        }
        if (keyLabel.text !== undefined) {
          keyLabel.text = k.labelText ?? "";
        }
      });
  }

  private createDefaultKeyboardRows() {
    const numKeys: InternalKeyboardRow = [
      ["1", "!"],
      ["2", "@"],
      ["3", "#"],
      ["4", "$"],
      ["5", "%"],
      ["6", "^"],
      ["7", "&"],
      ["8", "*"],
      ["9", "("],
      ["0", ")"],
    ];
    const row1: InternalKeyboardRow = [
      "q",
      "w",
      "e",
      "r",
      "t",
      "y",
      "u",
      "i",
      "o",
      "p",
    ];
    const row2: InternalKeyboardRow = [
      "a",
      "s",
      "d",
      "f",
      "g",
      "h",
      "j",
      "k",
      "l",
    ];
    const shiftArrowShapeOptions: ShapeOptions = {
      path: {
        // Public Domain from https://www.freesvg.org
        pathString: "m288-6.6849e-14 -288 288h144v288h288v-288h144l-288-288z",
        width: 24,
      },
      lineWidth: 2,
      strokeColor: WebColors.Black,
      fillColor: WebColors.Transparent,
      suppressEvents: true,
    };
    const backspaceShapeOptions: ShapeOptions = {
      path: {
        // CC0 from https://www.svgrepo.com
        pathString:
          "M10.625 5.09 0 22.09l10.625 17H44.18v-34H10.625zm31.555 32H11.734l-9.375-15 9.375-15H42.18v30zm-23.293-6.293 7.293-7.293 7.293 7.293 1.414-1.414-7.293-7.293 7.293-7.293-1.414-1.414-7.293 7.293-7.293-7.293-1.414 1.414 7.293 7.293-7.293 7.293",
        width: 24,
      },
      lineWidth: 1,
      strokeColor: WebColors.Black,
      fillColor: WebColors.Red,
      suppressEvents: true,
    };
    const row3: InternalKeyboardRow = [
      {
        code: "Shift",
        isShift: true,
        widthRatio: 1.5,
        keyIcon: new Shape(shiftArrowShapeOptions),
      },
      "z",
      "x",
      "c",
      "v",
      "b",
      "n",
      "m",
      {
        code: "Backspace",
        widthRatio: 1.5,
        keyIcon: new Shape(backspaceShapeOptions),
      },
    ];
    const row4: InternalKeyboardRow = [
      { code: " ", labelText: "SPACE", widthRatio: 5 },
    ];

    const keyboardRows = [numKeys, row1, row2, row3, row4];
    return keyboardRows;
  }

  private addVirtualKeyboardEventListener(
    eventListener: M2NodeEventListener<VirtualKeyboardEvent>,
    options?: CallbackOptions,
  ) {
    if (options?.replaceExisting) {
      this.eventListeners = this.eventListeners.filter(
        (listener) =>
          !(
            listener.nodeUuid === eventListener.nodeUuid &&
            listener.type === eventListener.type &&
            listener.compositeType === eventListener.compositeType
          ),
      );
    }
    this.eventListeners.push(eventListener as M2NodeEventListener<M2NodeEvent>);
  }

  /**
   * Does the `VirtualKeyboard` respond to user events? Default is true.
   */
  override get isUserInteractionEnabled(): boolean {
    return this._isUserInteractionEnabled;
  }
  /**
   * Does the `VirtualKeyboard` respond to user events? Default is true.
   */
  override set isUserInteractionEnabled(isUserInteractionEnabled: boolean) {
    this._isUserInteractionEnabled = isUserInteractionEnabled;
    /**
     * Rather than redraw of the entire keyboard, we can simply update the
     * `isUserInteractionEnabled` property of each key shape. This means we
     * handle this property change a bit differently, since we are changing
     * keyboard node properties directly, rather that changing the properties
     * of the composite and then redrawing the composite. Specifically, in
     * event playback mode, this.keyShapes may be undefined (it has not yet
     * been initialized), so we need to check for that.
     */
    this.keyShapes?.forEach((keyShape) => {
      keyShape.isUserInteractionEnabled = isUserInteractionEnabled;
    });
  }
}

M2c2KitHelpers.registerM2NodeClass(
  VirtualKeyboard as unknown as M2NodeConstructor,
);
