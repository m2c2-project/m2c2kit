import { ActivityEvent } from "./ActivityEvent";
import { ActivityData } from "./ActivityData";

// TODO: replace any with types
export interface ActivityDataEvent extends ActivityEvent {
  newData: ActivityData;
  newDataSchema: any;
  data: ActivityData;
  dataSchema: any;
  activityConfiguration: any;
}
