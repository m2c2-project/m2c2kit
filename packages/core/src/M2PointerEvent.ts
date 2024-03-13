import { M2NodeEvent } from "./M2NodeEvent";
import { Point } from "./Point";

/**
 * Describes an interaction between the pointer (mouse, touches) and a node.
 *
 * @remarks I would have named it PointerEvent, but that would collide with
 * the existing DOM PointerEvent.
 */
export interface M2PointerEvent extends M2NodeEvent {
  /** Point that was tapped on node, relative to the node coordinate system */
  point: Point;
  /** Buttons being pressed when event was fired. Taken from DOM MouseEvent.buttons */
  buttons: number;
}
