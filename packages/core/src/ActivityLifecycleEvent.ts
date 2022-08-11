import { ActivityEvent } from "./ActivityEvent";
import { ActivityResults } from "./ActivityResults";

/**
 * Notifies when an activity starts, ends, cancels, or
 * creates data.
 */
export interface ActivityLifecycleEvent extends ActivityEvent {
  results?: ActivityResults;
}
