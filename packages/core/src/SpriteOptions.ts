import { DrawableOptions } from "./DrawableOptions";
import { M2NodeOptions } from "./M2NodeOptions";

export interface SpriteOptions extends M2NodeOptions, DrawableOptions {
  /** Name of image to use for sprite. Must have been previously loaded */
  imageName?: string;
}
