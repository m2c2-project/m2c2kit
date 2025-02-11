import {
  WebColors,
  Label,
  Shape,
  Composite,
  IDrawable,
  CompositeOptions,
  Size,
  RgbaColor,
  CompositeEvent,
  M2NodeEventListener,
  CallbackOptions,
  M2NodeEvent,
  M2EventType,
  M2c2KitHelpers,
} from "@m2c2kit/core";
import { Canvas } from "canvaskit-wasm";

export interface SliderOptions extends CompositeOptions {
  /** The size of the track that the thumb moves along. */
  trackSize?: Size;
  /** The color of the track. */
  trackColor?: RgbaColor;
  /** The size of the thumb that the user drags. */
  thumbSize?: Size;
  /** The color of the thumb. */
  thumbColor?: RgbaColor;
  /** The minimum value of the slider. */
  min?: number;
  /** The maximum value of the slider. */
  max?: number;
  /** The initial value of the slider. */
  value?: number;
}

export interface SliderEvent extends CompositeEvent {
  type: "Composite";
  compositeType: "Slider";
  compositeEventType: "SliderValueChanged";
  target: Slider | string;
  value: number;
}

export class Slider extends Composite implements SliderOptions {
  readonly compositeType = "Slider";
  private originalOptions: SliderOptions;
  private _trackSize: Size = { width: 250, height: 10 };
  private _trackColor: RgbaColor = WebColors.Black;
  private _thumbSize: Size = { width: 20, height: 40 };
  private _thumbColor: RgbaColor = WebColors.DarkGray;
  private _min: number = 0;
  private _max: number = 100;
  private _value = (this.max - this.min) / 2;
  private thumbLabel?: Label;
  private _thumbShape?: Shape;

  private get thumbShape() {
    if (this._thumbShape === undefined) {
      throw new Error("thumbShape is not defined.");
    }
    return this._thumbShape;
  }
  private set thumbShape(value: Shape) {
    this._thumbShape = value;
  }

  /**
   * A slider to select a value from a range by dragging a thumb along a track.
   *
   * @experimental Slider is a work in progress and will change in future versions.
   *
   * @param options - {@link SliderOptions}
   */
  constructor(options: SliderOptions) {
    super(options);
    this.originalOptions = JSON.parse(JSON.stringify(options));

    if (options.trackSize) {
      this.trackSize = options.trackSize;
    }
    if (options.trackColor) {
      this.trackColor = options.trackColor;
    }
    if (options.thumbSize) {
      this.thumbSize = options.thumbSize;
    }
    if (options.thumbColor) {
      this.thumbColor = options.thumbColor;
    }
    if (options.min !== undefined) {
      this.min = options.min;
    }
    if (options.max !== undefined) {
      this.max = options.max;
    }
    if (options.value !== undefined) {
      this.value = options.value;
    }

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
    this.removeAllChildren();

    const trackShape = new Shape({
      rect: {
        width: this.trackSize.width,
        height: this.trackSize.height,
      },
      cornerRadius: 8,
      fillColor: this.trackColor,
    });
    this.addChild(trackShape);

    this.thumbShape = new Shape({
      rect: {
        width: this.thumbSize.width,
        height: this.thumbSize.height,
      },
      cornerRadius: 8,
      fillColor: this.thumbColor,
      isUserInteractionEnabled: true,
      draggable: true,
      zPosition: 1,
      position: {
        x:
          (this.value * this.trackSize.width) / (this.max - this.min) -
          this.trackSize.width / 2,
        y: 0,
      },
    });
    trackShape.addChild(this.thumbShape);

    const trackZoneShape = new Shape({
      rect: {
        width: this.trackSize.width,
        height: this.thumbSize.height,
      },
      // during development, it is useful to make this visible
      // fillColor: WebColors.Red,
      // alpha: 0.05,
      alpha: 0,
      isUserInteractionEnabled: true,
      zPosition: 0,
    });
    trackShape.addChild(trackZoneShape);
    trackZoneShape.onTapDown((e) => {
      // console.log("trackZoneShape.onTapDown", e.point.x);
      this.thumbShape.position.x = e.point.x - trackShape.size.width / 2;
      this.updateThumbLabel();
    });

    const thumbZoneShape = new Shape({
      rect: {
        width: this.trackSize.width,
        /**
         * The thumbZoneShape is twice the height of the parent scene in case
         * the slider is placed at the bottom or top of the screen. This
         * ensures that thumbZoneShape is large enough to capture pointer
         * events that are outside the bounds of the slider and on the parent
         * scene.
         */
        height: this.parentSceneAsNode.size.height * 2,
      },
      // during development, it is useful to make this visible
      // fillColor: WebColors.Black,
      // alpha: 0.008,
      alpha: 0,
      isUserInteractionEnabled: true,
    });
    this.addChild(thumbZoneShape);
    thumbZoneShape.onPointerMove(() => {
      this.thumbShape.draggable = true;
    });
    thumbZoneShape.onPointerLeave(() => {
      this.thumbShape.draggable = false;
    });

    this.thumbShape.onTapDown((e) => {
      /**
       * handled is set to true to prevent the tap event from being
       * propagated to the parent trackShape, which would cause the
       * thumb to jump to the tap location.
       */
      e.handled = true;

      if (e.point.y !== 0) {
        this.thumbShape.position.y = 0;
      }
      if (e.point.x < -this.trackSize.width / 2) {
        this.thumbShape.position.x = -this.trackSize.width / 2;
      }
      if (e.point.x > this.trackSize.width / 2) {
        this.thumbShape.position.x = this.trackSize.width / 2;
      }
      this.updateThumbLabel();
    });

    this.thumbShape.onDrag((e) => {
      if (e.position.y !== 0) {
        this.thumbShape.position.y = 0;
      }
      if (e.position.x < -this.trackSize.width / 2) {
        this.thumbShape.position.x = -this.trackSize.width / 2;
      }
      if (e.position.x > this.trackSize.width / 2) {
        this.thumbShape.position.x = this.trackSize.width / 2;
      }
      this.updateThumbLabel();
    });

    this.thumbShape.onDragEnd(() => {
      const value = Math.round(
        ((this.thumbShape.position.x + this.trackSize.width / 2) /
          this.trackSize.width) *
          (this.max - this.min),
      );
      this.thumbShape.position.x =
        (value / (this.max - this.min)) * this.trackSize.width -
        this.trackSize.width / 2;
      this.updateThumbLabel();
    });

    this.needsInitialization = false;
  }

