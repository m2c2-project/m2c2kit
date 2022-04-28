import { Point } from "./Point";
import { EasingFunction } from "./Easings";

export interface MoveActionOptions {
  /** Destination point. The point is relative to the entity's parent coordinate system */
  point: Point;
  /** Duration of move, in milliseconds */
  duration: number;
  /** Easing function for movement; default is linear */
  easing?: EasingFunction;
  /** Should the action run during screen trnsitions? Default is no */
  runDuringTransition?: boolean;
}
