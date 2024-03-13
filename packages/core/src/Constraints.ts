import { M2Node } from "./M2Node";

/**
 * Constraints for defining relative layouts.
 *
 * @remarks FOR INTERNAL USE ONLY
 */
export interface Constraints {
  /** Constrain the top (vertical axis) of this node to the top of the specified node. The tops of both will appear at the same vertical location */
  topToTopOf?: M2Node | string;
  /** Constrain the top (vertical axis) of this node to the bottom of the specified node. This node will appear immediately below the specified node */
  topToBottomOf?: M2Node | string;
  /** Constrain the bottom (vertical axis) of this node to the top of the specified node. This node will appear immediately above of the specified node */
  bottomToTopOf?: M2Node | string;
  /** Constrain the bottom (vertical axis) of this node to the bottom of the specified node. The bottoms of both will appear at the same vertical location */
  bottomToBottomOf?: M2Node | string;
  /** Constrain the start (horizontal axis) of this node to the start of the specified node. The start of both will appear at the same horizontal location */
  startToStartOf?: M2Node | string;
  /** Constrain the start (horizontal axis) of this node to the end of the specified node. This node will appear immediately to the right of the specified node */
  startToEndOf?: M2Node | string;
  /** Constrain the end (horizontal axis) of this node to the end of the specified node. The end of both will appear at the same horizontal location */
  endToEndOf?: M2Node | string;
  /** Constrain the end (horizontal axis) of this node to the start of the specified node. This node will appear immediately to the left of the specified node */
  endToStartOf?: M2Node | string;
  /** When opposing horizontal constraints are applied, the default is to center the node within the constraints (horizontalBias = .5). Setting horizontalBias less than .5 will pull the node towards the start (to the left). Setting horizontalBias greater than .5 will pull the node towards the end (to the right)  */
  horizontalBias?: number;
  /** When opposing vertical constraints are applied, the default is to center the node within the constraints (verticalBias = .5). Setting verticalBias less than .5 will pull the node towards the top. Setting verticalBias greater than .5 will pull the node towards the bottom */
  verticalBias?: number;
  // the following allows access to properties using a string key
  [key: string]: M2Node | string | number | undefined;
}
