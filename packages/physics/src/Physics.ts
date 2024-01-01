import { Engine } from "matter-js";
import Matter from "matter-js";
import {
  Game,
  Entity,
  Point,
  EventBase,
  CallbackOptions,
  Plugin,
} from "@m2c2kit/core";
import { Vector } from "./Vector";
import { PhysicsOptions } from "./PhysicsOptions";
import { PhysicsBody } from "./PhysicsBody";

declare module "@m2c2kit/core" {
  interface Entity {
    physicsBody?: PhysicsBody;
    _physicsBody?: PhysicsBody;
    _engineScale: number;
  }
}

interface PhysicsBodiesDictionary {
  [entityUuid: string]: Matter.Body;
}

export interface PhysicsEventListener {
  type: string;
  callback: (event: PhysicsEvent) => void;
}

export const PhysicsEventType = {
  ContactBegin: "ContactBegin",
  ContactEnd: "ContactEnd",
} as const;
export type PhysicsEventType =
  (typeof PhysicsEventType)[keyof typeof PhysicsEventType];

export interface PhysicsEvent extends EventBase {
  bodyA: PhysicsBody;
  bodyB: PhysicsBody;
}

/**
 * Physics functionality plugin
 *
 * @remarks Based on the Matter.js engine.
 */
export class Physics implements Plugin {
  id = "physics-matter-js";
  readonly type = "Game";
  engine: Engine;
  bodiesDictionary: PhysicsBodiesDictionary = {};
  options: PhysicsOptions;

  private _gravity: Vector = { dx: 0, dy: 1 };
  private _game?: Game;
  private framesSimulatedCount = 0;
  private cumulativeFrameSimulationTime = 0;
  private eventListeners = new Array<PhysicsEventListener>();

  /**
   * Creates an instance of the physics engine.
   *
   * @remarks The constructor must be called early in the game's `initialize()`
   * method because it adds properties to the `Entity` class for physics
   * functionality. These properties will not be available to entities before
   * the physics plugin is created.
   *
   * @param game - the game instance
   * @param options - {@link PhysicsOptions}
   * @example
   * async initialize() {
   *   await super.initialize();
   *   const game = this;
   *   const physics = new Physics({ showsPhysics: true })
   *   await game.registerPlugin(physics);
   *   ...
   * }
   */
  constructor(options?: PhysicsOptions) {
    console.log("⚪ @m2c2kit/physics version __PACKAGE_JSON_VERSION__");
    this.engine = Engine.create();
    this.options = options ?? {};
    if (this.options.gravity) {
      this.gravity = this.options.gravity;
    }
    this.modifyEntityProperties();
    this.configureEventListeners();
  }

  async initialize(game: Game): Promise<void> {
    this.game = game;
  }

  afterUpdate(game: Game, deltaTime: number): void {
    const entities = game.entities;
    this.initializePhysicsBodies(entities);

    const engineUpdateStart = performance.now();
    Engine.update(this.engine, deltaTime);
    this.cumulativeFrameSimulationTime =
      this.cumulativeFrameSimulationTime +
      (performance.now() - engineUpdateStart);
    this.framesSimulatedCount++;
    this.logAverageFrameUpdateDuration();
    this.updateEntitiesFromPhysicsBodies(entities);
  }

  private addEventListener(
    type: PhysicsEventType,
    callback: (ev: PhysicsEvent) => void,
    callbackOptions?: CallbackOptions,
  ): void {
    const eventListener: PhysicsEventListener = {
      type: type,
      callback: callback,
    };

    if (callbackOptions?.replaceExisting) {
      this.eventListeners = this.eventListeners.filter(
        (listener) => !(listener.type === eventListener.type),
      );
    }

    if (this.eventListeners.some((listener) => listener.type == type)) {
      console.warn(
        `game {${this.game.id}}: listener for physics event ${type} has already been added. This is usually not intended.`,
      );
    }

    this.eventListeners.push(eventListener);
  }

