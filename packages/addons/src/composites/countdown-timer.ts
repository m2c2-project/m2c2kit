import { Canvas } from "canvaskit-wasm";
import {
  WebColors,
  Composite,
  CompositeOptions,
  Shape,
  Label,
  RgbaColor,
  IDrawable,
  Equal,
  M2c2KitHelpers,
  M2NodeConstructor,
  Action,
  CompositeEvent,
  CallbackOptions,
  M2NodeEventListener,
  M2EventType,
  M2NodeEvent,
} from "@m2c2kit/core";

export interface CountdownTimerOptions extends CompositeOptions {
  /** Duration of the countdown, in milliseconds. Must be multiple of 1000. Default is 3000. */
  milliseconds?: number;
  /** Duration of each tick interval, in milliseconds. Default is 1000. */
  tickIntervalMilliseconds?: number;
  /** Font name for timer text (numbers). */
  fontName?: string;
  /** Font size for timer text (numbers). Default is 50. */
  fontSize?: number;
  /** Font size for timer text (numbers). Default is white. */
  fontColor?: RgbaColor;
  /** String to show when the timer reaches zero. Default is "0". This could be changed to another value, such as "GO!" */
  zeroString?: string;
  /** Shape of the timer. Default is a Royal Blue circle with a radius of 100. */
  timerShape?: TimerShape;
  /** Default is to center the timer text (numbers) vertically within the timer shape (verticalBias = .5). Setting verticalBias less than .5 will pull the text towards the top of the timer shape. Setting verticalBias greater than .5 will pull the text towards the bottom of the timer shape. */
  textVerticalBias?: number;
}

export interface TimerShape {
  circle?: {
    /** Radius of the circle timer shape. */
    radius: number;
  };
  rectangle?: {
    /** Width of the rectangle timer shape. */
    width: number;
    /** Height of the rectangle timer shape. */
    height: number;
    /** Corner radius of the rectangle timer shape. Default is 0. */
    cornerRadius?: number;
  };
  /** Color of the timer shape. Default is Royal Blue. */
  fillColor?: RgbaColor;
}

export interface CountdownTimerEvent extends CompositeEvent {
  type: "Composite";
  compositeType: "CountdownTimer";
  compositeEventType: "CountdownTimerTick" | "CountdownTimerComplete";
  millisecondsRemaining: number;
  target: CountdownTimer | string;
}

export class CountdownTimer extends Composite implements CountdownTimerOptions {
  readonly compositeType = "CountdownTimer";
  private originalOptions: CountdownTimerOptions;
  private _milliseconds = 3000;
  private _tickIntervalMilliseconds = 1000;
  private _fontName: string | undefined;
  private _fontSize = 50;
  private _fontColor = WebColors.White;
  private _zeroString = "0";
  private _timerShape: TimerShape = {
    circle: {
      radius: 100,
    },
    fillColor: WebColors.RoyalBlue,
  };
  private _textVerticalBias = 0.5;
  private countdownSequence = new Array<Action>();
  private timerShapeNode?: Shape;
  private timerNumberLabel?: Label;
  private _isRunning = false;
  private hasStopped = false;

