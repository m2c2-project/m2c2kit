// Importing CanvasKitInit from the canvaskit-wasm package does not work as expected.
// This fixes it.
// adapted from https://github.com/chengluyu/canvaskit-editor/blob/main/src/canvaskit.ts

import * as all from "canvaskit-wasm";
import { CanvasKit } from "canvaskit-wasm";
export * from "canvaskit-wasm";

type CorrectModule = {
  default: typeof all.CanvasKitInit;
};

const initialize = (all as unknown as CorrectModule).default;

export function CanvasKitInit(): Promise<CanvasKit> {
  return initialize({ locateFile: (file) => file });
}
