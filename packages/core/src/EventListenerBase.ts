import { EventType, EventBase } from "./EventBase";

export interface EventListenerBase {
  type: EventType;
  callback: (event: EventBase) => void;
  key?: string;
}
