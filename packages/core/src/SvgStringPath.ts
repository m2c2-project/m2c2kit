/**
 * A path created from an SVG string path.
 */

export interface SvgStringPath {
  /** SVG string from which to create the path */
  pathString?: string;
  /** SVG string from which to create the path @deprecated Use `pathString` */
  svgPathString?: string;
  /** If provided, scale the SVG path to this height, and scale the width to keep the original SVG proportions */
  height?: number;
  /** If provided, scale the SVG path to this width, and scale the height to keep the original SVG proportions */
  width?: number;
}
