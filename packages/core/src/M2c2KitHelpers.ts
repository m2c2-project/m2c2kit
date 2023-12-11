import { Canvas } from "canvaskit-wasm";
import { IDrawable } from "./IDrawable";
import { Entity } from "./Entity";
import { EntityType } from "./EntityType";
import { Shape } from "./Shape";
import { ShapeType } from "./ShapeType";
import { Point } from "./Point";
import { BoundingBox } from "./BoundingBox";

interface RotationTransform {
  /** Counterclockwise radians of the rotation */
  radians: number;
  /** Point around which to rotate */
  center: Point;
}

export class M2c2KitHelpers {
  /**
   * Calculates the four points of the bounding box of the entity, taking
   * into account the entity's rotation (as well as the rotation of its
   * ancestors).
   *
   * @remarks This method is used to calculate the rotated bounding box of an
   * entity when in order to determine if a point is inside the entity in
   * response to DOM pointer events. This method is NOT used to prepare the
   * CanvasKit canvas for drawing the entity.
   *
   * @param drawableEntity
   * @returns array of points representing the rotated entity
   */
  static calculateRotatedPoints(drawableEntity: IDrawable & Entity): Point[] {
    const entities = drawableEntity.ancestors;
    entities.reverse();
    entities.push(drawableEntity);

    /**
     * Create an array of 4 points for each entity, representing the
     * vertices of the entity's rectangular bounding box.
     */
    const entityPointsArray = entities.map((entity) => {
      const boundingBox =
        M2c2KitHelpers.calculateEntityAbsoluteBoundingBox(entity);
      return M2c2KitHelpers.boundingBoxToPoints(boundingBox);
    });

    /**
     * Start with the oldest ancestor and apply its rotation to itself
     * and all of its descendants. Then move on to the next ancestor.
     */
    for (let i = 0; i < entityPointsArray.length; i++) {
      if (!entityNeedsRotation(entities[i])) {
        continue;
      }
      const entityPoints = entityPointsArray[i];
      const radians = entities[i].zRotation;
      const center = M2c2KitHelpers.findCentroid(entityPoints);
      for (let j = i; j < entities.length; j++) {
        entityPointsArray[j] = rotateRectangle(
          entityPointsArray[j],
          radians,
          center,
        );
      }
    }

    /**
     * Return the points of the most last entity, which is the focal entity
     * passed into this function. These are the points of the focal entity
     * after all rotations have been applied.
     */
    return entityPointsArray[entityPointsArray.length - 1];
  }

  /**
   * Rotates the canvas so the entity appears rotated when drawn.
   *
   * @remarks Entities inherit rotations from their ancestors. Each ancestor,
   * however, rotates around its own anchor point. Thus, we must rotate the
   * canvas around the anchor point of each ancestor as well as the entity's
   * anchor point.
   *
   * @param canvas - CanvasKit canvas to rotate
   * @param drawableEntity - Entity to rotate the canvas for
   */
  static rotateCanvasForDrawableEntity(
    canvas: Canvas,
    drawableEntity: IDrawable & Entity,
  ) {
    const rotationTransforms =
      M2c2KitHelpers.calculateRotationTransforms(drawableEntity);
    if (rotationTransforms.length === 0) {
      return;
    }
    const drawScale = Globals.canvasScale / drawableEntity.absoluteScale;
    applyRotationTransformsToCanvas(rotationTransforms, drawScale, canvas);
  }

  /**
   * Calculates the absolute bounding box of the entity before any rotation
   * is applied.
   *
   * @remarks The absolute bounding box is the bounding box of the entity
   * relative to the scene's origin (0, 0).
   *
   * @param entity
   * @returns the bounding box of the entity
   */
  static calculateEntityAbsoluteBoundingBox(entity: Entity): BoundingBox {
    const anchorPoint = (entity as unknown as IDrawable).anchorPoint;
    const scale = entity.absoluteScale;
    // TODO: NEEDS TO BE FIXED FOR ANCHOR POINTS OTHER THAN (.5, .5)
    // TODO: TEST THIS FURTHER

    let width = entity.size.width;
    let height = entity.size.height;

    if (
      entity.type === EntityType.Shape &&
      (entity as Shape).shapeType === ShapeType.Circle
    ) {
      const radius = (entity as Shape).circleOfRadius;
      if (!radius) {
        throw "circleOfRadius is undefined";
      }
      width = radius * 2;
      height = radius * 2;
    }

    const xMin = entity.absolutePosition.x - width * anchorPoint.x * scale;
    const xMax =
      entity.absolutePosition.x + width * (1 - anchorPoint.x) * scale;
    const yMin = entity.absolutePosition.y - height * anchorPoint.y * scale;
    const yMax =
      entity.absolutePosition.y + height * (1 - anchorPoint.y) * scale;
    // const xMin = entity.absolutePosition.x - entity.size.width * anchorPoint.x * scale;
    // const xMax = entity.absolutePosition.x + entity.size.width * anchorPoint.x * scale;
    // const yMin = entity.absolutePosition.y - entity.size.height * anchorPoint.y * scale;
    // const yMax = entity.absolutePosition.y + entity.size.height * anchorPoint.y * scale;
    return { xMin, xMax, yMin, yMax };
  }

