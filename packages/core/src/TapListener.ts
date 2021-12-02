import { Point } from "./Point";
import { Entity } from "./Entity";

// TODO: use entity uuid, not name, to prevent name conflicts/collisions

export class TapListener {
  entityName?: string;
  codeCallback?: (tapevent: TapEvent) => void;
}
/**
 * Object passed to the tap event handler when the entity is tapped.
 */

export interface TapEvent {
  /** The entity that was tapped */
  tappedEntity: Entity;
  /** Point that was tapped on entity, relative to the entity coordinate system */
  point: Point;
}
