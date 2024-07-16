import { Canvas } from "canvaskit-wasm";
import { IDrawable } from "./IDrawable";
import { M2Node, handleInterfaceOptions } from "./M2Node";
import { M2NodeType } from "./M2NodeType";
import { Point } from "./Point";
import { CompositeOptions } from "./CompositeOptions";
import { Equal } from "./Equal";
import { CompositeEvent } from "./M2Event";

export abstract class Composite extends M2Node implements IDrawable {
  readonly type = M2NodeType.Composite;
  compositeType = "<compositeType>";
  isDrawable = true;
  // Drawable options
  private _anchorPoint: Point = { x: 0.5, y: 0.5 };
  private _zPosition = 0;

  /**
   * Base Drawable object for creating custom nodes ("composites") composed of primitive nodes.
   *
   * @param options
   */
  constructor(options: CompositeOptions = {}) {
    super(options);
    handleInterfaceOptions(this, options);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  override initialize(): void {}

  // anchorPoint and zPosition are properties of the IDrawable interface and
  // must be implemented in all Drawable objects. These properties are NOT
  // inherited from the M2Node class.
  get anchorPoint(): Point {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const node = this;
    return {
      get x(): number {
        return node._anchorPoint.x;
      },
      set x(x: number) {
        if (Equal.value(node._anchorPoint.x, x)) {
          return;
        }
        node._anchorPoint.x = x;
        node.savePropertyChangeEvent("anchorPoint", node.anchorPoint);
      },
      get y(): number {
        return node._anchorPoint.y;
      },
      set y(y: number) {
        if (Equal.value(node._anchorPoint.y, y)) {
          return;
        }
        node._anchorPoint.y = y;
        node.savePropertyChangeEvent("anchorPoint", node.anchorPoint);
      },
    };
  }
  set anchorPoint(anchorPoint: Point) {
    if (Equal.value(this._anchorPoint, anchorPoint)) {
      return;
    }
    this._anchorPoint = anchorPoint;
    this.savePropertyChangeEvent("anchorPoint", this.anchorPoint);
  }

  get zPosition(): number {
    return this._zPosition;
  }
  set zPosition(zPosition: number) {
    if (Equal.value(this._zPosition, zPosition)) {
      return;
    }
    this._zPosition = zPosition;
    this.savePropertyChangeEvent("zPosition", zPosition);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  dispose(): void {}

  update(): void {
    super.update();
  }

  draw(canvas: Canvas): void {
    super.drawChildren(canvas);
  }

  abstract warmup(canvas: Canvas): void;

  /**
   * Event handler for custom events a `Composite` may generate.
   *
   * @remarks If the `Composite` generates custom events, this method is
   * necessary for the `Composite` to work in replay mode.
   *
   * @param event - event to handle
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleCompositeEvent(event: CompositeEvent): void {}
}
