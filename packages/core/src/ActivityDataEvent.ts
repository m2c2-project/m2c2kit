import { ActivityEvent } from "./ActivityEvent";
import { ActivityData } from "./ActivityData";
import { JsonSchema } from "./JsonSchema";

export interface ActivityDataEvent extends ActivityEvent {
  newData: ActivityData;
  newDataSchema: JsonSchema;
  data: ActivityData;
  dataSchema: JsonSchema;
  activityConfiguration: unknown;
  activityConfigurationSchema: JsonSchema;
}
