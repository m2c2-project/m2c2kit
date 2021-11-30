export interface CustomActionOptions {
  /** callback - The callback function to be executed  */
  callback: () => void;
  /** Should the action run during screen transitions? Default is no */
  runDuringTransition?: boolean;
}
