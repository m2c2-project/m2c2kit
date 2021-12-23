import "./Globals";
import { CanvasKit, Image } from "canvaskit-wasm";
import { LoadedImage } from "./LoadedImage";
import { RenderedDataUrlImage } from "./RenderedDataUrlImage";
import { SvgImage } from "./SvgImage";

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
  renderedImages = new RenderedImages();
  loadedImages = new LoadedImages();
  canvasKit?: CanvasKit;
  // scratchCanvas is an extra, non-visible canvas in the DOM we use so the native browser can render SVGs.
  private scratchCanvas?: HTMLCanvasElement;
  private ctx?: CanvasRenderingContext2D;
  private scale?: number;

  getLoadedImage(gameUuid: string, imageName: string): LoadedImage {
    return this.loadedImages[gameUuid][imageName];
  }

  initialize(scratchCanvas: HTMLCanvasElement): void {
    this.scratchCanvas = scratchCanvas;
    const context2d = this.scratchCanvas.getContext("2d");
    if (context2d === null) {
      throw new Error("could not get 2d canvas context from scratch canvas");
    }
    this.ctx = context2d;
    this.scale = window.devicePixelRatio;
  }

  renderSvgImage(gameUuid: string, svgImage: SvgImage): Promise<void> {
    const image = document.createElement("img");
    return new Promise((resolve) => {
      image.width = svgImage.width;
      image.height = svgImage.height;
      image.onload = () => {
        if (!this.scratchCanvas || !this.ctx || !this.scale) {
          throw new Error("image manager not set up");
        }

        this.scratchCanvas.width = svgImage.width * this.scale;
        this.scratchCanvas.height = svgImage.height * this.scale;
        this.ctx.scale(this.scale, this.scale);
        this.ctx.clearRect(0, 0, svgImage.width, svgImage.height);
        this.ctx.drawImage(image, 0, 0, svgImage.width, svgImage.height);
        const dataUrl = this.scratchCanvas.toDataURL();

        const renderedImage = new RenderedDataUrlImage(
          svgImage.name,
          dataUrl,
          svgImage.width,
          svgImage.height
        );
        image.remove();

        if (!this.renderedImages[gameUuid]) {
          this.renderedImages[gameUuid] = {};
        }
        this.renderedImages[gameUuid][svgImage.name] = renderedImage;
        resolve();
      };
      image.onerror = () => {
        const renderedImage = new RenderedDataUrlImage(svgImage.name, "", 0, 0);
        if (!this.renderedImages[gameUuid]) {
          this.renderedImages[gameUuid] = {};
        }
        this.renderedImages[gameUuid][svgImage.name] = renderedImage;
        resolve();
      };

      if (svgImage.svgString && svgImage.url) {
        throw new Error("provide svg string or url. both were provided");
      }
      if (svgImage.svgString) {
        image.src =
          "data:image/svg+xml," + encodeURIComponent(svgImage.svgString);
      } else if (svgImage.url) {
        image.src = svgImage.url;
      } else {
        throw new Error("no svg string or url provided");
      }
    });
  }

  LoadRenderedImages(): void {
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
        this.loadedImages[gameUuid][imageName] = loadedImage;
      });
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
