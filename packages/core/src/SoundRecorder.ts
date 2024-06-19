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

  async start() {
    if (this.isRecording) {
      throw new Error(
        "cannot start SoundRecorder because it is already started.",
      );
    }

    const supportedMimeTypes = this.getMediaRecorderSupportedAudioMimeTypes();
    if (supportedMimeTypes.length === 0) {
      throw new Error(
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
      throw new Error("Error getting user media.");
    }
    if (!stream) {
      throw new Error("no stream.");
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
      throw new Error(
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

  async stop(): Promise<SoundRecorderResults> {
    if (!this.isRecording) {
      throw new Error("cannot stop SoundRecorder because it has not started.");
    }
    return new Promise<SoundRecorderResults>((resolve) => {
      if (!this.mediaRecorder) {
        throw new Error("no media recorder");
      }
      this.mediaRecorder.onstop = async () => {
        if (!this.mimeType) {
          throw new Error("no mimeType");
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
      throw new Error("cannot pause SoundRecorder because it is not started.");
    }
    if (this.isPaused) {
      throw new Error(
        "cannot pause SoundRecorder because it is already paused.",
      );
    }
    this.mediaRecorder?.pause();
    this._isPaused = true;
    Timer.stop(this.timerUuid);
  }

  resume() {
    if (!this.isRecording) {
      throw new Error("cannot resume SoundRecorder because it is not started.");
    }
    if (!this.isPaused) {
      throw new Error("cannot resume SoundRecorder because it is not paused.");
    }
    this.mediaRecorder?.resume();
    this._isPaused = false;
    Timer.start(this.timerUuid);
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
          throw new Error("base64WithoutPrefix is undefined.");
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
    throw new Error(`Method not implemented. ${newName}`);
  }
}
