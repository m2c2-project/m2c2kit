import { DrawableOptions } from "./DrawableOptions";
import { EntityOptions } from "./EntityOptions";
import { TextOptions } from "./TextOptions";

export interface TextLineOptions
  extends EntityOptions,
    DrawableOptions,
    TextOptions {
  width?: number;
}
