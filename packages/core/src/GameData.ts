import { ActivityKeyValueData } from "./ActivityKeyValueData";
import { TrialData } from "./Game";

export interface GameData extends ActivityKeyValueData {
  trials: Array<TrialData>;
}
