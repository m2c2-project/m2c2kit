export interface SoundRecorderResults {
  /** The MIME type of the recorded audio, possibly including the codec. */
  mimeType: string;
  /** The ISO 8601 device timestamp when the recording began. */
  beginIso8601Timestamp: string;
  /** The ISO 8601 device timestamp when the recording ended. */
  endIso8601Timestamp: string;
  /** The duration of the recording in milliseconds. @remarks The duration may be different from the timestamp end minus begin times if the recording was paused. */
  duration: number;
  /** The settings of the audio tracks when the recording began. */
  audioTrackSettings?: Array<MediaTrackSettings>;
  /** The recorded audio as a base 64 string. */
  audioBase64: string;
  /** The recorded audio as a Blob. */
  audioBlob: Blob;
}
