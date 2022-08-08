import { ActivityType } from "./ActivityType";

/** A snapshot of performance at a single point in time.
 *
 * @remarks This describes performance of the application internals, not the
 * participant. Do not store participant data here. Use snake case because
 * these data will be directly exported to persistence.
 */
export interface ActivityMetric {
  [key: string]: string | number | boolean | object | undefined | null;
  activity_type: ActivityType;
  activity_uuid: string;
  iso8601_timestamp: string;
}
