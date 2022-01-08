import { GameEvent } from "./GameEvent";

export interface GameLifecycleEvent extends GameEvent {
  ended: boolean;
}
