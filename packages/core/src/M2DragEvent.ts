import { M2NodeEvent } from "./M2NodeEvent";
import { Point } from "./Point";

/**
 * Describes a drag and drop operation.
 *
 * @remarks I would have named it DragEvent, but that would collide with
 * the existing DOM DragEvent.
 */
export interface M2DragEvent extends M2NodeEvent {
  /** Position of the node at the time of the M2DragEvent, relative to the parent node coordinate system. */
  position: Point;
  /** Buttons being pressed when event was fired. Taken from DOM MouseEvent.buttons. */
  buttons: number;
}
