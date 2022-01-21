import { EventBase } from "./EventBase";

export interface ActivityEvent extends EventBase {
  uuid: string;
  name: string;
}