  /**
   * A countdown timer displays a number that counts down to zero.
   *
   * @param options
   */
  constructor(options: CountdownTimerOptions) {
    super(options);
    this.originalOptions = JSON.parse(JSON.stringify(options));
    if (options.milliseconds) {
      this.milliseconds = options.milliseconds;
    }

    if (options.tickIntervalMilliseconds) {
      this.tickIntervalMilliseconds = options.tickIntervalMilliseconds;
    }

    if (options.fontName) {
      this.fontName = options.fontName;
    }

    if (options.fontSize !== undefined) {
      this.fontSize = options.fontSize;
    }

    if (options.fontColor) {
      this.fontColor = options.fontColor;
    }

    if (options.zeroString !== undefined) {
      this.zeroString = options.zeroString;
    }

    if (options.timerShape) {
      this.timerShape = options.timerShape;
    }

    if (options.textVerticalBias !== undefined) {
      this.textVerticalBias = options.textVerticalBias;
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
    this._isRunning = false;
    this.hasStopped = false;

    if (
      (this.timerShape?.circle === undefined &&
        this.timerShape?.rectangle === undefined) ||
      this.timerShape?.circle !== undefined
    ) {
      this.timerShapeNode = new Shape({
        circleOfRadius: this.timerShape.circle?.radius ?? 100,
        fillColor: this.timerShape?.fillColor ?? WebColors.RoyalBlue,
        suppressEvents: true,
      });
      this.addChild(this.timerShapeNode);
    } else if (this.timerShape?.rectangle !== undefined) {
      this.timerShapeNode = new Shape({
        rect: {
          width: this.timerShape?.rectangle?.width ?? 200,
          height: this.timerShape?.rectangle?.height ?? 200,
        },
        cornerRadius: this.timerShape?.rectangle?.cornerRadius,
        fillColor: this.timerShape?.fillColor ?? WebColors.RoyalBlue,
        suppressEvents: true,
      });
      this.addChild(this.timerShapeNode);
    } else {
      throw new Error("Invalid timer shape options.");
    }

    this.size = this.timerShapeNode.size;
    if (this.milliseconds % 1000 !== 0) {
      throw new Error(
        "CountdownTimer milliseconds must be a multiple of 1000.",
      );
    }
    const timerInitialNumber = Math.floor(this.milliseconds / 1000);

    this.timerNumberLabel = new Label({
      text: timerInitialNumber.toString(),
      fontSize: this.fontSize,
      fontName: this._fontName,
      fontColor: this.fontColor,
      layout: {
        constraints: {
          topToTopOf: this.timerShapeNode,
          bottomToBottomOf: this.timerShapeNode,
          startToStartOf: this.timerShapeNode,
          endToEndOf: this.timerShapeNode,
          verticalBias: this.textVerticalBias,
        },
      },
      suppressEvents: true,
    });
    this.timerShapeNode.addChild(this.timerNumberLabel);

    this.countdownSequence = new Array<Action>();

    for (
      let i = this.milliseconds;
      i > this.tickIntervalMilliseconds;
      i = i - this.tickIntervalMilliseconds
    ) {
      this.countdownSequence.push(
        Action.wait({ duration: this.tickIntervalMilliseconds }),
      );
      this.countdownSequence.push(
        Action.custom({
          callback: () => {
            this.tick(i - this.tickIntervalMilliseconds);
          },
        }),
      );
    }

    this.countdownSequence.push(
      Action.wait({ duration: this.tickIntervalMilliseconds }),
    );
    this.countdownSequence.push(
      Action.custom({
        callback: () => {
          this.tick(0);
          const countdownTimerEvent: CountdownTimerEvent = {
            type: M2EventType.Composite,
            compositeType: this.compositeType,
            compositeEventType: "CountdownTimerComplete",
            target: this,
            handled: false,
            millisecondsRemaining: 0,
            ...M2c2KitHelpers.createTimestamps(),
          };
          this.handleCompositeEvent(countdownTimerEvent);
          this.saveEvent(countdownTimerEvent);
          if (this.eventListeners.length > 0) {
            this.eventListeners
              .filter(
                (listener) =>
                  listener.type === M2EventType.Composite &&
                  listener.compositeType === "CountdownTimer" &&
                  listener.compositeEventType === "CountdownTimerComplete",
              )
              .forEach((listener) => {
                listener.callback(countdownTimerEvent);
              });
          }
        },
      }),
    );

    this.needsInitialization = false;
  }

  private tick(millisecondsRemaining: number) {
    const countdownTimerEvent: CountdownTimerEvent = {
      type: M2EventType.Composite,
      compositeType: this.compositeType,
      compositeEventType: "CountdownTimerTick",
      target: this,
      handled: false,
      millisecondsRemaining: millisecondsRemaining,
      ...M2c2KitHelpers.createTimestamps(),
    };
    this.handleCompositeEvent(countdownTimerEvent);
    this.saveEvent(countdownTimerEvent);
    if (this.eventListeners.length > 0) {
      this.eventListeners
        .filter(
          (listener) =>
            listener.type === M2EventType.Composite &&
            listener.compositeType === "CountdownTimer" &&
            listener.compositeEventType === "CountdownTimerTick",
        )
        .forEach((listener) => {
          listener.callback(countdownTimerEvent);
        });
    }
  }

  /**
   * Starts the countdown timer.
   *
   * @remarks Calling `start()` on a timer whose state is running (already started)
   * or stopped will raise an error.
   */
  start() {
    if (this.isRunning) {
      throw new Error("CountdownTimer: cannot start. It is already running.");
    }
    if (this.hasStopped) {
      throw new Error(
        "CountdownTimer: It has stopped. You cannot start a stopped CountdownTimer. Instead, create a new CountdownTimer or call CountdownTimer.reset() before starting.",
      );
    }
    /**
     * If the user calls start() and the timer has not yet been initialized as
     * part of the composite lifecycle, then initialize it.
     */
    if (this.needsInitialization) {
      this.initialize();
    }
    this.run(
      Action.sequence(this.countdownSequence),
      "__countdownSequenceAction",
    );
    this._isRunning = true;
  }

  /**
   * Stops the countdown timer.
   *
   * @remarks This method is idempotent. Calling `stop()` on a stopped timer
   * has no effect and will not raise an error. This can be called on a
   * CountdownTimer in any state.
   */
  stop() {
    if (this.isRunning) {
      this.removeAction("__countdownSequenceAction");
      this._isRunning = false;
      this.hasStopped = true;
    }
  }

  /**
   * Resets the countdown timer to its initial state so it can be started
   * again.
   *
   * @remarks This method is idempotent. Calling reset() multiple times will
   * not raise an error. This can be called on a CountdownTimer in any state.
   */
  reset() {
    this.stop();
    this.initialize();
  }

  /**
   * Returns true if the countdown timer is running.
   */
  get isRunning(): boolean {
    return this._isRunning;
  }

  override handleCompositeEvent(event: CountdownTimerEvent): void {
    if (!this.timerNumberLabel) {
      throw new Error("Timer number label not found.");
    }

    switch (event.compositeEventType) {
      case "CountdownTimerTick": {
        this.timerNumberLabel.text = Math.ceil(
          event.millisecondsRemaining / 1000,
        ).toString();
        break;
      }
      case "CountdownTimerComplete": {
        this.timerNumberLabel.text = this.zeroString;
        break;
      }
      default:
        throw new Error(
          `Invalid TimerCountdown event type: ${event.compositeEventType}`,
        );
    }
  }

  /**
   * Executes a callback when the timer ticks.
   *
   * @remarks The callback is also executed when the timer completes.
   *
   * @param callback - function to execute
   * @param options
   */
  onTick(
    callback: (countdownTimerEvent: CountdownTimerEvent) => void,
    options?: CallbackOptions,
  ): void {
    const eventListener: M2NodeEventListener<CountdownTimerEvent> = {
      type: M2EventType.Composite,
      compositeEventType: "CountdownTimerTick",
      compositeType: this.compositeType,
      nodeUuid: this.uuid,
      callback: <(ev: M2NodeEvent) => void>callback,
    };

    this.addCountdownTimerEventListener(eventListener, options);
  }

  /**
   * Executes a callback when the timer completes.
   *
   * @remarks This is the last tick of the timer.
   *
   * @param callback - function to execute.
   * @param options
   */
  onComplete(
    callback: (countdownTimerEvent: CountdownTimerEvent) => void,
    options?: CallbackOptions,
  ): void {
    const eventListener: M2NodeEventListener<CountdownTimerEvent> = {
      type: M2EventType.Composite,
      compositeEventType: "CountdownTimerComplete",
      compositeType: this.compositeType,
      nodeUuid: this.uuid,
      callback: <(ev: M2NodeEvent) => void>callback,
    };

    this.addCountdownTimerEventListener(eventListener, options);
  }

  private addCountdownTimerEventListener(
    eventListener: M2NodeEventListener<CountdownTimerEvent>,
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

  get milliseconds(): number {
    return this._milliseconds;
  }
  set milliseconds(milliseconds: number) {
    if (Equal.value(this._milliseconds, milliseconds)) {
      return;
    }
    this._milliseconds = milliseconds;
    this.needsInitialization = true;
    this.savePropertyChangeEvent("milliseconds", milliseconds);
  }

  get tickIntervalMilliseconds(): number {
    return this._tickIntervalMilliseconds;
  }
  set tickIntervalMilliseconds(tickIntervalMilliseconds: number) {
    if (Equal.value(this._tickIntervalMilliseconds, tickIntervalMilliseconds)) {
      return;
    }
    this._tickIntervalMilliseconds = tickIntervalMilliseconds;
    this.needsInitialization = true;
    this.savePropertyChangeEvent(
      "tickIntervalMilliseconds",
      tickIntervalMilliseconds,
    );
  }

  get fontColor(): RgbaColor {
    return this._fontColor;
  }
  set fontColor(fontColor: RgbaColor) {
    if (Equal.value(this._fontColor, fontColor)) {
      return;
    }
    this._fontColor = fontColor;
    this.needsInitialization = true;
    this.savePropertyChangeEvent("fontColor", fontColor);
  }

  get fontName(): string | undefined {
    return this._fontName;
  }
  set fontName(fontName: string | undefined) {
    if (this._fontName === fontName) {
      return;
    }
    this._fontName = fontName;
    this.needsInitialization = true;
    this.savePropertyChangeEvent("fontName", fontName);
  }

  get fontSize(): number {
    return this._fontSize;
  }
  set fontSize(fontSize: number) {
    if (Equal.value(this._fontSize, fontSize)) {
      return;
    }
    this._fontSize = fontSize;
    this.needsInitialization = true;
    this.savePropertyChangeEvent("fontSize", fontSize);
  }

  get zeroString(): string {
    return this._zeroString;
  }
  set zeroString(zeroString: string) {
    if (this._zeroString === zeroString) {
      return;
    }
    this._zeroString = zeroString;
    this.needsInitialization = true;
    this.savePropertyChangeEvent("zeroString", zeroString);
  }

  get timerShape(): TimerShape {
    return this._timerShape;
  }
  set timerShape(shape: TimerShape) {
    if (Equal.value(this._timerShape as object, shape as object)) {
      return;
    }
    this._timerShape = shape;
    this.needsInitialization = true;
    this.savePropertyChangeEvent("timerShape", shape);
  }

  get textVerticalBias(): number {
    return this._textVerticalBias;
  }
  set textVerticalBias(textVerticalBias: number) {
    if (Equal.value(this._textVerticalBias, textVerticalBias)) {
      return;
    }
    this._textVerticalBias = textVerticalBias;
    this.needsInitialization = true;
    this.savePropertyChangeEvent("textVerticalBias", textVerticalBias);
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
  duplicate(newName?: string | undefined): CountdownTimer {
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

M2c2KitHelpers.registerM2NodeClass(
  CountdownTimer as unknown as M2NodeConstructor,
);
