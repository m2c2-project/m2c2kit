import { LifecycleCallbacks } from "./LifecycleCallbacks";
import { Game } from "./Game";

export interface ActivityOptions {
  /** The games that compose this activity */
  games: Array<Game>;
  /** Callbacks executed when trials are completed and when game ends */
  callbacks?: LifecycleCallbacks;
}
