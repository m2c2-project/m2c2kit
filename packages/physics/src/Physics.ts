import { Engine } from "matter-js";
import Matter from "matter-js";
import { Game, Entity } from "@m2c2kit/core";
import { Vector } from "./Vector";
import { PhysicsOptions } from "./PhysicsOptions";

interface PhysicsBodiesDictionary {
  [entityUuid: string]: Matter.Body;
}

/**
 * Physics functionality, based on the Matter.js engine.
 */
export class Physics {
  engine: Engine;
  bodiesDictionary: PhysicsBodiesDictionary = {};
  options: PhysicsOptions = {};

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
  constructor(game: Game, options?: PhysicsOptions) {
    console.log("⚪ @m2c2kit/physics version __PACKAGE_JSON_VERSION__");
    this.engine = Engine.create();
    this.options = options || {};
    if (this.options.gravity) {
      this.gravity = this.options.gravity;
    }
    this.addEngineUpdateCallback(game);
  }

  /**
   * Vector that specifies the gravity to apply to all physics bodies.
   * Default is { dx: 0, dy: 1 }
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
