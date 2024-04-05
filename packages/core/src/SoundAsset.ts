export interface SoundAsset {
  /** Name of the sound to use when referring to it within m2c2kit, such as
   * when creating a `SoundPlayer` node. */
  soundName: string;
  /** URL of sound to load */
  url: string;
  /** If true, the sound will not be fully loaded until it is needed. Default
   * is false. Lazy loading is useful for sounds involved in localization.
   * These should be lazy loaded because they may not be needed.
   */
  lazy?: boolean;
}
