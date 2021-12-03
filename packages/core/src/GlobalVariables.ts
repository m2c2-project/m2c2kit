import { CanvasKit } from "canvaskit-wasm";
import { FontManager } from "./FontManager";
import { ImageManager } from "./ImageManager";

export class GlobalVariables {
  public canvasKit!: CanvasKit;
  public fontManager!: FontManager;
  public imageManager!: ImageManager;
  public now = NaN;
  public deltaTime = NaN;
  public canvasScale = NaN;
  // _rootScale is the scaling factor to be applied to scenes to scale up or
  // down to fit the device's window while preserving the aspect ratio the
  // game was designed for
  public rootScale = 1.0;
  public canvasCssWidth = NaN;
  public canvasCssHeight = NaN;
}
