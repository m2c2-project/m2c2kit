import { M2Error } from "./M2Error";
import { M2Node } from "./M2Node";
import { M2NodeType } from "./M2NodeType";
import { SoundRecorderOptions } from "./SoundRecorderOptions";
import { SoundRecorderResults } from "./SoundRecorderResults";
import { Timer } from "./Timer";
import { Uuid } from "./Uuid";

export class SoundRecorder
  extends M2Node
  implements Omit<SoundRecorderOptions, "backupMimeTypes">
{
  readonly type = M2NodeType.SoundRecorder;
  isDrawable = false;
  mimeType?: string;
  audioTrackConstraints?: MediaTrackConstraints;
  maximumDuration?: number;
  private _isRecording = false;
  private _isPaused = false;
  private mediaRecorder?: MediaRecorder;
  private audioChunks: BlobPart[] = [];
  private mediaTrackSettings?: Array<MediaTrackSettings>;
  private beginIso8601Timestamp?: string;
  private endIso8601Timestamp?: string;
  private timerUuid = "";

  /**
   * Node for recording sounds.
   *
   * @param options - {@link SoundRecorderOptions}
   */
  constructor(options?: SoundRecorderOptions) {
    super(options);

    if (options?.mimeType) {
      const supportedMimeTypes = this.getMediaRecorderSupportedAudioMimeTypes();
      if (supportedMimeTypes.includes(options.mimeType)) {
        this.mimeType = options.mimeType;
      } else {
        console.warn(
          `Unsupported MIME type in SoundRecorderOptions: ${options.mimeType}. Supported types are: ${supportedMimeTypes}.`,
        );
        if (options.backupMimeTypes) {
          const backupMimeType = this.getSupportedBackupMimeType(
            options.backupMimeTypes,
          );
          if (backupMimeType) {
            this.mimeType = backupMimeType;
            console.log(`Using backup MIME type: ${backupMimeType}.`);
          }
        }
      }
    }

    if (options?.audioTrackConstraints) {
      this.audioTrackConstraints = options.audioTrackConstraints;
    }

    if (options?.maximumDuration) {
      this.maximumDuration = options.maximumDuration;
    }
  }

  override initialize(): void {}

  /**
   * Starts recording audio from the microphone.
   *
   * @remarks If the `SoundRecorder` is already recording, an error will be
   * thrown. If permission to use the microphone has not been granted, the
   * browser will prompt the user to allow or deny access. Denial of access
   * will result in an error being thrown. To avoid this, use the
   * `queryPermission()` and `requestPermission()` methods to check and request
   * permission, respectively, and handle the results accordingly.
   */
  async start() {
    if (this.isRecording) {
      throw new M2Error(
        "cannot start SoundRecorder because it is already started.",
      );
    }

    // Clear data from prior recording, if present.
    this.audioChunks = [];
    this.endIso8601Timestamp = undefined;

    const supportedMimeTypes = this.getMediaRecorderSupportedAudioMimeTypes();
    if (supportedMimeTypes.length === 0) {
      throw new M2Error(
        "SoundRecorder found no supported MIME types for MediaRecorder.",
      );
    }

    if (!this.mimeType) {
      this.mimeType = supportedMimeTypes[0];
      console.log(`Using MIME type: ${this.mimeType}.`);
    }

    let stream: MediaStream | undefined;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: this.audioTrackConstraints ? this.audioTrackConstraints : true,
      });
    } catch (error) {
      throw new M2Error(`Error getting user media: ${error}.`);
    }
    if (!stream) {
      throw new M2Error("no stream.");
    }

    const audioTracks = stream.getAudioTracks();
    this.mediaTrackSettings = audioTracks?.map((track) => track.getSettings());

    this.mediaRecorder = new MediaRecorder(stream, { mimeType: this.mimeType });
    this.mediaRecorder.ondataavailable = (event) => {
      this.audioChunks.push(event.data);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.mediaRecorder.onerror = (event: any) => {
      /**
       * Error event object provided by MediaRecorder is in transition.
       * MediaRecorderErrorEvent is now deprecated, but may still be used. Or
       * the error event may be an ErrorEvent. Try to show both messages.
       */
      throw new M2Error(
        `MediaRecorder error: ${event?.error?.message} ${event?.message}`,
      );
    };
    this.mediaRecorder.start();
    this.beginIso8601Timestamp = new Date().toISOString();
    this.timerUuid = Uuid.generate();
    Timer.startNew(this.timerUuid);
    this._isRecording = true;
    this._isPaused = false;
  }

  /**
   * Stops recording audio from the microphone.
   *
   * @remarks If the `stop()` method is not awaited, the method returns a
   * Promise and the useable data will be lost.
   *
   * @returns A promise that resolves to a {@link SoundRecorderResults} object.
   * The `audioBase64` property of the object contains the recorded audio as a
   * base64 string.
   */
  async stop(): Promise<SoundRecorderResults> {
    if (!this.isRecording) {
      throw new M2Error(
        "cannot stop SoundRecorder because it has not started.",
      );
    }
    return new Promise<SoundRecorderResults>((resolve) => {
      if (!this.mediaRecorder) {
        throw new M2Error("no media recorder");
      }
      this.mediaRecorder.onstop = async () => {
        if (!this.mimeType) {
          throw new M2Error("no mimeType");
        }
        this._isRecording = false;
        this._isPaused = false;
        const audioBlob = new Blob(this.audioChunks, {
          type: this.getMimeTypeWithoutCodecs(this.mimeType),
        });
        const audioBase64 = await this.blobToBase64(audioBlob);
        resolve({
          mimeType: this.mimeType,
          beginIso8601Timestamp: this.beginIso8601Timestamp ?? "",
          endIso8601Timestamp: this.endIso8601Timestamp ?? "",
          duration: Timer.elapsed(this.timerUuid),
          audioTrackSettings: this.mediaTrackSettings,
          audioBase64: audioBase64,
          audioBlob: audioBlob,
        });
      };
      this.mediaRecorder.stop();
      this.endIso8601Timestamp = new Date().toISOString();
      if (!this.isPaused) {
        Timer.stop(this.timerUuid);
      }
    });
  }

  pause() {
    if (!this.isRecording) {
      throw new M2Error(
        "cannot pause SoundRecorder because it is not started.",
      );
    }
    if (this.isPaused) {
      throw new M2Error(
        "cannot pause SoundRecorder because it is already paused.",
      );
    }
    this.mediaRecorder?.pause();
    this._isPaused = true;
    Timer.stop(this.timerUuid);
  }

  resume() {
    if (!this.isRecording) {
      throw new M2Error(
        "cannot resume SoundRecorder because it is not started.",
      );
    }
    if (!this.isPaused) {
      throw new M2Error(
        "cannot resume SoundRecorder because it is not paused.",
      );
    }
    this.mediaRecorder?.resume();
    this._isPaused = false;
    Timer.start(this.timerUuid);
  }

  /**
   * Checks if the microphone permission is granted.
   *
   * @remarks This does not request permission from the user. It only queries
   * the current microphone permission state.
   *
   * @returns The `state` property ("granted", "denied", or "prompt") of
   * `PermissionStatus` or undefined if the browser does not support the
   * "microphone" permission.
   * See https://developer.mozilla.org/en-US/docs/Web/API/PermissionStatus/state
   */
  async queryPermission(): Promise<string | undefined> {
    try {
      const status = await navigator.permissions.query({
        /**
         * We use a type assertion here because the PermissionName type
         * does not include "microphone" in the TypeScript type definitions.
         */
        name: "microphone" as PermissionName,
      });
      return status.state;
    } catch (error) {
      /**
       * Some older browsers may not support navigator.permissions.query() or
       * the "microphone" permission, so return undefined.
       */
      console.warn(
        `Error calling navigator.permissions.query({ name: "microphone" }): ${error}.`,
      );
      return undefined;
    }
  }

  /**
   * Requests permission to use the microphone, and possibly prompts the user
   * to allow or deny access.
   *
   * @returns true if the microphone permission is granted, false if denied.
   */
  async requestPermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: this.audioTrackConstraints ? this.audioTrackConstraints : true,
      });
      // Stop the stream immediately since we only need permission
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      console.warn(`Microphone access denied: ${error}`);
      return false;
    }
  }

  /** Is the `SoundRecorder` currently recording? */
  get isRecording() {
    return this._isRecording;
  }
  /** Is the `SoundRecorder` currently paused? */
  get isPaused() {
    return this._isPaused;
  }

  override update() {
    super.update();
    if (
      this.isRecording &&
      !this.isPaused &&
      this.maximumDuration !== undefined &&
      Timer.elapsed(this.timerUuid) > this.maximumDuration
    ) {
      this.pause();
      return;
    }
  }

  /**
   * Returns an array of supported audio MIME types for MediaRecorder.
   *
   * @remarks Adapted from https://stackoverflow.com/a/68236494
   * License: https://creativecommons.org/licenses/by-sa/4.0/
   *
   * @returns
   */
  private getMediaRecorderSupportedAudioMimeTypes() {
    const mediaTypes = ["audio"];
    const containers = [
      "webm",
      "ogg",
      "mp3",
      "mp4",
      "x-matroska",
      "3gpp",
      "3gpp2",
      "3gp2",
      "quicktime",
      "mpeg",
      "aac",
      "flac",
      "x-flac",
      "wave",
      "wav",
      "x-wav",
      "x-pn-wav",
      "not-supported",
    ];
    const codecs = [
      "vp9",
      "vp9.0",
      "vp8",
      "vp8.0",
      "avc1",
      "av1",
      "h265",
      "h.265",
      "h264",
      "h.264",
      "opus",
      "vorbis",
      "pcm",
      "aac",
      "mpeg",
      "mp4a",
      "rtx",
      "red",
      "ulpfec",
      "g722",
      "pcmu",
      "pcma",
      "cn",
      "telephone-event",
      "not-supported",
    ];

    return [
      ...new Set(
        containers.flatMap((ext) =>
          mediaTypes.flatMap((mediaType) => [`${mediaType}/${ext}`]),
        ),
      ),
      ...new Set(
        containers.flatMap((ext) =>
          codecs.flatMap((codec) =>
            mediaTypes.flatMap((mediaType) => [
              // NOTE: 'codecs:' will always be true (false positive)
              `${mediaType}/${ext};codecs=${codec}`,
            ]),
          ),
        ),
      ),
      ...new Set(
        containers.flatMap((ext) =>
          codecs.flatMap((codec1) =>
            codecs.flatMap((codec2) =>
              mediaTypes.flatMap((mediaType) => [
                `${mediaType}/${ext};codecs="${codec1}, ${codec2}"`,
              ]),
            ),
          ),
        ),
      ),
    ].filter((variation) => MediaRecorder.isTypeSupported(variation));
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        /**
         * The result is a data URL with the following format:
         * data:[<mediatype>][;base64],<data>
         * We want to return the base64 data without the data URL prefix.
         */
        const base64WithoutPrefix = reader.result?.toString().split(",").pop();
        if (base64WithoutPrefix === undefined) {
          throw new M2Error("base64WithoutPrefix is undefined.");
        }
        resolve(base64WithoutPrefix);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private getMimeTypeWithoutCodecs(mimeType: string): string {
    // Use a regular expression to match the MIME type before any semicolon
    const match = mimeType.match(/^[^;]+/);
    // If a match is found, return it; otherwise, return an empty string
    return match ? match[0] : "";
  }

  private getSupportedBackupMimeType(backupMimeTypes: Array<string>) {
    const supportedMimeTypes = this.getMediaRecorderSupportedAudioMimeTypes();
    for (const mimeType of backupMimeTypes) {
      if (supportedMimeTypes.includes(mimeType)) {
        return mimeType;
      }
    }
    return undefined;
  }

  dispose(): void {}

  /**
   * Duplicates a node using deep copy.
   *
   * @remarks This is a deep recursive clone (node and children).
   * The uuid property of all duplicated nodes will be newly created,
   * because uuid must be unique.
   *
   * @param newName - optional name of the new, duplicated node. If not
   * provided, name will be the new uuid
   */
  override duplicate(newName?: string): SoundRecorder {
    throw new M2Error(`Method not implemented. ${newName}`);
  }
}
