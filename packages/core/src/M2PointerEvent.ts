import { EntityEvent } from "./EntityEvent";
import { Point } from "./Point";

/**
 * Describes an interaction between the pointer (mouse, touches) and an entity.
 *
 * @remarks I would have named it PointerEvent, but that would collide with
 * the existing DOM PointerEvent.
 */
export interface M2PointerEvent extends EntityEvent {
  /** Point that was tapped on entity, relative to the entity coordinate system */
  point: Point;
  /** Buttons being pressed when event was fired. Taken from DOM MouseEvent.buttons */
  buttons: number;
}
