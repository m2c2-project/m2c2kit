export interface M2Sound {
  soundName: string;
  data: ArrayBuffer | undefined;
  audioBuffer: AudioBuffer | undefined;
  url: string;
  status: M2SoundStatus;
}

export const M2SoundStatus = {
  /** Sound was set for lazy loading, and loading has not yet been requested. */
  Deferred: "Deferred",
  /** Sound is indicated for fetching, but fetching has not begun. */
  WillFetch: "WillFetch",
  /** Sound is being fetched. */
  Fetching: "Fetching",
  /** Sound has been fetched. */
  Fetched: "Fetched",
  /** Sound is being decoded. */
  Decoding: "Decoding",
  /** Sound has fully finished loading and is ready to use. */
  Ready: "Ready",
  /** Error occurred in loading. */
  Error: "Error",
} as const;

export type M2SoundStatus = (typeof M2SoundStatus)[keyof typeof M2SoundStatus];
