import { Action } from "./Action";

/**
 * An ActionContainer is an Action that can contain other actions.
 *
 * @remarks An ActionContainer is a parent action that can have other
 * actions as children. The `Sequence`, `Group`, `Repeat,` and
 * `RepeatForever` actions implement `ActionContainer`.
 */
export interface ActionContainer extends Action {
  /**
   * Immediate children of a parent action.
   */
  children: Array<Action>;
  /**
   * All children of a parent action and those children's children, recursively.
   */
  descendants: Array<Action>;
}
