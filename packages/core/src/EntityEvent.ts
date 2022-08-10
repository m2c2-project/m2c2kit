import { EventBase } from "./EventBase";
import { Entity } from "./Entity";

export interface EntityEvent extends EventBase {
  target: Entity;
}
