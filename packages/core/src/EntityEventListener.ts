import { EntityEvent } from "./EntityEvent";

// TODO: use entity uuid, not name, to prevent name conflicts/collisions
export interface EntityEventListener {
  eventType: string;
  entityName: string;
  callback: (event: EntityEvent) => void;
}
