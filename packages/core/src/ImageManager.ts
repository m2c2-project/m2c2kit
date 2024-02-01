import "./Globals";
import { CanvasKit } from "canvaskit-wasm";
import { M2Image, M2ImageStatus } from "./M2Image";
import { BrowserImage } from "./BrowserImage";
import { Game } from "./Game";
import { Sprite } from "./Sprite";
/**
 * Fetches, loads, and provides images to the game.
 */
export class ImageManager {
  images: Record<string, M2Image> = {};
  private canvasKit: CanvasKit;
  private _scratchCanvas?: HTMLCanvasElement;
  private ctx?: CanvasRenderingContext2D;
  private scale?: number;
  private game: Game;

  constructor(game: Game) {
    this.game = game;
    this.canvasKit = game.canvasKit;
  }

  /**
   * Loads image assets and makes them ready to use during the game initialization.
   *
   * @internal For m2c2kit library use only
   *
   * @remarks Typically, a user won't call this because the m2c2kit
   * framework will call this automatically.
   *
   * @param browserImages - array of BrowserImage objects
   * @returns A promise that completes when all images have loaded
   */
  async initializeImages(
    browserImages: Array<BrowserImage> | undefined,
  ): Promise<void> {
    await this.loadImages(browserImages ?? []);
    //this.removeScratchCanvas();
  }

  /**
   * Loads an array of images and makes them ready for the game.
   *
   * @remarks Using the browser's image rendering, this method converts the
   * images (png, jpg, svg, or svg string) into m2c2kit images ({@link M2Image}).
   * Rendering is an async activity, and thus this method returns a promise.
   * Rendering of all images is done in parallel.
   *
   * @param browserImages - an array of {@link BrowserImage}
   * @returns A promise that completes when all images have loaded
   */
  async loadImages(browserImages: Array<BrowserImage>) {
    if (browserImages.length === 0) {
      return;
    }
    this.checkImageNamesForDuplicates(browserImages);

    const renderImagesPromises = browserImages.map((browserImage) => {
      const m2Image: M2Image = {
        imageName: browserImage.imageName,
        url: browserImage.url,
        svgString: browserImage.svgString,
        canvaskitImage: undefined,
        width: browserImage.width,
        height: browserImage.height,
        status: browserImage.lazy
          ? M2ImageStatus.Deferred
          : M2ImageStatus.Loading,
      };
      this.images[browserImage.imageName] = m2Image;
      if (m2Image.status === M2ImageStatus.Loading) {
        return this.renderM2Image(m2Image);
      }
      return Promise.resolve();
    });
    await Promise.all(renderImagesPromises);
  }

  private checkImageNamesForDuplicates(browserImages: BrowserImage[]) {
    const findDuplicates = (arr: string[]) =>
      arr.filter((item, index) => arr.indexOf(item) != index);
    const duplicateImageNames = findDuplicates(
      browserImages.map((i) => i.imageName),
    );
    if (duplicateImageNames.length > 0) {
      throw new Error(
        `image names must be unique. these image names are duplicated within a game ${this.game.id}: ` +
          duplicateImageNames.join(", "),
      );
    }
  }

  /**
   * Makes ready to the game a m2c2kit image ({@link M2Image}) that was
   * previously loaded, but whose browser rendering was deferred.
   *
   * @internal For m2c2kit library use only
   *
   * @param image - name of the image to render and make ready
   * @returns A promise that completes when the image is ready
   */
  prepareDeferredImage(image: M2Image): Promise<void> {
    image.status = M2ImageStatus.Loading;
    return this.renderM2Image(image);
  }

