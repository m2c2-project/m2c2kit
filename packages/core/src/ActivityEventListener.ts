import { M2EventListener } from "./M2EventListener";

export interface ActivityEventListener<ActivityEvent>
  extends M2EventListener<ActivityEvent> {
  /** UUID of the activity that the event listener is listening for. */
  activityUuid: string;
}
