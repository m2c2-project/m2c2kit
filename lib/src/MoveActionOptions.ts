import { Point } from "./Point";

//#endregion Transitions
//#region Actions ------------------------------------------------------------
export interface MoveActionOptions {
  /** Destination point. The point is relative to the entity's parent coordinate system */
  point: Point;
  /** Duration of move, in milliseconds */
  duration: number;
  /** Should the action run during screen transitions? Default is no */
  runDuringTransition?: boolean;
}