  updateThumbLabel() {
    const value =
      ((this.thumbShape.position.x + this.trackSize.width / 2) /
        this.trackSize.width) *
      (this.max - this.min);
    if (!this.thumbLabel) {
      this.thumbLabel = new Label({
        text: value.toString(),
      });
      this.addChild(this.thumbLabel);
    }
    this.thumbLabel.text = Math.round(value).toString();
    this.thumbLabel.position = {
      x: this.thumbShape.position.x,
      y: this.thumbShape.position.y - 30,
    };

    if (this.thumbLabel) {
      this.thumbLabel.position = {
        x: this.thumbShape.position.x,
        y: this.thumbShape.position.y - 30,
      };
    }

    const sliderEvent: SliderEvent = {
      type: M2EventType.Composite,
      compositeType: "Slider",
      compositeEventType: "SliderValueChanged",
      target: this,
      value: value,
      ...M2c2KitHelpers.createTimestamps(),
    };
    this.handleCompositeEvent(sliderEvent);
    this.saveEvent(sliderEvent);
    if (this.eventListeners.length > 0) {
      this.eventListeners
        .filter(
          (listener) =>
            listener.type === M2EventType.Composite &&
            listener.compositeType === this.compositeType &&
            listener.compositeEventType === "SliderValueChanged",
        )
        .forEach((listener) => {
          listener.callback(sliderEvent);
        });
    }
  }

  /**
   * Executes a callback when the slider value changes.
   *
   * @param callback - function to execute
   * @param options
   */
  onValueChanged(
    callback: (sliderEvent: SliderEvent) => void,
    options?: CallbackOptions,
  ): void {
    const eventListener: M2NodeEventListener<SliderEvent> = {
      type: M2EventType.Composite,
      compositeEventType: "SliderValueChanged",
      compositeType: this.compositeType,
      nodeUuid: this.uuid,
      callback: <(ev: M2NodeEvent) => void>callback,
    };

    this.addSliderEventListener(eventListener, options);
  }

  private addSliderEventListener(
    eventListener: M2NodeEventListener<SliderEvent>,
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

  get trackSize(): Size {
    return this._trackSize;
  }
  set trackSize(value: Size) {
    this._trackSize = value;
  }

  get trackColor(): RgbaColor {
    return this._trackColor;
  }
  set trackColor(value: RgbaColor) {
    this._trackColor = value;
  }

  get thumbSize(): Size {
    return this._thumbSize;
  }
  set thumbSize(value: Size) {
    this._thumbSize = value;
  }

  get thumbColor(): RgbaColor {
    return this._thumbColor;
  }
  set thumbColor(value: RgbaColor) {
    this._thumbColor = value;
  }

  get value(): number {
    return this._value;
  }
  set value(value: number) {
    this._value = value;
  }

  get min(): number {
    return this._min;
  }
  set min(value: number) {
    this._min = value;
  }

  get max(): number {
    return this._max;
  }
  set max(value: number) {
    this._max = value;
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
  duplicate(newName?: string | undefined): Slider {
    throw new Error(`Method not implemented. ${newName}`);
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
