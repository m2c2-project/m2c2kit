import { Path } from "./Path";
import { Point } from "./Point";
import { Entity } from "./Entity";
import { Size } from "./Size";

/**
 * Lines and/or shapes, and methods for creating them.
 */
export class MutablePath implements Path {
  size: Size = { width: 0, height: 0 };
  _subpaths = new Array<Array<Point>>();

  get subpaths(): Array<Array<Point>> {
    if (this.currentPath.length > 0) {
      return [...this._subpaths, this.currentPath];
    } else {
      return this._subpaths;
    }
  }

  private currentPath = new Array<Point>();

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

  clear(): void {
    this._subpaths = new Array<Array<Point>>();
    this.currentPath = new Array<Point>();
  }

  duplicate(newName?: string | undefined): Entity {
    throw new Error("Method not implemented.");
  }
}
