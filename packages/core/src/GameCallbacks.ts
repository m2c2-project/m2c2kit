import { GameLifecycleEvent } from "./GameLifecycleEvent";
import { GameTrialEvent } from "./GameTrialEvent";

export interface GameCallbacks {
  /** Callback executed when the game lifecycle changes, such as when it ends. */
  onGameLifecycleChange?: (event: GameLifecycleEvent) => void;
  /** Callback executed when a game trial completes. */
  onGameTrialComplete?: (event: GameTrialEvent) => void;
}
