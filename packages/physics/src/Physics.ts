import { Engine } from "matter-js";
import Matter from "matter-js";
import { Game, Entity, Point } from "@m2c2kit/core";
import { Vector } from "./Vector";
import { PhysicsOptions } from "./PhysicsOptions";
import { PhysicsBody } from "./PhysicsBody";

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
    _engineScale: number;
  }
}

interface PhysicsBodiesDictionary {
  [entityUuid: string]: Matter.Body;
}

/**
 * Physics functionality, based on the Matter.js engine.
 */
export class Physics {
  engine: Engine;
  bodiesDictionary: PhysicsBodiesDictionary = {};
  options: PhysicsOptions;

  private _gravity: Vector = { dx: 0, dy: 1 };
  private framesSimulatedCount = 0;
  private cumulativeFrameSimulationTime = 0;

  /**
   * Creates an instance of the physics engine.
   *
   * @remarks This must be called early in the game's initialize() method.
   * @param game - the game instance
   * @param options - {@link PhysicsOptions}
   * @example
   * async initialize() {
   *   await super.initialize();
   *   const game = this;
   *   const physics = new Physics(game, { showsPhysics: true });
   *   ...
   * }
   */
  constructor(options: PhysicsOptions) {
    console.log("⚪ @m2c2kit/physics version __PACKAGE_JSON_VERSION__");
    this.engine = Engine.create();
    this.options = options;
    if (this.options.gravity) {
      this.gravity = this.options.gravity;
    }
    this.addEngineUpdateCallback(this.options.game);
    this.modifyEntityProperties();
  }

  private modifyEntityProperties() {
    // Add the physicsBody property to the Entity class.
    Object.defineProperty(Entity.prototype, "physicsBody", {
      set(this: Entity, physicsBody: PhysicsBody) {
        this._physicsBody = physicsBody;
        this._physicsBody.entity = this;
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
          Matter.Body.setAngle(entity._physicsBody.body, zRotation);
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
          Matter.Body.scale(entity._physicsBody.body, scaleFactor, scaleFactor);
        }
      },
      get() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const entity: Entity = this;
        return entity._scale;
      },
    });
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

  private addEngineUpdateCallback(game: Game) {
    game.onFrameDidSimulatePhysics((ev) => {
      const entities = game.entities;
      this.initializePhysicsBodies(entities);

      const engineUpdateStart = performance.now();
      Engine.update(this.engine, ev.deltaTime);
      this.cumulativeFrameSimulationTime =
        this.cumulativeFrameSimulationTime +
        (performance.now() - engineUpdateStart);
      this.framesSimulatedCount++;
      this.logAverageFrameUpdateDuration();
      this.updateEntitiesFromPhysicsBodies(entities);
    });
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
