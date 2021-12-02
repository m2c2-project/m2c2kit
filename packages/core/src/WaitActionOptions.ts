export interface WaitActionOptions {
  /** Duration of wait, in milliseconds */
  duration: number;
  /** Should the action run during screen transitions? Default is no */
  runDuringTransition?: boolean;
}
