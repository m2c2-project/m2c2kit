import { ActionContainer } from "./ActionContainer";

/**
 * An extension of `ActionContainer` that can repeat another action.
 *
 * @remarks A `RepeatingActionContainer` is a parent action that repeats
 * another action for a specified number of repetitions, as provided in the
 * `count` property. The `Repeat` and `RepeatForever` actions implement
 * `RepeatingActionContainer`.
 */
export interface RepeatingActionContainer extends ActionContainer {
  /** Number of times the action will repeat. */
  count: number;
  /** Number of completions done. */
  completedRepetitions: number;
  /** How long, in milliseconds, the repeating action has run. This is updated
   * only at the end of a repetition. */
  cumulativeDuration: number;
  /** Returns true when the action is running and the action's children have
   * just completed a repetition */
  repetitionHasCompleted: boolean;
}
