import { Session } from "./Session";
export interface Activity {
  /** Starts the activity */
  start(): void;
  /** Stops the activity */
  stop(): void;
  /** The activity's parent session */
  session: Session;
  /** The activity's unique identifier. NOTE: This is newly generated each session. The uuid for an activity will vary across sessions. */
  uuid: string;
}
