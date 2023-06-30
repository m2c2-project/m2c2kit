import { Entity, Shape, WebColors } from "@m2c2kit/core";
import Matter from "matter-js";
import { Physics } from "./Physics";
import { Vector } from "./Vector";
import { PhysicsBodyOptions } from "./PhysicsBodyOptions";

/**
 * A rigid body model added to an entity to enable physics simulation.
 *
 * @remarks This is a wrapper around the Matter.js `Body` class.
 *
 * @param options - {@link PhysicsBodyOptions}
 */
export class PhysicsBody implements PhysicsBodyOptions {
  _entity?: Entity;
  _body?: Matter.Body;
  options: PhysicsBodyOptions;
  needsInitialization = true;
  private _isDynamic = true;
  private readonly EDGE_LOOP_DEFAULT_THICKNESS = 10;

  private get body() {
    if (!this._body) {
      throw new Error("PhysicsBody.entity is undefined");
    }
    return this._body;
  }

  private set body(body: Matter.Body) {
    this._body = body;
  }

  get velocity(): Vector {
    /**
     * declaration files are incomplete and do not contain getVelocity
     */
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const matterVector = Matter.Body.getVelocity(this.body) as Matter.Vector;
    return { dx: matterVector.x, dy: matterVector.y };
  }

  set velocity(velocity: Vector) {
    if (!this.isDynamic) {
      throw new Error(
        "PhysicsBody.velocity cannot be set when PhysicsBody.isDynamic is false"
      );
    }
    Matter.Body.setVelocity(
      this.body,
      Matter.Vector.create(velocity.dx, velocity.dy)
    );
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
    Matter.Sleeping.set(this.body, resting);
  }

  get resting() {
    return this.body.isSleeping;
  }

  set restitution(restitution: number) {
    this.body.restitution = restitution;
  }

  get restitution() {
    return this.body.restitution;
  }

  set friction(friction: number) {
    this.body.friction = friction;
  }

  get friction() {
    return this.body.friction;
  }

  set damping(damping: number) {
    this.body.frictionAir = damping;
  }

  get damping() {
    return this.body.frictionAir;
  }

  constructor(options: PhysicsBodyOptions) {
    this.options = options;
    this.needsInitialization = true;
  }

