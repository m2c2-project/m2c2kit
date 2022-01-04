/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Activity,
  ActivityOptions,
  FontManager,
  ImageManager,
  Game,
  GameOptions,
  Scene,
} from "../../build-umd";
import { JSDOM } from "jsdom";

// jest.mock("../../dist/umd/m2c2kit", () => {
//   const m2c2kit = jest.requireActual("../../dist/umd/m2c2kit");
//   // original.Game.prototype.init = (options: GameInitOptions): Promise<void> => {
//   //   throw new Error("err!");
//   // }

//   m2c2kit.Game.prototype.init = jest.fn().mockReturnValue(Promise.resolve());
//   return m2c2kit;
// });

// for how to mock part of a module using jest,
// see https://www.chakshunyu.com/blog/how-to-mock-only-one-function-from-a-module-in-jest/

let maxRequestedFrames = 180;
let requestedFrames = 0;

const skiaCanvas = {
  save: () => undefined,
  scale: () => undefined,
  drawRRect: () => undefined,
  restore: () => undefined,
  drawText: () => undefined,
};

const requestAnimationFrame = (callback: (canvas: object) => void) => {
  if (requestedFrames < maxRequestedFrames) {
    requestedFrames++;
    callback(skiaCanvas);
  }
  return undefined;
};

jest.mock("../../build-umd", () => {
  const m2c2kit = jest.requireActual("../../build-umd");

  m2c2kit.Activity.prototype.loadCanvasKit = jest.fn().mockReturnValue(
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
});

class Game1 extends Game {
  constructor(specifiedParameters?: any) {
    const gameOptions: GameOptions = {
      name: "game1",
      version: "0.1",
      showFps: true,
      width: 400,
      height: 800,
    };

    super(gameOptions, specifiedParameters);
    const game = this;
    const s = new Scene({
      name: "game1FirstScene",
    });
    game.addScene(s);
    game.entryScene = s;
  }
}

class Game2 extends Game {
  constructor(specifiedParameters?: any) {
    const gameOptions: GameOptions = {
      name: "game2",
      version: "0.1",
      showFps: true,
      width: 400,
      height: 800,
    };

    super(gameOptions, specifiedParameters);
    const game = this;
    const s = new Scene({
      name: "game2FirstScene",
    });
    game.addScene(s);
    game.entryScene = s;
  }
}

let activity: Activity;
let g1: Game1;
let g2: Game2;
let perfCounter: number;

beforeEach(() => {
  g1 = new Game1();
  g2 = new Game2();

  const options: ActivityOptions = { games: [g1, g2] };
  activity = new Activity(options);

  const dom = new JSDOM(`<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </head>
    <body>
        <canvas style="height: 100vh; width: 100vw"></canvas>
      </div>
    </body>
  </html>`);

  // for how to mock globals,
  // see https://www.grzegorowski.com/how-to-mock-global-window-with-jest

  // @ts-ignore
  global.window = dom.window;
  // @ts-ignore
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;

  perfCounter = 0;
  global.window.performance.now = () => {
    perfCounter = perfCounter + 16.66666666666667;
    return perfCounter - 16.66666666666667;
  };

  requestedFrames = 0;
});

describe("Activity", () => {
  it("creates a FontManager", () => {
    expect(activity.fontManager).toBeInstanceOf(FontManager);
  });
  it("creates an ImageManager", () => {
    expect(activity.imageManager).toBeInstanceOf(ImageManager);
  });
});

describe("Activity init", () => {
  it("executes", () => {
    return activity.init().then((result) => expect(result).toBe(undefined));
  });

  it("assigns canvaskit", () => {
    // CanvasKit is an interface, so we can't expect an instance of CanvasKit
    // Instead, expect a property we mocked above
    return activity.init().then(() => {
      expect(activity.fontManager.canvasKit).toHaveProperty(
        "MakeCanvasSurface"
      );
      expect(activity.imageManager.canvasKit).toHaveProperty(
        "MakeCanvasSurface"
      );
      expect(g1.canvasKit).toHaveProperty("MakeCanvasSurface");
      expect(g2.canvasKit).toHaveProperty("MakeCanvasSurface");
    });
  });
});

describe("Activity start", () => {
  it("starts first game", () => {
    return activity.init().then(() => {
      activity.start();
      expect(activity.currentGame).toBe(g1);
    });
  });
});

describe("Activity nextGame", () => {
  it("advances to next game", () => {
    return activity.init().then(() => {
      activity.start();
      activity.nextGame();
      expect(activity.currentGame).toBe(g2);
    });
  });
});
