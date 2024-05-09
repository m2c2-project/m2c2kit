import { Action } from "./Action";

export interface RepeatActionOptions {
  /** Action to repeat */
  action: Action;
  /** Number of times to repeat the action */
  count: number;
  /** Should the action run during screen transitions? Default is no */
  runDuringTransition?: boolean;
}
