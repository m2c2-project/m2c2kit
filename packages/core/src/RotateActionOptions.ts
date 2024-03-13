export interface RotateActionOptions {
  /** Relative amount to rotate the node, in counter-clockwise radians */
  byAngle?: number;
  /** Absolute angle to which rotate the node, in counter-clockwise radians */
  toAngle?: number;
  /** If `toAngle` is provided, should the rotation be performed in the direction that leads to the smallest rotation? Default is true */
  shortestUnitArc?: boolean;
  /** Duration of rotation, in milliseconds */
  duration: number;
  /** Should the action run during screen transitions? Default is false */
  runDuringTransition?: boolean;
}
