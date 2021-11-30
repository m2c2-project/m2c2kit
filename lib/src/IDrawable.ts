import { Canvas } from "canvaskit-wasm";
import { Point } from "./Point";

//#endregion Interface options
//#region Interfaces ------------------------------------------------------------
export interface IDrawable {
  draw(canvas: Canvas): void;
  anchorPoint: Point;
  zPosition: number;
}
