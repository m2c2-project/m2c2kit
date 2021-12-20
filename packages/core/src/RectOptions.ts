import { Point } from "./Point";
import { Size } from "./Size";

export interface RectOptions {
  /** Position of rectangle */
  origin?: Point;
  /** Size of rectangle */
  size?: Size;
  /** X coordinate of rectangle position; this can be used instead of setting the origin property */
  x?: number;
  /** Y coordinate of rectangle position; this can be used instead of setting the origin property */
  y?: number;
  /** Width of rectangle; this can be used instead of setting the size property */
  width?: number;
  /** Height of rectangle; this can be used instead of setting the size property */
  height?: number;
}
