import { Image } from "canvaskit-wasm";
/**
 * An image that has been loaded into the game.
 *
 * @remarks An M2Image is a wrapper around a CanvasKit Image, with some
 * additional properties.
 */
export interface M2Image {
  imageName: string;
  canvaskitImage: Image | undefined;
  width: number;
  height: number;
  status: M2ImageStatus;
  url?: string;
  svgString?: string;
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