  /**
   * Executes a callback when physics bodies begin to contact each other.
   *
   * @param callback - callback function to be called when a contact begins.
   * @param options - {@link CallbackOptions}
   */
  onContactBegin(
    callback: (ev: PhysicsEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(
      PhysicsEventType.ContactBegin,
      <(ev: PhysicsEvent) => void>callback,
      options,
    );
  }

  /**
   * Executes a callback when physics bodies end contact with other.
   *
   * @param callback - callback function to be called when a contact ends
   * @param options - {@link CallbackOptions}
   */
  onContactEnd(
    callback: (ev: PhysicsEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(
      PhysicsEventType.ContactEnd,
      <(ev: PhysicsEvent) => void>callback,
      options,
    );
  }

  private configureEventListeners() {
    Matter.Events.on(this.engine, "collisionStart", (event) => {
      this.eventListeners
        .filter((listener) => listener.type === PhysicsEventType.ContactBegin)
        .forEach((listener) => {
          const { bodyA, bodyB } =
            this.getPhysicsBodiesFromCollisionEvent(event);
          const physicsEvent: PhysicsEvent = {
            type: PhysicsEventType.ContactBegin,
            target: this,
            bodyA: bodyA,
            bodyB: bodyB,
          };
          listener.callback(physicsEvent);
        });
    });

    Matter.Events.on(this.engine, "collisionEnd", (event) => {
      this.eventListeners
        .filter((listener) => listener.type === PhysicsEventType.ContactEnd)
        .forEach((listener) => {
          const { bodyA, bodyB } =
            this.getPhysicsBodiesFromCollisionEvent(event);
          const physicsEvent: PhysicsEvent = {
            type: PhysicsEventType.ContactEnd,
            target: this,
            bodyA: bodyA,
            bodyB: bodyB,
          };
          listener.callback(physicsEvent);
        });
    });
  }

  /**
   * Returns the Physics Bodies (A & B) involved in a collision event.
   *
   * @remarks the Matter.js collision event has the the bodies as
   * Matter.Body type. This method get their corresponding wrappers as
   * PhysicsBody type.
   *
   * @param event - Matter.js collision event
   * @returns bodyA and bodyB PhysicsBody objects
   */
  private getPhysicsBodiesFromCollisionEvent(
    event: Matter.IEventCollision<Matter.Engine>,
  ) {
    const entityA = this.game.entities.find(
      (e) => e.uuid === event.pairs[0].bodyA.label,
    );
    if (!entityA) {
      throw new Error("bodyA entity not found");
    }
    if (!entityA.physicsBody) {
      throw new Error("bodyA entity does not have a physicsBody");
    }
    const entityB = this.game.entities.find(
      (e) => e.uuid === event.pairs[0].bodyB.label,
    );
    if (!entityB) {
      throw new Error("bodyB entity not found");
    }
    if (!entityB.physicsBody) {
      throw new Error("bodyB entity does not have a physicsBody");
    }
    return { bodyA: entityA.physicsBody, bodyB: entityB.physicsBody };
  }

  private modifyEntityProperties() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const physics = this;
    // Add the physicsBody property to the Entity class.
    Object.defineProperty(Entity.prototype, "physicsBody", {
      set(this: Entity, physicsBody: PhysicsBody) {
        /**
         * if there is an existing physics body AND there is an existing
         * Matter.js body AND the engine has been created, then remove the
         * Matter.js body from the world and the physics body from the entity.
         * Check if there are any outlines and remove them.
         */
        if (this._physicsBody && this._physicsBody.body && physics.engine) {
          Matter.Composite.remove(physics.engine.world, this._physicsBody.body);
        }
        const outlines = this.children.filter((c) =>
          c.name.startsWith("__PhysicsBodyOutline"),
        );
        outlines.forEach((outline) => {
          this.removeChild(outline);
        });
        this._physicsBody = physicsBody;
        if (physicsBody !== undefined) {
          this._physicsBody.entity = this;
        } else {
          delete physics.bodiesDictionary[this.uuid];
        }
      },
      get(this: Entity) {
        return this._physicsBody;
      },
    });

    /**
     * When an entity has a physics body, its position is the same as the
     * physics body's position within the physics engine. Thus, if the user
     * modifies the entity's position, we need to update the physics body's
     * position within the physics engine.
     */
    Object.defineProperty(Entity.prototype, "position", {
      set(position: Point) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const entity: Entity = this;
        entity._position = position;
        const body = entity?.physicsBody?.body;
        if (
          body &&
          (body.position.x !== position.x || body.position.y !== position.y)
        ) {
          Matter.Body.setPosition(body, position);
        }
      },
      get() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const entity: Entity = this;
        return {
          get x(): number {
            return entity._position.x;
          },
          set x(x: number) {
            entity._position.x = x;
            const body = entity?.physicsBody?.body;
            if (body && body.position.x !== x) {
              Matter.Body.setPosition(body, {
                x,
                y: body.position.y,
              });
            }
          },
          get y(): number {
            return entity._position.y;
          },
          set y(y: number) {
            entity._position.y = y;
            const body = entity?.physicsBody?.body;
            if (body && body.position.y !== y) {
              Matter.Body.setPosition(body, {
                x: body.position.x,
                y,
              });
            }
          },
        };
      },
    });

