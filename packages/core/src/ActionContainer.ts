import { Action } from "./Action";

/**
 * An ActionContainer is an Action that can contain other actions.
 *
 * @remarks An ActionContainer is a parent action that can have other
 * actions as children. The `Sequence` and `Group` actions are examples that
 * implement `ActionContainer`.
 */
export interface ActionContainer extends Action {
  children: Array<Action>;
}
