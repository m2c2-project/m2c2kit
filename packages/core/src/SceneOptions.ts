import { DrawableOptions } from "./DrawableOptions";
import { EntityOptions } from "./EntityOptions";
import { RgbaColor } from "./RgbaColor";

export interface SceneOptions extends EntityOptions, DrawableOptions {
  backgroundColor?: RgbaColor;
}
