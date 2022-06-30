import { findUpSync } from "find-up";
import { Constants } from "./constants";

export function getCanvasKitWasmPath(): string | undefined {
  return findUpSync(Constants.NODE_MODULES_CANVASKITWASM_PATH);
}
