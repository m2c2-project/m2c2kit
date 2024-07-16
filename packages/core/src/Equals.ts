import { RgbaColor } from "./RgbaColor";

/**
 * Utility class for comparing equality of m2c2kit objects.
 *
 * @deprecated Use the class `Equal` instead.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Equals {
  /**
   * Compares two RgbaColor objects and returns true if they are equal.
   *
   * @remarks If either of the colors is undefined, the comparison will
   * return false. RgbaColor is an array of 4 numbers, and thus is a
   * reference type. We need this method to compare two RgbaColor objects
   * for value equality.
   *
   * @deprecated Use the methods in `Equal` instead.
   *
   * @param color1
   * @param color2
   * @returns
   */
  static rgbaColor(color1?: RgbaColor, color2?: RgbaColor): boolean {
    if (!color1 || !color2) {
      return false;
    }
    return (
      color1[0] === color2[0] &&
      color1[1] === color2[1] &&
      color1[2] === color2[2] &&
      color1[3] === color2[3]
    );
  }
}
