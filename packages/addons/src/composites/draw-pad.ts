import {
  CompositeOptions,
  Size,
  RgbaColor,
  M2NodeEvent,
  Point,
  CallbackOptions,
  Composite,
  WebColors,
  Shape,
  MutablePath,
  TapEvent,
  M2PointerEvent,
  M2Node,
  IDrawable,
  M2c2KitHelpers,
  M2NodeConstructor,
} from "@m2c2kit/core";
import { Canvas } from "canvaskit-wasm";

export interface DrawPadOptions extends CompositeOptions {
  /** Size of the DrawPad */
  size: Size;
  /** Color of drawn lines. Default is red. */
  lineColor?: RgbaColor;
  /** Width of drawn lines. Default is 1 */
  lineWidth?: number;
  /** Background color of the DrawPad. Default is transparent. */
  backgroundColor?: RgbaColor;
  /** Width of the border. Default is 1 */
  borderWidth?: number;
  /** Color of the border. Default is black */
  borderColor?: RgbaColor;
  /** Does the DrawPad respond to user interaction? Default is true. */
  isUserInteractionEnabled?: boolean;
  /** Should drawing resume when the pointer, in a down state, returns to the DrawPad area after exiting it while drawing? Default is false. */
  resumeDrawingOnReturn?: boolean;
  /** Should the user be permitted to draw only one continuous line? If so, no more drawing is allowed after the first stroke ends. */
  continuousDrawingOnly?: boolean;
  /** If `continuousDrawingOnly`, this is the maximum pixel distance from the last stroke's end point that the user is allowed to continue drawing with a new stroke. */
  continuousDrawingOnlyExceptionDistance?: number;
}

export const DrawPadEventType = {
  StrokeStart: "StrokeStart",
  StrokeMove: "StrokeMove",
  StrokeEnd: "StrokeEnd",
} as const;
export type DrawPadEventType =
  (typeof DrawPadEventType)[keyof typeof DrawPadEventType];

export interface DrawPadEvent extends M2NodeEvent {
  type: DrawPadEventType;
  position: Point;
}

export const DrawPadItemEventType = {
  StrokeEnter: "StrokeEnter",
  StrokeLeave: "StrokeLeave",
} as const;
export type DrawPadItemEventType =
  (typeof DrawPadItemEventType)[keyof typeof DrawPadItemEventType];

export interface DrawPadItemEvent extends M2NodeEvent {
  type: DrawPadItemEventType;
}

export interface StrokeInteraction {
  /** Type of user interaction with the stroke: StrokeStart, StrokeMove, or StrokeEnd. */
  type: DrawPadEventType;
  /** Position on the DrawPad where the interaction occurred. In the DrawPad coordinate system, (0, 0) is the upper-left corner. */
  position: Point;
  /** Device ISO8601 Timestamp of the interaction. */
  iso8601Timestamp: string;
  /** Was the interaction's position interpolated? (clipped to DrawPad boundary) because the user drew out of bounds? @remarks Only StrokeMove and StrokeEnd can be interpolated. A StrokeStart position can never begin out of bounds. */
  interpolated: boolean;
}

export type DrawPadStroke = Array<StrokeInteraction>;

export interface DrawPadItem {
  /**
   * Executes a callback when a DrawPad stroke begins on or enters the DrawPadItem.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onStrokeEnter(
    callback: (ev: DrawPadItemEvent) => void,
    options?: CallbackOptions,
  ): void;
  /**
   * Executes a callback when a DrawPad stroke leaves the DrawPadItem.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onStrokeLeave(
    callback: (ev: DrawPadItemEvent) => void,
    options?: CallbackOptions,
  ): void;
  /** Is a DrawPad stroke currently within the bounds of the DrawPad item? */
  isStrokeWithinBounds: boolean;
  /** Position of the DrawPadItem within the DrawPad coordinate system, in which (0, 0) is the upper-left corner. */
  drawPadPosition: Point;
}

export class DrawPad extends Composite {
  compositeType = "DrawPad";
  resumeDrawingOnReturn = false;
  continuousDrawingOnly = false;
  continuousDrawingOnlyExceptionDistance: number | undefined;

