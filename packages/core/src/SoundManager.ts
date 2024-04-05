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
   * @param soundAssets - array of SoundAsset objects
   */
  initializeSounds(soundAssets: Array<SoundAsset> | undefined): Promise<void> {
    if (!soundAssets) {
      return Promise.resolve();
    }
    return this.loadSounds(soundAssets);
  }

  /**
   * Loads an array of sound assets and makes them ready for the game.
   *
   * @remarks Loading a sound consists of 1) fetching the sound file and 2)
   * decoding the sound data. The sound is then ready to be played. Step 1
   * can be done at any time, but step 2 requires an `AudioContext`, which
   * can only be created after a user interaction. If a play `Action` is
   * attempted before the sound is ready (either it has not been fetched or
   * decoded), the play `Action` will log a warning to the console and the
   * loading process will continue in the background, and the sound will play
   * when ready. This `loadSounds()` method **does not** have to be awaited.
   *
   * @param soundAssets - an array of {@link SoundAsset}
   * @returns A promise that completes when all sounds have loaded
   */
  loadSounds(soundAssets: Array<SoundAsset>): Promise<void> {
    if (soundAssets.length === 0) {
      return Promise.resolve();
    }
    soundAssets.forEach((sound) => {
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
        status: sound.lazy ? M2SoundStatus.Deferred : M2SoundStatus.WillFetch,
      };
      if (this.sounds[sound.soundName]) {
        console.warn(
          `A sound named ${sound.soundName} has already been loaded. It will be replaced.`,
        );
      }
      this.sounds[sound.soundName] = m2Sound;
    });
    return this.fetchSounds();
  }

  private async fetchSounds() {
    const fetchSoundsPromises = Object.values(this.sounds).map((m2Sound) => {
      if (m2Sound.status === M2SoundStatus.WillFetch) {
        m2Sound.status = M2SoundStatus.Fetching;
        return fetch(m2Sound.url).then((response) => {
          if (!response.ok) {
            m2Sound.status = M2SoundStatus.Error;
            throw new Error(
              `cannot fetch sound ${m2Sound.soundName} at url ${m2Sound.url}: ${response.statusText}`,
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

  /**
   * Fetches a m2c2kit sound ({@link M2Sound}) that was previously
   * initialized with lazy loading.
   *
   * @internal For m2c2kit library use only
   *
   * @param m2Sound - M2Sound to fetch
   * @returns A promise that completes when sounds have been fetched
   */
  fetchDeferredSound(m2Sound: M2Sound): Promise<void> {
    m2Sound.status = M2SoundStatus.WillFetch;
    return this.fetchSounds();
  }

  /**
   * Checks if the SoundManager has sounds needing decoding.
   *
   * @internal For m2c2kit library use only
   *
   * @returns true if there are sounds that have been fetched and are waiting
   * to be decoded (status is `M2SoundStatus.Fetched`)
   */
  hasSoundsToDecode() {
    return (
      Object.values(this.sounds).filter(
        (sound) => sound.status === M2SoundStatus.Fetched,
      ).length > 0
    );
  }

  /**
   * Decodes all fetched sounds from bytes to an `AudioBuffer`.
   *
   * @internal For m2c2kit library use only
   *
   * @remarks This method will be called after the `AudioContext` has been
   * created and if there are fetched sounds waiting to be decoded.
   *
   * @returns A promise that completes when all fetched sounds have been decoded
   */
  decodeFetchedSounds() {
    const sounds = Object.values(this.sounds);
    const decodeSoundsPromises = sounds
      .filter((sound) => sound.status === M2SoundStatus.Fetched)
      .map((sound) => this.decodeSound(sound));
    return Promise.all(decodeSoundsPromises);
  }

  /**
   * Decodes a sound from bytes to an `AudioBuffer`.
   *
   * @param sound - sound to decode
   */
  private async decodeSound(sound: M2Sound) {
    if (!sound.data) {
      throw new Error(
        `data is undefined for sound ${sound.soundName} (url ${sound.url})`,
      );
    }

    try {
      sound.status = M2SoundStatus.Decoding;
      const buffer = await this.audioContext.decodeAudioData(sound.data);
      sound.audioBuffer = buffer;
      sound.status = M2SoundStatus.Ready;
      console.log(
        `⚪ sound decoded. name: ${sound.soundName}, duration (seconds): ${buffer.duration}`,
      );
    } catch {
      // Set status to Error. An exception will also be thrown by the play action.
      sound.status = M2SoundStatus.Error;
      throw new Error(
        `error decoding sound ${sound.soundName} (url: ${sound.url})`,
      );
    }
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
   * Frees up resources allocated by the SoundManager.
   *
   * @internal For m2c2kit library use only
   *
   * @remarks This will be done automatically by the m2c2kit library; the
   * end-user must not call this.
   */
  dispose(): void {}

  /**
   * Gets names of sounds entered in the `SoundManager`.
   *
   * @remarks These are sounds that the `SoundManager` is aware of. The sounds
   * may not be ready to play (may not have been fetched or decoded yet).
   *
   * @returns array of sound names
   */
  getSoundNames(): Array<string> {
    return Object.keys(this.sounds);
  }
}
