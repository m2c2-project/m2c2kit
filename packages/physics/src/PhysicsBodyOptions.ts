import { Size } from "@m2c2kit/core";
import { Vector } from "./Vector";

export interface PhysicsBodyOptions {
  /**
   * A circular physics body of the given radius centered on the node.
   */
  circleOfRadius?: number;
  /**
   * A rectangular physics body of the given size centered on the node.
   */
  rect?: Size;
  /**
   * A region that physics bodies cannot penetrate.
   */
  edgeLoop?: Size & {
    /**
     * The thickness of the edge loop. Defaults to 50.
     *
     * @remarks If body A is moving rapidly and/or is small, and body B is
     * also small, collisions between the two bodies may not be detected.
     * This can manifest as body A "passing through" body B. This is called
     * "tunneling". If body B is an edge loop, one way to reduce tunneling
     * is to increase the thickness of the edge loop.
     * See https://github.com/liabru/matter-js/issues/5
     */
    thickness?: number;
  };
  /**
   * Whether or not the physics body moves in response to forces. Defaults to true.
   *
   * @remarks Once set, this property cannot be changed. This is negated and mapped to the Matter.js `static` property.
   */
  isDynamic?: boolean;
  /**
   * Whether or not the physics body currently moves in response to forces. Defaults to false.
   *
   * @remarks Unlike `isDynamic`, this property can be changed after the body is created. This is mapped to the Matter.js `sleeping` property.
   */
  resting?: boolean;
  /**
   * How elastic (bouncy) the body is.
   *
   * @remarks Range is 0 to 1. 0 means collisions are not elastic at all (no bouncing), 1 means collisions are perfectly elastic. Defaults to 0. This is mapped to the Matter.js `restitution` property.
   */
  restitution?: number;
  /**
   * The velocity of the body.
   */
  velocity?: Vector;
  /**
   * Friction of the body, in the range [0, 1].
   */
  friction?: number;
  /**
   * Friction due to air forces on the body, in the range [0, 1].
   */
  damping?: number;
  /**
   * Whether or not the body can rotate. Defaults to true.
   *
   * @remarks If true, this sets the Matter.js `inertia` property to `Infinity`.
   */
  allowsRotation?: boolean;
  /**
   * The mass of the body.
   *
   * @remarks Density will automatically be calculated when mass is set.
   */
  mass?: number;
  /**
   * Body density (mass per unit area)
   *
   * @remarks Mass will automatically be calculated when density is set.
   */
  density?: number;
  /**
   * Body speed.
   *
   * @remarks If speed is set, the direction will be maintained when velocity
   * is updated.
   */
  speed?: number;
  /**
   * Body angular velocity.
   */
  angularVelocity?: number;
  /**
   * A 32-bit mask specifying which categories this physics body belongs to.
   *
   * @remarks There are up to 32 different categories that physics bodies can
   * belong to. Each category is represented by a bit in the mask. For example,
   * if a body belongs to categories 1 and 3, its category bit mask is
   * 0b00000000000000000000000000000101. Along with the `collisionBitMask`,
   * this property determines which other bodies this physics body can
   * collide with. Default category for all physics bodies is 1.
   */
  categoryBitMask?: number;
  /**
   * A 32-bit mask specifying which categories this physics body can collide with.
   *
   * @remarks This value is a bit mask of the other physics body categories
   * that this body can collide with. Default is 0xFFFFFFFF, which means this
   * body can collide with all other categories (e.g., all physics bodies).
   */
  collisionBitMask?: number;
}
