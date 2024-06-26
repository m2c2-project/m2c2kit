import { Easings } from "./Easings";
import { EasingFunction } from "./Easings";
import { Scene } from "./Scene";

export interface SlideTransitionOptions {
  /** Direction in which the slide action goes */
  direction: TransitionDirection;
  /** Duration, in milliseconds, of the transition */
  duration: number;
  /** Easing function for movement; default is linear */
  easing?: EasingFunction;
}

/**
 * The Transition class has static methods for creating animations that run as one scene transitions to another.
 */
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
    return new SlideTransition(
      options.direction,
      options.duration,
      options.easing ?? Easings.linear
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
    easing: EasingFunction
  ) {
    super();
    this.direction = direction;
    this.duration = duration;
    this.easing = easing;
  }
}

export enum TransitionType {
  Slide = "Slide",
  None = "None",
}

export enum TransitionDirection {
  Up = "Up",
  Down = "Down",
  Right = "Right",
  Left = "Left",
}
export class SceneTransition {
  constructor(public scene: Scene, public transition: Transition) {}
}
