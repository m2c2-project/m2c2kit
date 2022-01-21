import { ActivityDataEvent } from "./ActivityDataEvent";
import { ActivityLifecycleEvent } from "./ActivityLifecycleEvent";

export interface ActivityCallbacks {
  /** Callback executed when the activity lifecycle changes, such as when it ends. */
  onActivityLifecycleChange?: (event: ActivityLifecycleEvent) => void;
  /** Callback executed when an activity creates some data. */
  onActivityDataCreate?: (event: ActivityDataEvent) => void;
}
