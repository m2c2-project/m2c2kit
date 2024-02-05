import { M2EventListener } from "./M2EventListener";

export interface EntityEventListener<EntityEvent>
  extends M2EventListener<EntityEvent> {
  /** For composites that raise events, type of the composite custom event. */
  compositeType?: string;
  /** UUID of the entity that the event listener is listening for. */
  entityUuid: string;
}