    /**
     * When an entity has a physics body, its zRotation is the same as the
     * physics body's angle within the physics engine. Thus, if the user
     * modifies the entity's zRotation, we need to update the physics body's
     * angle within the physics engine.
     */
    Object.defineProperty(Entity.prototype, "zRotation", {
      set(zRotation: number) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const entity: Entity = this;
        entity._zRotation = zRotation;
        const body = entity?.physicsBody?.body;
        if (body && body.angle !== zRotation) {
          Matter.Body.setAngle(body, zRotation);
        }
      },
      get() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const entity: Entity = this;
        return entity._zRotation;
      },
    });

    /**
     * When an entity has a physics body, its scale is the same as the
     * physics body's scale within the physics engine. Thus, if the user
     * modifies the entity's scale, we need to update the physics body's
     * scaleX and scaleY within the physics engine.
     */
    Object.defineProperty(Entity.prototype, "scale", {
      set(scale: number) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const entity: Entity = this;
        entity._scale = scale;
        const body = entity?.physicsBody?.body;
        if (body) {
          /**
           * Although Matter.js allows us to scale the body within its engine,
           * there is not a property to get the current scale. So we need to
           * keep track of the scale ourselves in _engineScale.
           */
          if (entity._engineScale === undefined) {
            entity._engineScale = 1;
          }
          const scaleFactor = scale / entity._engineScale;
          entity._engineScale = scale;
          // use same scaleFactor for scaleX and scaleY
          const body = entity?.physicsBody?.body;
          if (body) {
            Matter.Body.scale(body, scaleFactor, scaleFactor);
          }
          //Matter.Body.scale(entity._physicsBody.body, scaleFactor, scaleFactor);
        }
      },
      get() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const entity: Entity = this;
        return entity._scale;
      },
    });
  }

  get game(): Game {
    if (!this._game) {
      throw new Error("Physics(): game not set");
    }
    return this._game;
  }

  set game(game: Game) {
    this._game = game;
  }

  /**
   * Vector that specifies the gravity to apply to all physics bodies.
   * Default is &#123; dx: 0, dy: 1 &#125;
   */
  get gravity(): Vector {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const physics = this;
    /**
     * We return getters and setter because we need to inform the engine of
     * change even when only one of the dx or dy values is changed.
     */
    return {
      get dx(): number {
        return physics._gravity.dx;
      },
      set dx(dx: number) {
        physics.gravity = { dx, dy: physics.gravity.dy };
      },
      get dy(): number {
        return physics._gravity.dy;
      },
      set dy(dy: number) {
        physics.gravity = { dx: physics.gravity.dx, dy };
      },
    };
  }

  set gravity(gravity: Vector) {
    this._gravity = gravity;
    this.engine.gravity.x = gravity.dx;
    this.engine.gravity.y = gravity.dy;
  }

  private updateEntitiesFromPhysicsBodies(entities: Entity[]) {
    entities.forEach((entity) => {
      if (this.bodiesDictionary[entity.uuid]) {
        entity.position.x = this.bodiesDictionary[entity.uuid].position.x;
        entity.position.y = this.bodiesDictionary[entity.uuid].position.y;
        entity.zRotation = this.bodiesDictionary[entity.uuid].angle;
      }
    });
  }

  private initializePhysicsBodies(entities: Entity[]) {
    entities.forEach((entity) => {
      if (
        entity.physicsBody !== undefined &&
        entity.physicsBody.needsInitialization
      ) {
        entity.physicsBody.initialize(this);
      }
    });
  }

  private logAverageFrameUpdateDuration() {
    if (this.framesSimulatedCount % 60 === 0) {
      if (this.options.logEngineStats) {
        console.log(
          `average frame Engine.update() time over last 60 frames: ${(
            this.cumulativeFrameSimulationTime / 60
          ).toFixed(2)} milliseconds.`,
        );
      }
      this.cumulativeFrameSimulationTime = 0;
    }
  }
}
