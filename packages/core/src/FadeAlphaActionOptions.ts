export interface FadeAlphaActionOptions {
  /** Opacity of the entity. 0 is fully transparent, 1 is fully opaque. */
  alpha: number;
  /** Duration of scale, in milliseconds */
  duration: number;
  /** Should the action run during screen transitions? Default is no */
  runDuringTransition?: boolean;
}
