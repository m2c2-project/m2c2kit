import { Entity } from "@m2c2kit/core";
import { PhysicsBody } from "./PhysicsBody";

export * from "./Physics";
export * from "./PhysicsBody";

declare module "@m2c2kit/core" {
  interface Entity {
    /**
     * A rigid body model added to an entity to enable physics simulation.
     *
     * @remarks This is a wrapper around the Matter.js `Body` class.
     *
     * @param options - {@link PhysicsBodyOptions}
     */
    physicsBody: PhysicsBody;
    _physicsBody: PhysicsBody;
  }
}

Object.defineProperty(Entity.prototype, "physicsBody", {
  set(this: Entity, physicsBody: PhysicsBody) {
    this._physicsBody = physicsBody;
    this._physicsBody.entity = this;
  },
  get(this: Entity) {
    return this._physicsBody;
  },
});
