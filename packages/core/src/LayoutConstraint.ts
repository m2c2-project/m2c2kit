import { Entity } from "./Entity";
import { ConstraintType } from "./ConstraintType";

/**
 * This class is used internally for processing layout constraints that
 * have been defined according to the Contraints interface.
 *
 * Imagine we have two entities, A and B. B's position is set
 * using its position property. A's position is set using the layout
 * constraint "bottomToTopOf B." A is the focal entity in this example.
 * What this means is that A's y coordinate will be computed such that
 * the bottom of A is the top of B. If A and B are squares, then A sits
 * on top of B with no gap.
 */
export class LayoutConstraint {
  // the constraint, e.g., bottomToTopOf
  type: ConstraintType;
  // alter is the other entity that the focal entity is contrained to.
  // in the example above, A is the focal entity, B is the alter
  // thus the alter entity property is B
  alterEntity: Entity;

  // the below 3 properties are calculated from the constraint type
  // (we set them to false by default to avoid undefined warnings, but
  // they will be definitely assigned in the constructor logic)
  // the properties are used in the positioning update step
  //
  // does the constraint affect the Y or X axis? If not, then it's
  // a horizontal constraint
  verticalConstraint = false;
  // does the constraint apply to the focal entity's "minimum" position
  // along its axis? That is, does the constraint reference the focal
  // entity's "top" or "start"? Top and start are considered minimums because
  // our origin (0, 0) in the upper left.
  // If not, then the constraint applies to the focal entity's "maximum"
  // position, e.g., its "bottom" or "end".
  focalEntityMinimum = false;
  // does the constraint apply to the alter entity's "minimum" position
  // along its axis?
  alterEntityMinimum = false;

  verticalTypes = [
    ConstraintType.topToTopOf,
    ConstraintType.topToBottomOf,
    ConstraintType.bottomToTopOf,
    ConstraintType.bottomToBottomOf,
  ];

  // e.g., entity A
  focalEntityMinimumTypes = [
    ConstraintType.topToTopOf,
    ConstraintType.topToBottomOf,
    ConstraintType.startToStartOf,
    ConstraintType.startToEndOf,
  ];

  // e.g., entity B
  alterEntityMinimumTypes = [
    ConstraintType.topToTopOf,
    ConstraintType.bottomToTopOf,
    ConstraintType.startToStartOf,
    ConstraintType.endToStartOf,
  ];

  constructor(type: ConstraintType, alterEntity: Entity) {
    this.type = type;
    this.alterEntity = alterEntity;

    // If it's not a vertical constraint, it's a horizontal contraint
    // similarly, if it's not a focal entitity minimum constraint,
    // it's a focal entitity maximum constraint. All of these are binary,
    // so we can use a series of if/else to completely assign values to
    // verticalConstraint, focalEntityMinimum, and alterEntityMinimum
    //
    if (this.verticalTypes.includes(type)) {
      this.verticalConstraint = true;
      if (this.focalEntityMinimumTypes.includes(type)) {
        this.focalEntityMinimum = true;
      } else {
        this.focalEntityMinimum = false;
      }
      if (this.alterEntityMinimumTypes.includes(type)) {
        this.alterEntityMinimum = true;
      } else {
        this.alterEntityMinimum = false;
      }
    } else {
      this.verticalConstraint = false;
      if (this.focalEntityMinimumTypes.includes(type)) {
        this.focalEntityMinimum = true;
      } else {
        this.focalEntityMinimum = false;
      }
      if (this.alterEntityMinimumTypes.includes(type)) {
        this.alterEntityMinimum = true;
      } else {
        this.alterEntityMinimum = false;
      }
    }
  }
}
