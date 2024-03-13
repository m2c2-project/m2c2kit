import { M2Node } from "@m2c2kit/core";
import { PhysicsBody } from "./PhysicsBody";

export interface M2NodeExtended extends M2Node {
  /**
   * A rigid body model added to a node to enable physics simulation.
   *
   * @remarks Set to `undefined` to remove the physics body from the node
   * and the physics engine world. Note that this will not remove the node
   * from the scene. If the node is visible, setting the physics body to
   * `undefined` will "freeze" the node at its current position and
   * rotation.
   */
  physicsBody?: PhysicsBody;
  _physicsBody?: PhysicsBody;
  _engineScale: number;
}