  private _backgroundColor: RgbaColor = [0, 0, 0, 0];
  private _borderColor = WebColors.Black;
  private _borderWidth = 1;
  private _lineColor = WebColors.Red;
  private _lineWidth = 1;
  /** The rectangular "pad" on which to draw */
  private drawArea?: Shape;
  /** The lines that are drawn */
  private drawShape?: Shape;
  private isDrawingPointerDown = false;
  private pointerIsDownAndPointerLeftDrawAreaWhenDown = false;
  private currentStrokesNotAllowed = false;
  private originalOptions: DrawPadOptions;

  /** Array of strokes created on the DrawPad, with position and timestamps
   * of all interactions with each DrawPadStroke.
   */
  strokes = new Array<DrawPadStroke>();

  /**
   * A rectangular area on which the user can draw strokes (lines).
   *
   * @remarks This composite node is composed of a rectangle Shape and
   * another Shape that is formed from a path of points.
   *
   * @param options - {@link DrawPadOptions}
   */
  constructor(options: DrawPadOptions) {
    super(options);
    this.originalOptions = JSON.parse(JSON.stringify(options));
    if (options.isUserInteractionEnabled === undefined) {
      // unlike most nodes, DrawPad is interactive by default
      this.isUserInteractionEnabled = true;
    }
    if (!options.size) {
      throw new Error("DrawPad size must be specified");
    }
    this.size = options.size;

    if (options.lineColor) {
      this.lineColor = options.lineColor;
    }
    if (options.lineWidth) {
      this.lineWidth = options.lineWidth;
    }
    if (options.backgroundColor) {
      this.backgroundColor = options.backgroundColor;
    }
    if (options.borderColor) {
      this.borderColor = options.borderColor;
    }
    if (options.borderWidth) {
      this.borderWidth = options.borderWidth;
    }
    if (options.resumeDrawingOnReturn !== undefined) {
      this.resumeDrawingOnReturn = options.resumeDrawingOnReturn;
    }

    if (options.continuousDrawingOnly !== undefined) {
      this.continuousDrawingOnly = options.continuousDrawingOnly;
    }

    if (options.continuousDrawingOnlyExceptionDistance !== undefined) {
      this.continuousDrawingOnlyExceptionDistance =
        options.continuousDrawingOnlyExceptionDistance;
    }
    this.saveNodeNewEvent();
  }

  override get completeNodeOptions() {
    return {
      ...this.options,
      ...this.getNodeOptions(),
      ...this.getDrawableOptions(),
      ...this.originalOptions,
    };
  }

  override initialize(): void {
    this.initializeDrawShape();
    this.initializeDrawArea();
    this.needsInitialization = false;
  }

  private initializeDrawShape() {
    if (!this.drawShape) {
      const mutablePath = new MutablePath();
      this.drawShape = new Shape({
        path: mutablePath,
        size: this.size,
      });
      this.addChild(this.drawShape);
    }
    this.drawShape.strokeColor = this.lineColor;
    this.drawShape.lineWidth = this.lineWidth;
  }

  private initializeDrawArea() {
    if (!this.drawArea) {
      this.drawArea = new Shape({
        rect: { size: this.size },
        isUserInteractionEnabled: true,
        suppressEvents: true,
      });
      this.addChild(this.drawArea);

      this.drawArea.onTapDown((e) => {
        this.handleTapDown(e);
      });

      this.drawArea.onPointerMove((e) => {
        this.handlePointerMove(e);
      });

      this.drawArea.onTapUpAny(() => {
        this.handleTapUpAny();
      });

      this.drawArea.onTapLeave((e) => {
        this.handleTapLeave(e);
      });
    }
    this.drawArea.fillColor = this.backgroundColor;
    this.drawArea.strokeColor = this.borderColor;
    this.drawArea.lineWidth = this.borderWidth;
  }

