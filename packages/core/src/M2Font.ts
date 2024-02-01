import { Typeface } from "canvaskit-wasm";

export interface M2Font {
  fontName: string;
  typeface: Typeface | undefined;
  data: ArrayBuffer | undefined;
  url: string;
  status: M2FontStatus;
  default: boolean;
}

export const M2FontStatus = {
  /** Font was set for lazy loading, and loading has not yet been requested. */
  Deferred: "Deferred",
  /** Font is in the process of loading. */
  Loading: "Loading",
  /** Font has fully finished loading and is ready to use. */
  Ready: "Ready",
  /** Error occurred in loading. */
  Error: "Error",
} as const;

export type M2FontStatus = (typeof M2FontStatus)[keyof typeof M2FontStatus];
