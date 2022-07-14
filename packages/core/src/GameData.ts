import { ActivityData } from "./ActivityData";
import { TrialData } from "./Game";

export interface GameData extends ActivityData {
  trials: Array<TrialData>;
}
