import { ActivityCallbacks } from "./ActivityCallbacks";
import { SessionCallbacks } from "./SessionCallbacks";
import { Activity } from "./Activity";
export interface SessionOptions {
  /** The activities that compose this session */
  activities: Array<Activity>;
  /** Callbacks executed when activity events occurs, such as when activity creates data or ends */
  activityCallbacks?: ActivityCallbacks;
  /** Callbacks executed when session events occur */
  sessionCallbacks?: SessionCallbacks;
}
