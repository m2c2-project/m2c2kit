import { Canvas } from "canvaskit-wasm";
import { IDrawable } from "./IDrawable";
import { M2Node, handleInterfaceOptions } from "./M2Node";
import { M2NodeType } from "./M2NodeType";
import { Point } from "./Point";
import { CompositeOptions } from "./CompositeOptions";

export abstract class Composite extends M2Node implements IDrawable {
  readonly type = M2NodeType.Composite;
  compositeType = "<compositeType>";
  isDrawable = true;
  // Drawable options
  anchorPoint: Point = { x: 0.5, y: 0.5 };
  zPosition = 0;

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

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  dispose(): void {}

  update(): void {
    super.update();
  }

  draw(canvas: Canvas): void {
    super.drawChildren(canvas);
  }

  abstract warmup(canvas: Canvas): void;
}
