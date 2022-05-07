import { DrawableOptions } from "./DrawableOptions";
import { EntityOptions } from "./EntityOptions";
import { RgbaColor } from "./RgbaColor";

export interface SceneOptions extends EntityOptions, DrawableOptions {
  /** Background color of the scene. Default is Constants.DEFAULT_SCENE_BACKGROUND_COLOR (WebColors.White) */
  backgroundColor?: RgbaColor;
}
