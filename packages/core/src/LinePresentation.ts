import { RgbaColor } from "./RgbaColor";

/**
 * Properties that describe line colors and widths in a `M2ColorfulPath`.
 */
export interface LinePresentation {
  strokeColor: RgbaColor;
  lineWidth: number;
  subpathIndex: number;
  pointIndex: number;
}
