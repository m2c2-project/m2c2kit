import { DrawableOptions } from "./DrawableOptions";
import { M2NodeOptions } from "./M2NodeOptions";
import { RgbaColor } from "./RgbaColor";

export interface SceneOptions extends M2NodeOptions, DrawableOptions {
  /** Background color of the scene. Default is Constants.DEFAULT_SCENE_BACKGROUND_COLOR (WebColors.White) */
  backgroundColor?: RgbaColor;
}
