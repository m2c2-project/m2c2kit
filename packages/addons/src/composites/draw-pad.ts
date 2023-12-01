import {
  CompositeOptions,
  Size,
  RgbaColor,
  EntityEvent,
  Point,
  CallbackOptions,
  Composite,
  WebColors,
  Shape,
  MutablePath,
  TapEvent,
  M2PointerEvent,
  Entity,
  IDrawable,
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

export interface DrawPadEvent extends EntityEvent {
  type: DrawPadEventType;
  position: Point;
}

export const DrawPadItemEventType = {
  StrokeEnter: "StrokeEnter",
  StrokeLeave: "StrokeLeave",
} as const;
export type DrawPadItemEventType =
  (typeof DrawPadItemEventType)[keyof typeof DrawPadItemEventType];

export interface DrawPadItemEvent extends EntityEvent {
  type: DrawPadItemEventType;
}

export interface StrokeInteraction {
  /** Type of user interaction with the stroke: StrokeStart, StrokeMove, or StrokeEnd. */
  type: DrawPadEventType;
  /** Position on the DrawPad where the interaction occurred. In the DrawPad coordinate system, (0, 0) is the upper-left corner. */
  position: Point;
  /** Device ISO8601 Timestamp of the interaction. */
  iso8601Timestamp: string;
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

  /** Array of strokes created on the DrawPad, with position and timestamps
   * of all interactions with each DrawPadStroke.
   */
  strokes = new Array<DrawPadStroke>();

  /**
   * A rectangular area on which the user can draw strokes (lines).
   *
   * @remarks This composite entity is composed of a rectangle Shape and
   * another Shape that is formed from a path of points.
   *
   * @param options - {@link DrawPadOptions}
   */
  constructor(options: DrawPadOptions) {
    super(options);
    if (options.isUserInteractionEnabled === undefined) {
      // unlike most entities, DrawPad is interactive by default
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

      this.drawArea.onTapLeave(() => {
        this.handleTapLeave();
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
      const drawShape = this.drawShape;
      if (!drawShape) {
        throw new Error("no draw shape");
      }
      const path = drawShape.path as MutablePath;

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

      this.isDrawingPointerDown = true;
      path.move(e.point);
      const drawPadEvent: DrawPadEvent = {
        type: DrawPadEventType.StrokeStart,
        target: this,
        handled: false,
        position: e.point,
      };
      this.strokes.push([
        {
          type: DrawPadEventType.StrokeStart,
          position: e.point,
          iso8601Timestamp: new Date().toISOString(),
        },
      ]);
      this.raiseDrawPadEvent(drawPadEvent);
    }
  }

  private handleTapLeave() {
    if (this.currentStrokesNotAllowed) {
      this.isDrawingPointerDown = false;
      return;
    }
    if (this.resumeDrawingOnReturn === false) {
      this.isDrawingPointerDown = false;
      const strokeCount = this.strokes.length;
      const strokeInteractionCount = this.strokes[strokeCount - 1].length;
      const drawPadEvent: DrawPadEvent = {
        type: DrawPadEventType.StrokeEnd,
        position:
          this.strokes[strokeCount - 1][strokeInteractionCount - 1].position,
        target: this,
        handled: false,
      };
      this.strokes[strokeCount - 1].push({
        type: DrawPadEventType.StrokeEnd,
        position:
          this.strokes[strokeCount - 1][strokeInteractionCount - 1].position,
        iso8601Timestamp: new Date().toISOString(),
      });
      this.raiseDrawPadEvent(drawPadEvent);
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
      };
      this.strokes[strokeCount - 1].push({
        type: DrawPadEventType.StrokeEnd,
        position:
          this.strokes[strokeCount - 1][strokeInteractionCount - 1].position,
        iso8601Timestamp: new Date().toISOString(),
      });
      this.raiseDrawPadEvent(drawPadEvent);
    }
  }

  private handlePointerMove(e: M2PointerEvent) {
    if (this.isUserInteractionEnabled && this.isDrawingPointerDown) {
      const drawShape = this.drawShape;
      if (!drawShape) {
        throw new Error("no draw shape");
      }
      const path = drawShape.path as MutablePath;
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
      };
      const strokeCount = this.strokes.length;
      this.strokes[strokeCount - 1].push({
        type: DrawPadEventType.StrokeMove,
        position: e.point,
        iso8601Timestamp: new Date().toISOString(),
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

  private raiseDrawPadItemEvent(item: Entity, event: DrawPadItemEvent): void {
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
    const drawShape = this.drawShape;
    if (!drawShape) {
      throw new Error("no draw shape");
    }
    const path = drawShape.path as MutablePath;
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
      <(ev: EntityEvent) => void>callback,
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
      <(ev: EntityEvent) => void>callback,
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
      <(ev: EntityEvent) => void>callback,
      options,
    );
  }

  /**
   * Adds an entity to the DrawPad.
   *
   * @remarks After the entity is added to the DrawPad, its
   * position is adjusted to be relative to the DrawPad's coordinate
   * system, and it is made interactive. The method returns an object
   * which is the entity as a DrawPadItem, which has additional methods,
   * properties, and events specific to it now being on a DrawPad. The entity
   * now **must** be manipulated only using the DrawPadItem object. Using
   * the original entity object will result in undefined behavior.
   *
   * @param entity - the entity to add to the DrawPad
   * @returns the entity as a DrawPadItem
   */
  addItem<T extends Entity>(entity: T): T & DrawPadItem {
    Object.defineProperty(entity, "drawPadPosition", {
      get: function () {
        const drawPad = entity.parent as DrawPad;
        return {
          get x() {
            return entity.position.x + drawPad.size.width / 2;
          },

          set x(value) {
            entity.position.x = value - drawPad.size.width / 2;
          },
          get y() {
            return entity.position.y + drawPad.size.height / 2;
          },

          set y(value) {
            entity.position.y = value - drawPad.size.height / 2;
          },
        };
      },
      set: function (value: Point) {
        const drawPad = entity.parent as DrawPad;
        entity.position.x = value.x - drawPad.size.width / 2;
        entity.position.y = value.y - drawPad.size.height / 2;
      },
    });
    Object.defineProperty(entity, "onStrokeEnter", {
      value: function (
        this: T,
        callback: (ev: DrawPadItemEvent) => void,
        options?: CallbackOptions,
      ) {
        this.addEventListener(
          DrawPadItemEventType.StrokeEnter,
          <(ev: EntityEvent) => void>callback,
          options,
        );
      },
    });
    Object.defineProperty(entity, "onStrokeLeave", {
      value: function (
        this: T,
        callback: (ev: DrawPadItemEvent) => void,
        options?: CallbackOptions,
      ) {
        this.addEventListener(
          DrawPadItemEventType.StrokeLeave,
          <(ev: EntityEvent) => void>callback,
          options,
        );
      },
    });
    Object.defineProperty(entity, "isStrokeWithinBounds", {
      value: false,
      writable: true,
    });
    entity.onPointerDown(() => {
      if (this.isDrawingPointerDown) {
        if ((entity as unknown as DrawPadItem).isStrokeWithinBounds === false) {
          (entity as unknown as DrawPadItem).isStrokeWithinBounds = true;
          const drawPadItemEvent: DrawPadItemEvent = {
            type: DrawPadItemEventType.StrokeEnter,
            target: entity,
          };
          this.raiseDrawPadItemEvent(entity, drawPadItemEvent);
        }
      }
    });
    entity.onPointerMove(() => {
      if (this.isDrawingPointerDown) {
        if ((entity as unknown as DrawPadItem).isStrokeWithinBounds === false) {
          (entity as unknown as DrawPadItem).isStrokeWithinBounds = true;
          const drawPadItemEvent: DrawPadItemEvent = {
            type: DrawPadItemEventType.StrokeEnter,
            target: entity,
          };
          this.raiseDrawPadItemEvent(entity, drawPadItemEvent);
        }
      }
    });
    entity.onPointerLeave(() => {
      if (this.isDrawingPointerDown) {
        if ((entity as unknown as DrawPadItem).isStrokeWithinBounds === true) {
          (entity as unknown as DrawPadItem).isStrokeWithinBounds = false;
          const drawPadItemEvent: DrawPadItemEvent = {
            type: DrawPadItemEventType.StrokeLeave,
            target: entity,
          };
          this.raiseDrawPadItemEvent(entity, drawPadItemEvent);
        }
      }
    });
    entity.onPointerUp(() => {
      if ((entity as unknown as DrawPadItem).isStrokeWithinBounds === true) {
        (entity as unknown as DrawPadItem).isStrokeWithinBounds = false;
        const drawPadItemEvent: DrawPadItemEvent = {
          type: DrawPadItemEventType.StrokeLeave,
          target: entity,
        };
        this.raiseDrawPadItemEvent(entity, drawPadItemEvent);
      }
    });
    this.addChild(entity);
    /**
     * DrawPadItems must have zPosition -1 (below the DrawPadArea) so the
     * pointer events are properly processed. If this is not set, TapDown
     * event on the DrawPadArea will not set isStrokeWithinBounds = true,
     * and thus the StrokeEnter event on the item will not be raised.
     */
    (entity as unknown as IDrawable).zPosition = -1;
    /**
     * Adust the entity position so it is relative to the DrawPad coordinate
     * system.
     */
    entity.position.x = entity.position.x - this.size.width / 2;
    entity.position.y = entity.position.y - this.size.height / 2;
    entity.isUserInteractionEnabled = true;
    return entity as T & DrawPadItem;
  }

  /**
   * Takes a screenshot of the DrawPad.
   *
   * @returns a base64-encoded string of the DrawPad's current state in
   * PNG format.
   */
  takeScreenshot() {
    const surface = this.game.surface;
    if (!surface) {
      throw new Error("no surface");
    }
    const drawArea = this.drawArea;
    if (!drawArea) {
      throw new Error("no draw area");
    }
    const sx =
      (drawArea.absolutePosition.x - drawArea.size.width / 2) *
      Globals.canvasScale;
    const sy =
      (drawArea.absolutePosition.y - drawArea.size.height / 2) *
      Globals.canvasScale;
    const sw = drawArea.size.width * Globals.canvasScale;
    const sh = drawArea.size.height * Globals.canvasScale;
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
      throw new Error("no cropped image");
    }
    const bytes = croppedImage.encodeToBytes();
    if (!bytes) {
      throw new Error("no bytes");
    }
    croppedImage.delete();
    return this.arrayBufferToBase64String(bytes);
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
    throw new Error("Method not implemented.");
  }
}