  private dist(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  private handleTapDown(e: TapEvent) {
    if (this.isUserInteractionEnabled) {
      if (!this.drawShape?.path) {
        throw new Error("DrawPad.handleTapDown(): no drawShape.path");
      }
      const path = this.drawShape.path as MutablePath;

      if (this.continuousDrawingOnly && path.subpaths.length !== 0) {
        const prevPoint =
          path.subpaths[path.subpaths.length - 1][
            path.subpaths[path.subpaths.length - 1].length - 1
          ];
        const currentPoint = e.point;

        if (
          this.continuousDrawingOnlyExceptionDistance === undefined ||
          this.dist(prevPoint, currentPoint) >
            this.continuousDrawingOnlyExceptionDistance
        ) {
          this.currentStrokesNotAllowed = true;
          return;
        }
      }

      this.currentStrokesNotAllowed = false;
      this.isDrawingPointerDown = true;
      path.move(e.point);
      const drawPadEvent: DrawPadEvent = {
        type: DrawPadEventType.StrokeStart,
        target: this,
        handled: false,
        position: e.point,
        ...M2c2KitHelpers.createTimestamps(),
      };
      this.strokes.push([
        {
          type: DrawPadEventType.StrokeStart,
          position: e.point,
          iso8601Timestamp: new Date().toISOString(),
          interpolated: false,
        },
      ]);
      this.raiseDrawPadEvent(drawPadEvent);
    }
  }

  private addInterpolatedStrokeMove(point: Point): Point {
    const strokeCount = this.strokes.length;
    const strokeInteractionCount = this.strokes[strokeCount - 1].length;
    const previousPoint =
      this.strokes[this.strokes.length - 1][strokeInteractionCount - 1]
        .position;
    const interpolatedPoint = this.interpolateToDrawPadBorder(
      point,
      previousPoint,
      this.size,
    );

    if (!this.drawShape?.path) {
      throw new Error("DrawPad.addInterpolatedStrokeMove(): no drawShape.path");
    }
    const path = this.drawShape.path as MutablePath;
    path.addLine(interpolatedPoint);

    const drawPadEvent: DrawPadEvent = {
      type: DrawPadEventType.StrokeMove,
      target: this,
      handled: false,
      position: interpolatedPoint,
      ...M2c2KitHelpers.createTimestamps(),
    };
    this.strokes[strokeCount - 1].push({
      type: DrawPadEventType.StrokeMove,
      position: interpolatedPoint,
      iso8601Timestamp: new Date().toISOString(),
      interpolated: true,
    });
    this.raiseDrawPadEvent(drawPadEvent);

    return interpolatedPoint;
  }

  private handleTapLeave(e: TapEvent) {
    if (this.currentStrokesNotAllowed) {
      this.isDrawingPointerDown = false;
      return;
    }
    if (this.resumeDrawingOnReturn === false) {
      this.isDrawingPointerDown = false;
      const strokeCount = this.strokes.length;
      const strokeInteractionCount = this.strokes[strokeCount - 1].length;

      let pointWasInterpolated = false;
      let point = e.point;
      /**
       * If moving the pointer quickly when exiting the DrawPad area, we must
       * interpolate a point on the border of the DrawPad and add a stroke.
       * Otherwise, the stroke will end abruptly at the last point within the
       * DrawPad.
       */
      if (!this.isPointWithinDrawPad(e.point, this.size)) {
        point = this.addInterpolatedStrokeMove(e.point);
        pointWasInterpolated = true;
      }

      const drawPadEvent: DrawPadEvent = {
        type: DrawPadEventType.StrokeEnd,
        position:
          this.strokes[strokeCount - 1][strokeInteractionCount - 1].position,
        target: this,
        handled: false,
        ...M2c2KitHelpers.createTimestamps(),
      };
      this.strokes[strokeCount - 1].push({
        type: DrawPadEventType.StrokeEnd,
        position: pointWasInterpolated
          ? point
          : this.strokes[strokeCount - 1][strokeInteractionCount - 1].position,
        iso8601Timestamp: new Date().toISOString(),
        interpolated: pointWasInterpolated,
      });
      this.raiseDrawPadEvent(drawPadEvent);
      this.currentStrokesNotAllowed = true;
    } else {
      this.pointerIsDownAndPointerLeftDrawAreaWhenDown = true;
    }
  }

  private handleTapUpAny() {
    if (this.currentStrokesNotAllowed) {
      this.isDrawingPointerDown = false;
      return;
    }
    if (this.isUserInteractionEnabled) {
      this.isDrawingPointerDown = false;
      this.pointerIsDownAndPointerLeftDrawAreaWhenDown = false;
      const strokeCount = this.strokes.length;
      const strokeInteractionCount = this.strokes[strokeCount - 1].length;
      const drawPadEvent: DrawPadEvent = {
        type: DrawPadEventType.StrokeEnd,
        position:
          this.strokes[strokeCount - 1][strokeInteractionCount - 1].position,
        target: this,
        handled: false,
        ...M2c2KitHelpers.createTimestamps(),
      };
      this.strokes[strokeCount - 1].push({
        type: DrawPadEventType.StrokeEnd,
        position:
          this.strokes[strokeCount - 1][strokeInteractionCount - 1].position,
        iso8601Timestamp: new Date().toISOString(),
        interpolated: false,
      });
      this.raiseDrawPadEvent(drawPadEvent);
    }
  }

  private handlePointerMove(e: M2PointerEvent) {
    if (this.isUserInteractionEnabled && this.isDrawingPointerDown) {
      if (!this.drawShape?.path) {
        throw new Error("DrawPad.handlePointerMove(): no drawShape.path");
      }
      const path = this.drawShape.path as MutablePath;
      if (
        this.isDrawingPointerDown &&
        !this.pointerIsDownAndPointerLeftDrawAreaWhenDown
      ) {
        path.addLine(e.point);
      }
      if (this.pointerIsDownAndPointerLeftDrawAreaWhenDown) {
        this.pointerIsDownAndPointerLeftDrawAreaWhenDown = false;
        path.move(e.point);
      }
      const drawPadEvent: DrawPadEvent = {
        type: DrawPadEventType.StrokeMove,
        target: this,
        handled: false,
        position: e.point,
        ...M2c2KitHelpers.createTimestamps(),
      };
      const strokeCount = this.strokes.length;
      this.strokes[strokeCount - 1].push({
        type: DrawPadEventType.StrokeMove,
        position: e.point,
        iso8601Timestamp: new Date().toISOString(),
        interpolated: false,
      });
      this.raiseDrawPadEvent(drawPadEvent);
    }
  }

  update(): void {
    super.update();
  }

  draw(canvas: Canvas): void {
    super.drawChildren(canvas);
  }

  private raiseDrawPadEvent(event: DrawPadEvent): void {
    if (this.eventListeners.length > 0) {
      this.eventListeners
        .filter((listener) => listener.type === event.type)
        .forEach((listener) => {
          listener.callback(event);
        });
    }
  }

  private raiseDrawPadItemEvent(item: M2Node, event: DrawPadItemEvent): void {
    if (item.eventListeners.length > 0) {
      item.eventListeners
        .filter((listener) => listener.type === event.type)
        .forEach((listener) => {
          listener.callback(event);
        });
    }
  }

  /**
   * Removes all strokes from the DrawPad.
   */
  clear(): void {
    if (!this.drawShape?.path) {
      throw new Error("DrawPad.clear(): no drawShape.path");
    }
    const path = this.drawShape.path as MutablePath;
    path.clear();
    this.strokes = new Array<DrawPadStroke>();
  }

  warmup(canvas: Canvas): void {
    this.initialize();
    this.children
      .filter((child) => child.isDrawable)
      .forEach((child) => {
        (child as unknown as IDrawable).warmup(canvas);
      });
  }

  /**
   * Executes a callback when the user starts a stroke on the DrawPad.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onStrokeStart(
    callback: (ev: DrawPadEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(
      DrawPadEventType.StrokeStart,
      <(ev: M2NodeEvent) => void>callback,
      options,
    );
  }

  /**
   * Executes a callback when the user moves a stroke on the DrawPad.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onStrokeMove(
    callback: (ev: DrawPadEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(
      DrawPadEventType.StrokeMove,
      <(ev: M2NodeEvent) => void>callback,
      options,
    );
  }

  /**
   * Executes a callback when the user ends a stroke on the DrawPad.
   *
   * @param callback - function to execute
   * @param options - {@link CallbackOptions}
   */
  onStrokeEnd(
    callback: (ev: DrawPadEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(
      DrawPadEventType.StrokeEnd,
      <(ev: M2NodeEvent) => void>callback,
      options,
    );
  }

  /**
   * Adds a node to the DrawPad.
   *
   * @remarks After the node is added to the DrawPad, its
   * position is adjusted to be relative to the DrawPad's coordinate
   * system, and it is made interactive. The method returns an object
   * which is the node as a DrawPadItem, which has additional methods,
   * properties, and events specific to it now being on a DrawPad. The node
   * now **must** be manipulated only using the DrawPadItem object. Using
   * the original node object will result in undefined behavior.
   *
   * @param node - the node to add to the DrawPad
   * @returns the node as a DrawPadItem
   */
  addItem<T extends M2Node>(node: T): T & DrawPadItem {
    Object.defineProperty(node, "drawPadPosition", {
      get: function () {
        const drawPad = node.parent as DrawPad;
        return {
          get x() {
            return node.position.x + drawPad.size.width / 2;
          },

          set x(value) {
            node.position.x = value - drawPad.size.width / 2;
          },
          get y() {
            return node.position.y + drawPad.size.height / 2;
          },

          set y(value) {
            node.position.y = value - drawPad.size.height / 2;
          },
        };
      },
      set: function (value: Point) {
        const drawPad = node.parent as DrawPad;
        node.position.x = value.x - drawPad.size.width / 2;
        node.position.y = value.y - drawPad.size.height / 2;
      },
    });
    Object.defineProperty(node, "onStrokeEnter", {
      value: function (
        this: T,
        callback: (ev: DrawPadItemEvent) => void,
        options?: CallbackOptions,
      ) {
        this.addEventListener(
          DrawPadItemEventType.StrokeEnter,
          <(ev: M2NodeEvent) => void>callback,
          options,
        );
      },
    });
    Object.defineProperty(node, "onStrokeLeave", {
      value: function (
        this: T,
        callback: (ev: DrawPadItemEvent) => void,
        options?: CallbackOptions,
      ) {
        this.addEventListener(
          DrawPadItemEventType.StrokeLeave,
          <(ev: M2NodeEvent) => void>callback,
          options,
        );
      },
    });
    Object.defineProperty(node, "isStrokeWithinBounds", {
      value: false,
      writable: true,
    });
    node.onPointerDown(() => {
      if (this.isDrawingPointerDown) {
        if ((node as unknown as DrawPadItem).isStrokeWithinBounds === false) {
          (node as unknown as DrawPadItem).isStrokeWithinBounds = true;
          const drawPadItemEvent: DrawPadItemEvent = {
            type: DrawPadItemEventType.StrokeEnter,
            target: node,
            ...M2c2KitHelpers.createTimestamps(),
          };
          this.raiseDrawPadItemEvent(node, drawPadItemEvent);
        }
      }
    });
    node.onPointerMove(() => {
      if (this.isDrawingPointerDown) {
        if ((node as unknown as DrawPadItem).isStrokeWithinBounds === false) {
          (node as unknown as DrawPadItem).isStrokeWithinBounds = true;
          const drawPadItemEvent: DrawPadItemEvent = {
            type: DrawPadItemEventType.StrokeEnter,
            target: node,
            ...M2c2KitHelpers.createTimestamps(),
          };
          this.raiseDrawPadItemEvent(node, drawPadItemEvent);
        }
      }
    });
    node.onPointerLeave(() => {
      if (this.isDrawingPointerDown) {
        if ((node as unknown as DrawPadItem).isStrokeWithinBounds === true) {
          (node as unknown as DrawPadItem).isStrokeWithinBounds = false;
          const drawPadItemEvent: DrawPadItemEvent = {
            type: DrawPadItemEventType.StrokeLeave,
            target: node,
            ...M2c2KitHelpers.createTimestamps(),
          };
          this.raiseDrawPadItemEvent(node, drawPadItemEvent);
        }
      }
    });
    node.onPointerUp(() => {
      if ((node as unknown as DrawPadItem).isStrokeWithinBounds === true) {
        (node as unknown as DrawPadItem).isStrokeWithinBounds = false;
        const drawPadItemEvent: DrawPadItemEvent = {
          type: DrawPadItemEventType.StrokeLeave,
          target: node,
          ...M2c2KitHelpers.createTimestamps(),
        };
        this.raiseDrawPadItemEvent(node, drawPadItemEvent);
      }
    });
    this.addChild(node);
    /**
     * DrawPadItems must have zPosition -1 (below the DrawPadArea) so the
     * pointer events are properly processed. If this is not set, TapDown
     * event on the DrawPadArea will not set isStrokeWithinBounds = true,
     * and thus the StrokeEnter event on the item will not be raised.
     */
    (node as unknown as IDrawable).zPosition = -1;
    /**
     * Adust the node position so it is relative to the DrawPad coordinate
     * system.
     */
    node.position.x = node.position.x - this.size.width / 2;
    node.position.y = node.position.y - this.size.height / 2;
    node.isUserInteractionEnabled = true;
    return node as T & DrawPadItem;
  }

  /**
   * Takes a screenshot of the DrawPad.
   *
   * @returns a base64-encoded string of the DrawPad's current state in
   * PNG format.
   */
  takeScreenshot() {
    const drawArea = this.drawArea;
    if (!drawArea) {
      throw new Error("DrawPad.takeScreenshot(): no drawArea");
    }
    const sx =
      (drawArea.absolutePosition.x - drawArea.size.width / 2) *
      m2c2Globals.canvasScale;
    const sy =
      (drawArea.absolutePosition.y - drawArea.size.height / 2) *
      m2c2Globals.canvasScale;
    const sw = drawArea.size.width * m2c2Globals.canvasScale;
    const sh = drawArea.size.height * m2c2Globals.canvasScale;
    const imageInfo = {
      alphaType: this.game.canvasKit.AlphaType.Unpremul,
      colorType: this.game.canvasKit.ColorType.RGBA_8888,
      colorSpace: this.game.canvasKit.ColorSpace.SRGB,
      width: sw,
      height: sh,
    };
    const snapshot = this.game.snapshots[0];
    const pixelData = snapshot.readPixels(sx, sy, imageInfo) as Uint8Array;
    const croppedImage = this.game.canvasKit.MakeImage(
      imageInfo,
      pixelData,
      pixelData.length / sh,
    );
    if (!croppedImage) {
      throw new Error("DrawPad.takeScreenshot(): no croppedImage");
    }
    const bytes = croppedImage.encodeToBytes();
    if (!bytes) {
      throw new Error(
        "DrawPad.takeScreenshot(): croppedImage.encodeToBytes() failed",
      );
    }
    croppedImage.delete();
    return this.arrayBufferToBase64String(bytes);
  }

  /**
   * Determines whether a point is within the DrawPad.
   *
   * @param point - The point to check
   * @returns True - if the point is within the DrawPad, false otherwise
   */
  private isPointWithinDrawPad(point: Point, drawPadSize: Size): boolean {
    return (
      point.x >= 0 &&
      point.x <= drawPadSize.width &&
      point.y >= 0 &&
      point.y <= drawPadSize.height
    );
  }

  /**
   * Interpolates a point to the border of the DrawPad based on a line that
   * crosses the DrawPad border. The line is formed by the current "out of
   * bounds" point the and previous "within bounds" point.
   *
   * @param currentPoint - The current point
   * @param previousPoint - The previous point
   * @param drawPadSize - The size of the DrawPad
   * @returns A new point on the border of the DrawPad
   */
  private interpolateToDrawPadBorder(
    currentPoint: Point,
    previousPoint: Point,
    drawPadSize: Size,
  ): Point {
    /** Calculate the slope and intercept of the line passing through the
     * current and previous points Use the formula y = mx + b, where m
     * is the slope and b is the intercept.
     */
    const slope =
      (currentPoint.y - previousPoint.y) / (currentPoint.x - previousPoint.x);
    const intercept = currentPoint.y - slope * currentPoint.x;

    // Initialize the new point to be returned
    const newPoint: Point = { x: 0, y: 0 };

    // Check if vertical line (slope is undefined)
    if (!Number.isFinite(slope)) {
      // Use the current x value as the intersection point
      newPoint.x = currentPoint.x;
      // Check if the line segment is going from top to bottom
      if (currentPoint.y - previousPoint.y > 0) {
        // Set the new point to be the intersection point on the bottom border
        newPoint.y = drawPadSize.height;
        return newPoint;
      }
      // Check if the line segment is going from bottom to top
      if (currentPoint.y - previousPoint.y < 0) {
        // Set the new point to be the intersection point on the top border
        newPoint.y = 0;
        return newPoint;
      }
    }

    /**
     * Check if the line intersects the left or right border of DrawPad.
     * Use formula y = mx + b and substitute x = 0 or x = drawPadSize.width
     */
    const yLeft = slope * 0 + intercept;
    const yRight = slope * drawPadSize.width + intercept;
    // Check if the intersection point is within the DrawPad height
    if (yLeft >= 0 && yLeft <= drawPadSize.height) {
      // Check if the line segment is going from right to left
      if (currentPoint.x - previousPoint.x < 0) {
        // Set the new point to be the intersection point on the left border
        newPoint.x = 0;
        newPoint.y = yLeft;
        return newPoint;
      }
    }
    if (yRight >= 0 && yRight <= drawPadSize.height) {
      // Check if the line segment is going from left to right
      if (currentPoint.x - previousPoint.x > 0) {
        // Set the new point to be the intersection point on the right border
        newPoint.x = drawPadSize.width;
        newPoint.y = yRight;
        return newPoint;
      }
    }

    /**
     * Check if the line intersects the top or bottom border of DrawPad.
     * Use formula x = (y - b) / m and substitute y = 0 or y = drawPadSize.height
     */
    const xTop = (0 - intercept) / slope;
    const xBottom = (drawPadSize.height - intercept) / slope;
    // Check if the intersection point is within the DrawPad width
    if (xTop >= 0 && xTop <= drawPadSize.width) {
      // Check if the line segment is going from bottom to top
      if (currentPoint.y - previousPoint.y < 0) {
        // Set the new point to be the intersection point on the top border
        newPoint.x = xTop;
        newPoint.y = 0;
        return newPoint;
      }
    }
    if (xBottom >= 0 && xBottom <= drawPadSize.width) {
      // Check if the line segment is going from top to bottom
      if (currentPoint.y - previousPoint.y > 0) {
        // Set the new point to be the intersection point on the bottom border
        newPoint.x = xBottom;
        newPoint.y = drawPadSize.height;
        return newPoint;
      }
    }

    // If none of the above cases apply, return the current point as fallback
    return currentPoint;
  }

  private arrayBufferToBase64String(buffer: ArrayBuffer): string {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  get backgroundColor(): RgbaColor {
    return this._backgroundColor;
  }
  set backgroundColor(backgroundColor: RgbaColor) {
    this._backgroundColor = backgroundColor;
    this.needsInitialization = true;
  }

  get borderColor(): RgbaColor {
    return this._borderColor;
  }
  set borderColor(borderColor: RgbaColor) {
    this._borderColor = borderColor;
    this.needsInitialization = true;
  }

  get borderWidth(): number {
    return this._borderWidth;
  }
  set borderWidth(borderWidth: number) {
    this._borderWidth = borderWidth;
    this.needsInitialization = true;
  }

  get lineColor(): RgbaColor {
    return this._lineColor;
  }
  set lineColor(lineColor: RgbaColor) {
    this._lineColor = lineColor;
    this.needsInitialization = true;
  }

  get lineWidth(): number {
    return this._lineWidth;
  }
  set lineWidth(lineWidth: number) {
    this._lineWidth = lineWidth;
    this.needsInitialization = true;
  }

  override duplicate(newName?: string): DrawPad {
    throw new Error(`DrawPad.duplicate(): Method not implemented. ${newName}`);
  }
}

M2c2KitHelpers.registerM2NodeClass(DrawPad as unknown as M2NodeConstructor);