  /**
   * Converts an angle from radians to degrees.
   *
   * @remarks In m2c2kit, radians are counter clockwise from the positive
   * x-axis, but the rotate method in CanvasKit uses degrees clockwise. Thus
   * we negate after conversion from radians to degrees.
   *
   * @param radians - The angle in radians
   * @returns The angle in degrees
   */
  static radiansToDegrees(radians: number) {
    return -M2c2KitHelpers.normalizeAngleRadians(radians) * (180 / Math.PI);
  }

  /**
   * Normalizes an angle in radians to the range [0, 2*Math.PI)
   *
   * @param radians - angle in radians
   * @returns normalized angle in radians
   */
  static normalizeAngleRadians(radians: number): number {
    const quotient = Math.floor(radians / (2 * Math.PI));
    let normalized = radians - quotient * (2 * Math.PI);
    // If the remainder is negative, add 2*Math.PI to make it positive
    if (normalized < 0) {
      normalized += 2 * Math.PI;
    }
    return normalized;
  }

  /**
   * Checks if two points are on the same side of a line.
   *
   * @remarks The line is defined by two points, a and b. The function uses
   * the cross product to determine the relative position of the points.
   *
   * @param p1 - point to check
   * @param p2 - point to check
   * @param a - point that defines one end of the line
   * @param b - point that defines the other end of the line
   * @returns true if p1 and p2 are on the same side of the line, or false
   * otherwise
   */
  static arePointsOnSameSideOfLine(
    p1: Point,
    p2: Point,
    a: Point,
    b: Point,
  ): boolean {
    // cross product of (a, b) and (a, p1)
    const cp1 = (b.x - a.x) * (p1.y - a.y) - (b.y - a.y) * (p1.x - a.x);
    // cross product of (a, b) and (a, p2)
    const cp2 = (b.x - a.x) * (p2.y - a.y) - (b.y - a.y) * (p2.x - a.x);
    // the points are on the same side if the cross products have the same sign
    return cp1 * cp2 >= 0;
  }

  /**
   * Checks if a point is inside a rectangle.
   *
   * @remarks The rectangle may have been rotated (sides might not be parallel
   * to the axes).
   *
   * @param point - The Point to check
   * @param rect - An array of four Points representing the vertices of the
   * rectangle in clockwise order
   * @returns true if the Point is inside the rectangle
   */
  static isPointInsideRectangle(point: Point, rect: Point[]): boolean {
    if (rect.length !== 4) {
      throw new Error("Invalid input: expected an array of four points");
    }
    /**
     * The point is inside the rectangle if and only if it is on the same
     * side of each edge as the opposite vertex.
     * For example, the point is inside the rectangle if it is on the same
     * side of the edge (rect[0], rect[1]) as rect[2]
     */
    return (
      M2c2KitHelpers.arePointsOnSameSideOfLine(
        point,
        rect[2],
        rect[0],
        rect[1],
      ) &&
      M2c2KitHelpers.arePointsOnSameSideOfLine(
        point,
        rect[3],
        rect[1],
        rect[2],
      ) &&
      M2c2KitHelpers.arePointsOnSameSideOfLine(
        point,
        rect[0],
        rect[2],
        rect[3],
      ) &&
      M2c2KitHelpers.arePointsOnSameSideOfLine(point, rect[1], rect[3], rect[0])
    );
  }

  /**
   * Checks if the entity or any of its ancestors have been rotated.
   *
   * @param entity - entity to check
   * @returns true if the entity or any of its ancestors have been rotated
   */
  static entityOrAncestorHasBeenRotated(entity: Entity): boolean {
    const entities = entity.ancestors;
    entities.push(entity);
    return entities.some((entity) => entityNeedsRotation(entity));
  }

  /**
   * Converts a bounding box to an array of four points representing the
   * vertices of the rectangle.
   *
   * @remarks In m2c2kit, the y-axis is inverted: origin is in the upper-left.
   * Vertices are returned in clockwise order starting from the upper-left.
   *
   * @param boundingBox
   * @returns An array of four points
   */
  static boundingBoxToPoints(boundingBox: BoundingBox): Point[] {
    const { xMin, xMax, yMin, yMax } = boundingBox;
    const points: Point[] = [
      { x: xMin, y: yMin }, // Top left
      { x: xMax, y: yMin }, // Top right
      { x: xMax, y: yMax }, // Bottom right
      { x: xMin, y: yMax }, // Bottom left
    ];
    return points;
  }

