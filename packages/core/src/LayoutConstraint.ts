import { M2Node } from "./M2Node";
import { ConstraintType } from "./ConstraintType";

/**
 * This class is used internally for processing layout constraints that
 * have been defined according to the Constraints interface.
 *
 * Imagine we have two nodes, A and B. B's position is set
 * using its position property. A's position is set using the layout
 * constraint "bottomToTopOf B." A is the focal node in this example.
 * What this means is that A's y coordinate will be computed such that
 * the bottom of A is the top of B. If A and B are squares, then A sits
 * on top of B with no gap.
 */
export class LayoutConstraint {
  // the constraint, e.g., bottomToTopOf
  type: ConstraintType;
  // alter is the other node that the focal node is constrained to.
  // in the example above, A is the focal node, B is the alter
  // thus the alter node property is B
  alterNode: M2Node;

  // the below 3 properties are calculated from the constraint type
  // (we set them to false by default to avoid undefined warnings, but
  // they will be definitely assigned in the constructor logic)
  // the properties are used in the positioning update step
  //
  // does the constraint affect the Y or X axis? If not, then it's
  // a horizontal constraint
  verticalConstraint = false;
  // does the constraint apply to the focal node's "minimum" position
  // along its axis? That is, does the constraint reference the focal
  // node's "top" or "start"? Top and start are considered minimums because
  // our origin (0, 0) in the upper left.
  // If not, then the constraint applies to the focal node's "maximum"
  // position, e.g., its "bottom" or "end".
  focalNodeMinimum = false;
  // does the constraint apply to the alter node's "minimum" position
  // along its axis?
  alterNodeMinimum = false;

  verticalTypes = [
    ConstraintType.topToTopOf,
    ConstraintType.topToBottomOf,
    ConstraintType.bottomToTopOf,
    ConstraintType.bottomToBottomOf,
  ];

  // e.g., node A
  focalNodeMinimumTypes = [
    ConstraintType.topToTopOf,
    ConstraintType.topToBottomOf,
    ConstraintType.startToStartOf,
    ConstraintType.startToEndOf,
  ];

  // e.g., node B
  alterNodeMinimumTypes = [
    ConstraintType.topToTopOf,
    ConstraintType.bottomToTopOf,
    ConstraintType.startToStartOf,
    ConstraintType.endToStartOf,
  ];

  constructor(type: ConstraintType, alterNode: M2Node) {
    this.type = type;
    this.alterNode = alterNode;

    // If it's not a vertical constraint, it's a horizontal constraint
    // similarly, if it's not a focal node minimum constraint,
    // it's a focal node maximum constraint. All of these are binary,
    // so we can use a series of if/else to completely assign values to
    // verticalConstraint, focalNodeMinimum, and alterNodeMinimum
    //
    if (this.verticalTypes.includes(type)) {
      this.verticalConstraint = true;
      if (this.focalNodeMinimumTypes.includes(type)) {
        this.focalNodeMinimum = true;
      } else {
        this.focalNodeMinimum = false;
      }
      if (this.alterNodeMinimumTypes.includes(type)) {
        this.alterNodeMinimum = true;
      } else {
        this.alterNodeMinimum = false;
      }
    } else {
      this.verticalConstraint = false;
      if (this.focalNodeMinimumTypes.includes(type)) {
        this.focalNodeMinimum = true;
      } else {
        this.focalNodeMinimum = false;
      }
      if (this.alterNodeMinimumTypes.includes(type)) {
        this.alterNodeMinimum = true;
      } else {
        this.alterNodeMinimum = false;
      }
    }
  }
}
