import { EventType } from "./EventBase";
import { ActivityEvent } from "./ActivityEvent";

export interface ActivityEventListener {
  type: EventType;
  activityUuid: string;
  callback: (event: ActivityEvent) => void;
}
