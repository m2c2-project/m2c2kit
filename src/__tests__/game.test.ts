/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Game } from "../../dist/umd/m2c2kit";
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

jest.mock("../../dist/umd/m2c2kit", () => {
  const m2c2kit = jest.requireActual("../../dist/umd/m2c2kit");

  m2c2kit.Game.prototype.loadCanvasKit = jest.fn().mockReturnValue(
    Promise.resolve({
      MakeCanvasSurface: () => {
        return {
          reportBackendTypeIsGPU: () => true,
          getCanvas: () => {
            return {
              scale: () => undefined,
            };
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
        };
      },
      Color: function () {
        return {};
      },
    })
  );
  return m2c2kit;
});

let game: Game;
let window: any;

//window.performance.now = () => 0;

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

  // @ts-ignore
  global.window = dom.window;
  // @ts-ignore
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
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
