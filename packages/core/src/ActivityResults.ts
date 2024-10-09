import { ActivityKeyValueData } from "./ActivityKeyValueData";
import { ActivityMetric } from "./ActivityMetric";
import { JsonSchema } from "./JsonSchema";

/**
 * All the data created by an activity.
 */
export interface ActivityResults {
  /** All the data of the specified data type created thus far by the activity. */
  data: ActivityKeyValueData;
  /** JSON schema describing the structure of the data. */
  dataSchema: JsonSchema;
  /** Type of data. */
  dataType: "Trial" | "Scoring" | "Survey";
  /** Parameters under which the activity was run. */
  activityConfiguration: unknown;
  /** JSON schema describing the activity parameters. */
  activityConfigurationSchema: JsonSchema;
  /** Metrics describing internal application performance. */
  activityMetrics?: Array<ActivityMetric>;
}
