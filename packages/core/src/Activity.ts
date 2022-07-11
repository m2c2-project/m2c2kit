import { ActivityType } from "./ActivityType";
import { Session } from "./Session";
export interface Activity {
  /** The type of activity: Game or Survey */
  type: ActivityType;
  /** Initializes the activity. All code to construct the activity's appearance and behavior must be placed in this method. */
  init(): void;
  /** Starts the activity */
  start(): void;
  /** Stops the activity */
  stop(): void;
  /** The activity's parent session */
  session: Session;
  /** The activity's unique identifier. NOTE: This is newly generated each session. The uuid for an activity will vary across sessions. */
  uuid: string;
  /** The activity's human friendly name */
  name: string;
  /** The value of performance.now() immediately before the activity begins */
  beginTimestamp: number;
  /** The value of new Date().toISOString() immediately before the activity begins */
  beginIso8601Timestamp: string;
  /** Set activity parameters if defaults are not desired*/
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setParameters(newParameters: any): void;
}
