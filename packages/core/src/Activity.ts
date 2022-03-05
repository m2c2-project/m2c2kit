import { Session } from "./Session";

export interface Activity {
  /** Initializes the activity. */
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
  /** Set activity parameters if defaults are not desired*/
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setParameters(newParameters: any): void;
}
