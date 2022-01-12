import { SessionCallbacks } from "./SessionCallbacks";
import { Activity } from "./Activity";
import { GameCallbacks } from "./GameCallbacks";

export interface SessionOptions {
  /** The activities that compose this session */
  activities: Array<Activity>;
  /** Callbacks executed when trials are completed and when game ends */
  gameCallbacks?: GameCallbacks;
  /** Callbacks executed when session events occur */
  sessionCallbacks?: SessionCallbacks;
}
