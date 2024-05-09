import { Action } from "./Action";

export interface RepeatForeverActionOptions {
  /** Action to repeat */
  action: Action;
  /** Should the action run during screen transitions? Default is no */
  runDuringTransition?: boolean;
}
