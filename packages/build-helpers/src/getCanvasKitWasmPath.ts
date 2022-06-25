import findupSync from "findup-sync";
import { Constants } from "./constants";

export function getCanvasKitWasmPath(): string | null {
  return findupSync(Constants.NODE_MODULES_CANVASKITWASM_PATH);
}
