import { Activity } from "./Activity";
import { M2Event } from "./M2Event";

/** Base interface for all Activity events. */
export interface ActivityEvent extends M2Event<Activity> {
  target: Activity;
}
