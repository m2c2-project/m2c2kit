import { GameLifecycleEvent } from "./GameLifecycleEvent";
import { GameTrialEvent } from "./GameTrialEvent";

export interface GameCallbacks {
  /** Callback executed when the current game has ended. */
  onGameEnd?: (event: GameLifecycleEvent) => void;
  /** Callback executed when a game trial has completed. */
  onGameTrialComplete?: (event: GameTrialEvent) => void;
}
