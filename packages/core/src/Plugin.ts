import { Game } from "./Game";

/**
 * A Plugin is code that can be registered to run at certain points in the game loop.
 */
export interface Plugin {
  /** Short identifier of the plugin. */
  id: string;
  /** What kind of m2c2kit object does the plugin work with? */
  type: "Game" | "Session" | "Survey";
  /** Initialization code run when the plugin is registered with the game. */
  initialize?: (game: Game) => Promise<void>;
  /** Is the plugin disabled and not to be run? Default is false. @remarks Disabled plugins will still be initialized. */
  disabled?: boolean;
  /** Plugin code run before the frame update, but before the frame draw. */
  beforeUpdate?: (game: Game, deltaTime: number) => void;
  /** Plugin code run after the frame update, but before the frame draw. */
  afterUpdate?: (game: Game, deltaTime: number) => void;
}
