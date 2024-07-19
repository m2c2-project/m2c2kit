import {
  Transition,
  TransitionDirection,
  Easings,
  Scene,
  Label,
  Action,
  Shape,
  SceneOptions,
  RgbaColor,
  WebColors,
} from "@m2c2kit/core";
import { TimerShape } from "../composites/countdown-timer";

const SCENE_TRANSITION_EASING = Easings.sinusoidalInOut;
const SCENE_TRANSITION_DURATION_MS = 500;

export interface CountdownSceneOptions extends SceneOptions {
  /** Duration of the countdown, in milliseconds. */
  milliseconds: number;
  /** Duration of the slide transition, in milliseconds, to the next scene after the countdown completes. Default is 500. */
  transitionDurationMilliseconds?: number;
  /** A custom transition to use to present next scene after the countdown completes. */
  transition?: Transition;
  /** Duration in milliseconds to stay on zero before transitioning to the next scene. Default is zero. This option should be used if `transition` is set to `Transition.none()`. Otherwise, the zero will flash for a single frame before presenting the next scene. */
  zeroDwellMilliseconds?: number;
  /** Text shown below the countdown shape. Default is "GET READY". */
  text?: string;
  /** Font name for text  */
  textFontName?: string;
  /** Font size for text. Default is 50. */
  textFontSize?: number;
  /** Font color for text. Default is black. */
  textFontColor?: RgbaColor;
  /** Distance between bottom of countdown shape and text. Default is 32. */
  textMarginTop?: number;
  /** Font name for timer numbers. */
  timerNumbersFontName?: string;
  /** Font size for timer numbers. Default is 50. */
  timerNumbersFontSize?: number;
  /** Font size for timer numbers. Default is white. */
  timerNumbersFontColor?: RgbaColor;
  /** String to show when the timer reaches zero. Default is "0". This could be changed to another value, such as "GO!" */
  zeroString?: string;
  /** Shape of the timer. Default is a Royal Blue circle with a radius of 100 centered vertically. */
  timerShape?: TimerShape;
  /** Default is to center the timer shape vertically within the scene (verticalBias = .5). Setting verticalBias less than .5 will pull the shape towards the top. Setting verticalBias greater than .5 will pull the shape towards the bottom. */
  shapeVerticalBias?: number;
}

export class CountdownScene extends Scene {
  /**
   * A scene that counts down from a specified number to zero, then transitions to the next scene.
   *
   * @param options - {@link CountdownSceneOptions}
   */
  constructor(options: CountdownSceneOptions) {
    super(options);

    if (
      options?.transitionDurationMilliseconds !== undefined &&
      options?.transition
    ) {
      throw new Error(
        "Both transition and transitionDurationMilliseconds options were provided. Only one should be provided. If using a custom transition, then the duration of that transition must be specified within the custom transition.",
      );
    }

    let timerShape: Shape;

    if (
      (options?.timerShape?.circle === undefined &&
        options?.timerShape?.rectangle === undefined) ||
      options?.timerShape.circle !== undefined
    ) {
      timerShape = new Shape({
        circleOfRadius: options?.timerShape?.circle?.radius ?? 100,
        layout: {
          constraints: {
            topToTopOf: this,
            bottomToBottomOf: this,
            startToStartOf: this,
            endToEndOf: this,
            verticalBias: options?.shapeVerticalBias ?? 0.5,
          },
        },
        fillColor: options?.timerShape?.fillColor ?? WebColors.RoyalBlue,
      });
      this.addChild(timerShape);
    } else if (options?.timerShape.rectangle !== undefined) {
      timerShape = new Shape({
        rect: {
          width: options?.timerShape?.rectangle?.width ?? 200,
          height: options?.timerShape?.rectangle?.height ?? 200,
        },
        cornerRadius: options?.timerShape?.rectangle?.cornerRadius,
        layout: {
          constraints: {
            topToTopOf: this,
            bottomToBottomOf: this,
            startToStartOf: this,
            endToEndOf: this,
            verticalBias: options.shapeVerticalBias ?? 0.5,
          },
        },
        fillColor: options?.timerShape?.fillColor ?? WebColors.RoyalBlue,
      });
      this.addChild(timerShape);
    } else {
      throw new Error("Invalid timer shape options.");
    }

    const timerInitialNumber = Math.floor(options.milliseconds / 1000);

    const timerNumberLabel = new Label({
      // Number text will be set in onSetup()
      text: "",
      fontSize: options?.timerNumbersFontSize ?? 50,
      fontName: options?.timerNumbersFontName,
      fontColor: options?.timerNumbersFontColor ?? WebColors.White,
    });
    timerShape.addChild(timerNumberLabel);

    const textLabel = new Label({
      text: options?.text ?? "GET READY",
      fontSize: options?.textFontSize ?? 50,
      fontName: options?.textFontName,
      fontColor: options?.textFontColor,
      layout: {
        marginTop: options?.textMarginTop ?? 32,
        constraints: {
          topToBottomOf: timerShape,
          startToStartOf: this,
          endToEndOf: this,
        },
      },
    });
    this.addChild(textLabel);

    const countdownSequence = new Array<Action>();

    for (let i = timerInitialNumber - 1; i > 0; i--) {
      countdownSequence.push(Action.wait({ duration: 1000 }));
      countdownSequence.push(
        Action.custom({
          callback: () => {
            timerNumberLabel.text = i.toString();
          },
        }),
      );
    }

    countdownSequence.push(Action.wait({ duration: 1000 }));
    countdownSequence.push(
      Action.custom({
        callback: () => {
          timerNumberLabel.text = options?.zeroString ?? "0";
        },
      }),
    );
    if (options?.zeroDwellMilliseconds !== undefined) {
      countdownSequence.push(
        Action.wait({ duration: options.zeroDwellMilliseconds }),
      );
    }

    countdownSequence.push(
      Action.custom({
        callback: () => {
          const game = this.game;
          const isLastScene =
            game.scenes.indexOf(this) === game.scenes.length - 1;
          if (isLastScene) {
            game.end();
          }
          const nextScene = game.scenes[game.scenes.indexOf(this) + 1];
          game.presentScene(
            nextScene,
            options?.transition ??
              Transition.slide({
                direction: TransitionDirection.Left,
                duration:
                  options?.transitionDurationMilliseconds ??
                  SCENE_TRANSITION_DURATION_MS,
                easing: SCENE_TRANSITION_EASING,
              }),
          );
        },
      }),
    );

    this.onSetup(() => {
      /**
       * Set the timer number label to the initial number. This must be done
       * in onSetup() in case the scene is presented more than once.
       */
      timerNumberLabel.text = timerInitialNumber.toString();
    });

    this.onAppear(() => {
      this.run(Action.sequence(countdownSequence));
    });
  }
}