  /**
   * Finds the centroid of a rectangle.
   *
   * @param points - An array of four points representing the vertices of the
   * rectangle.
   * @returns array of points representing the centroid of the rectangle.
   */
  static findCentroid(points: Point[]): Point {
    if (points.length !== 4) {
      throw new Error("Invalid input: expected an array of four points");
    }

    // Calculate the sum of the x and y coordinates of the points
    let xSum = 0;
    let ySum = 0;
    for (const point of points) {
      xSum += point.x;
      ySum += point.y;
    }

    // Divide the sums by four to get the average x and y coordinates
    const xAvg = xSum / 4;
    const yAvg = ySum / 4;

    return { x: xAvg, y: yAvg };
  }

  /**
   * Rotates a point, counterclockwise, around another point by an angle in
   * radians.
   *
   * @param point - Point to rotate
   * @param radians - angle in radians
   * @param center - Point to rotate around
   * @returns rotated point
   */
  static rotatePoint(point: Point, radians: number, center: Point): Point {
    // Calculate the relative position of p to the center
    const dx = point.x - center.x;
    const dy = point.y - center.y;

    // Apply the rotation matrix
    // Note: To rotate counterclockwise, we need to negate the angle
    const x = dx * Math.cos(-radians) - dy * Math.sin(-radians);
    const y = dx * Math.sin(-radians) + dy * Math.cos(-radians);

    // Return the new point with the center offset added back
    return {
      x: x + center.x,
      y: y + center.y,
    };
  }

  /**
   * Calculates the rotation transforms to apply to entity, respecting any
   * ancestor rotations.
   *
   * @param drawableEntity - entity to calculate rotation transforms for
   * @returns array of rotation transforms to apply
   */
  static calculateRotationTransforms(
    drawableEntity: IDrawable & Entity,
  ): RotationTransform[] {
    const rotationTransforms: RotationTransform[] = [];
    const entities = drawableEntity.ancestors;
    entities.reverse();
    entities.push(drawableEntity);

    /**
     * Iterate all entities and, if needed, rotate each around
     * its anchor point. Save a running list of all rotations in the
     * array rotationTransforms.
     */
    entities.forEach((entity) => {
      if (entityNeedsRotation(entity)) {
        const drawable = entity as unknown as IDrawable & Entity;
        /**
         * Scenes must be handled specially because they have a different
         * coordinate system -- (0, 0) is in the upper-left -- and their
         * anchor point is (0, 0). Despite this, we rotate them around their
         * center.
         */
        if (drawable.type === EntityType.Scene) {
          const center = {
            x: drawable.absolutePosition.x + drawable.size.width * 0.5,
            y: drawable.absolutePosition.y + drawable.size.height * 0.5,
          };
          rotationTransforms.push({
            radians: drawable.zRotation,
            center,
          });
          return;
        }

        const boundingBox =
          M2c2KitHelpers.calculateEntityAbsoluteBoundingBox(drawable);
        const points = M2c2KitHelpers.boundingBoxToPoints(boundingBox);
        const center = M2c2KitHelpers.findCentroid(points);
        rotationTransforms.push({
          radians: drawable.zRotation,
          center,
        });
      }
    });

    return rotationTransforms;
  }
}

/**
 * Rotates the canvas around the anchor point of each rotation transform.
 *
 * @param rotationTransforms - array of rotation transforms to apply
 * @param scale - drawing scale to be applied
 * @param canvas - CanvasKit canvas to rotate
 */
function applyRotationTransformsToCanvas(
  rotationTransforms: RotationTransform[],
  scale: number,
  canvas: Canvas,
) {
  rotationTransforms.forEach((transform) => {
    canvas.rotate(
      M2c2KitHelpers.radiansToDegrees(transform.radians),
      transform.center.x * scale,
      transform.center.y * scale,
    );
  });
}

function entityNeedsRotation(entity: Entity): boolean {
  return (
    M2c2KitHelpers.normalizeAngleRadians(entity.zRotation) !== 0 &&
    entity.isDrawable
  );
}

/**
 * Rotates a rectangle, counterclockwise, around a point by a given angle
 * in radians.
 *
 * @param rect - An array of four points representing the vertices of the rectangle
 * @param radians - The angle of rotation in radians
 * @param center - The point of rotation
 * @returns rotated rectangle
 */
function rotateRectangle(
  rect: Point[],
  radians: number,
  center: Point,
): Point[] {
  if (rect.length !== 4) {
    throw new Error("Invalid input: expected an array of four points");
  }

  const rotated: Point[] = [];
  // Rotate each rectangle vertex
  for (const p of rect) {
    rotated.push(M2c2KitHelpers.rotatePoint(p, radians, center));
  }
  return rotated;
}
