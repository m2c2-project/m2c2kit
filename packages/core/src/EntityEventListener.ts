import { EventType } from "./EventBase";
import { EntityEvent } from "./EntityEvent";

export interface EntityEventListener {
  type: EventType | string;
  /** For composites that raise events, type of the composite custom event. */
  compositeType?: string;
  entityUuid: string;
  callback: (event: EntityEvent) => void;
}
