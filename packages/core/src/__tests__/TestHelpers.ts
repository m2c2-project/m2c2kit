export class TestHelpers {
  static createM2c2KitMock(
    perfCounter: number,
    requestedFrames: number,
    maxRequestedFrames: number
  ): any {
    const skiaCanvas = {
      save: () => undefined,
      scale: () => undefined,
      drawRRect: () => undefined,
      restore: () => undefined,
      drawText: () => undefined,
    };

    const requestAnimationFrame = (callback: (canvas: object) => void) => {
      perfCounter = perfCounter + 16.66666666666667;
      if (requestedFrames < maxRequestedFrames) {
        requestedFrames++;
        callback(skiaCanvas);
      }
      return undefined;
    };

    const m2c2kit = jest.requireActual("../../build-umd");

    m2c2kit.Session.prototype.loadCanvasKit = jest.fn().mockReturnValue(
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
              return {};
            },
            requestAnimationFrame: (callback: (canvas: object) => void) => {
              return requestAnimationFrame(callback);
            },
          };
        },
        Font: function () {
          return {};
        },
        Paint: function () {
          return {
            setColor: () => undefined,
            setAntiAlias: () => undefined,
            setStyle: () => undefined,
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
      })
    );
    return m2c2kit;
  }
}
