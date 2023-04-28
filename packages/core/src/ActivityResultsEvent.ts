import { ActivityEvent } from "./ActivityEvent";
import { ActivityKeyValueData } from "./ActivityKeyValueData";
import { ActivityResults } from "./ActivityResults";
import { JsonSchema } from "./JsonSchema";

/**
 * Dispatched when new data is created by an activity.
 *
 * @remarks Event contains all the data created by an activity, with
 * separate properties for the newly created data. ActivityResultsEvent
 * inherits "data" from ActivityResults, which contains the complete data
 * up to this point (both new and existing data).
 */
export interface ActivityResultsEvent extends ActivityEvent, ActivityResults {
  /** New data created by the activity, which dispatched this event */
  newData: ActivityKeyValueData;
  /** JSON schema describing the new data */
  newDataSchema: JsonSchema;
  // the following are inherited from ActivityResults:
  // data: ActivityKeyValueData;
  // dataSchema: JsonSchema;
  // activityConfiguration: unknown;
  // activityConfigurationSchema: JsonSchema;
  // activityMetrics?: Array<ActivityMetric>;
  /** ISO 8601 timestamp of the event. Specifically, value of "new Date().toISOString()" executed on the device when the ActivityResultsEvent occurred. */
  iso8601Timestamp: string;
}
