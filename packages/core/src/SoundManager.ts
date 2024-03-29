import { Game } from "./Game";
import { M2c2KitHelpers } from "./M2c2KitHelpers";
import { GameBaseUrls } from "./GameBaseUrls";
import { M2Sound, M2SoundStatus } from "./M2Sound";
import { SoundAsset } from "./SoundAsset";

/**
 * Fetches, loads, and provides sounds to the game.
 *
 * @internal For m2c2kit library use only
 */
export class SoundManager {
  private sounds: Record<string, M2Sound> = {};
  private game: Game;
  private baseUrls: GameBaseUrls;
  private _audioContext?: AudioContext;

  constructor(game: Game, baseUrls: GameBaseUrls) {
    this.game = game;
    this.baseUrls = baseUrls;
  }

  get audioContext(): AudioContext {
    if (!this._audioContext) {
      if (!navigator.userActivation.hasBeenActive) {
        throw new Error(
          "AudioContext cannot be created until user has interacted with the page",
        );
      }
      this._audioContext = new AudioContext();
    }
    return this._audioContext;
  }

  /**
   * Loads sound assets during the game initialization.
   *
   * @internal For m2c2kit library use only
   *
   * @remarks Typically, a user won't call this because the m2c2kit
   * framework will call this automatically. At initialization, sounds can
   * only be fetched, not decoded because the AudioContext can not yet
   * be created (it requires a user interaction).
   *
   * @param sounds - array of SoundAsset objects
   */
  initializeSounds(sounds: Array<SoundAsset> | undefined): Promise<void> {
    return this.fetchSounds(sounds ?? []);
  }

  private async fetchSounds(sounds: Array<SoundAsset>) {
    if (sounds.length === 0) {
      return;
    }
    const fetchSoundsPromises = sounds.map((sound) => {
      /**
       * If the url has a scheme, then we do not alter the url. Otherwise, we
       * prepend the game assets base URL and look for the full URL in the
       * manifest.
       */
      let url = sound.url;
      if (!M2c2KitHelpers.urlHasScheme(sound.url)) {
        url = M2c2KitHelpers.getUrlFromManifest(
          this.game,
          `${this.baseUrls.assets}/${sound.url}`,
        );
      }
      const m2Sound: M2Sound = {
        soundName: sound.soundName,
        data: undefined,
        audioBuffer: undefined,
        url,
        status: sound.lazy ? M2SoundStatus.Deferred : M2SoundStatus.Fetching,
      };
      this.sounds[sound.soundName] = m2Sound;

      if (m2Sound.status === M2SoundStatus.Fetching) {
        return fetch(m2Sound.url).then((response) => {
          if (!response.ok) {
            throw new Error(
              `cannot fetch font ${sound.soundName} at url ${sound.url}: ${response.statusText}`,
            );
          }
          return response.arrayBuffer().then((arrayBuffer) => {
            m2Sound.data = arrayBuffer;
            m2Sound.status = M2SoundStatus.Fetched;
            console.log(
              `⚪ sound fetched. name: ${m2Sound.soundName}, bytes: ${arrayBuffer.byteLength}`,
            );
          });
        });
      }
      return Promise.resolve();
    });
    await Promise.all(fetchSoundsPromises);
  }

  hasSoundsToDecode() {
    return (
      Object.values(this.sounds).filter(
        (sound) => sound.status === M2SoundStatus.Fetched,
      ).length > 0
    );
  }

  async decodeFetchedSounds() {
    const sounds = Object.values(this.sounds);
    const decodeSoundsPromises = sounds
      .filter((sound) => sound.status === M2SoundStatus.Fetched)
      .map((sound) => this.decodeSound(sound));
    return Promise.all(decodeSoundsPromises);
  }

  private async decodeSound(sound: M2Sound) {
    if (!sound.data) {
      throw new Error("sound data is undefined");
    }
    sound.status = M2SoundStatus.Decoding;
    return this.audioContext.decodeAudioData(sound.data).then((buffer) => {
      sound.audioBuffer = buffer;
      sound.status = M2SoundStatus.Ready;
      console.log(
        `⚪ sound decoded. name: ${sound.soundName}, duration (seconds): ${buffer.duration}`,
      );
    });
  }

  /**
   * Returns a m2c2kit sound ({@link M2Sound}) that has been entered into the
   * SoundManager.
   *
   * @internal For m2c2kit library use only
   *
   * @remarks Typically, a user won't need to call this because sound
   * initialization and processing is handled by the framework.
   *
   * @param soundName - sound's name as defined in the game's sound assets
   * @returns a m2c2kit sound
   */
  getSound(soundName: string): M2Sound {
    const sound = this.sounds[soundName];
    if (!sound) {
      throw new Error(`getSound(): sound ${soundName} not found`);
    }
    return sound;
  }

  /**
   * Frees up resources allocated by the FontManager.
   *
   * @internal For m2c2kit library use only
   *
   * @remarks This will be done automatically by the m2c2kit library; the
   * end-user must not call this.
   */
  dispose(): void {}

  /**
   * Gets names of sounds entered in the SoundManager.
   *
   * @returns array of sound names
   */
  getSoundNames(): Array<string> {
    return Object.keys(this.sounds);
  }
}
