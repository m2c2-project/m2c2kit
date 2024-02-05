import { Session } from "./Session";
import { M2Event } from "./M2Event";

/** Base interface for all Session events. */
export interface SessionEvent extends M2Event<Session> {
  target: Session;
}
