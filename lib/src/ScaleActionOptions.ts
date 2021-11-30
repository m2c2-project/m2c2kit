export interface ScaleActionOptions {
  /** The scaling ratio. 1 is no change, greater than 1 is make bigger, less than 1 is make smaller */
  scale: number;
  /** Duration of scale, in milliseconds */
  duration: number;
  /** Should the action run during screen transitions? Default is no */
  runDuringTransition?: boolean;
}
