import { Scene } from "./Scene";

//#region Transitions ------------------------------------------------------------

export abstract class Transition {
  abstract type: TransitionType;
  duration = 0;

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
