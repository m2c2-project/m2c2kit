import { Layout } from "./Layout";
import { Point } from "./Point";

export interface EntityOptions {
  /** Name of the entity. Only needed if the entity will be referred to by name in a later function */
  name?: string;
  /** Position of the entity within its parent coordinate system. Default is (0, 0) */
  position?: Point;
  /** Scale of the entity. Default is 1.0 */
  scale?: number;
  /** Does the entity respond to user events, such as taps? Default is false */
  isUserInteractionEnabled?: boolean;
  /** Can the entity be dragged? */
  draggable?: boolean;
  /** Is the entity, and its children, hidden? (not displayed). Default is false */
  hidden?: boolean;
  /** FOR INTERNAL USE ONLY */
  layout?: Layout;
}
