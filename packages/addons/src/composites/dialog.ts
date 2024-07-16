import { Paint, Canvas } from "canvaskit-wasm";
import {
  M2NodeEvent,
  WebColors,
  Composite,
  CompositeOptions,
  Shape,
  Label,
  RgbaColor,
  Size,
  IDrawable,
  M2NodeEventListener,
  M2EventType,
  CallbackOptions,
  Timer,
} from "@m2c2kit/core";
import { Button } from "./button";

export interface DialogOptions extends CompositeOptions {
  /** Size of dialog box */
  size?: Size;
  /** Corner radius of dialog box; can be used to make rounded corners */
  cornerRadius?: number;
  /** Background color of dialog box. Default is WebColors.White */
  backgroundColor?: RgbaColor;
  /** Color of button text. Default is WebColors.White */
  fontColor?: RgbaColor;
  overlayAlpha?: number;
  positiveButtonText?: string;
  negativeButtonText?: string;
  positiveButtonColor?: RgbaColor;
  negativeButtonColor?: RgbaColor;
  messageText?: string;
}

export enum DialogResult {
  Dismiss = "Dismiss",
  Positive = "Positive",
  Negative = "Negative",
}

export interface DialogEvent extends M2NodeEvent {
  dialogResult: DialogResult;
}

export class Dialog extends Composite {
  compositeType = "Dialog";

  private _backgroundColor = WebColors.White;

  cornerRadius = 9;

  overlayAlpha = 0.5;
  contentText = "";
  positiveButtonText = "";
  negativeButtonText = "";

  private _fontColor = WebColors.White;
  private backgroundPaint?: Paint;

  // todo: add getters/setters so button can respond to changes in its options
  // todo: add default "behaviors" (?) like button click animation?
  constructor(options?: DialogOptions) {
    super(options);
    // set zPosition to max value so it is always on top
    this.zPosition = Number.MAX_VALUE;

    // by default, dialog is hidden
    this.hidden = true;

    if (!options) {
      return;
    }

    if (options.overlayAlpha) {
      this.overlayAlpha = options.overlayAlpha;
    }

    if (options.messageText) {
      this.contentText = options.messageText;
    }

    if (options.positiveButtonText) {
      this.positiveButtonText = options.positiveButtonText;
    }

    if (options.negativeButtonText) {
      this.negativeButtonText = options.negativeButtonText;
    }

    if (options.size) {
      this.size = options.size;
    }
    if (options.cornerRadius) {
      this.cornerRadius = options.cornerRadius;
    }
    // if (options.fontSize) {
    //   this.fontSize = options.fontSize;
    // }
    if (options.fontColor) {
      this.fontColor = options.fontColor;
    }
    if (options.backgroundColor) {
      this.backgroundColor = options.backgroundColor;
    }
  }

  show(): void {
    this.hidden = false;
  }

  onDialogResult(
    callback: (dialogResultEvent: DialogEvent) => void,
    options?: CallbackOptions,
  ): void {
    const eventListener: M2NodeEventListener<DialogEvent> = {
      type: M2EventType.Composite,
      compositeType: "DialogResult",
      nodeUuid: this.uuid,
      callback: callback,
    };

    if (options?.replaceExisting) {
      this.eventListeners = this.eventListeners.filter(
        (listener) =>
          !(
            listener.nodeUuid === eventListener.nodeUuid &&
            listener.type === eventListener.type
          ),
      );
    }
    this.eventListeners.push(eventListener as M2NodeEventListener<M2NodeEvent>);
  }

