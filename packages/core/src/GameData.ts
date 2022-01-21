import { ActivityData } from "./ActivityData";
import { TrialData, Metadata } from "./Game";

export interface GameData extends ActivityData {
  trials: Array<TrialData>;
  metadata: Metadata;
}
