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
} from "@m2c2kit/core";
import { Canvas } from "canvaskit-wasm";

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

interface InternalKeyConfiguration
  extends KeyConfiguration,
    Omit<KeyConfiguration, "keyIconShapeOptions"> {
  /** Icon to show on the key. */
  keyIcon?: Shape;
}

export type VirtualKeyboardRow = Array<
  KeyConfiguration | string | Array<string>
>;

type InternalVirtualKeyboardRow = Array<
  InternalKeyConfiguration | string | Array<string>
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

export interface VirtualKeyboardEvent extends M2NodeEvent {
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

interface Key extends InternalKeyConfiguration {
  keyLabel?: Label;
}

export class VirtualKeyboard extends Composite {
  compositeType = "VirtualKeyboard";
  private keyboardHorizontalPaddingPercent: number;
  private keyboardVerticalPaddingPercent: number;
  private keyHorizontalPaddingPercent: number;
  private keyVerticalPaddingPercent: number;
  private rowsConfiguration = new Array<InternalVirtualKeyboardRow>();
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

  private shiftActivated = false;
  private shiftKeyShape: Shape | undefined;
  private keyShapes = new Array<Shape>();

  // VirtualKeyboard defaults to being user interactive.
  override _isUserInteractionEnabled = true;

  /**
   * An on-screen keyboard that can be used to enter text.
   *
   * @param options - {@link VirtualKeyboardOptions}
   */
  constructor(options: VirtualKeyboardOptions) {
    super(options);
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
      this.rowsConfiguration = options.rows.map((row) => {
        const internalRow = row.map((key) => {
          if (key instanceof Object && !Array.isArray(key)) {
            const internalKeyConfig = key as InternalKeyConfiguration;
            if (key.keyIconShapeOptions) {
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
  }

  override initialize(): void {
    if (this.rowsConfiguration.length === 0) {
      const numKeys: InternalVirtualKeyboardRow = [
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
      const row1: InternalVirtualKeyboardRow = [
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
      const row2: InternalVirtualKeyboardRow = [
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
      };
      const row3: InternalVirtualKeyboardRow = [
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
      const row4: VirtualKeyboardRow = [
        { code: " ", labelText: "SPACE", widthRatio: 5 },
      ];

      const keyboardRows: Array<VirtualKeyboardRow> = [
        numKeys,
        row1,
        row2,
        row3,
        row4,
      ];
      this.rowsConfiguration = keyboardRows;
      this.keysPerRow = this.rowsConfiguration.reduce(
        (max, row) => Math.max(max, row.length),
        0,
      );
      this.fontSize = this.size.height / this.rowsConfiguration.length / 2.5;
    }

    const keyboardRectangle = new Shape({
      rect: { size: this.size },
      fillColor: this.backgroundColor,
    });
    this.addChild(keyboardRectangle);

    const rows: Array<Array<Key>> = this.rowsConfiguration.map((row) => {
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
        } as KeyConfiguration;
      });
    });

    const keyboardOrigin: Point = {
      x: -keyboardRectangle.size.width / 2,
      y: -keyboardRectangle.size.height / 2,
    };

    const keyboardVerticalPadding =
      (this.keyboardVerticalPaddingPercent ?? 0.025) * this.size.height;
    const keyboardHorizontalPadding =
      (this.keyboardHorizontalPaddingPercent ?? 0.02) * this.size.width;
    const keyBoxHeight =
      (this.size.height - 2 * keyboardVerticalPadding) / rows.length;
    const keyBoxWidth =
      (this.size.width - 2 * keyboardHorizontalPadding) / this.keysPerRow;

    this.keyShapes = [];

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
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
            .map((s) => s.trim())
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
        });
        keyBox.addChild(keyShape);
        this.keyShapes.push(keyShape);

        keyShape.onTapUp((tapEvent) => {
          let keyAsString = "";
          if (!key.isShift) {
            if (this.shiftActivated) {
              this.shiftActivated = false;
              if (this.shiftKeyShape) {
                this.shiftKeyShape.fillColor = this.keyColor;
                if (key.keyIcon) {
                  key.keyIcon.fillColor = WebColors.Transparent;
                }
              }
              rows
                .flatMap((k) => k)
                .forEach((k) => {
                  if (k.keyLabel?.text !== undefined) {
                    k.keyLabel.text = k.labelText ?? "";
                  }
                });
              keyAsString = key.labelTextShifted ?? key.code;
            } else {
              keyAsString = key.labelText ?? key.code;
            }
            if (key.code === " " || key.code === "Backspace") {
              keyAsString = key.code;
            }
            keyShape.fillColor = this.keyColor;
          } else {
            if (!this.shiftActivated) {
              keyShape.fillColor = this.keyColor;
            } else {
              keyShape.fillColor = this.specialKeyDownColor;
            }
            keyAsString = key.code;
          }
          letterCircle.hidden = true;

          if (this.eventListeners.length > 0) {
            this.eventListeners
              .filter(
                (listener) =>
                  listener.type === M2EventType.CompositeCustom &&
                  listener.compositeType === "VirtualKeyboardKeyUp",
              )
              .forEach((listener) => {
                const virtualKeyboardEvent: VirtualKeyboardEvent = {
                  type: M2EventType.CompositeCustom,
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
                };
                listener.callback(virtualKeyboardEvent);
              });
          }
        });

        keyShape.onTapDown((tapEvent) => {
          if (key.isShift) {
            this.shiftActivated = !this.shiftActivated;
            if (this.shiftActivated) {
              keyShape.fillColor = this.specialKeyDownColor;
              if (key.keyIcon) {
                key.keyIcon.fillColor = WebColors.Black;
              }
              rows
                .flatMap((k) => k)
                .forEach((k) => {
                  if (k.keyLabel?.text !== undefined) {
                    k.keyLabel.text = k.labelTextShifted ?? k.labelText ?? "";
                  }
                });
            } else {
              keyShape.fillColor = this.keyColor;
              if (key.keyIcon) {
                key.keyIcon.fillColor = WebColors.Transparent;
              }
              rows
                .flatMap((k) => k)
                .forEach((k) => {
                  if (k.keyLabel?.text !== undefined) {
                    k.keyLabel.text = k.labelText ?? "";
                  }
                });
            }
          }
          let keyAsString = "";
          if (key.isShift || key.code === " " || key.code === "Backspace") {
            keyShape.fillColor = this.specialKeyDownColor;
            keyAsString = key.code;
          } else {
            keyShape.fillColor = this.keyDownColor;
            if (this.showKeyDownPreview) {
              letterCircle.hidden = false;
              letterCircle.position.x = keyBox.position.x;
              letterCircle.position.y = keyBox.position.y - keyHeight * 1.2;
              if (this.shiftActivated) {
                letterCircleLabel.text = key.labelTextShifted ?? key.code;
              } else {
                letterCircleLabel.text = key.labelText ?? key.code;
              }
            }
            if (this.shiftActivated) {
              keyAsString = key.labelTextShifted ?? key.code;
            } else {
              keyAsString = key.labelText ?? key.code;
            }
          }

          if (this.eventListeners.length > 0) {
            this.eventListeners
              .filter(
                (listener) =>
                  listener.type === M2EventType.CompositeCustom &&
                  listener.compositeType === "VirtualKeyboardKeyDown",
              )
              .forEach((listener) => {
                const virtualKeyboardEvent: VirtualKeyboardEvent = {
                  type: M2EventType.CompositeCustom,
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
                };
                listener.callback(virtualKeyboardEvent);
              });
          }
        });

        keyShape.onTapLeave(() => {
          keyShape.fillColor = this.keyColor;
          letterCircle.hidden = true;
        });

        const keyLabel = new Label({
          text: key.labelText,
          fontSize: this.fontSize,
          fontNames: this.fontNames,
        });
        keyBox.addChild(keyLabel);
        key.keyLabel = keyLabel;

        if (key.isShift) {
          this.shiftKeyShape = keyShape;
        }

        if (key.keyIcon) {
          keyBox.addChild(key.keyIcon);
        }

        keyboardRectangle.addChild(keyBox);
      }
    }

    const letterCircle = new Shape({
      circleOfRadius: 28,
      fillColor: WebColors.Silver,
      hidden: true,
    });
    keyboardRectangle.addChild(letterCircle);
    const letterCircleLabel = new Label({
      text: "",
      fontSize: this.fontSize,
      fontNames: this.fontNames,
    });
    letterCircle.addChild(letterCircleLabel);

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
      type: M2EventType.CompositeCustom,
      compositeType: "VirtualKeyboardKeyDown",
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
      type: M2EventType.CompositeCustom,
      compositeType: "VirtualKeyboardKeyUp",
      nodeUuid: this.uuid,
      callback: <(ev: M2NodeEvent) => void>callback,
    };

    this.addVirtualKeyboardEventListener(eventListener, options);
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
    this.keyShapes.forEach((keyShape) => {
      keyShape.isUserInteractionEnabled = isUserInteractionEnabled;
    });
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
}
