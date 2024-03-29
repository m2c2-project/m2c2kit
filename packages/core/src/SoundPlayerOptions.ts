import { M2NodeOptions } from ".";

export interface SoundPlayerOptions extends M2NodeOptions {
  /** Name of sound to play. Must have been previously loaded */
  soundName: string;
}
