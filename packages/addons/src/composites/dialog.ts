import { Paint, Canvas } from "canvaskit-wasm";
import {
  EntityEvent,
  WebColors,
  Composite,
  CompositeOptions,
  Shape,
  Label,
  RgbaColor,
  Size,
  IDrawable,
  EntityEventListener,
} from "@m2c2kit/core";
import "../Globals";
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
  Dismiss = "dismiss",
  Positive = "positive",
  Negative = "negative",
}

export interface DialogEvent extends EntityEvent {
  dialogResult: DialogResult;
  //onActivityLifecycleChange?: (event: ActivityLifecycleEvent) => void;
}

export class Dialog extends Composite {
  compositeType = "dialog";

  private _backgroundColor = WebColors.White;

  cornerRadius = 9;

  overlayAlpha = 0.5;
  contentText = "";
  positiveButtonText = "";
  negativeButtonText = "";
  zPosition = Number.MAX_VALUE;
  hidden = true;

  private _fontColor = WebColors.White;
  private backgroundPaint?: Paint;

  // todo: add getters/setters so button can respond to changes in its options
  // todo: add default "behaviors" (?) like button click animation?
  constructor(options?: DialogOptions) {
    super(options);
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

    // if (options.text) {
    //   this.text = options.text;
    // }
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

  onDialolgResult(
    callback: (dailogResultEvent: DialogEvent) => void,
    replaceExistingCallback = true
  ): void {
    // By default, we'll replace the existing callback if there is one
    // Why? If the same setup code is called more than once for a scene that repeats, it could
    // add the same callback again. Usually, this is not the intent.

    // cast <(ev: EntityEvent) => void> is needed because callback parameter
    // in this onTapDown method has argument of type TapEvent, but
    // in the EntityEventListener type, the callback property expects a
    // callback with argument of type EntityEvent
    const eventListener: EntityEventListener = {
      eventType: "dialogresult",
      entityName: this.name,
      callback: <(ev: EntityEvent) => void>callback,
    };

    if (replaceExistingCallback) {
      this.eventListeners = this.eventListeners.filter(
        (listener) => listener.entityName !== eventListener.entityName
      );
    }
    this.eventListeners.push(eventListener);
  }

  override initialize(): void {
    this.removeAllChildren();

    const overlay = new Shape({
      rect: {
        width: Globals.canvasCssWidth,
        height: Globals.canvasCssHeight,
        x: Globals.canvasCssWidth / 2,
        y: Globals.canvasCssHeight / 2,
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
          .filter((listener) => listener.eventType === "dialogresult")
          .forEach((listener) => {
            const dialogEvent: DialogEvent = {
              target: this,
              handled: false,
              dialogResult: DialogResult.Dismiss,
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
        x: Globals.canvasCssWidth / 2,
        y: Globals.canvasCssHeight / 2,
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
          .filter((listener) => listener.eventType === "dialogresult")
          .forEach((listener) => {
            const dialogEvent: DialogEvent = {
              target: this,
              handled: false,
              dialogResult: DialogResult.Negative,
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
          .filter((listener) => listener.eventType === "dialogresult")
          .forEach((listener) => {
            const dialogEvent: DialogEvent = {
              target: this,
              handled: false,
              dialogResult: DialogResult.Positive,
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

  /**
   * Duplicates an entity using deep copy.
   *
   * @remarks This is a deep recursive clone (entity and children).
   * The uuid property of all duplicated entities will be newly created,
   * because uuid must be unique.
   *
   * @param newName - optional name of the new, duplicated entity. If not
   * provided, name will be the new uuid
   */
  override duplicate(newName?: string): Dialog {
    throw new Error("duplicate not implemented");
    // const dest = new Dialog({
    //   ...this.getEntityOptions(),
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
