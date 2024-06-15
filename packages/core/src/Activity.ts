import { ActivityLifecycleEvent } from "./ActivityLifecycleEvent";
import { ActivityType } from "./ActivityType";
import { IDataStore } from "./IDataStore";
import { CallbackOptions } from "./CallbackOptions";
import { ActivityResultsEvent } from "./ActivityResultsEvent";

export interface Activity {
  /** The type of activity: Game or Survey */
  type: ActivityType;
  /**
   * Initializes the activity.
   *
   * @remarks All code to create the activity's appearance and behavior must
   * be placed in this method. This method is asynchronous, and must be
   * awaited. When writing a new game by extending the `Game` class, this
   * method will be overridden, but the base method must still be called with
   * `await super.initialize()`.
   */
  initialize(): Promise<void>;
  /**
   * Initializes the activity.
   *
   * @remarks All code to create the activity's appearance and behavior must
   * be placed in this method. This method is asynchronous, and must be
   * awaited. When writing a new game by extending the `Game` class, this
   * method will be overridden, but the base method must still be called with
   * `await super.init()`.
   *
   * @deprecated use Game.initialize() instead.
   */
  init(): Promise<void>;
  /** Starts the activity */
  start(): Promise<void>;
  /** Stops the activity */
  stop(): void;
  /**
   * Executes a callback when the activity starts.
   *
   * @param callback - function to execute.
   * @param options - options for the callback.
   */
  onStart(
    callback: (activityLifecycleEvent: ActivityLifecycleEvent) => void,
    options?: CallbackOptions,
  ): void;
  /**
   * Executes a callback when the activity is canceled.
   *
   * @param callback - function to execute.
   * @param options - options for the callback.
   */
  onCancel(
    callback: (activityLifecycleEvent: ActivityLifecycleEvent) => void,
    options?: CallbackOptions,
  ): void;
  /**
   * Executes a callback when the activity ends.
   *
   * @param callback - function to execute.
   * @param options - options for the callback.
   */
  onEnd(
    callback: (activityLifecycleEvent: ActivityLifecycleEvent) => void,
    options?: CallbackOptions,
  ): void;
  /**
   * Executes a callback when the activity generates data.
   *
   * @param callback - function to execute.
   * @param options - options for the callback.
   */
  onData(
    callback: (activityResultsEvent: ActivityResultsEvent) => void,
    options?: CallbackOptions,
  ): void;
  /** The activity's parent session unique identifier. This is newly generated each session. */
  sessionUuid: string;
  /** The activity's unique identifier. This is newly generated each session. The UUID for an activity will vary across sessions. */
  uuid: string;
  /** Human-friendly name of this activity */
  name: string;
  /** Short identifier of this activity */
  id: string;
  /** Persistent unique identifier (UUID) of the activity. Required for games. Optional or empty string if a survey. */
  publishUuid: string;
  /** The ID of the study (protocol, experiment, or other aggregate) that contains the repeated administrations of this activity. The ID should be short, url-friendly, human-readable text (no spaces, special characters, or slashes), e.g., `nyc-aging-cohort`. */
  studyId?: string;
  /** Unique identifier (UUID) of the study (protocol, experiment, or other aggregate) that contains the administration of this activity. */
  studyUuid?: string;
  /** The value of performance.now() immediately before the activity begins */
  beginTimestamp: number;
  /** The value of new Date().toISOString() immediately before the activity begins */
  beginIso8601Timestamp: string;
  /** Sets additional activity parameters if defaults are not sufficient. */
  setParameters(additionalParameters: unknown): void;
  /** Additional activity parameters that were set. */
  readonly additionalParameters?: unknown;
  /** Optional stores to use for saving data. The implementation of the store is not provided by the \@m2c2kit/core library. */
  dataStores?: IDataStore[];
}
