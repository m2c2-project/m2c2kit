import { findUpSync } from "find-up";
import { Constants } from "./constants";

export function getCanvasKitWasmPath(): string | undefined {
  return findUpSync(Constants.CANVASKITWASM_PATH);
}
