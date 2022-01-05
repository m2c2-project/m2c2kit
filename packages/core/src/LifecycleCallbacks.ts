import { TrialSchema } from "./TrialSchema";
import { GameData } from "./Game";

export interface LifecycleCallbacks {
  /** Callback executed when the current game has ended. It is the responsibility of the game programmer to call this at the appropriate time. It is not triggered automatically */
  onGameEnded?: () => void;
  /** Callback executed when a trial has completed. It is the responsibility of the the programmer to call this at the appropriate time. It is not triggered automatically. */
  onTrialCompleted?: (
    trialNumber: number,
    data: GameData,
    trialSchema: TrialSchema
  ) => void;
  /** Callback executed when all the game's trials have completed. It is the responsibility of the game programmer to call this at the appropriate time. It is not triggered automatically. */
  onAllTrialsCompleted?: (data: GameData, trialSchema: TrialSchema) => void;
}
