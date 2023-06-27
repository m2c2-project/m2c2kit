import { Engine, World, Bodies, Composite, Composites } from "matter-js";
import { Game, Entity, RgbaColor } from "@m2c2kit/core";

export interface PhysicsBodiesDictionary {
  [entityUuid: string]: Matter.Body;
}

export interface PhysicsOptions {
  /**
   * Whether or not to show the physics bodies in the game by drawing an outline around them.
   */
  showsPhysics?: boolean;
  /**
   * The color of the physics body outline. Defaults to green.
   */
  showsPhysicsStrokeColor?: RgbaColor;
  /**
   * The width of the physics body outline. Defaults to 1.
   */
  showsPhysicsLineWidth?: number;
  /**
   * Whether to log the average time it takes to update the physics engine each frame.
   */
  logEngineStats?: boolean;
}

/**
 * Physics functionality, based on the Matter.js engine.
 */
export class Physics {
  static engine: Engine;
  static bodiesDictionary: PhysicsBodiesDictionary = {};
  static options: PhysicsOptions = {};

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
    Physics.addEngineUpdateCallback(game);
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
