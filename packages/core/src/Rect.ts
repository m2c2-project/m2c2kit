import { Point } from "./Point";
import { Size } from "./Size";
import { RectOptions } from "./RectOptions";

export class Rect implements RectOptions {
  origin?: Point;
  size?: Size;
  x?: number;
  y?: number;
  width?: number;
  height?: number;

  constructor(options: RectOptions) {
    this.origin = options.origin;
    this.size = options.size;
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
  }
}
