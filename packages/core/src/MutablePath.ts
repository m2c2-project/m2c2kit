import { M2Path } from "./M2Path";
import { Point } from "./Point";

/**
 * Subpaths and methods for creating them.
 *
 * @remarks Subpaths are an array of lines that are drawn together.
 */
export class MutablePath implements M2Path {
  _subpaths = new Array<Array<Point>>();

  get subpaths(): Array<Array<Point>> {
    if (this.currentPath.length > 0) {
      return [...this._subpaths, this.currentPath];
    } else {
      return this._subpaths;
    }
  }

  protected currentPath = new Array<Point>();

  /**
   * Starts a new subpath at a given point.
   *
   * @param point - location at which to start the new subpath
   */
  move(point: Point): void {
    if (this.currentPath.length > 0) {
      this._subpaths.push(this.currentPath);
    }
    this.currentPath = new Array<Point>();
    this.currentPath.push(point);
  }

  /**
   * Adds a straight line to the current subpath.
   *
   * @remarks The line is added from the last point in the current subpath to
   * the given point.
   *
   * @param point - location where the line will end
   */
  addLine(point: Point): void {
    this.currentPath.push(point);
  }

  /**
   * Removes all subpaths from the shape.
   */
  clear(): void {
    this._subpaths = new Array<Array<Point>>();
    this.currentPath = new Array<Point>();
  }

  /**
   * Makes a deep copy.
   *
   * @returns a deep copy
   */
  duplicate(): MutablePath {
    const newPath = new MutablePath();
    newPath._subpaths = JSON.parse(JSON.stringify(this._subpaths));
    newPath.currentPath = JSON.parse(JSON.stringify(this.currentPath));
    return newPath;
  }
}
