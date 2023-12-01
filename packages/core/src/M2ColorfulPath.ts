import { LinePresentation } from "./LinePresentation";
import { M2Path } from "./M2Path";

/**
 * A collection of multi-color lines to draw.
 *
 * @remarks Unlike `M2Path`, this interface allows for lines of different
 * colors and widths to be drawn in the same path.
 */
export interface M2ColorfulPath extends M2Path {
  /** Colors and widths of lines in the path. */
  linePresentations: Array<LinePresentation>;
}
