import { ActivityCallbacks } from "./ActivityCallbacks";
import { SessionCallbacks } from "./SessionCallbacks";
import { Activity } from "./Activity";
export interface SessionOptions {
  /** The activities that compose this session */
  activities: Array<Activity>;
  /** Callbacks executed when activity events occurs, such as when activity creates data or ends */
  activityCallbacks?: ActivityCallbacks;
  /** Callbacks executed when session events occur */
  sessionCallbacks?: SessionCallbacks;
  /** Url of the canvaskit.wasm binary. Always set to the default value of "canvaskit.wasm" */
  canvasKitWasmUrl: "canvaskit.wasm";
  /** Use a specified session UUID, rather than create a new one */
  sessionUuid?: string;
  /** URL of session assets folder (which contains wasm binary), if not the default location of "assets" */
  assetsUrl?: string;
  /** NOT IMPLEMENTED YET: Orientation the screen should be locked to for this session. Value will be passed into the ScreenOrientation.lock() Web API. */
  orientation?:
    | "natural"
    | "landscape"
    | "portrait"
    | "portrait-primary"
    | "portrait-secondary"
    | "landscape-primary"
    | "landscape-secondary";
}
