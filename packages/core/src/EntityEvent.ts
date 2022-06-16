import { Entity } from "./Entity";

export interface EntityEvent {
  target: Entity;
  /** Has the event been handled by a prior listener, or should it continue to propagate to other listeners */
  handled: boolean;
}
