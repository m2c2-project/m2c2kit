export interface PendingScreenshot {
  rect: [] | [number, number, number, number];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  promiseResolve: any;
}
