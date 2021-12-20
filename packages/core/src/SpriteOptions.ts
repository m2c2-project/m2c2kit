import { DrawableOptions } from "./DrawableOptions";
import { EntityOptions } from "./EntityOptions";

export interface SpriteOptions extends EntityOptions, DrawableOptions {
  /** Name of image to use for sprite. Must have been previously loaded */
  imageName?: string;
}
