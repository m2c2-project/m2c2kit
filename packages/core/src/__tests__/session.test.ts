/* eslint-disable @typescript-eslint/ban-ts-comment */
import { TestHelpers } from "./TestHelpers";
import {
  Session,
  SessionOptions,
  FontManager,
  ImageManager,
  Game,
  GameOptions,
  Scene,
} from "../../build-umd";

jest.mock("../../build-umd", () => {
  return TestHelpers.createM2c2KitMock();
});

class Game1 extends Game {
  constructor() {
    const gameOptions: GameOptions = {
      name: "game1",
      id: "game1",
      version: "0.1",
      showFps: true,
      width: 400,
      height: 800,
    };

    super(gameOptions);
  }

  async init() {
    await super.init();
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const game = this;
    const s = new Scene({
      name: "game1FirstScene",
    });
    game.addScene(s);
    game.entryScene = s;
  }
}

class Game2 extends Game {
  constructor() {
    const gameOptions: GameOptions = {
      name: "game2",
      id: "game2",
      version: "0.1",
      showFps: true,
      width: 400,
      height: 800,
    };

    super(gameOptions);
  }

  async init() {
    await super.init();
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const game = this;
    const s = new Scene({
      name: "game2FirstScene",
    });
    game.addScene(s);
    game.entryScene = s;
  }
}

let session: Session;
let g1: Game1;
let g2: Game2;

beforeEach(async () => {
  g1 = new Game1();
  g2 = new Game2();

  const options: SessionOptions = {
    activities: [g1, g2],
    canvasKitWasmUrl: "assets/canvaskit.wasm",
  };
  session = new Session(options);
  TestHelpers.setupDomAndGlobals();
  await session.init();
});

describe("Session", () => {
  it("creates a FontManager", () => {
    expect(session.fontManager).toBeInstanceOf(FontManager);
  });
  it("creates an ImageManager", () => {
    expect(session.imageManager).toBeInstanceOf(ImageManager);
  });
});

describe("Session init", () => {
  it("executes", () => {
    return session.init().then((result) => expect(result).toBe(undefined));
  });

  it("assigns canvaskit", () => {
    // CanvasKit is an interface, so we can't expect an instance of CanvasKit
    // Instead, expect a property we mocked above
    expect(session.fontManager.canvasKit).toHaveProperty("MakeCanvasSurface");
    expect(session.imageManager.canvasKit).toHaveProperty("MakeCanvasSurface");
    expect(g1.canvasKit).toHaveProperty("MakeCanvasSurface");
    expect(g2.canvasKit).toHaveProperty("MakeCanvasSurface");
  });
});

describe("Session start", () => {
  it("starts first activity", () => {
    session.start();
    expect(session.currentActivity).toBe(g1);
  });
});

describe("Session advanceToNextActivity", () => {
  it("advances to next activity", () => {
    session.start();
    session.advanceToNextActivity();
    expect(session.currentActivity).toBe(g2);
  });
});
