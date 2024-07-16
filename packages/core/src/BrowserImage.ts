/**
 * Image that can be rendered by a browser from a URL or from a
 * HTML svg tag in string form. Provide either url or svgString, not both.
 */
export interface BrowserImage {
  /** Name that will be used to refer to the image. Must be unique among all
   * images within a game */
  imageName: string;
  /** Width to scale image to */
  width: number;
  /** Height to scale image to */
  height: number;
  /** The HTML SVG tag, in string form, that will be rendered and loaded.
   * Must begin with &#60;svg> and end with &#60;/svg> */
  svgString?: string;
  /** URL of image asset (svg, png, jpg) to render and load */
  url?: string;
  /** Image asset as a Data URL. @internal For m2c2kit library use only */
  dataUrl?: string;
  /** If true, the image will not be fully loaded until it is needed. Default
   * is false. Lazy loading is useful for large "banks" of images. These should
   * be lazy loaded because they may not be needed. */
  lazy?: boolean;
  /** If true, try to use a localized version of the image. Localized images
   * are loaded on demand and are not preloaded. Only an image whose asset
   * is provided as a URL can be localized. Default is false. */
  localize?: boolean;
}
