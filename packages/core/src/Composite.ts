import { Canvas } from "canvaskit-wasm";
import { IDrawable } from "./IDrawable";
import { Entity, handleInterfaceOptions } from "./Entity";
import { EntityType } from "./EntityType";
import { Point } from "./Point";
import { CompositeOptions } from "./CompositeOptions";

export abstract class Composite extends Entity implements IDrawable {
  readonly type = EntityType.composite;
  compositeType = "<compositeType>";
  isDrawable = true;
  // Drawable options
  anchorPoint: Point = { x: 0.5, y: 0.5 };
  zPosition = 0;

  /**
   * Base Drawable object for creating custom entities ("composites") composed of primitive entities.
   *
   * @param options
   */
  constructor(options: CompositeOptions = {}) {
    super(options);
    handleInterfaceOptions(this, options);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  override initialize(): void {}

  update(): void {
    super.update();
  }

  draw(canvas: Canvas): void {
    super.drawChildren(canvas);
  }
}
