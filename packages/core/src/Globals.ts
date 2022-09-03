import { GlobalVariables } from "./GlobalVariables";

declare global {
  // eslint-disable-next-line no-var
  var Globals: GlobalVariables;
}

if (!window.globalThis) {
  console.log("shimming globalThis");
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.globalThis = window;
}

globalThis.Globals = new GlobalVariables();
export {};
