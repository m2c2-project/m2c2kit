import { SessionEvent } from "./SessionEvent";
export interface SessionLifecycleEvent extends SessionEvent {
  initialized: boolean;
  ended: boolean;
}
