import { EventBase } from "./EventBase";
import { Game } from "./Game";

/**
 * Notifies when events in the Frame cycle occur on a Game.
 */
export interface FrameCycleEvent extends EventBase {
  target: Game;
  /** difference in milliseconds since the last Frame lifecycle began */
  deltaTime: number;
}
