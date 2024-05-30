import { Image } from "canvaskit-wasm";
/**
 * An image that has been loaded into the game.
 *
 * @remarks An M2Image is a wrapper around a CanvasKit Image, with some
 * additional properties.
 */
export interface M2Image {
  /** Name of the image, as it will be referred to when creating a sprite. */
  imageName: string;
  /** The image in CanvasKit format. */
  canvaskitImage: Image | undefined;
  width: number;
  height: number;
  /** Status of the image: Deferred, Loading, Ready, or Error. */
  status: M2ImageStatus;
  /** For an image that will be fetched, this is the URL that will be attempted. This may have localization applied. */
  url?: string;
  /** Is this image a fallback localized image? */
  isFallback: boolean;
  /** For an image that will be fetched, the original URL before any localization. */
  originalUrl?: string;
  /** For a localized image that will be fetched, additional URLs to try if the URL in `url` fails. */
  fallbackLocalizationUrls?: Array<string>;
  /** An image defined by an SVG string. */
  svgString?: string;
  /** Try to localize the image by fetching a locale-specific image? Default is false. */
  localize: boolean;
}

export const M2ImageStatus = {
  /** Image was set for lazy loading, and loading has not yet been requested. */
  Deferred: "Deferred",
  /** Image is in the process of loading (fetching, rendering, and conversion to CanvasKit Image). */
  Loading: "Loading",
  /** Image has fully finished loading and is ready to use. */
  Ready: "Ready",
  /** Error occurred in loading. */
  Error: "Error",
} as const;

export type M2ImageStatus = (typeof M2ImageStatus)[keyof typeof M2ImageStatus];
