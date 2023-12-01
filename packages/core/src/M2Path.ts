import { Point } from "./Point";

/**
 * A collection of lines to draw.
 */
export interface M2Path {
  /** The subpath that compose up the path */
  subpaths: Array<Array<Point>>;
}
