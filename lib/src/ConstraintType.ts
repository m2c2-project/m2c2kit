/**
 * This enum is used interally for processing the layout constraints. We use
 * an enum to avoid magic strings.
 */

export enum ConstraintType {
  topToTopOf = "topToTopOf",
  topToBottomOf = "topToBottomOf",
  bottomToTopOf = "bottomToTopOf",
  bottomToBottomOf = "bottomToBottomOf",
  startToStartOf = "startToStartOf",
  startToEndOf = "startToEndOf",
  endToEndOf = "endToEndOf",
  endToStartOf = "endToStartOf",
}
