import { Easings } from "./Easings";
import { EasingFunction } from "./Easings";
import { Scene } from "./Scene";

export interface SlideTransitionOptions {
  /** Direction in which the slide action goes */
  direction: TransitionDirection;
  /** Duration, in milliseconds, of the transition */
  duration: number;
  /** Easing function for movement or a string identifier of the easing function, e.g., `SinusoidalInOut`. Default is a linear easing function. */
  easing?: EasingFunction | string;
}

/**
 * The Transition class has static methods for creating animations that run as one scene transitions to another.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class Transition {
  abstract type: TransitionType;
  abstract easing: EasingFunction;
  abstract duration: number;

  /**
   * Creates a scene transition in which the outgoing scene slides out and the incoming scene slides in, as if the incoming scene pushes it.
   *
   * @param options - {@link SlideTransitionOptions}
   * @returns
   */
  public static slide(options: SlideTransitionOptions): SlideTransition {
    let easingFunction = Easings.linear;
    if (typeof options.easing === "string") {
      easingFunction = Easings.fromTypeAsString(options.easing);
    } else if (options.easing !== undefined) {
      easingFunction = options.easing;
    }

    return new SlideTransition(
      options.direction,
      options.duration,
      easingFunction,
    );
  }

  /**
   * Creates a scene transition with no animation or duration. The next scene is immediately drawn.
   */
  public static none(): NoneTransition {
    return new NoneTransition();
  }
}

export class NoneTransition extends Transition {
  type = TransitionType.None;
  easing: EasingFunction;
  duration: number;
  constructor() {
    super();
    this.duration = NaN;
    this.easing = Easings.none;
  }
}

export class SlideTransition extends Transition {
  type = TransitionType.Slide;
  easing: EasingFunction;
  duration: number;
  direction: TransitionDirection;
  constructor(
    direction: TransitionDirection,
    duration: number,
    easing: EasingFunction,
  ) {
    super();
    this.direction = direction;
    this.duration = duration;
    this.easing = easing;
  }
}

export const TransitionType = {
  Slide: "Slide",
  None: "None",
} as const;
export type TransitionType =
  (typeof TransitionType)[keyof typeof TransitionType];

export const TransitionDirection = {
  Up: "Up",
  Down: "Down",
  Right: "Right",
  Left: "Left",
} as const;
export type TransitionDirection =
  (typeof TransitionDirection)[keyof typeof TransitionDirection];

export class SceneTransition {
  constructor(
    public scene: Scene,
    public transition: Transition,
  ) {}
}
