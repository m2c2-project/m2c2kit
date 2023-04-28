import { EntityEvent } from "./EntityEvent";
import { Point } from "./Point";

/**
 * Describes an interaction of a pointer (mouse, touches) pressing an entity.
 *
 * @remarks Unlike M2PointerEvent, TapEvent considers how the pointer, while
 * in the down state, moves in relation to the bounds of the entity.
 */
export interface TapEvent extends EntityEvent {
  /** Point that was tapped on entity, relative to the entity coordinate system */
  point: Point;
  /** Buttons being pressed when event was fired. Taken from DOM MouseEvent.buttons */
  buttons: number;
}
