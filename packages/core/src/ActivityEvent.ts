import { ActivityType } from "./ActivityType";
import { EventBase } from "./EventBase";

export interface ActivityEvent extends EventBase {
  uuid: string;
  name: string;
  activityType: ActivityType;
}
