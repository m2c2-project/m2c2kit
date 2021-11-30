/**
 * Position in two-dimensional space.
 */

export class Point {
  x: number;
  y: number;

  constructor(x?: number, y?: number) {
    if (x != null && y != null) {
      this.x = x;
      this.y = y;
    } else {
      this.x = 0;
      this.y = 0;
    }
  }
}