  override initialize(): void {
    this.removeAllChildren();

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
    });
    overlay.onTapDown((e) => {
      e.handled = true;
      this.hidden = true;
      if (this.eventListeners.length > 0) {
        this.eventListeners
          .filter((listener) => listener.type === M2EventType.Composite)
          .forEach((listener) => {
            const dialogEvent: DialogEvent = {
              type: M2EventType.Composite,
              target: this,
              handled: false,
              dialogResult: DialogResult.Dismiss,
              timestamp: Timer.now(),
              iso8601Timestamp: new Date().toISOString(),
            };
            listener.callback(dialogEvent);
          });
      }
    });
    this.addChild(overlay);

    const dialogBox = new Shape({
      rect: {
        width: 300,
        height: 150,
        x: m2c2Globals.canvasCssWidth / 2,
        y: m2c2Globals.canvasCssHeight / 2,
      },
      cornerRadius: this.cornerRadius,
      fillColor: this.backgroundColor,
      isUserInteractionEnabled: true,
    });
    dialogBox.onTapDown((e) => {
      e.handled = true;
    });
    this.addChild(dialogBox);

    const dialogBoxPrimaryText = new Label({
      text: this.contentText,
      fontSize: 24,
      position: { x: 200, y: 360 },
    });
    this.addChild(dialogBoxPrimaryText);

    const negativeButton = new Button({
      text: this.negativeButtonText,
      position: { x: 120, y: 440 },
      size: { width: 100, height: 40 },
      isUserInteractionEnabled: true,
      zPosition: 1,
    });
    negativeButton.onTapDown((e) => {
      e.handled = true;
      this.hidden = true;
    });
    negativeButton.onTapDown((e) => {
      e.handled = true;
      this.hidden = true;
      if (this.eventListeners.length > 0) {
        this.eventListeners
          .filter((listener) => listener.type === M2EventType.Composite)
          .forEach((listener) => {
            const dialogEvent: DialogEvent = {
              type: M2EventType.Composite,
              target: this,
              handled: false,
              dialogResult: DialogResult.Negative,
              timestamp: Timer.now(),
              iso8601Timestamp: new Date().toISOString(),
            };
            listener.callback(dialogEvent);
          });
      }
    });

    const positiveButton = new Button({
      text: this.positiveButtonText,
      position: { x: 280, y: 440 },
      size: { width: 100, height: 40 },
      isUserInteractionEnabled: true,
      zPosition: 1,
    });
    positiveButton.onTapDown((e) => {
      e.handled = true;
      this.hidden = true;
      if (this.eventListeners.length > 0) {
        this.eventListeners
          .filter((listener) => listener.type === M2EventType.Composite)
          .forEach((listener) => {
            const dialogEvent: DialogEvent = {
              type: M2EventType.Composite,
              target: this,
              handled: false,
              dialogResult: DialogResult.Positive,
              timestamp: Timer.now(),
              iso8601Timestamp: new Date().toISOString(),
            };
            listener.callback(dialogEvent);
          });
      }
    });

    this.addChild(negativeButton);
    this.addChild(positiveButton);

    this.needsInitialization = false;
  }

  get backgroundColor(): RgbaColor {
    return this._backgroundColor;
  }
  set backgroundColor(backgroundColor: RgbaColor) {
    this._backgroundColor = backgroundColor;
    this.needsInitialization = true;
  }
  get fontColor(): RgbaColor {
    return this._fontColor;
  }
  set fontColor(fontColor: RgbaColor) {
    this._fontColor = fontColor;
    this.needsInitialization = true;
  }

  get hidden(): boolean {
    return this._hidden;
  }
  set hidden(hidden: boolean) {
    this._hidden = hidden;
    this.needsInitialization;
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
  override duplicate(newName?: string): Dialog {
    throw new Error(`duplicate not implemented. ${newName}`);
    // const dest = new Dialog({
    //   ...this.getNodeOptions(),
    //   ...this.getDrawableOptions(),
    //   ...this.getTextOptions(),
    //   size: this.size,
    //   cornerRadius: this.cornerRadius,
    //   backgroundColor: this.backgroundColor,
    //   fontColor: this.fontColor,
    //   name: newName,
    // });

    // if (this.children.length > 0) {
    //   dest.children = this.children.map((child) => {
    //     const clonedChild = child.duplicate();
    //     clonedChild.parent = dest;
    //     return clonedChild;
    //   });
    // }

    //return dest;
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
}
