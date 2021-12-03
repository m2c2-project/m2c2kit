import { Canvas } from "canvaskit-wasm";
import { Point } from "./Point";

export interface IDrawable {
  draw(canvas: Canvas): void;
  anchorPoint: Point;
  zPosition: number;
}
