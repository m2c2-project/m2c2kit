import { CanvasKit } from "canvaskit-wasm";

export class Globals {
  public static canvasKit: CanvasKit;
  public static now = NaN;
  public static deltaTime = NaN;
  public static canvasScale = NaN;
  // _rootScale is the scaling factor to be applied to scenes to scale up or
  // down to fit the device's window while preserving the aspect ratio the
  // game was designed for
  public static rootScale = 1.0;
  public static canvasCssWidth = NaN;
  public static canvasCssHeight = NaN;
}
