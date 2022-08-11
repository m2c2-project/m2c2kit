import { EventBase } from "./EventBase";
import { Entity } from "./Entity";

/** Base interface for all Entity events. */
export interface EntityEvent extends EventBase {
  target: Entity;
}