  initialize() {
    if (this.options.circleOfRadius) {
      this.body = this.createCircleBody(this.options);
    } else if (this.options.rect) {
      this.body = this.createRectBody(this.options);
    } else if (this.options.edgeLoop) {
      this.body = this.createEdgeLoopBody(this.options);
    } else {
      throw new Error(
        "PhysicsBodyOptions are invalid; must specify either circleOfRadius, rect, or edgeLoop"
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

    if (this.options.friction) {
      this.friction = this.options.friction;
    }

    if (this.options.damping) {
      this.damping = this.options.damping;
    }

    if (this.options.velocity) {
      this.velocity = this.options.velocity;
    }

    this.body.frictionStatic = 1;

    Matter.World.add(Physics.engine.world, this.body);
    Physics.bodiesDictionary[this.entity.uuid] = this.body;
    this.needsInitialization = false;
  }

  private createCircleBody(options: PhysicsBodyOptions) {
    if (!options.circleOfRadius) {
      throw new Error(
        "PhysicsBody.createCircleBody requires options.circleOfRadius"
      );
    }

    if (Physics.options.showsPhysics) {
      const circleOutline = new Shape({
        circleOfRadius: options.circleOfRadius,
        fillColor: WebColors.Transparent,
        strokeColor: Physics.options.showsPhysicsStrokeColor ?? WebColors.Green,
        lineWidth: Physics.options.showsPhysicsLineWidth ?? 1,
        zPosition: Number.MAX_SAFE_INTEGER,
        name: "PhysicsBodyOutline",
      });
      this.entity.addChild(circleOutline);
    }

    return Matter.Bodies.circle(
      this.entity.position.x,
      this.entity.position.y,
      options.circleOfRadius
    );
  }

  private createRectBody(options: PhysicsBodyOptions) {
    if (!options.rect) {
      throw new Error("PhysicsBody.createRectBody requires options.rect");
    }

    if (Physics.options.showsPhysics) {
      const rectOutline = new Shape({
        rect: {
          width: options.rect.width,
          height: options.rect.height,
        },
        fillColor: WebColors.Transparent,
        strokeColor: Physics.options.showsPhysicsStrokeColor ?? WebColors.Green,
        lineWidth: Physics.options.showsPhysicsLineWidth ?? 1,
        zPosition: Number.MAX_SAFE_INTEGER,
      });
      this.entity.addChild(rectOutline);
    }

    return Matter.Bodies.rectangle(
      this.entity.position.x,
      this.entity.position.y,
      options.rect.width,
      options.rect.height
    );
  }

  private createEdgeLoopBody(options: PhysicsBodyOptions) {
    if (!options.edgeLoop) {
      throw new Error(
        "PhysicsBody.createEdgeLoopBody requires options.edgeLoop"
      );
    }

    const thickness =
      options.edgeLoop.thickness ?? this.EDGE_LOOP_DEFAULT_THICKNESS;

    if (Physics.options.showsPhysics) {
      const rectOutlineA = new Shape({
        position: {
          x: 0,
          y: -options.edgeLoop.height / 2 - thickness / 2,
        },
        rect: {
          width: options.edgeLoop.width + thickness * 2,
          height: thickness,
        },
        fillColor: WebColors.Transparent,
        strokeColor: Physics.options.showsPhysicsStrokeColor ?? WebColors.Green,
        lineWidth: Physics.options.showsPhysicsLineWidth ?? 1,
        zPosition: Number.MAX_SAFE_INTEGER,
      });
      this.entity.addChild(rectOutlineA);

      const rectOutlineB = new Shape({
        position: {
          x: 0,
          y: options.edgeLoop.height / 2 + thickness / 2,
        },
        rect: {
          width: options.edgeLoop.width + thickness * 2,
          height: thickness,
        },
        fillColor: WebColors.Transparent,
        strokeColor: Physics.options.showsPhysicsStrokeColor ?? WebColors.Green,
        lineWidth: Physics.options.showsPhysicsLineWidth ?? 1,
        zPosition: Number.MAX_SAFE_INTEGER,
      });
      this.entity.addChild(rectOutlineB);

      const rectOutlineC = new Shape({
        position: {
          x: -options.edgeLoop.width / 2 - thickness / 2,
          y: 0,
        },
        rect: {
          width: thickness,
          height: options.edgeLoop.height,
        },
        fillColor: WebColors.Transparent,
        strokeColor: Physics.options.showsPhysicsStrokeColor ?? WebColors.Green,
        lineWidth: Physics.options.showsPhysicsLineWidth ?? 1,
        zPosition: Number.MAX_SAFE_INTEGER,
      });
      this.entity.addChild(rectOutlineC);

      const rectOutlineD = new Shape({
        position: {
          x: options.edgeLoop.width / 2 + thickness / 2,
          y: 0,
        },
        rect: {
          width: thickness,
          height: options.edgeLoop.height,
        },
        fillColor: WebColors.Transparent,
        strokeColor: Physics.options.showsPhysicsStrokeColor ?? WebColors.Green,
        lineWidth: Physics.options.showsPhysicsLineWidth ?? 1,
        zPosition: Number.MAX_SAFE_INTEGER,
      });
      this.entity.addChild(rectOutlineD);
    }

    const partA = Matter.Bodies.rectangle(
      this.entity.position.x,
      this.entity.position.y - options.edgeLoop.height / 2 - thickness / 2,
      options.edgeLoop.width + thickness * 2,
      thickness
    );
    const partB = Matter.Bodies.rectangle(
      this.entity.position.x,
      this.entity.position.y + options.edgeLoop.height / 2 + thickness / 2,
      options.edgeLoop.width + thickness * 2,
      thickness
    );
    const partC = Matter.Bodies.rectangle(
      this.entity.position.x - options.edgeLoop.width / 2 - thickness / 2,
      this.entity.position.y,
      thickness,
      options.edgeLoop.height
    );
    const partD = Matter.Bodies.rectangle(
      this.entity.position.x + options.edgeLoop.width / 2 + thickness / 2,
      this.entity.position.y,
      thickness,
      options.edgeLoop.height
    );
    const body = Matter.Body.create({
      parts: [partA, partB, partC, partD],
      isStatic: true,
    });
    return body;
  }
}
