/**
 * Bounding box of a node.
 *
 * @remarks In the m2c2kit coordinate system, the origin (0, 0) is at the top
 * left corner.
 */
export interface BoundingBox {
  /** The minimum x value of the bounding box */
  xMin: number;
  /** The maximum x value of the bounding box */
  xMax: number;
  /** The minimum y value of the bounding box */
  yMin: number;
  /** The maximum y value of the bounding box */
  yMax: number;
}
