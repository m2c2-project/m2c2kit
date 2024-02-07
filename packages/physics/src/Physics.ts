import { Engine } from "matter-js";
import Matter from "matter-js";
import {
  Game,
  Entity,
  Point,
  PluginEvent,
  CallbackOptions,
  Plugin,
} from "@m2c2kit/core";
import { Vector } from "./Vector";
import { PhysicsOptions } from "./PhysicsOptions";
import { PhysicsBody } from "./PhysicsBody";
import { EntityExtended } from "./EntityExtended";

interface PhysicsBodiesDictionary {
  [entityUuid: string]: Matter.Body;
}

interface ApplyForceQueueItem {
  body: Matter.Body;
  position: Matter.Vector;
  force: Matter.Vector;
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

export interface PhysicsEvent extends PluginEvent {
  bodyA: PhysicsBody;
  bodyB: PhysicsBody;
}

const DELTA_TIME_60_FPS = 16.66666667;

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
  private applyForceQueue = new Array<ApplyForceQueueItem>();
  private accumulatedDeltaTime = 0;

  /**
   * Creates an instance of the physics engine.
   *
   * @remarks The constructor must be called early in the game's `initialize()`
   * method because it adds properties to the `Entity` class for physics
   * functionality. These properties will not be available to entities before
   * the physics plugin is created.
   *
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
    this.initializePhysicsBodies(game.entities);

    /**
     * To ensure the physics simulation shows the same behavior across
     * various frame rates, we need to run the simulation at a fixed
     * time step. We use a fixed time step of 16.66666667 milliseconds, which
     * corresponds to 60 frames per second. If the frame rate is lower than
     * 60 fps, we run the simulation multiple times to catch up. If the frame
     * rate is higher than 60 fps, we skip some simulation steps.
     *
     * When the frame rate is not exactly 60 fps, we keep track of the
     * accumulated delta time and run the simulation when the accumulated
     * delta time is greater than or equal to 16.66666667 milliseconds.
     *
     * See https://gafferongames.com/post/fix_your_timestep/
     */
    this.accumulatedDeltaTime = this.accumulatedDeltaTime + deltaTime;
    if (this.accumulatedDeltaTime < DELTA_TIME_60_FPS) {
      return;
    }

    const engineUpdateStart = performance.now();
    const engineTicksToRun = Math.floor(
      this.accumulatedDeltaTime / DELTA_TIME_60_FPS,
    );

    for (let i = 0; i < engineTicksToRun; i++) {
      while (this.applyForceQueue.length > 0) {
        const item = this.applyForceQueue.shift();
        if (item === undefined) {
          throw new Error("apply force queue item is undefined");
        }
        Matter.Body.applyForce(
          item.body,
          item.position,
          Matter.Vector.create(item.force.x, item.force.y),
        );
      }
      Engine.update(this.engine, DELTA_TIME_60_FPS);
      this.accumulatedDeltaTime = this.accumulatedDeltaTime - DELTA_TIME_60_FPS;
    }
    this.applyForceQueue = [];

    this.cumulativeFrameSimulationTime =
      this.cumulativeFrameSimulationTime +
      (performance.now() - engineUpdateStart);
    this.framesSimulatedCount++;
    this.logAverageFrameUpdateDuration();
    this.updateEntitiesFromPhysicsBodies(game.entities);
  }

  /**
   * Adds an applyForce() call to the queue.
   *
   * @param item - {@link ApplyForceQueueItem}
   */
  scheduleApplyForce(item: ApplyForceQueueItem): void {
    this.applyForceQueue.push(item);
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
    ) as EntityExtended | undefined;
    if (!entityA) {
      throw new Error("bodyA entity not found");
    }
    if (!entityA.physicsBody) {
      throw new Error("bodyA entity does not have a physicsBody");
    }
    const entityB = this.game.entities.find(
      (e) => e.uuid === event.pairs[0].bodyB.label,
    ) as EntityExtended | undefined;
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
      set(this: EntityExtended, physicsBody: PhysicsBody) {
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
          /**
           * "as Entity" is not needed to build, but it was added because
           * Jest fails without it. (related to module augmentation issues).
           */
          this._physicsBody.entity = this as Entity;
        } else {
          delete physics.bodiesDictionary[this.uuid];
        }
      },
      get(this: EntityExtended) {
        return this._physicsBody;
      },
      /**
       * Set configurable to true so that the property can be redefined when
       * running multiple tests in Jest.
       */
      configurable: true,
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
        const entity: EntityExtended = this;
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
        const entity: EntityExtended = this;
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
      configurable: true,
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
        const entity: EntityExtended = this;
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
      configurable: true,
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
        const entity: EntityExtended = this;
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
      configurable: true,
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
        (entity as EntityExtended).physicsBody !== undefined &&
        (entity as EntityExtended).physicsBody?.needsInitialization
      ) {
        (entity as EntityExtended).physicsBody?.initialize(this);
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
