import { Session } from "./Session";
import { EventBase } from "./EventBase";

/** Base interface for all Session events. */
export interface SessionEvent extends EventBase {
  target: Session;
}
