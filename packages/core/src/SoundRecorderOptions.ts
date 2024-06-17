import { M2NodeOptions } from "./M2NodeOptions";

export interface SoundRecorderOptions extends M2NodeOptions {
  /** Preferred MIME type to use for recording audio. `audio/webm` or `audio/mp4` is recommended. If omitted, it will use any MIME type supported by the device. */
  mimeType?: string;
  /** Additional MIME types to use for recording audio, in order of preference, if preferred type is not supported. `["audio/webm", "audio/mp4"]` is recommended. */
  backupMimeTypes?: Array<string>;
  /** Maximum duration, in milliseconds, to allow recording. If recording lasts longer than this duration, it will automatically be paused. This can be used to prevent excessively long recording and memory usage. */
  maximumDuration?: number;
  /** Additional audio constraints to be applied when requesting the audio device.
   * see https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
   * @remarks Use with caution. All kinds of constraints may not be supported
   * on all browsers, and specifying too restrictive constraints will result in
   * no available user audio device and an exception. Unusual constraints may
   * also result in an unexpected device being selected.
   * @example
   *  audioTrackConstraints: {
   *    channelCount: 1,
   *    noiseSuppression: { ideal: true },
   *  }
   * */
  audioTrackConstraints?: MediaTrackConstraints;
}
