/**
 * SVG image to be rendered and loaded from a URL or HTML svg tag in string form.
 */

export interface SvgImage {
  /** Name that will be used to refer to the SVG image. Must be unique among all images */
  name: string;
  /** Width to scale SVG image to */
  width: number;
  /** Height to scale SVG image to */
  height: number;
  /** The HTML SVG tag, in string form, that will be rendered and loaded. Must begin with &#60;svg> and end with &#60;/svg> */
  svgString?: string;
  /** URL of SVG asset to render and load */
  url?: string;
}
