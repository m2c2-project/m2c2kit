import { M2NodeEvent } from "./M2NodeEvent";
import { Point } from "./Point";

/**
 * Describes an interaction of a pointer (mouse, touches) pressing a node.
 *
 * @remarks Unlike M2PointerEvent, TapEvent considers how the pointer, while
 * in the down state, moves in relation to the bounds of the node.
 */
export interface TapEvent extends M2NodeEvent {
  /** Point that was tapped on node, relative to the node coordinate system */
  point: Point;
  /** Buttons being pressed when event was fired. Taken from DOM MouseEvent.buttons */
  buttons: number;
}
