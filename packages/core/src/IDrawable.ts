import { Canvas } from "canvaskit-wasm";
import { Point } from "./Point";

export interface IDrawable {
  draw(canvas: Canvas): void;
  warmup(canvas: Canvas): void;
  /**
   * Frees up resources allocated by the Drawable M2Node.
   *
   * @internal For m2c2kit library use only
   *
   * @remarks This will be done automatically by the m2c2kit library; the
   * end-user must not call this.
   */
  dispose(): void;
  anchorPoint: Point;
  zPosition: number;
}
