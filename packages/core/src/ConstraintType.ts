/**
 * This enum is used interally for processing the layout constraints. We use
 * an enum to avoid magic strings. NOTE: the casing in ConstraintType must
 * match the casing in Constraints.ts. Thus, this enum's members are in
 * lowercase, which is not typical Typescript style.
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
