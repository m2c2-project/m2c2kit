import { ActivityData } from "./ActivityData";
import { ActivityMetric } from "./ActivityMetric";
import { JsonSchema } from "./JsonSchema";

export interface FinalActivityData {
  data: ActivityData;
  dataSchema: JsonSchema;
  activityConfiguration: unknown;
  activityConfigurationSchema: JsonSchema;
  activityMetrics?: Array<ActivityMetric>;
}
