import { Canvas } from "canvaskit-wasm";
import { IDrawable } from "./IDrawable";
import { M2Node } from "./M2Node";
import { M2NodeType } from "./M2NodeType";
import { Shape } from "./Shape";
import { ShapeType } from "./ShapeType";
import { Point } from "./Point";
import { BoundingBox } from "./BoundingBox";
import { Game } from "./Game";
import { M2NodeConstructor } from "./M2NodeConstructor";
import { Timer } from "./Timer";

interface RotationTransform {
  /** Counterclockwise radians of the rotation */
  radians: number;
  /** Point around which to rotate */
  center: Point;
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class M2c2KitHelpers {
  /**
   * Returns the URL as it appears in the game's manifest.json file.
   *
   * @remarks This is used to return the hashed URL.
   *
   * @param game - game object
   * @param url - the URL
   * @returns the hashed URL from the manifest, or the original URL if there is no manifest or the URL is not in the manifest.
   */
  static getUrlFromManifest(game: Game, url: string): string {
    const manifest = game.manifest;
    if (manifest && manifest[url]) {
      return manifest[url];
    }
    return url;
  }

  /**
   * Does the URL have a scheme?
   *
   * @param url - the URL to test
   * @returns true if the url begins with a scheme (e.g., "http://",
   * "https://", "file://", etc.)
   */
  static urlHasScheme(url: string): boolean {
    return /^[a-z]+:\/\//i.test(url);
  }

  /**
   * Registers a `M2Node` class with the global class registry.
   *
   * @remarks This is used to register a class so that it can be
   * instantiated by the `M2NodeFactory`.
   *
   * @param nodeClass - class or classes to register.
   */
  static registerM2NodeClass(...nodeClass: Array<M2NodeConstructor>): void {
    if (!m2c2Globals.m2NodeClassRegistry) {
      m2c2Globals.m2NodeClassRegistry = {};
    }

    nodeClass.forEach((_nodeClass) => {
      m2c2Globals.m2NodeClassRegistry = {
        ...m2c2Globals.m2NodeClassRegistry,
        [_nodeClass.name]: _nodeClass,
      };
    });
  }

  /**
   * Creates timestamps based on when the current frame's update began.
   *
   * @remarks When recording events related to node creation, node
   * parent-child relationships, and node properties, the timestamps should be
   * based on when current frame's update began -- not the current time. While
   * current time is most accurate for recording user interactions (use
   * `M2c2KitHelpers.createTimestamps()` for user interactions), the frame's
   * update is the best way to ensure that node events that occurred in the same
   * frame are recorded with the same timestamp and thus are replayed in the
   * correct order. For example, a node may be created, added to a scene, and
   * have its hidden property set to true, all in the same frame. If the
   * current timestamps were used for all these events, it could happen that
   * the hidden property is set slightly after the node is added to the scene.
   * When replayed, this could cause the node to be visible for a single frame
   * if the queue of replay events pulls only the creation and addition events.
   * By using the frame's update time, we ensure that all events related to a
   * node are recorded with the same timestamp and are replayed in the same
   * frame.
   * If game has not yet begun to run (i.e., frame updates have not yet started),
   * the timestamps will be based on the current time.
   *
   * @returns object with timestamps
   */
  static createFrameUpdateTimestamps() {
    return {
      timestamp:
        Number.isNaN(m2c2Globals?.now) || m2c2Globals?.now === undefined
          ? Timer.now()
          : m2c2Globals.now,
      iso8601Timestamp: !m2c2Globals.iso8601Now
        ? new Date().toISOString()
        : m2c2Globals.iso8601Now,
    };
  }

  /**
   * Creates timestamps based on the current time.
   *
   * @remarks Use `M2c2KitHelpers.createFrameUpdateTimestamps()` when requesting
   * timestamps for events related to node creation, parent-child
   * relationships, and properties.
   * See {@link createFrameUpdateTimestamps()} for explanation.
   *
   * @returns object with `timestamp` and `iso8601Timestamp` properties
   */
  static createTimestamps() {
    return {
      timestamp: Timer.now(),
      iso8601Timestamp: new Date().toISOString(),
    };
  }

  /**
   * Calculates the four points of the bounding box of the node, taking
   * into account the node's rotation (as well as the rotation of its
   * ancestors).
   *
   * @remarks This method is used to calculate the rotated bounding box of an
   * node when in order to determine if a point is inside the node in
   * response to DOM pointer events. This method is NOT used to prepare the
   * CanvasKit canvas for drawing the node.
   *
   * @param drawableNode
   * @returns array of points representing the rotated node
   */
  static calculateRotatedPoints(drawableNode: IDrawable & M2Node): Point[] {
    const nodes = drawableNode.ancestors;
    nodes.reverse();
    nodes.push(drawableNode);

    /**
     * Create an array of 4 points for each node, representing the
     * vertices of the node's rectangular bounding box.
     */
    const nodePointsArray = nodes.map((node) => {
      const boundingBox = M2c2KitHelpers.calculateNodeAbsoluteBoundingBox(node);
      return M2c2KitHelpers.boundingBoxToPoints(boundingBox);
    });

    /**
     * Start with the oldest ancestor and apply its rotation to itself
     * and all of its descendants. Then move on to the next ancestor.
     */
    for (let i = 0; i < nodePointsArray.length; i++) {
      if (!nodeNeedsRotation(nodes[i])) {
        continue;
      }
      const nodePoints = nodePointsArray[i];
      const radians = nodes[i].zRotation;
      const center = M2c2KitHelpers.findCentroid(nodePoints);
      for (let j = i; j < nodes.length; j++) {
        nodePointsArray[j] = rotateRectangle(
          nodePointsArray[j],
          radians,
          center,
        );
      }
    }

    /**
     * Return the points of the most last node, which is the focal node
     * passed into this function. These are the points of the focal node
     * after all rotations have been applied.
     */
    return nodePointsArray[nodePointsArray.length - 1];
  }

  /**
   * Rotates the canvas so the node appears rotated when drawn.
   *
   * @remarks Nodes inherit rotations from their ancestors. Each ancestor,
   * however, rotates around its own anchor point. Thus, we must rotate the
   * canvas around the anchor point of each ancestor as well as the node's
   * anchor point.
   *
   * @param canvas - CanvasKit canvas to rotate
   * @param drawableNode - Node to rotate the canvas for
   */
  static rotateCanvasForDrawableNode(
    canvas: Canvas,
    drawableNode: IDrawable & M2Node,
  ) {
    const rotationTransforms =
      M2c2KitHelpers.calculateRotationTransforms(drawableNode);
    if (rotationTransforms.length === 0) {
      return;
    }
    const drawScale = m2c2Globals.canvasScale / drawableNode.absoluteScale;
    applyRotationTransformsToCanvas(rotationTransforms, drawScale, canvas);
  }

  /**
   * Calculates the absolute bounding box of the node before any rotation
   * is applied.
   *
   * @remarks The absolute bounding box is the bounding box of the node
   * relative to the scene's origin (0, 0).
   *
   * @param node
   * @returns the bounding box of the node
   */
  static calculateNodeAbsoluteBoundingBox(node: M2Node): BoundingBox {
    const anchorPoint = (node as unknown as IDrawable).anchorPoint;
    const scale = node.absoluteScale;
    // TODO: NEEDS TO BE FIXED FOR ANCHOR POINTS OTHER THAN (.5, .5)
    // TODO: TEST THIS FURTHER

    let width = node.size.width;
    let height = node.size.height;

    if (
      node.type === M2NodeType.Shape &&
      (node as Shape).shapeType === ShapeType.Circle
    ) {
      const radius = (node as Shape).circleOfRadius;
      if (!radius) {
        throw "circleOfRadius is undefined";
      }
      width = radius * 2;
      height = radius * 2;
    }

    const xMin = node.absolutePosition.x - width * anchorPoint.x * scale;
    const xMax = node.absolutePosition.x + width * (1 - anchorPoint.x) * scale;
    const yMin = node.absolutePosition.y - height * anchorPoint.y * scale;
    const yMax = node.absolutePosition.y + height * (1 - anchorPoint.y) * scale;
    // const xMin = node.absolutePosition.x - node.size.width * anchorPoint.x * scale;
    // const xMax = node.absolutePosition.x + node.size.width * anchorPoint.x * scale;
    // const yMin = node.absolutePosition.y - node.size.height * anchorPoint.y * scale;
    // const yMax = node.absolutePosition.y + node.size.height * anchorPoint.y * scale;
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
   * Checks if the node or any of its ancestors have been rotated.
   *
   * @param node - node to check
   * @returns true if the node or any of its ancestors have been rotated
   */
  static nodeOrAncestorHasBeenRotated(node: M2Node): boolean {
    const nodes = node.ancestors;
    nodes.push(node);
    return nodes.some((node) => nodeNeedsRotation(node));
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
   * Calculates the rotation transforms to apply to node, respecting any
   * ancestor rotations.
   *
   * @param drawableNode - node to calculate rotation transforms for
   * @returns array of rotation transforms to apply
   */
  static calculateRotationTransforms(
    drawableNode: IDrawable & M2Node,
  ): RotationTransform[] {
    const rotationTransforms: RotationTransform[] = [];
    const nodes = drawableNode.ancestors;
    nodes.reverse();
    nodes.push(drawableNode);

    /**
     * Iterate all nodes and, if needed, rotate each around
     * its anchor point. Save a running list of all rotations in the
     * array rotationTransforms.
     */
    nodes.forEach((node) => {
      if (nodeNeedsRotation(node)) {
        const drawable = node as unknown as IDrawable & M2Node;
        /**
         * Scenes must be handled specially because they have a different
         * coordinate system -- (0, 0) is in the upper-left -- and their
         * anchor point is (0, 0). Despite this, we rotate them around their
         * center.
         */
        if (drawable.type === M2NodeType.Scene) {
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
          M2c2KitHelpers.calculateNodeAbsoluteBoundingBox(drawable);
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

function nodeNeedsRotation(node: M2Node): boolean {
  return (
    M2c2KitHelpers.normalizeAngleRadians(node.zRotation) !== 0 &&
    node.isDrawable
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
