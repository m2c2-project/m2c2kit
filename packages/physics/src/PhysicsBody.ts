import { M2Node, Point, Shape, WebColors } from "@m2c2kit/core";
import Matter from "matter-js";
import { Physics } from "./Physics";
import { Vector } from "./Vector";
import { PhysicsBodyOptions } from "./PhysicsBodyOptions";

/**
 * A rigid body model added to a node to enable physics simulation.
 *
 * @param options - {@link PhysicsBodyOptions}
 */
export class PhysicsBody implements PhysicsBodyOptions {
  _node?: M2Node;
  _body?: Matter.Body;
  options: PhysicsBodyOptions;
  needsInitialization = true;
  private _isDynamic = true;
  private readonly EDGE_LOOP_DEFAULT_THICKNESS = 50;
  private _physics?: Physics;
  private _allowsRotation = true;
  private previousInertia = NaN;

  constructor(options: PhysicsBodyOptions) {
    this.options = options;
    this.needsInitialization = true;
  }

  initialize(physics: Physics) {
    this.physics = physics;
    if (this.options.circleOfRadius !== undefined) {
      this.body = this.createCircleBody(this.options);
    } else if (this.options.rect) {
      this.body = this.createRectBody(this.options);
    } else if (this.options.edgeLoop) {
      this.body = this.createEdgeLoopBody(this.options);
    } else {
      throw new Error(
        "PhysicsBodyOptions are invalid; must specify either circleOfRadius, rect, or edgeLoop",
      );
    }

    if (this.options.isDynamic !== undefined) {
      this.isDynamic = this.options.isDynamic;
    }
    if (this.options.edgeLoop) {
      if (this.options.isDynamic) {
        throw new Error(
          "PhysicsBodyOptions are invalid; edgeLoop bodies must be static",
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

    if (this.options.friction !== undefined) {
      this.friction = this.options.friction;
    }

    if (this.options.damping !== undefined) {
      this.damping = this.options.damping;
    }

    if (this.options.velocity) {
      this.velocity = this.options.velocity;
    }

    if (this.options.allowsRotation !== undefined) {
      this.allowsRotation = this.options.allowsRotation;
    }

    if (this.options.mass !== undefined) {
      this.mass = this.options.mass;
    }

    if (this.options.density !== undefined) {
      this.density = this.options.density;
    }

    if (this.options.speed !== undefined) {
      this.speed = this.options.speed;
    }

    if (this.options.angularVelocity !== undefined) {
      this.angularVelocity = this.options.angularVelocity;
    }

    if (this.options.categoryBitMask !== undefined) {
      this.categoryBitMask = this.options.categoryBitMask;
    }

    if (this.options.collisionBitMask !== undefined) {
      this.collisionBitMask = this.options.collisionBitMask;
    }

    Matter.Composite.add(this.physics.engine.world, this.body);
    this.physics.bodiesDictionary[this.node.uuid] = this.body;
    this.body.label = this.node.uuid;
    this.needsInitialization = false;
  }

  /**
   * Applies a force to the body in a single time step.
   *
   * @remarks if `at` is not specified, the force is applied at the body's current `position`.
   *
   * @param force - force to apply as a vector.
   * @param at - the point at which to apply the force, relative to the body's position in scene coordinates.
   */
  applyForce(force: Vector, at?: Point) {
    let atPosition = at;
    if (!atPosition) {
      atPosition = this.node.position;
    }
    /**
     * We cannot call `Matter.Body.applyForce()` here because it will
     * immediately apply the force to the body, without regard to the
     * frames per second that the physics engine is running. Instead, we
     * schedule the force to be applied by the physics engine at the
     * appropriate time, as determined in the `afterUpdate()` plugin
     * entrypoint.
     */
    this.physics.scheduleApplyForce({
      body: this.body,
      position: Matter.Vector.create(atPosition.x, atPosition.y),
      force: Matter.Vector.create(force.dx, force.dy),
    });
  }

  private createCircleBody(options: PhysicsBodyOptions) {
    if (!options.circleOfRadius) {
      throw new Error(
        "PhysicsBody.createCircleBody requires options.circleOfRadius",
      );
    }

    if (this.physics.options.showsPhysics) {
      const circleOutline = new Shape({
        circleOfRadius: options.circleOfRadius,
        fillColor: WebColors.Transparent,
        strokeColor:
          this.physics.options.showsPhysicsStrokeColor ?? WebColors.Green,
        lineWidth: this.physics.options.showsPhysicsLineWidth ?? 1,
        zPosition: Number.MAX_SAFE_INTEGER,
        name: `__PhysicsBodyOutline for ${this.node.name}`,
      });
      this.node.addChild(circleOutline);
      circleOutline.initialize();
    }

    return Matter.Bodies.circle(
      this.node.position.x,
      this.node.position.y,
      options.circleOfRadius,
    );
  }

  private createRectBody(options: PhysicsBodyOptions) {
    if (!options.rect) {
      throw new Error("PhysicsBody.createRectBody requires options.rect");
    }

    if (this.physics.options.showsPhysics) {
      const rectOutline = new Shape({
        rect: {
          width: options.rect.width,
          height: options.rect.height,
        },
        fillColor: WebColors.Transparent,
        strokeColor:
          this.physics.options.showsPhysicsStrokeColor ?? WebColors.Green,
        lineWidth: this.physics.options.showsPhysicsLineWidth ?? 1,
        zPosition: Number.MAX_SAFE_INTEGER,
        name: `__PhysicsBodyOutline for ${this.node.name}`,
      });
      this.node.addChild(rectOutline);
      rectOutline.initialize();
    }

    return Matter.Bodies.rectangle(
      this.node.position.x,
      this.node.position.y,
      options.rect.width,
      options.rect.height,
    );
  }

  private createEdgeLoopBody(options: PhysicsBodyOptions) {
    if (!options.edgeLoop) {
      throw new Error(
        "PhysicsBody.createEdgeLoopBody requires options.edgeLoop",
      );
    }

    const thickness =
      options.edgeLoop.thickness ?? this.EDGE_LOOP_DEFAULT_THICKNESS;

    if (this.physics.options.showsPhysics) {
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
        strokeColor:
          this.physics.options.showsPhysicsStrokeColor ?? WebColors.Green,
        lineWidth: this.physics.options.showsPhysicsLineWidth ?? 1,
        zPosition: Number.MAX_SAFE_INTEGER,
        name: `__PhysicsBodyOutline (Edge Loop A) for ${this.node.name}`,
      });
      this.node.addChild(rectOutlineA);
      rectOutlineA.initialize();

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
        strokeColor:
          this.physics.options.showsPhysicsStrokeColor ?? WebColors.Green,
        lineWidth: this.physics.options.showsPhysicsLineWidth ?? 1,
        zPosition: Number.MAX_SAFE_INTEGER,
        name: `__PhysicsBodyOutline (Edge Loop B) for ${this.node.name}`,
      });
      this.node.addChild(rectOutlineB);
      rectOutlineB.initialize();

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
        strokeColor:
          this.physics.options.showsPhysicsStrokeColor ?? WebColors.Green,
        lineWidth: this.physics.options.showsPhysicsLineWidth ?? 1,
        zPosition: Number.MAX_SAFE_INTEGER,
        name: `__PhysicsBodyOutline (Edge Loop C) for ${this.node.name}`,
      });
      this.node.addChild(rectOutlineC);
      rectOutlineC.initialize();

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
        strokeColor:
          this.physics.options.showsPhysicsStrokeColor ?? WebColors.Green,
        lineWidth: this.physics.options.showsPhysicsLineWidth ?? 1,
        zPosition: Number.MAX_SAFE_INTEGER,
        name: `__PhysicsBodyOutline (Edge Loop D) for ${this.node.name}`,
      });
      this.node.addChild(rectOutlineD);
      rectOutlineD.initialize();
    }

    /**
     * Assign the node UUID as the label for each part of the edge loop.
     * This is because when there is a collision, Matter.js reports the
     * collision with the part, not the composite body we later create
     * from these parts. Parts A and B are top and bottom; parts C and D
     * are left and right.
     */
    const partA = Matter.Bodies.rectangle(
      this.node.position.x,
      this.node.position.y - options.edgeLoop.height / 2 - thickness / 2,
      options.edgeLoop.width + thickness * 2,
      thickness,
      { label: this.node.uuid },
    );
    const partB = Matter.Bodies.rectangle(
      this.node.position.x,
      this.node.position.y + options.edgeLoop.height / 2 + thickness / 2,
      options.edgeLoop.width + thickness * 2,
      thickness,
      { label: this.node.uuid },
    );
    /**
     * Parts C and D are the left and right parts of the edge loop. We add
     * 2 * thickness to these bodies' heights to ensure that parts C and D
     * overlap with parts A and B. Otherwise, there were problems with
     * bodies tunneling out of the edge loop at the "seams" of the parts.
     */
    const partC = Matter.Bodies.rectangle(
      this.node.position.x - options.edgeLoop.width / 2 - thickness / 2,
      this.node.position.y,
      thickness,
      options.edgeLoop.height + 2 * thickness,
      { label: this.node.uuid },
    );
    const partD = Matter.Bodies.rectangle(
      this.node.position.x + options.edgeLoop.width / 2 + thickness / 2,
      this.node.position.y,
      thickness,
      options.edgeLoop.height + 2 * thickness,
      { label: this.node.uuid },
    );
    const body = Matter.Body.create({
      parts: [partA, partB, partC, partD],
      isStatic: true,
    });
    return body;
  }

  get physics() {
    if (!this._physics) {
      throw new Error("PhysicsBody.physics is undefined");
    }
    return this._physics;
  }

  set physics(physics: Physics) {
    this._physics = physics;
  }

  get body() {
    if (!this._body) {
      throw new Error("PhysicsBody.node is undefined");
    }
    return this._body;
  }

  set body(body: Matter.Body) {
    this._body = body;
  }

  get velocity(): Vector {
    const matterVector = Matter.Body.getVelocity(this.body);
    return { dx: matterVector.x, dy: matterVector.y };
  }

  set velocity(velocity: Vector) {
    if (!this.isDynamic) {
      throw new Error(
        "PhysicsBody.velocity cannot be set when PhysicsBody.isDynamic is false",
      );
    }
    Matter.Body.setVelocity(
      this.body,
      Matter.Vector.create(velocity.dx, velocity.dy),
    );
  }

  get node() {
    if (!this._node) {
      throw new Error("PhysicsBody.node is undefined");
    }
    return this._node;
  }

  set node(node: M2Node) {
    this._node = node;
  }

  set isDynamic(isDynamic: boolean) {
    if (this.options.edgeLoop) {
      throw new Error(
        "PhysicsBody.isDynamic cannot be set after the PhysicsBody edgeLoop has been created.",
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

  set allowsRotation(allowsRotation: boolean) {
    this._allowsRotation = allowsRotation;
    if (!allowsRotation) {
      this.previousInertia = this.body.inertia;
      Matter.Body.setInertia(this.body, Infinity);
    } else {
      if (!isNaN(this.previousInertia)) {
        Matter.Body.setInertia(this.body, this.previousInertia);
      }
    }
  }

  get allowsRotation() {
    return this._allowsRotation;
  }

  set mass(mass: number) {
    Matter.Body.setMass(this.body, mass);
  }

  get mass() {
    return this.body.mass;
  }

  get density() {
    return this.body.density;
  }

  set density(density: number) {
    Matter.Body.setDensity(this.body, density);
  }

  /**
   * The area of the body's convex hull.
   *
   * @remarks This is a read-only property.
   */
  get area() {
    return this.body.area;
  }

  get speed() {
    return this.body.density;
  }

  set speed(speed: number) {
    Matter.Body.setSpeed(this.body, speed);
  }

  get angularVelocity() {
    return this.body.angularVelocity;
  }

  set angularVelocity(angularVelocity: number) {
    Matter.Body.setAngularVelocity(this.body, angularVelocity);
  }

  get categoryBitMask() {
    if (this.body.collisionFilter.category === undefined) {
      // default is 1, so this should never happen
      throw new Error("PhysicsBody.categoryBitMask is undefined");
    }
    return this.body.collisionFilter.category;
  }

  set categoryBitMask(categoryBitMask: number) {
    this.body.collisionFilter.category = categoryBitMask;
  }

  get collisionBitMask() {
    if (this.body.collisionFilter.mask === undefined) {
      // default is 0xFFFFFFFF, so this should never happen
      throw new Error("PhysicsBody.collisionBitMask is undefined");
    }
    return this.body.collisionFilter.mask;
  }

  set collisionBitMask(collisionBitMask: number) {
    this.body.collisionFilter.mask = collisionBitMask;
  }
}
