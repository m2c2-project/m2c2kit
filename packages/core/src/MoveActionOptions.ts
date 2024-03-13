import { Point } from "./Point";
import { EasingFunction } from "./Easings";

export interface MoveActionOptions {
  /** Destination point. The point is relative to the node's parent coordinate system */
  point: Point;
  /** Duration of move, in milliseconds */
  duration: number;
  /** Easing function for movement; default is linear */
  easing?: EasingFunction;
  /** Should the action run during screen transitions? Default is no */
  runDuringTransition?: boolean;
}
