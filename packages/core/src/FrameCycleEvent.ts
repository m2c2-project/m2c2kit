import { Game } from "./Game";
import { PluginEvent } from "./PluginEvent";

/**
 * Notifies when events in the Frame cycle occur on a Game.
 */
export interface FrameCycleEvent extends PluginEvent {
  target: Game;
  /** difference in milliseconds since the last Frame lifecycle began */
  deltaTime: number;
}
