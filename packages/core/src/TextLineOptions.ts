import { DrawableOptions } from "./DrawableOptions";
import { M2NodeOptions } from "./M2NodeOptions";
import { TextOptions } from "./TextOptions";

export interface TextLineOptions
  extends M2NodeOptions,
    DrawableOptions,
    TextOptions {
  width?: number;
}