  /**
   * Uses the browser to render an image to a CanvasKit Image and make it
   * ready to the game as an M2Image.
   *
   * @remarks This is complex because we rely on the browser's rendering
   * and HTML image element processing. This involves a number of steps,
   * including events, callbacks, and error handling. In addition, there
   * are two types of images to be rendered: 1) url to an image (e.g., jpg,
   * png, svg), and 2) svg string.
   *
   * @param m2Image The image to render
   * @returns A promise of type void that resolves when the image has been
   * rendered
   */
  private renderM2Image(m2Image: M2Image): Promise<void> {
    const imgElement = document.createElement("img");
    const renderAfterBrowserLoad = (
      resolve: (value: void | PromiseLike<void>) => void,
    ) => {
      if (!this.scratchCanvas || !this.ctx || !this.scale) {
        throw new Error("image manager not set up");
      }

      this.scratchCanvas.width = m2Image.width * this.scale;
      this.scratchCanvas.height = m2Image.height * this.scale;
      this.ctx.scale(this.scale, this.scale);
      this.ctx.clearRect(0, 0, m2Image.width, m2Image.height);
      this.ctx.drawImage(imgElement, 0, 0, m2Image.width, m2Image.height);

      // // commented code does the same as below this.scratchCanvas.toBlob(),
      // // but uses canvaskit methods, which are faster.
      // // TODO: explore which approach is better.
      // const canvaskitImage = this.canvasKit.MakeImageFromCanvasImageSource(this.scratchCanvas);
      // console.log(
      //   `image loaded. name: ${m2Image.imageName}, w: ${m2Image.width}, h: ${m2Image.height}`,
      // );
      // this.images[m2Image.imageName].canvaskitImage = canvaskitImage;
      // this.images[m2Image.imageName].status = M2ImageStatus.Ready;
      // const sprites = this.game.entities.filter(
      //   (e) => e.type === "Sprite",
      // ) as Sprite[];
      // sprites.forEach((sprite) => {
      //   if (sprite.imageName === m2Image.imageName) {
      //     sprite.needsInitialization = true;
      //   }
      // });
      // resolve();

      this.scratchCanvas.toBlob((blob) => {
        if (!blob) {
          throw new Error("blob is undefined");
        }
        blob.arrayBuffer().then((buffer) => {
          const canvaskitImage = this.canvasKit.MakeImageFromEncoded(buffer);
          if (!canvaskitImage) {
            throw new Error(
              `could not create image with name "${m2Image.imageName}."`,
            );
          }
          console.log(
            `image loaded. name: ${m2Image.imageName}, w: ${m2Image.width}, h: ${m2Image.height}`,
          );
          this.images[m2Image.imageName].canvaskitImage = canvaskitImage;
          this.images[m2Image.imageName].status = M2ImageStatus.Ready;
          const sprites = this.game.entities.filter(
            (e) => e.type === "Sprite",
          ) as Sprite[];
          sprites.forEach((sprite) => {
            if (sprite.imageName === m2Image.imageName) {
              sprite.needsInitialization = true;
            }
          });
          resolve();
        });
      });
    };

    return new Promise((resolve, reject) => {
      imgElement.width = m2Image.width;
      imgElement.height = m2Image.height;
      imgElement.crossOrigin = "Anonymous";
      imgElement.onerror = () => {
        reject(
          new Error(
            `unable to render image named ${m2Image.imageName}. image source was ${m2Image.svgString ? "svgString" : `url: ${m2Image.url}`}`,
          ),
        );
      };
      imgElement.onload = () => {
        /**
         * TODO: Add some warnings (or throw error?) if the SVG does not have
         * height/width or a viewBox. see prior versions of this code for some
         * of the logic. A SVG, either a svgString or a url pointing to an SVG,
         * without height/width or a viewBox will not display properly -- it
         * will not be resized to the correct size.
         */
        renderAfterBrowserLoad(resolve);
      };

      if (!m2Image.svgString && !m2Image.url) {
        throw new Error(
          `no svgString or url provided for image named ${m2Image.imageName}`,
        );
      }
      if (m2Image.svgString && m2Image.url) {
        throw new Error(
          `provide svgString or url. both were provided for image named ${m2Image.imageName}`,
        );
      }
      if (m2Image.svgString) {
        imgElement.src =
          "data:image/svg+xml," + encodeURIComponent(m2Image.svgString);
      } else if (m2Image.url) {
        const browserImageUrl = this.game.prependAssetsGameIdUrl(m2Image.url);
        /**
         * Originally, below was a single line: image.src = browserImageUrl
         * This worked, but this prevented us from intercepting this image
         * request and modifying the url (we do this by patching the
         * fetch function in some use cases, such as in the playground).
         * So, now we fetch the image ourselves and set the image src
         * to a constructed data url.
         */
        fetch(browserImageUrl)
          .then((response) => response.arrayBuffer())
          .then((data) => {
            this.arrayBufferToBase64Async(data).then((base64String) => {
              const subtype = this.inferImageSubtypeFromUrl(m2Image.url);
              imgElement.src =
                "data:image/" + subtype + ";base64," + base64String;
            });
          });
      }
    });
  }

  private arrayBufferToBase64Async(buffer: ArrayBuffer): Promise<string> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        resolve(fileReader.result?.toString().split(",")[1] ?? "");
      };
      fileReader.onerror = reject;
      fileReader.readAsDataURL(new Blob([buffer]));
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

  /**
   * Returns a m2c2kit image ({@link M2Image}) that has been loaded by the ImageManager.
   *
   * @internal For m2c2kit library use only
   *
   * @remarks Typically, a user won't call this because they use a higher-level
   * abstraction (m2c2kit Sprite).
   *
   * @param imageName - The name given to the previously rendered image
   * @returns A m2c2kit image
   */
  getImage(imageName: string): M2Image {
    return this.images[imageName];
  }

  /**
   * Adds a m2c2kit image ({@link M2Image}) to the images ready for the game.
   *
   * @internal For m2c2kit library use only
   *
   * @remarks Typically, a programmer won't call this because images will be
   * automatically rendered and loaded in initializeImages().
   * One reason this function is called in-game is when the game takes
   * a screenshot and adds it as an outgoing image for transitions.
   *
   * @param image - A m2c2kit image
   */
  addImage(image: M2Image): void {
    this.images[image.imageName] = image;
  }

  /**
   * Returns the scratchCanvas, which is an extra, non-visible canvas in the
   * DOM we use so the native browser can render images like svg, png, jpg,
   * that we later will convert to CanvasKit Image.
   */
  private get scratchCanvas(): HTMLCanvasElement {
    if (!this._scratchCanvas) {
      this._scratchCanvas = document.createElement("canvas");
      // use a random number in the id to avoid collisions
      this._scratchCanvas.id = `m2c2kit-scratch-canvas-${
        this.game.id
      }-${Math.floor(Math.random() * 1000000)}`;
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

  private removeScratchCanvas(): void {
    this.ctx = undefined;
    this._scratchCanvas?.remove();
  }
}
