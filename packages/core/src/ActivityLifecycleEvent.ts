import { ActivityEvent } from "./ActivityEvent";

export interface ActivityLifecycleEvent extends ActivityEvent {
  /** the activity started. */
  started?: boolean;
  /** the activity ended. the user fully completed the activity and  */
  ended?: boolean;
  /** the activity ended. the user canceled without fully completing the activity */
  userCanceled?: boolean;
}
