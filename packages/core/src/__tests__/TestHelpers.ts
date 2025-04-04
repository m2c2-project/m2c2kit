import { Game } from "..";
import { jest } from "@jest/globals";
import { CanvasKit } from "canvaskit-wasm";
import { DomHelper } from "@m2c2kit/session";

export class TestHelpers {
  static setupDomAndGlobals(): void {
    const html = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body class="m2c2kit-background-color m2c2kit-no-margin">
      <div id="m2c2kit">
      </div>
    </body>
    </html>`;
    document.documentElement.innerHTML = html;
    const root = document.getElementById("m2c2kit");
    if (!root) {
      throw new Error(`root element not found`);
    }
    DomHelper.createRoot(root);

    Object.defineProperty(window, "performance", {
      value: TestHelpers.performance,
    });

    /**
     * Default window size when using jsdom is 1024w x 768h, but this will
     * cause m2c2kit to resize the absolute size of nodes, which
     * complicates our tests (which are using 400w x 800h). So make the
     * window tall enough to fit our typical 400w x 800h game.
     */

    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1000,
    });

    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 1200,
    });

    /**
     * node-canvas (the npm "canvas" package) is no longer a dependency, so
     * the getContext method will throw an error. This is caught, but it
     * generates lots of console messages. The result of getContext is not
     * used in the tests, so mock it to return null and avoid these
     * distracting errors.
     */
    jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  }

  static perfCounter = 0;
  static requestedFrames = 0;
  static maxRequestedFrames = 0;
  static FRAME_DURATION_MS = 16.66666666666667;

  static expectValueToBeWithinTolerance(
    value: number,
    expected: number,
    tolerance: number,
  ) {
    expect(value).toBeGreaterThanOrEqual(expected - tolerance);
    expect(value).toBeLessThanOrEqual(expected + tolerance);
  }

  static performance = {
    now: () => this.perfCounter,
  };

  static sleep = (ms: number) => (this.perfCounter = this.perfCounter + ms);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static createM2c2KitMock(): any {
    const skiaCanvas = {
      save: () => undefined,
      scale: () => undefined,
      drawImage: () => undefined,
      drawCircle: () => undefined,
      drawRect: () => undefined,
      drawRRect: () => undefined,
      restore: () => undefined,
      drawText: () => undefined,
      rotate: () => undefined,
    };

    const requestAnimationFrame = (callback: (canvas: object) => void) => {
      this.perfCounter = this.perfCounter + this.FRAME_DURATION_MS;
      if (TestHelpers.requestedFrames < TestHelpers.maxRequestedFrames) {
        TestHelpers.requestedFrames++;
        callback(skiaCanvas);
      }
      return undefined;
    };

    Game.prototype.loadCanvasKit = jest.fn().mockReturnValue(
      Promise.resolve({
        PaintStyle: {
          Fill: undefined,
        },
        MakeCanvasSurface: () => {
          return {
            reportBackendTypeIsGPU: () => true,
            getCanvas: () => {
              return skiaCanvas;
            },
            makeImageSnapshot: () => {
              return {
                delete: () => undefined,
              };
            },
            requestAnimationFrame: (callback: (canvas: object) => void) => {
              return requestAnimationFrame(callback);
            },
            width: () => {
              return NaN;
            },
            height: () => {
              return NaN;
            },
          };
        },
        MakeWebGLCanvasSurface: () => {
          return {
            reportBackendTypeIsGPU: () => true,
            getCanvas: () => {
              return skiaCanvas;
            },
            makeImageSnapshot: () => {
              return {
                delete: () => undefined,
              };
            },
            requestAnimationFrame: (callback: (canvas: object) => void) => {
              return requestAnimationFrame(callback);
            },
            width: () => {
              return NaN;
            },
            height: () => {
              return NaN;
            },
          };
        },
        Font: function () {
          return {
            delete: () => undefined,
            isDeleted: () => undefined,
          };
        },
        Paint: function () {
          return {
            setColor: () => undefined,
            setAntiAlias: () => undefined,
            setStyle: () => undefined,
            setStrokeWidth: () => undefined,
            delete: () => undefined,
            isDeleted: () => undefined,
            setAlphaf: () => undefined,
          };
        },
        Color: function () {
          return {};
        },
        LTRBRect: function () {
          return {};
        },
        RRectXY: function () {
          return {};
        },
        TextAlign: {
          Center: undefined,
          Left: undefined,
          Right: undefined,
        },
        TypefaceFontProvider: {
          Make: () => undefined,
          registerFont: () => undefined,
        },
      }),
    ) as (canvasKitWasmUrl: string) => Promise<CanvasKit>;
  }
}
