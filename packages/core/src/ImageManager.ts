import { Globals } from "./Globals";
import { Image } from "canvaskit-wasm";
import { LoadedImage } from "./LoadedImage";
import { RenderedDataUrlImage } from "./RenderedDataUrlImage";
import { SvgImage } from "./SvgImage";

export class ImageManager {
  // scratchCanvas is an extra, non-visible canvas in the DOM we use so the native browser can render SVGs.
  private static scratchCanvas: HTMLCanvasElement;
  private static ctx: CanvasRenderingContext2D;
  private static scale: number;
  static _renderedDataUrlImages: Record<string, RenderedDataUrlImage> = {};
  static _loadedImages: Record<string, LoadedImage> = {};

  static initialize(scratchCanvas: HTMLCanvasElement): void {
    this.scratchCanvas = scratchCanvas;
    const context2d = ImageManager.scratchCanvas.getContext("2d");
    if (context2d === null) {
      throw new Error("could not get 2d canvas context from scratch canvas");
    }
    this.ctx = context2d;
    this.scale = window.devicePixelRatio;
  }

  static renderSvgImage(svgImage: SvgImage): Promise<RenderedDataUrlImage> {
    const image = document.createElement("img");
    return new Promise((resolve) => {
      image.width = svgImage.width;
      image.height = svgImage.height;
      image.onload = () => {
        ImageManager.scratchCanvas.width = svgImage.width * ImageManager.scale;
        ImageManager.scratchCanvas.height =
          svgImage.height * ImageManager.scale;
        ImageManager.ctx.scale(ImageManager.scale, ImageManager.scale);
        ImageManager.ctx.clearRect(0, 0, svgImage.width, svgImage.height);
        ImageManager.ctx.drawImage(
          image,
          0,
          0,
          svgImage.width,
          svgImage.height
        );
        const dataUrl = ImageManager.scratchCanvas.toDataURL();
        this._renderedDataUrlImages[svgImage.name] = new RenderedDataUrlImage(
          svgImage.name,
          dataUrl,
          svgImage.width,
          svgImage.height
        );
        image.remove();
        resolve(this._renderedDataUrlImages[svgImage.name]);
      };
      image.onerror = () => {
        this._renderedDataUrlImages[svgImage.name] = new RenderedDataUrlImage(
          svgImage.name,
          "",
          0,
          0
        );
        resolve(this._renderedDataUrlImages[svgImage.name]);
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

  static LoadRenderedSvgImages(urls: RenderedDataUrlImage[]): void {
    urls.forEach((url) => ImageManager.convertRenderedDataUrlImage(url));
  }

  private static convertRenderedDataUrlImage(
    loadedDataUrlImage: RenderedDataUrlImage
  ): void {
    let img: Image | null = null;
    try {
      img = Globals.canvasKit.MakeImageFromEncoded(
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
    if (Object.keys(ImageManager._loadedImages).includes("name")) {
      throw new Error(
        `an image with name ${loadedDataUrlImage.name} was already loaded`
      );
    }
    ImageManager._loadedImages[loadedDataUrlImage.name] = loadedImage;
    console.log(
      `image loaded. name: ${loadedDataUrlImage.name}, w: ${loadedDataUrlImage.width}, h: ${loadedDataUrlImage.height}`
    );
  }

  private static dataURLtoArrayBuffer(dataUrl: string): ArrayBuffer {
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
