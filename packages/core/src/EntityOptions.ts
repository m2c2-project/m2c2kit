import { Layout } from "./Layout";
import { Point } from "./Point";

export interface EntityOptions {
  /** Name of the entity. Only needed if the entity will be referred to by name in a later function */
  name?: string;
  /** Position of the entity within its parent coordinate system. Default is (0, 0) */
  position?: Point;
  /** Scale of the entity. Default is 1.0 */
  scale?: number;
  /** Opacity of the entity. 0 is fully transparent, 1 is fully opaque. Default is 1.0. Alpha has multiplicative inheritance. For example, if the entity's parent is alpha .5 and this entity's is alpha .4, then the entity will appear with alpha .2. */
  alpha?: number;
  /** Rotation of the entity around the Z axis. Unit is radians. Default is 0 (no rotation). zRotation has inheritance. In addition to this entity's zRotation, all ancestors' zRotations will be applied. */
  zRotation?: number;
  /** Does the entity respond to user events, such as taps? Default is false */
  isUserInteractionEnabled?: boolean;
  /** Can the entity be dragged? */
  draggable?: boolean;
  /** Is the entity, and its children, hidden? (not displayed). Default is false */
  hidden?: boolean;
  /** FOR INTERNAL USE ONLY */
  layout?: Layout;
}
