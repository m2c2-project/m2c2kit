import { Activity } from "./Activity";
import { EventBase } from "./EventBase";

/** Base interface for all Activity events. */
export interface ActivityEvent extends EventBase {
  target: Activity;
}
