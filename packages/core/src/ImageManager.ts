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
  loadedImages = new LoadedImages();
  private _scratchCanvas?: HTMLCanvasElement;
  private ctx?: CanvasRenderingContext2D;
  private scale?: number;

  /**
   * Returns a CanvasKit Image that was previously rendered by the ImageManager.
   *
   * @remarks Typically, this won't be called directly because a programmer
   * will use a higher-level abstraction (m2c2kit Sprite).
   *
   * @param gameUuid - The game that the image resource is part of
   * @param imageName - The name given to the rendered image
   * @returns A CanvasKit Image
   */
  getLoadedImage(gameUuid: string, imageName: string): LoadedImage {
    return this.loadedImages[gameUuid][imageName];
  }

  /**
   * Adds a CanvasKit Image to the images available to a given game.
   *
   * @remarks Typically, a programmer won't call this because images will be
   * automatically rendered and loaded in the Activity async init.
   * The only time this function is called in-game is when our internal
   * methods add screenshot images needed for transitions.
   *
   * @param loadedImage - An image that has been converted to a CanvasKit Image
   * @param gameUuid - The game that the Image is part of
   */
  addLoadedImage(loadedImage: LoadedImage, gameUuid: string): void {
    /**
     *  If no images were rendered and loaded during Activity init
     *  (or if we're running Jest tests and we skip all that), then
     *  then this.loadedImages[gameUuid] is undefined. Make an empty
     *  object so it can hold images.
     */
    if (!this.loadedImages[gameUuid]) {
      this.loadedImages[gameUuid] = {};
    }
    this.loadedImages[gameUuid][loadedImage.name] = loadedImage;
  }

  /**
   * Renders game images from their original format (png, jpg, svg) to
   * CanvasKit Image.
   *
   * @remarks Typically, a programmer won't call this because the Session
   * object will manage this. Rendering is an async activity, and thus
   * this method returns a promise. Rendering of all images is done in
   * parallel.
   *
   * @param allGamesImages - An array of GameImages data structures that
   * specify the image's desired size, it's name, and where the image to be
   * rendered is located (e.g., embedded svgString or url)
   * @returns A promise that completes when all game images have rendered
   */
  renderImages(allGamesImages: Array<GameImages>): Promise<void[]> {
    const renderImagesPromises = new Array<Promise<void>>();
    allGamesImages.forEach((gameImages) => {
      if (gameImages.images) {
        const findDuplicates = (arr: string[]) =>
          arr.filter((item, index) => arr.indexOf(item) != index);
        const duplicateImageNames = findDuplicates(
          gameImages.images.map((i) => i.imageName)
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

  /**
   * Adds all rendered CanvasKit Images to the images available to m2c2kit.
   *
   * @remarks Typically, a programmer won't call this because the Session
   * object will manage this.
   */
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

  /**
   * Our private method rendering an image to a CanvasKit Image
   *
   * @remarks This is complex because there is a separate flow to render
   * svg images versus other (e.g., jpg, png). Svg images may be provided
   * in a url or inline. In addition, there is a Firefox svg rendering issue,
   * see below, that must be handled.
   * Additional complexity comes from the potentially multiple async steps and
   * the multiple errors that can happen throughout.
   *
   * @param gameUuid
   * @param browserImage
   * @returns A promise of type void
   */
  private renderBrowserImage(
    gameUuid: string,
    browserImage: BrowserImage
  ): Promise<void> {
    const image = document.createElement("img");

    const renderLoadedImage = () => {
      if (!this.scratchCanvas || !this.ctx || !this.scale) {
        throw new Error("image manager not set up");
      }

      this.scratchCanvas.width = browserImage.width * this.scale;
      this.scratchCanvas.height = browserImage.height * this.scale;
      this.ctx.scale(this.scale, this.scale);
      this.ctx.clearRect(0, 0, browserImage.width, browserImage.height);
      this.ctx.drawImage(image, 0, 0, browserImage.width, browserImage.height);
      const dataUrl = this.scratchCanvas.toDataURL();

      const renderedImage = new RenderedDataUrlImage(
        browserImage.imageName,
        dataUrl,
        browserImage.width,
        browserImage.height
      );
      image.remove();

      if (!this.renderedImages[gameUuid]) {
        this.renderedImages[gameUuid] = {};
      }
      this.renderedImages[gameUuid][browserImage.imageName] = renderedImage;
    };

    const onError = () => {
      let additional = "";
      if (browserImage.svgString) {
        additional = " image source was svgString";
      } else if (browserImage.url) {
        additional = ` image source was url ${browserImage.url}`;
      }
      console.warn(
        `unable to render image named ${browserImage.imageName}.${additional}`
      );
      const renderedImage = new RenderedDataUrlImage(
        browserImage.imageName,
        "",
        0,
        0
      );
      if (!this.renderedImages[gameUuid]) {
        this.renderedImages[gameUuid] = {};
      }
      this.renderedImages[gameUuid][browserImage.imageName] = renderedImage;
    };

    return new Promise((resolve) => {
      image.width = browserImage.width;
      image.height = browserImage.height;
      image.crossOrigin = "Anonymous";
      image.onload = () => {
        /**
         * Firefox has an issue such that svg images without height and width
         * attributes will not render.
         * see https://bugzilla.mozilla.org/show_bug.cgi?id=700533.
         * This seems to be deliberate behavior, see
         * https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/SVG_Image_Tag
         * where it states, "If you do not set the height or width attributes,
         * they will be set to 0. Having a height or width attribute of 0 will
         * disable rendering of the image."
         *
         * In any case, it is not uncommon to encounter valid svgs that do not
         * have height and width attributes.
         *
         * To mitigate this, once an image is loaded by the native webview,
         * check if the image was an svg. If it is an svg, then check the
         * image's naturalHeight and naturalWidth properties, which appear to
         * be assigned 0 when Firefox encounters an svg without height/width.
         * On Chrome, however, this is not the case (naturalHeight and
         * naturalWidth are non-zero). On Firefox, the solution is as follows.
         * Get the viewBox from the svg, which should contain the width and
         * height in the 2nd and 3rd index position. If the svg was loaded
         * from an svg string, add width/height attributes to the svg string
         * and reload the img from this modified svg string.
         * If the svg was loaded from a url, first fetch the url as string,
         * then follow the same steps as if it were loaded from string.
         */
        let isSvg = false;
        if (
          image.src.startsWith("data:image/svg+xml") ||
          image.src.toLowerCase().endsWith("svg")
        ) {
          isSvg = true;
        }

        if (isSvg && (image.naturalHeight === 0 || image.naturalWidth === 0)) {
          let imageSource: string;
          if (image.src.startsWith("data:image/svg+xml")) {
            imageSource = "svg string";
          } else {
            imageSource = image.src;
          }
          console.warn(
            `svg image named ${browserImage.imageName} loaded from ${imageSource} has naturalHeight 0 and/or naturalWidth 0. This is probably because the svg is missing height and width attributes. This will cause the svg not to render on Firefox, due to issue described at https://bugzilla.mozilla.org/show_bug.cgi?id=700533. m2c2kit will attempt to infer the height and width from the svg viewBox, but it is strongly recommended that all svg images have height and width attributes.`
          );

          const reloadImageUsingViewBoxWidthHeight = (
            svgElement: HTMLElement
          ): void => {
            const viewBoxError = (): void => {
              console.warn(
                `svg image named ${browserImage.imageName} has missing or invalid viewBox; unable to render.`
              );
              renderLoadedImage();
              resolve();
            };

            if (svgElement.hasAttribute("viewBox")) {
              const viewBox = svgElement.getAttribute("viewBox");
              if (viewBox) {
                const bounds = viewBox.split(" ");
                if (bounds.length === 4) {
                  svgElement.setAttribute("width", bounds[2]);
                  svgElement.setAttribute("height", bounds[3]);
                  image.onload = () => {
                    renderLoadedImage();
                    resolve();
                  };
                  image.src =
                    "data:image/svg+xml," +
                    encodeURIComponent(svgElement.outerHTML);
                } else {
                  viewBoxError();
                }
              } else {
                viewBoxError();
              }
            } else {
              viewBoxError();
            }
          };

          if (browserImage.svgString) {
            const svgElement = new DOMParser().parseFromString(
              browserImage.svgString,
              "text/xml"
            ).documentElement;
            reloadImageUsingViewBoxWidthHeight(svgElement);
          } else if (browserImage.url) {
            fetch(browserImage.url)
              .then((res) => res.text())
              .then((body) => {
                const svgElement = new DOMParser().parseFromString(
                  body,
                  "text/xml"
                ).documentElement;
                reloadImageUsingViewBoxWidthHeight(svgElement);
              });
          } else {
            // we should never get here, because either browserImage.svgString
            // or browserImage.url should be defined
            console.warn(
              `unable to render svg image named ${browserImage.imageName}.`
            );
            renderLoadedImage();
            resolve();
          }
        } else {
          if (image.naturalHeight === 0 || image.naturalWidth === 0) {
            // not an svg, but still 0 natural height or natural width
            console.warn(
              `image named ${browserImage.imageName} has naturalHeight 0 and/or naturalWidth 0. This may cause inaccurate rendering. Please check the image.`
            );
          }
          renderLoadedImage();
          resolve();
        }
      };

      image.onerror = () => {
        onError();
        resolve();
      };

      if (browserImage.svgString && browserImage.url) {
        throw new Error(
          `provide svgString or url. both were provided for image named ${browserImage.imageName}`
        );
      }
      if (browserImage.svgString) {
        image.src =
          "data:image/svg+xml," + encodeURIComponent(browserImage.svgString);
      } else if (browserImage.url) {
        /**
         * Originally, below was a single line: image.src = browserImage.url
         * This worked, but this prevented us from intercepting this image
         * request and modifying the url (we do this by patching the
         * fetch function in some use cases, such as in the playground).
         * So, now we fetch the image ourselves and set the image src
         * to the data url.
         */
        fetch(browserImage.url)
          .then((response) => response.arrayBuffer())
          .then((data) => {
            const base64String = btoa(
              String.fromCharCode(...new Uint8Array(data))
            );
            const subtype = this.inferImageSubtypeFromUrl(browserImage.url);
            image.src = "data:image/" + subtype + ";base64," + base64String;
          });
      } else {
        throw new Error(
          `no svgString or url provided for image named ${browserImage.imageName}`
        );
      }
    });
  }

  private inferImageSubtypeFromUrl(url?: string) {
    // default to jpeg if no extension
    let subtype = "jpeg";
    if (url?.includes(".")) {
      subtype = url.split(".").pop()?.toLowerCase() ?? "jpeg";
      if (subtype === "") {
        subtype = "jpeg";
      }
    }
    if (subtype === "svg") {
      subtype = "svg+xml";
    }
    return subtype;
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
        `could not create image with name "${loadedDataUrlImage.name}."`
      );
    }
    if (img === null) {
      throw new Error(
        `could not create image with name "${loadedDataUrlImage.name}."`
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
   * Returns the scratchCanvas, which is an extra, non-visible canvas in the
   * DOM we use so the native browser can render images like svg, png, jpg,
   * that we later will convert to CanvasKit Image.
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

  removeScratchCanvas(): void {
    this.ctx = undefined;
    this._scratchCanvas?.remove();
  }
}
