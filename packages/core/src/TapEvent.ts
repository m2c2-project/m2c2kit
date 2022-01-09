import { EntityEvent } from "./EntityEvent";
import { Point } from "./Point";

export interface TapEvent extends EntityEvent {
  /** Point that was tapped on entity, relative to the entity coordinate system */
  point: Point;
}
