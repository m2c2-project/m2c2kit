import { ActivityMetric } from "./ActivityMetric";
import { ActivityType } from "./ActivityType";

/**
 * Base interface for game metrics.
 *
 * @remarks This should be extended to create more specific game metrics.
 * This describes performance of the application internals, not the
 * participant. Do not store participant data here. Use snake case because
 * these data will be directly exported to persistence.
 */
export interface GameMetric extends ActivityMetric {
  activity_type: ActivityType.Game;
}

/**
 * A game metric describing drawing performance.
 */
export interface FpsGameMetric extends GameMetric {
  /** Frames per second. Specifically, the number of times our callback provided to requestAnimationFrame() was called */
  fps: number;
  /** The internal, in milliseconds, over which the FPS was calculated */
  fps_interval_ms: number;
  /** The threshold below which a FpsGameMetric was triggered. */
  fps_report_threshold: number;
}
