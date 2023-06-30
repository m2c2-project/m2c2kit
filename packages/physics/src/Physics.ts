import {
  Engine,
  Resolver,
  Events,
  World,
  Bodies,
  Composite,
  Composites,
} from "matter-js";
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
  static engine: Engine;
  static bodiesDictionary: PhysicsBodiesDictionary = {};
  static options: PhysicsOptions = {};

  private static _gravity: Vector = { dx: 0, dy: 1 };
  private static framesSimulatedCount = 0;
  private static cumulativeFrameSimulationTime = 0;

  /**
   * Initializes the physics engine.
   *
   * @remarks This must be called early in the game's initialize() method.
   * @example
   * async initialize() {
   *   await super.initialize();
   *   const game = this;
   *   Physics.initialize(game);
   *   ...
   * }
   * @param game - the game instance
   * @param options - {@link PhysicsOptions}
   */
  static initialize(game: Game, options?: PhysicsOptions) {
    console.log("⚪ @m2c2kit/physics version __PACKAGE_JSON_VERSION__");
    this.engine = Engine.create();
    this.options = options || {};
    if (this.options.gravity) {
      Physics.gravity = this.options.gravity;
    }
    Physics.addEngineUpdateCallback(game);
  }

  /**
   * Vector that specifies the gravity to apply to all physics bodies. Default is { dx: 0, dy: 1 }
   */
  static get gravity(): Vector {
    /**
     * We return getters and setter because we need to inform the engine of
     * change even when only one of the dx or dy values is changed.
     */
    return {
      get dx(): number {
        return Physics._gravity.dx;
      },
      set dx(dx: number) {
        Physics.gravity = { dx, dy: Physics.gravity.dy };
      },
      get dy(): number {
        return Physics._gravity.dy;
      },
      set dy(dy: number) {
        Physics.gravity = { dx: Physics.gravity.dx, dy };
      },
    };
  }

  static set gravity(gravity: Vector) {
    Physics._gravity = gravity;
    Physics.engine.gravity.x = gravity.dx;
    Physics.engine.gravity.y = gravity.dy;
  }

  private static addEngineUpdateCallback(game: Game) {
    game.onFrameDidSimulatePhysics((ev) => {
      const entities = game.entities;
      Physics.initializePhysicsBodies(entities);

      const engineUpdateStart = performance.now();
      Engine.update(Physics.engine, ev.deltaTime);
      Physics.cumulativeFrameSimulationTime =
        Physics.cumulativeFrameSimulationTime +
        (performance.now() - engineUpdateStart);
      Physics.framesSimulatedCount++;
      Physics.logAverageFrameUpdateDuration();
      Physics.updateEntityPositionsFromPhysicsBodies(entities);
    });
  }

  private static updateEntityPositionsFromPhysicsBodies(entities: Entity[]) {
    entities.forEach((entity) => {
      if (this.bodiesDictionary[entity.uuid]) {
        entity.position.x = this.bodiesDictionary[entity.uuid].position.x;
        entity.position.y = this.bodiesDictionary[entity.uuid].position.y;
      }
    });
  }

  private static initializePhysicsBodies(entities: Entity[]) {
    entities.forEach((entity) => {
      if (
        entity.physicsBody !== undefined &&
        entity.physicsBody.needsInitialization
      ) {
        entity.physicsBody.initialize();
      }
    });
  }

  private static logAverageFrameUpdateDuration() {
    if (Physics.framesSimulatedCount % 60 === 0) {
      if (Physics.options.logEngineStats) {
        console.log(
          `average frame Engine.update() time over last 60 frames: ${(
            Physics.cumulativeFrameSimulationTime / 60
          ).toFixed(2)} milliseconds.`
        );
      }
      Physics.cumulativeFrameSimulationTime = 0;
    }
  }
}
