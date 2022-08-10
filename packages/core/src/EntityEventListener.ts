import { EventType } from "./EventBase";
import { EntityEvent } from "./EntityEvent";

export interface EntityEventListener {
  type: EventType;
  entityUuid: string;
  callback: (event: EntityEvent) => void;
}
