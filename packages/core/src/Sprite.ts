import "./Globals";
import { Canvas } from "canvaskit-wasm";
import { IDrawable } from "./IDrawable";
import { Entity, handleInterfaceOptions } from "./Entity";
import { EntityType } from "./EntityType";
import { Point } from "./Point";
import { SpriteOptions } from "./SpriteOptions";
import { LoadedImage } from "./LoadedImage";
import { Scene } from ".";

export class Sprite extends Entity implements IDrawable, SpriteOptions {
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
   * @param options - {@link SpriteOptions}
   */
  constructor(options: SpriteOptions = {}) {
    super(options);
    handleInterfaceOptions(this, options);
    if (options.imageName) {
      this.imageName = options.imageName;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  override initialize(): void {
    const imageManager = (this.parentSceneAsEntity as unknown as Scene).game
      .imageManager;
    if (!Object.keys(imageManager._loadedImages).includes(this._imageName)) {
      throw new Error(
        `an image with name ${this._imageName} has not been loaded`
      );
    }
    this.loadedImage = imageManager._loadedImages[this.imageName];
    this.size.width = this.loadedImage.width;
    this.size.height = this.loadedImage.height;
  }

  set imageName(imageName: string) {
    this._imageName = imageName;
    this.needsInitialization = true;
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
