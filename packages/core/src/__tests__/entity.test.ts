/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Session,
  SessionOptions,
  Game,
  GameOptions,
  Scene,
  Label,
  Shape,
  Size,
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

const maxRequestedFrames = 180;
let requestedFrames = 0;

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

jest.mock("../../build-umd", () => {
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
});

class Game1 extends Game {
  constructor(specifiedParameters?: unknown) {
    const gameOptions: GameOptions = {
      name: "game1",
      version: "0.1",
      showFps: true,
      width: 400,
      height: 800,
    };

    super(gameOptions, specifiedParameters);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const game = this;

    const scene1 = new Scene({ name: "myScene1" });
    game.addScene(scene1);
    const label1 = new Label({ text: "Hello", name: "myLabel1" });
    scene1.addChild(label1);
    const rect1 = new Shape({
      rect: { size: new Size(100, 100) },
      name: "myRect1",
    });
    label1.addChild(rect1);

    game.addScene(scene1);
    game.entryScene = scene1;
  }
}

let session: Session;
let g1: Game1;
let perfCounter: number;
let scene1: Scene;
let label1: Label;
let rect1: Shape;

beforeEach(() => {
  g1 = new Game1();
  rect1 = g1.entities
    .filter((e) => e.name === "myRect1")
    .find(Boolean) as Shape;
  if (!rect1) {
    throw new Error("myRect1 undefined");
  }

  scene1 = g1.entities
    .filter((e) => e.name === "myScene1")
    .find(Boolean) as Scene;
  if (!scene1) {
    throw new Error("myScene1 undefined");
  }

  label1 = g1.entities
    .filter((e) => e.name === "myLabel1")
    .find(Boolean) as Label;
  if (!label1) {
    throw new Error("myLabel1 undefined");
  }

  const options: SessionOptions = { activities: [g1] };
  session = new Session(options);

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
    return perfCounter;
  };

  requestedFrames = 0;
});

describe("test descendants", () => {
  it("descendants of scene1 contain label1 and rect1", () => {
    return session.init().then(() => {
      expect(scene1.descendants).toContain(label1);
      expect(scene1.descendants).toContain(rect1);
    });
  });

  it("descendants of label1 contain rect1", () => {
    expect(label1.descendants).toContain(rect1);
  });

  it("should be false that label is descendant of rect", () => {
    expect(rect1.descendants.includes(label1)).toBeFalsy();
  });
});

describe("test descendant", () => {
  it("should return label as descendant of scene", () => {
    expect(scene1.descendant("myLabel1")).toBe(label1);
  });
  it("should return rect as descendant of label", () => {
    expect(label1.descendant("myRect1")).toBe(rect1);
  });
  it("should throw Error when descendant is not found", () => {
    // see https://stackoverflow.com/a/46155381
    const t = () => {
      return scene1.descendant("wrong-name");
    };
    expect(t).toThrow(Error);
  });
});

describe("test removeAllChildren", () => {
  it("scene1 children should have length 0", () => {
    scene1.removeAllChildren();
    expect(scene1.children).toHaveLength(0);
  });
});

describe("test addChild", () => {
  it("scene1 should contain newly added label", () => {
    const newLabel = new Label({ text: "words", name: "myNewLabel" });
    scene1.addChild(newLabel);
    expect(scene1.children).toContain(newLabel);
  });

  it("should throw Error if try to add scene to a scene", () => {
    const newScene = new Scene({ name: "myNewScene" });
    const t = () => {
      scene1.addChild(newScene);
    };
    expect(t).toThrow(Error);
  });

  it("should throw Error if try to add child with a duplicated name", () => {
    const newLabel = new Label({ text: "words", name: "myLabel1" });
    const t = () => {
      scene1.addChild(newLabel);
    };
    expect(t).toThrow(Error);
  });
});
