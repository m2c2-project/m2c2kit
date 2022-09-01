import { Canvas } from "canvaskit-wasm";
import { Point } from "./Point";

export interface IDrawable {
  draw(canvas: Canvas): void;
  warmup(canvas: Canvas): void;
  /**
   * Frees up resources that were allocated for this drawable entity.
   *
   * @remarks This will be done automatically by the m2c2kit library;
   * the end-user must not call this.
   */
  dispose(): void;
  anchorPoint: Point;
  zPosition: number;
}
