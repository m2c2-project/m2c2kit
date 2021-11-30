import { Canvas } from "canvaskit-wasm";
import { IDrawable } from "./IDrawable";
import { Entity, handleInterfaceOptions } from "./Entity";
import { EntityType } from "./EntityType";
import { Point } from "./Point";
import { SpriteOptions } from "./SpriteOptions";
import { LoadedImage, ImageManager } from "./index";
import { Globals } from "./Globals";

export class Sprite extends Entity implements IDrawable {
  readonly type = EntityType.sprite;
  isDrawable = true;
  // Drawable options
  anchorPoint = new Point(0.5, 0.5);
  zPosition = 0;
  // Sprite options
  private _imageName = ""; // public getter/setter is below

  private loadedImage?: LoadedImage;

  /**
   * Visual image displayed on the screen.
   *
   * @remarks Sprites must be loaded during the Game.init() method prior to their use.
   *
   * @param options
   */
  constructor(options: SpriteOptions = {}) {
    super(options);
    handleInterfaceOptions(this, options);
    if (options.imageName) {
      this.imageName = options.imageName;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  override initialize(): void {}

  set imageName(imageName: string) {
    if (!Object.keys(ImageManager._loadedImages).includes(imageName)) {
      throw new Error(`an image with name ${imageName} has not been loaded`);
    }
    this._imageName = imageName;
    this.loadedImage = ImageManager._loadedImages[this.imageName];
    this.size.width = this.loadedImage.width;
    this.size.height = this.loadedImage.height;
  }

  get imageName(): string {
    return this._imageName;
  }

  update(): void {
    super.update();
  }

  draw(canvas: Canvas): void {
    if (!this.hidden) {
      if (this.loadedImage) {
        canvas.save();
        const drawScale = Globals.canvasScale / this.absoluteScale;
        canvas.scale(1 / drawScale, 1 / drawScale);

        const x =
          (this.absolutePosition.x -
            this.size.width * this.anchorPoint.x * this.absoluteScale) *
          drawScale;
        const y =
          (this.absolutePosition.y -
            this.size.height * this.anchorPoint.y * this.absoluteScale) *
          drawScale;

        canvas.drawImage(this.loadedImage.image, x, y);
        canvas.restore();
      }

      super.drawChildren(canvas);
    }
  }
}
