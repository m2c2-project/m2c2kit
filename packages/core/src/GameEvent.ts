import { Activity } from "./Activity";
import { Game } from "./Game";
import { M2Event } from "./M2Event";

/** Base interface for all Game events. */
export interface GameEvent extends M2Event<Activity> {
  target: Game;
}
