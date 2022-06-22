import { ActivityEvent } from "./ActivityEvent";

export interface ActivityLifecycleEvent extends ActivityEvent {
  /** the activity started. */
  started?: boolean;
  /** the activity ended after the user fully completed the activity */
  ended?: boolean;
  /** the activity ended because the user canceled without fully completing the activity */
  canceled?: boolean;
}
