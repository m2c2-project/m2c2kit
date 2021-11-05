/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Game,
  Scene,
  Shape,
  Size,
  Action,
  Point,
} from "../../dist/umd/m2c2kit";
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

const requestAnimationFrame = (callback: (canvas: object) => void) => {
  const skiaCanvas = {
    save: () => undefined,
    scale: () => undefined,
    drawRRect: () => undefined,
    restore: () => undefined,
  };
  if (requestedFrames < maxRequestedFrames) {
    requestedFrames++;
    callback(skiaCanvas);
  }
  return undefined;
};

jest.mock("../../dist/umd/m2c2kit", () => {
  const m2c2kit = jest.requireActual("../../dist/umd/m2c2kit");

  m2c2kit.Game.prototype.loadCanvasKit = jest.fn().mockReturnValue(
    Promise.resolve({
      PaintStyle: {
        Fill: undefined,
      },
      MakeCanvasSurface: () => {
        return {
          reportBackendTypeIsGPU: () => true,
          getCanvas: () => {
            return {
              save: () => undefined,
              scale: () => undefined,
            };
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

let game: Game;
let perfCounter: number;

beforeEach(() => {
  game = new Game();

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

describe("actions", () => {
  it("shape completes move from (200, 200) to (50, 50)", () => {
    maxRequestedFrames = 63;
    return game
      .init({ width: 400, height: 800, _unitTesting: true })
      .then(() => {
        const scene1 = new Scene({ name: "myScene1" });
        game.addScene(scene1);
        const rect1 = new Shape({
          rect: { size: new Size(100, 100) },
          name: "myRect1",
          position: new Point(200, 200),
        });
        scene1.addChild(rect1);
        game.entryScene = scene1;

        rect1.run(Action.Move(new Point(50, 50), 1000));
        game.start();
        console.debug(
          `frames requested: ${requestedFrames}, ellapsed virtual milliseconds: ${perfCounter}`
        );
        expect(rect1.position).toEqual(new Point(50, 50));
      });
  });

  it("shape is exactly midway during from (200, 200) to (50, 50)", () => {
    maxRequestedFrames = 32;
    return game
      .init({ width: 400, height: 800, _unitTesting: true })
      .then(() => {
        const scene1 = new Scene({ name: "myScene1" });
        game.addScene(scene1);
        const rect1 = new Shape({
          rect: { size: new Size(100, 100) },
          name: "myRect1",
          position: new Point(200, 200),
        });
        scene1.addChild(rect1);
        game.entryScene = scene1;

        rect1.run(Action.Move(new Point(50, 50), 1000));
        game.start();

        expect(rect1.position).toEqual(new Point(125, 125));
        console.debug(
          `frames requested: ${requestedFrames}, ellapsed virtual milliseconds: ${perfCounter}`
        );
      });
  });
});

describe("test init()", () => {
  it("executes", () => {
    return game
      .init({ width: 400, height: 800 })
      .then((result) => expect(result).toBe(undefined));
  });

  it("creates m2c2kitscratchcanvas html element", () => {
    return game.init({ width: 400, height: 800 }).then((_) => {
      expect(
        global.document.getElementById("m2c2kitscratchcanvas")
      ).not.toBeNull();
    });
  });

  it("scales down on smaller screen that is half the size", () => {
    // @ts-ignore
    global.window.innerWidth = 200;
    // @ts-ignore
    global.window.innerHeight = 400;
    return game.init({ width: 400, height: 800 }).then((_) => {
      expect(game._rootScale).toBe(0.5);
    });
  });

  it("scales down on smaller screen with different aspect ratio", () => {
    // @ts-ignore
    global.window.innerWidth = 400;
    // @ts-ignore
    global.window.innerHeight = 200;
    return game.init({ width: 400, height: 800 }).then((_) => {
      expect(game._rootScale).toBe(0.25);
    });
  });

  it("scales up on larger screen that is double the size when stretch is true", () => {
    // @ts-ignore
    global.window.innerWidth = 800;
    // @ts-ignore
    global.window.innerHeight = 1600;
    return game.init({ width: 400, height: 800, stretch: true }).then((_) => {
      expect(game._rootScale).toBe(2);
    });
  });

  it("scales up on larger screen with different aspect ratio when stretch is true", () => {
    // @ts-ignore
    global.window.innerWidth = 1200;
    // @ts-ignore
    global.window.innerHeight = 1200;
    return game.init({ width: 400, height: 800, stretch: true }).then((_) => {
      expect(game._rootScale).toBe(1.5);
    });
  });
});
