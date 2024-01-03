import { PhysicsBody } from "./PhysicsBody";
export * from "./Physics";
export * from "./PhysicsBody";
export * from "./PhysicsOptions";
export * from "./PhysicsBodyOptions";
export * from "./Vector";

declare module "@m2c2kit/core" {
  interface Entity {
    /**
     * A rigid body model added to an entity to enable physics simulation.
     *
     * @remarks Set to `undefined` to remove the physics body from the entity
     * and the physics engine world. Note that this will not remove the entity
     * from the scene. If the entity is visible, setting the physics body to
     * `undefined` will "freeze" the entity at its current position and
     * rotation.
     */
    physicsBody?: PhysicsBody;
  }
}
