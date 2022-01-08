import { GameEvent } from "./GameEvent";
import { GameParameters } from "./GameParameters";
import { GameData } from "./GameData";
import { TrialSchema } from "./TrialSchema";

export interface GameTrialEvent extends GameEvent {
  trialIndex: number;
  trialSchema: TrialSchema;
  gameData: GameData;
  gameParameters: GameParameters;
}
