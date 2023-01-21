import { ActivityType } from "./ActivityType";
import { IDataStore } from "./IDataStore";
import { Session } from "./Session";
export interface Activity {
  /** The type of activity: Game or Survey */
  type: ActivityType;
  /** Initializes the activity. All code to create the activity's appearance and behavior must be placed in this method. This method is asynchronous, and must be awaited. When writing a new game by extending the `Game` class, this method will be overridden, but the base method must still be called with `await super.init()`. */
  init(): Promise<void>;
  /** Starts the activity */
  start(): Promise<void>;
  /** Stops the activity */
  stop(): void;
  /** The activity's parent session */
  session: Session;
  /** The activity's unique identifier. NOTE: This is newly generated each session. The uuid for an activity will vary across sessions. */
  uuid: string;
  /** Human-friendly name of this activity */
  name: string;
  /** Short identifier of this activity */
  id: string;
  /** The value of performance.now() immediately before the activity begins */
  beginTimestamp: number;
  /** The value of new Date().toISOString() immediately before the activity begins */
  beginIso8601Timestamp: string;
  /** Sets additional activity parameters if defaults are not sufficient. */
  setParameters(additionalParameters: unknown): void;
  /** Additional activity parameters that were set. */
  readonly additionalParameters?: unknown;
  /** Optional store to use for saving data. The implementation of the store is not provided by the \@m2c2kit/core library. */
  dataStore?: IDataStore;
}
