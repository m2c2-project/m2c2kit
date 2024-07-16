import { Point } from "./Point";
import { RgbaColor } from "./RgbaColor";
import { Size } from "./Size";
import { RectOptions } from "./RectOptions";
import { M2Path } from "./M2Path";
import { M2ColorfulPath } from "./M2ColorfulPath";
import { SvgStringPath } from "./SvgStringPath";

type ValueType =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<ValueType>
  | { [key: string]: ValueType }
  | Point
  | RectOptions
  | M2Path
  | M2ColorfulPath
  | SvgStringPath
  | Size;

/**
 * Utility class for comparing equality of m2c2kit objects.
 *
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Equal {
  /**
   * Compares two RgbaColor objects and returns true if they are equal.
   *
   * @remarks If either of the colors is undefined, the comparison will
   * return false. RgbaColor is an array of 4 numbers, and thus is a
   * reference type. We need this method to compare two RgbaColor objects
   * for value equality.
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

  /**
   * Compares two values for deep equality.
   *
   * @remarks Supported values are string, number, boolean, null, undefined,
   * and object (note that arrays are objects in JavaScript).
   *
   * @param value1 - value to compare
   * @param value2 - value to compare
   * @returns true if values have deep equality
   */
  static value(value1: ValueType, value2: ValueType): boolean {
    if (typeof value1 !== typeof value2) {
      return false;
    }

    if (
      value1 &&
      typeof value1 === "object" &&
      value2 &&
      typeof value2 === "object"
    ) {
      return Equal.objectsDeepEqual(value1, value2);
    }

    return value1 === value2;
  }

  /**
   * Compares two objects for deep equality.
   *
   * @remarks In JavaScript, arrays are objects, so this method will also
   * compare arrays for deep equality.
   *
   * @param obj1 - object to compare
   * @param obj2 - object to compare
   * @returns true if objects have deep equality
   */
  private static objectsDeepEqual(obj1: ValueType, obj2: ValueType): boolean {
    if (obj1 === obj2) {
      return true;
    }

    // Handle the case where both are arrays
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      if (obj1.length !== obj2.length) {
        return false;
      }
      for (let i = 0; i < obj1.length; i++) {
        if (!Equal.objectsDeepEqual(obj1[i], obj2[i])) {
          return false;
        }
      }
      return true;
    }

    // Handle the case where both are objects but not arrays
    if (
      typeof obj1 === "object" &&
      !Array.isArray(obj1) &&
      obj1 !== null &&
      typeof obj2 === "object" &&
      !Array.isArray(obj2) &&
      obj2 !== null
    ) {
      const keys1 = Object.keys(obj1 as { [key: string]: ValueType });
      const keys2 = Object.keys(obj2 as { [key: string]: ValueType });
      if (keys1.length !== keys2.length) {
        return false;
      }

      for (const key of keys1) {
        if (
          !(key in obj2) ||
          !Equal.objectsDeepEqual(
            (obj1 as { [key: string]: ValueType })[key],
            (obj2 as { [key: string]: ValueType })[key],
          )
        ) {
          return false;
        }
      }
      return true;
    }

    // If neither is an object or array, return false
    return false;
  }
}
