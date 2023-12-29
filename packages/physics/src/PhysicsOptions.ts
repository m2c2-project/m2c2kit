import { RgbaColor } from "@m2c2kit/core";
import { Vector } from "./Vector";

export interface PhysicsOptions {
  /**
   * Whether or not to show the physics bodies in the game by drawing an outline around them.
   */
  showsPhysics?: boolean;
  /**
   * The color of the physics body outline. Defaults to green.
   */
  showsPhysicsStrokeColor?: RgbaColor;
  /**
   * The width of the physics body outline. Defaults to 1.
   */
  showsPhysicsLineWidth?: number;
  /**
   * Whether to log the average time it takes to update the physics engine each frame.
   */
  logEngineStats?: boolean;
  /**
   * Vector that specifies the gravity to apply to all physics bodies. Default is &#123; dx: 0, dy: 1 &#125;
   */
  gravity?: Vector;
}
