import "./Globals";
import { CanvasKit, Image } from "canvaskit-wasm";
import { LoadedImage } from "./LoadedImage";
import { RenderedDataUrlImage } from "./RenderedDataUrlImage";
import { BrowserImage } from "./BrowserImage";
import { GameImages } from "./GameImages";

class RenderedImages {
  [gameUuid: string]: {
    [name: string]: RenderedDataUrlImage;
  };
}

class LoadedImages {
  [gameUuid: string]: {
    [name: string]: LoadedImage;
  };
}

export class ImageManager {
  canvasKit?: CanvasKit;
  private renderedImages = new RenderedImages();
  private loadedImages = new LoadedImages();
  private _scratchCanvas?: HTMLCanvasElement;
  private ctx?: CanvasRenderingContext2D;
  private scale?: number;

  getLoadedImage(gameUuid: string, imageName: string): LoadedImage {
    return this.loadedImages[gameUuid][imageName];
  }

  /**
   * Adds a CanvasKit image to the images available to a given game.
   * Typically, this won't be called directly because images will be
   * automatically rendered and loaded in the Activity async init.
   * The only time this function is called in-game is to add
   * screenshot images needed for transitions
   *
   * @param loadedImage
   * @param gameUuid
   */
  addLoadedImage(loadedImage: LoadedImage, gameUuid: string): void {
    // If no images were rendered and loaded during Activity init
    // (or if we're running Jest tests and we skip all that), then
    // then this.loadedImages[gameUuid] is undefined. Make an empty
    // object so it can hold images
    if (!this.loadedImages[gameUuid]) {
      this.loadedImages[gameUuid] = {};
    }
    this.loadedImages[gameUuid][loadedImage.name] = loadedImage;
  }

  renderImages(allGamesImages: Array<GameImages>) {
    const renderImagesPromises = new Array<Promise<void>>();
    allGamesImages.forEach((gameImages) => {
      if (gameImages.images) {
        const findDuplicates = (arr: string[]) =>
          arr.filter((item, index) => arr.indexOf(item) != index);
        const duplicateImageNames = findDuplicates(
          gameImages.images.map((i) => i.name)
        );
        if (duplicateImageNames.length > 0) {
          throw new Error(
            "image names must be unique. these image names are duplicated within a game: " +
              duplicateImageNames.join(", ")
          );
        }
        gameImages.images.map((browserImage) => {
          renderImagesPromises.push(
            this.renderBrowserImage(gameImages.uuid, browserImage)
          );
        });
      }
    });
    return Promise.all(renderImagesPromises);
  }

  loadAllGamesRenderedImages(): void {
    const gameUuids = Object.keys(this.renderedImages);
    gameUuids.forEach((gameUuid) => {
      const imageNames = Object.keys(this.renderedImages[gameUuid]);
      imageNames.forEach((imageName) => {
        const loadedImage = this.convertRenderedDataUrlImageToCanvasKitImage(
          this.renderedImages[gameUuid][imageName]
        );
        if (!this.loadedImages[gameUuid]) {
          this.loadedImages[gameUuid] = {};
        }
        this.addLoadedImage(loadedImage, gameUuid);
      });
    });
  }

  private renderBrowserImage(
    gameUuid: string,
    browserImage: BrowserImage
  ): Promise<void> {
    const image = document.createElement("img");
    return new Promise((resolve) => {
      image.width = browserImage.width;
      image.height = browserImage.height;
      image.crossOrigin = "Anonymous";
      image.onload = () => {
        if (!this.scratchCanvas || !this.ctx || !this.scale) {
          throw new Error("image manager not set up");
        }

        this.scratchCanvas.width = browserImage.width * this.scale;
        this.scratchCanvas.height = browserImage.height * this.scale;
        this.ctx.scale(this.scale, this.scale);
        this.ctx.clearRect(0, 0, browserImage.width, browserImage.height);
        this.ctx.drawImage(
          image,
          0,
          0,
          browserImage.width,
          browserImage.height
        );
        const dataUrl = this.scratchCanvas.toDataURL();

        const renderedImage = new RenderedDataUrlImage(
          browserImage.name,
          dataUrl,
          browserImage.width,
          browserImage.height
        );
        image.remove();

        if (!this.renderedImages[gameUuid]) {
          this.renderedImages[gameUuid] = {};
        }
        this.renderedImages[gameUuid][browserImage.name] = renderedImage;
        resolve();
      };
      image.onerror = () => {
        const renderedImage = new RenderedDataUrlImage(
          browserImage.name,
          "",
          0,
          0
        );
        if (!this.renderedImages[gameUuid]) {
          this.renderedImages[gameUuid] = {};
        }
        this.renderedImages[gameUuid][browserImage.name] = renderedImage;
        resolve();
      };

      if (browserImage.svgString && browserImage.url) {
        throw new Error("provide svg string or url. both were provided");
      }
      if (browserImage.svgString) {
        image.src =
          "data:image/svg+xml," + encodeURIComponent(browserImage.svgString);
      } else if (browserImage.url) {
        image.src = browserImage.url;
      } else {
        throw new Error("no svg string or url provided");
      }
    });
  }

  private convertRenderedDataUrlImageToCanvasKitImage(
    loadedDataUrlImage: RenderedDataUrlImage
  ): LoadedImage {
    if (!this.canvasKit) {
      throw new Error("canvasKit undefined");
    }
    let img: Image | null = null;
    try {
      img = this.canvasKit.MakeImageFromEncoded(
        this.dataURLtoArrayBuffer(loadedDataUrlImage.dataUrlImage)
      );
    } catch {
      throw new Error(
        `could not create image with name "${loadedDataUrlImage.name}"`
      );
    }
    if (img === null) {
      throw new Error(
        `could not create image with name "${loadedDataUrlImage.name}"`
      );
    }
    const loadedImage = new LoadedImage(
      loadedDataUrlImage.name,
      img,
      loadedDataUrlImage.width,
      loadedDataUrlImage.height
    );
    console.log(
      `image loaded. name: ${loadedDataUrlImage.name}, w: ${loadedDataUrlImage.width}, h: ${loadedDataUrlImage.height}`
    );
    return loadedImage;
  }

  /**
   * scratchCanvas is an extra, non-visible canvas in the DOM we use so the native browser can render images
   */
  private get scratchCanvas(): HTMLCanvasElement {
    if (!this._scratchCanvas) {
      this._scratchCanvas = document.createElement("canvas");
      this._scratchCanvas.id = "m2c2kitscratchcanvas";
      this._scratchCanvas.hidden = true;
      document.body.appendChild(this._scratchCanvas);

      const context2d = this._scratchCanvas.getContext("2d");
      if (context2d === null) {
        throw new Error("could not get 2d canvas context from scratch canvas");
      }
      this.ctx = context2d;
      this.scale = window.devicePixelRatio;
    }
    return this._scratchCanvas;
  }

  private dataURLtoArrayBuffer(dataUrl: string): ArrayBuffer {
    const arr = dataUrl.split(",");
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return u8arr.buffer;
  }
}
