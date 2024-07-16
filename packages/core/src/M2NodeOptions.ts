import { Layout } from "./Layout";
import { Point } from "./Point";

export interface M2NodeOptions {
  /** Name of the node. Only needed if the node will be referred to by name in a later function */
  name?: string;
  /** Position of the node within its parent coordinate system. Default is (0, 0) */
  position?: Point;
  /** Scale of the node. Default is 1.0 */
  scale?: number;
  /** Opacity of the node. 0 is fully transparent, 1 is fully opaque. Default is 1.0. Alpha has multiplicative inheritance. For example, if the node's parent is alpha .5 and this node's is alpha .4, then the node will appear with alpha .2. */
  alpha?: number;
  /** Rotation of the node around the Z axis. Unit is radians. Default is 0 (no rotation). zRotation has inheritance. In addition to this node's zRotation, all ancestors' zRotations will be applied. */
  zRotation?: number;
  /** Does the node respond to user events, such as taps? Default is false */
  isUserInteractionEnabled?: boolean;
  /** Can the node be dragged? */
  draggable?: boolean;
  /** Is the node, and its children, hidden? (not displayed). Default is false */
  hidden?: boolean;
  /** FOR INTERNAL USE ONLY */
  layout?: Layout;
  /** Unique identifier (UUID). Will be generated automatically. @internal For m2c2kit library use only */
  uuid?: string;
  /** Should the node not emit events to the EventStore? Default is false.
   * @remarks This property is for use by authors of `Composite` nodes. It is not intended for general use. */
  suppressEvents?: boolean;
}
