import { Entity, Shape, Size, WebColors } from "@m2c2kit/core";
import Matter from "matter-js";
import { Physics } from "./Physics";

export interface PhysicsBodyOptions {
  /**
   * A circular physics body of the given radius centered on the entity.
   */
  circleOfRadius?: number;
  /**
   * A rectangular physics body of the given size centered on the entity.
   */
  rect?: Size;
  /**
   * A region that physics bodies cannot penetrate.
   */
  edgeLoop?: Size & {
    /**
     * The thickness of the edge loop. Defaults to 10.
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
}

/**
 * A rigid body model added to an entity to enable physics simulation.
 *
 * @remarks This is a wrapper around the Matter.js `Body` class.
 *
 * @param options - {@link PhysicsBodyOptions}
 */
export class PhysicsBody {
  _entity?: Entity;
  _body?: Matter.Body;
  options: PhysicsBodyOptions;
  needsInitialization = true;
  private _isDynamic = true;
  private _resting = false;
  private _restitution = 0;
  private readonly EDGE_LOOP_DEFAULT_THICKNESS = 10;

  get body() {
    if (!this._body) {
      throw new Error("PhysicsBody.entity is undefined");
    }
    return this._body;
  }

  set body(body: Matter.Body) {
    this._body = body;
  }

  get entity() {
    if (!this._entity) {
      throw new Error("PhysicsBody.entity is undefined");
    }
    return this._entity;
  }

  set entity(entity: Entity) {
    this._entity = entity;
  }

  set isDynamic(isDynamic: boolean) {
    if (this.options.edgeLoop) {
      throw new Error(
        "PhysicsBody.isDynamic cannot be set after the PhysicsBody edgeLoop has been created."
      );
    }
    this._isDynamic = isDynamic;
    Matter.Body.setStatic(this.body, !this.options.isDynamic);
  }

  get isDynamic() {
    return this._isDynamic;
  }

  set resting(resting: boolean) {
    this._resting = resting;
    Matter.Sleeping.set(this.body, resting);
  }

  get resting() {
    return this._resting;
  }

  set restitution(restitution: number) {
    this._restitution = restitution;
    this.body.restitution = restitution;
  }

  get restitution() {
    return this._restitution;
  }

  constructor(options: PhysicsBodyOptions) {
    this.options = options;
    this.needsInitialization = true;
  }

  initialize() {
    if (this.options.circleOfRadius) {
      this.body = Matter.Bodies.circle(
        this.entity.position.x,
        this.entity.position.y,
        this.options.circleOfRadius
      );
      if (Physics.options.showsPhysics) {
        const circleOutline = new Shape({
          circleOfRadius: this.options.circleOfRadius,
          fillColor: WebColors.Transparent,
          strokeColor:
            Physics.options.showsPhysicsStrokeColor ?? WebColors.Green,
          lineWidth: Physics.options.showsPhysicsLineWidth ?? 1,
          zPosition: Number.MAX_SAFE_INTEGER,
          name: "PhysicsBodyOutline",
        });
        this.entity.addChild(circleOutline);
      }
    } else if (this.options.rect) {
      this.body = Matter.Bodies.rectangle(
        this.entity.position.x,
        this.entity.position.y,
        this.options.rect.width,
        this.options.rect.height
      );
      if (Physics.options.showsPhysics) {
        const rectOutline = new Shape({
          rect: {
            width: this.options.rect.width,
            height: this.options.rect.height,
          },
          fillColor: WebColors.Transparent,
          strokeColor:
            Physics.options.showsPhysicsStrokeColor ?? WebColors.Green,
          lineWidth: Physics.options.showsPhysicsLineWidth ?? 1,
          zPosition: Number.MAX_SAFE_INTEGER,
        });
        this.entity.addChild(rectOutline);
      }
    } else if (this.options.edgeLoop) {
      const thickness =
        this.options.edgeLoop.thickness ?? this.EDGE_LOOP_DEFAULT_THICKNESS;

      const partA = Matter.Bodies.rectangle(
        this.entity.position.x,
        this.entity.position.y -
          this.options.edgeLoop.height / 2 -
          thickness / 2,
        this.options.edgeLoop.width + thickness * 2,
        thickness
      );
      const partB = Matter.Bodies.rectangle(
        this.entity.position.x,
        this.entity.position.y +
          this.options.edgeLoop.height / 2 +
          thickness / 2,
        this.options.edgeLoop.width + thickness * 2,
        thickness
      );
      const partC = Matter.Bodies.rectangle(
        this.entity.position.x -
          this.options.edgeLoop.width / 2 -
          thickness / 2,
        this.entity.position.y,
        thickness,
        this.options.edgeLoop.height
      );
      const partD = Matter.Bodies.rectangle(
        this.entity.position.x +
          this.options.edgeLoop.width / 2 +
          thickness / 2,
        this.entity.position.y,
        thickness,
        this.options.edgeLoop.height
      );
      this.body = Matter.Body.create({
        parts: [partA, partB, partC, partD],
        isStatic: true,
      });

      if (Physics.options.showsPhysics) {
        const rectOutlineA = new Shape({
          position: {
            x: 0,
            y: -this.options.edgeLoop.height / 2 - thickness / 2,
          },
          rect: {
            width: this.options.edgeLoop.width + thickness * 2,
            height: thickness,
          },
          fillColor: WebColors.Transparent,
          strokeColor:
            Physics.options.showsPhysicsStrokeColor ?? WebColors.Green,
          lineWidth: Physics.options.showsPhysicsLineWidth ?? 1,
          zPosition: Number.MAX_SAFE_INTEGER,
        });
        this.entity.addChild(rectOutlineA);

        const rectOutlineB = new Shape({
          position: {
            x: 0,
            y: this.options.edgeLoop.height / 2 + thickness / 2,
          },
          rect: {
            width: this.options.edgeLoop.width + thickness * 2,
            height: thickness,
          },
          fillColor: WebColors.Transparent,
          strokeColor:
            Physics.options.showsPhysicsStrokeColor ?? WebColors.Green,
          lineWidth: Physics.options.showsPhysicsLineWidth ?? 1,
          zPosition: Number.MAX_SAFE_INTEGER,
        });
        this.entity.addChild(rectOutlineB);

        const rectOutlineC = new Shape({
          position: {
            x: -this.options.edgeLoop.width / 2 - thickness / 2,
            y: 0,
          },
          rect: {
            width: thickness,
            height: this.options.edgeLoop.height,
          },
          fillColor: WebColors.Transparent,
          strokeColor:
            Physics.options.showsPhysicsStrokeColor ?? WebColors.Green,
          lineWidth: Physics.options.showsPhysicsLineWidth ?? 1,
          zPosition: Number.MAX_SAFE_INTEGER,
        });
        this.entity.addChild(rectOutlineC);

        const rectOutlineD = new Shape({
          position: {
            x: this.options.edgeLoop.width / 2 + thickness / 2,
            y: 0,
          },
          rect: {
            width: thickness,
            height: this.options.edgeLoop.height,
          },
          fillColor: WebColors.Transparent,
          strokeColor:
            Physics.options.showsPhysicsStrokeColor ?? WebColors.Green,
          lineWidth: Physics.options.showsPhysicsLineWidth ?? 1,
          zPosition: Number.MAX_SAFE_INTEGER,
        });
        this.entity.addChild(rectOutlineD);
      }
    } else {
      throw new Error(
        "PhysicsBodyOptions are invalid; must specify either circleOfRadius or rect"
      );
    }

    if (this.options.isDynamic !== undefined) {
      this.isDynamic = this.options.isDynamic;
    }
    if (this.options.edgeLoop) {
      if (this.options.isDynamic) {
        throw new Error(
          "PhysicsBodyOptions are invalid; edgeLoop bodies must be static"
        );
      }
      this._isDynamic = false;
    }
    if (this.options.resting !== undefined) {
      this.resting = this.options.resting;
    }
    if (this.options.restitution !== undefined) {
      this.restitution = this.options.restitution;
    }

    Matter.World.add(Physics.engine.world, this.body);
    Physics.bodiesDictionary[this.entity.uuid] = this.body;
    this.needsInitialization = false;
  }
}
