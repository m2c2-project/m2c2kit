declare global {
  // Must be var to be in the global scope
  // eslint-disable-next-line no-var
  var m2c2Globals: GlobalVariables;
}

export interface GlobalVariables {
  now: number;
  iso8601Now: string;
  deltaTime: number;
  canvasScale: number;
  /**
   * rootScale is the scaling factor to be applied to scenes to scale up or
   * down to fit the device's window while preserving the aspect ratio the
   * game was designed for
   */
  rootScale: number;
  canvasCssWidth: number;
  canvasCssHeight: number;
  /**
   * A dictionary of all `M2Node` classes that have been registered.
   * This is used to instantiate `M2Node` objects from their class name.
   *
   * @remarks The type should be `{ [key: string]: M2NodeConstructor }` or
   * `M2NodeClassRegistry`. But, this creates problems in Jest: I could not
   *  get ts-jest to compile when the type of a global variable is not a
   * simple type. Instead, the type of `m2NodeClassRegistry` is `object`,
   * and I will assert it to `M2NodeClassRegistry` when needed.
   */
  m2NodeClassRegistry: object;
  get eventSequence(): number;
  __sequence: number;
}

function initializeGlobalVariables() {
  globalThis.m2c2Globals = {
    now: performance.now(),
    iso8601Now: "",
    deltaTime: NaN,
    canvasScale: NaN,
    rootScale: 1.0,
    canvasCssWidth: NaN,
    canvasCssHeight: NaN,
    m2NodeClassRegistry: {},
    __sequence: 0,
    get eventSequence() {
      m2c2Globals.__sequence++;
      return m2c2Globals.__sequence - 1;
    },
  };
}

initializeGlobalVariables();
