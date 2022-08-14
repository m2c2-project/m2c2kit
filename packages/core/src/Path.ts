import { Point } from "./Point";
import { Size } from "./Size";

/**
 * A set of lines and/or shapes to draw.
 */

export interface Path {
  /** The subpath that compose up the path */
  subpaths: Array<Array<Point>>;
  /** The size of the path. This is neeeded to properly position the shape that is drawn by the path */
  size: Size;
}
