import { Scene } from "./Scene";

export abstract class Transition {
  abstract type: TransitionType;
  duration = 0;

  /**
   * Creates a scene transition in which the outgoing scene slides out and the incoming scene slides in, as if the incoming scene pushes it.
   *
   * @param direction - TransitionDirection in which the push action goes
   * @param duration - Duration, in millis, of the transition
   * @returns
   */
  public static push(
    direction: TransitionDirection,
    duration: number
  ): PushTransition {
    return new PushTransition(direction, duration);
  }
}

export class PushTransition extends Transition {
  type = TransitionType.push;
  direction: TransitionDirection;
  constructor(direction: TransitionDirection, duration: number) {
    super();
    this.direction = direction;
    this.duration = duration;
  }
}

export enum TransitionType {
  push = "Push",
}

export enum TransitionDirection {
  up = "Up",
  down = "Down",
  right = "Right",
  left = "Left",
}
export class SceneTransition {
  constructor(public scene: Scene, public transition?: Transition) {}
}
