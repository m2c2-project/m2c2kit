import { EventBase } from "./EventBase";
import { Entity } from "./Entity";

/** Base interface for all Entity events. */
export interface EntityEvent extends EventBase {
  /** The Entity on which the event occurred. */
  target: Entity;
  /** For composites that raise events, type of the composite custom event. */
  compositeType?: string;
}
