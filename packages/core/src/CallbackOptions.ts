export interface CallbackOptions {
  /** Should the provided callback replace any existing callbacks of the same event type for this target? Default is false */
  replaceExisting?: boolean;
  /** String identifier used to identify the callback. Only needed if the callback will be removed later */
  key?: string;
}
