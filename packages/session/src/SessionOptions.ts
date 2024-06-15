import { SessionCallbacks } from "./SessionCallbacks";
import { Activity, ActivityCallbacks } from "@m2c2kit/core";
import { IDataStore } from "@m2c2kit/core";

export interface SessionOptions {
  /** The activities that compose this session */
  activities: Array<Activity>;
  /** Callbacks executed when activity events occurs, such as when activity creates data or ends */
  activityCallbacks?: ActivityCallbacks;
  /** Callbacks executed when session events occur */
  sessionCallbacks?: SessionCallbacks;
  /** Use a specified session UUID, rather than create a new one */
  sessionUuid?: string;
  /** URL of session assets folder (which contains wasm binary), if not the default location of "assets" */
  assetsUrl?: string;
  /** Array of one or more optional databases that implement the IDataStore interface for persisting data. For store item operations, the first data store will be used. */
  dataStores?: IDataStore[];
  /** The ID of the study (protocol, experiment, or other aggregate) that contains the repeated administrations of these sessions. The ID should be short, url-friendly, human-readable text (no spaces, special characters, or slashes), e.g., `nyc-aging-cohort.` */
  studyId?: string;
  /** The unique identifier (UUID) of the study (protocol, experiment, or other aggregate) that contains the administration of this session. */
  studyUuid?: string;
  /** After the session initializes, should the session automatically start? Default is true */
  autoStartAfterInit?: boolean;
  /** When an activity ends or is canceled, should the session automatically go to the next activity? Default is true */
  autoGoToNextActivity?: boolean;
  /** After the last activity ends or is canceled, should the session automatically end? Default is true */
  autoEndAfterLastActivity?: boolean;
  /** The id of the HTML element to use as the root element where m2c2kit activities will be rendered. Default is "m2c2kit". */
  rootElementId?: string;
  /** Optional style sheet (CSS) to apply to the document instead of the default m2c2kit CSS. It is recommended to use the default CSS. */
  styleSheet?: string;
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
