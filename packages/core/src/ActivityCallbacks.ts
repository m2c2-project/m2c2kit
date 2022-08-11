import { ActivityResultsEvent } from "./ActivityResultsEvent";
import { ActivityLifecycleEvent } from "./ActivityLifecycleEvent";

export interface ActivityCallbacks {
  /** Callback executed when the activity lifecycle changes, such as when it ends. */
  onActivityLifecycle?: (event: ActivityLifecycleEvent) => void;
  /** Callback executed when an activity creates some data. */
  onActivityResults?: (event: ActivityResultsEvent) => void;
}
