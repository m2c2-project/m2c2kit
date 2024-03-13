import { PhysicsBody } from "./PhysicsBody";
export * from "./Physics";
export * from "./PhysicsBody";
export * from "./PhysicsOptions";
export * from "./PhysicsBodyOptions";
export * from "./Vector";

declare module "@m2c2kit/core" {
  interface M2Node {
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
  }
}

console.log("⚪ @m2c2kit/physics version __PACKAGE_JSON_VERSION__");
