/**
 * Image that can be rendered by a browser from a URL or from a
 * HTML svg tag in string form. Provide either url or svgString, not both.
 */
export interface BrowserImage {
  /** Name that will be used to refer to the image. Must be unique among all
   * images within a game */
  name: string;
  /** Width to scale image to */
  width: number;
  /** Height to scale image to */
  height: number;
  /** The HTML SVG tag, in string form, that will be rendered and loaded.
   * Must begin with &#60;svg> and end with &#60;/svg> */
  svgString?: string;
  /** URL of image asset (svg, png, jpg) to render and load */
  url?: string;
}
