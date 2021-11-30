import { DrawableOptions } from "./DrawableOptions";
import { EntityOptions } from "./EntityOptions";

export interface SpriteOptions extends EntityOptions, DrawableOptions {
  imageName?: string;
}
