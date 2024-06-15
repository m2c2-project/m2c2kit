import { TestHelpers } from "./TestHelpers";
import { Game, GameOptions, Scene } from "@m2c2kit/core";
import { Session, SessionOptions } from "@m2c2kit/session";
TestHelpers.createM2c2KitMock();

class Game1 extends Game {
  constructor() {
    const gameOptions: GameOptions = {
      name: "game1",
      id: "game1",
      publishUuid: "00000000-0000-0000-0000-000000000000",
      version: "0.1",
      showFps: true,
      width: 400,
      height: 800,
    };

    super(gameOptions);
  }

  async initialize() {
    await super.initialize();
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
      publishUuid: "00000000-0000-0000-0000-000000000000",
      version: "0.1",
      showFps: true,
      width: 400,
      height: 800,
    };

    super(gameOptions);
  }

  async initialize() {
    await super.initialize();
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
    autoStartAfterInit: false,
  };
  session = new Session(options);
  TestHelpers.setupDomAndGlobals();
});

describe("Session init", () => {
  it("executes", async () => {
    const voidResult = await session.initialize();
    return expect(voidResult).toBe(void 0);
  });

  it("assigns canvaskit", async () => {
    await session.initialize();
    // CanvasKit is an interface, so we can't expect an instance of CanvasKit
    // Instead, expect a property we mocked above
    expect(g1.canvasKit).toHaveProperty("MakeCanvasSurface");
    expect(g2.canvasKit).toHaveProperty("MakeCanvasSurface");
  });
});

describe("Session start", () => {
  it("starts first activity", async () => {
    await session.initialize();
    await session.start();
    expect(session.currentActivity).toBe(g1);
  });
});

describe("Session advanceToNextActivity", () => {
  it("advances to next activity", async () => {
    await session.initialize();
    await session.start();
    session.goToNextActivity();
    expect(session.currentActivity).toBe(g2);
  });

  it("automatically advances to next activity when autoGoToNextActivity = true", async () => {
    session.options.autoGoToNextActivity = true;
    await session.initialize();
    await session.start();
    g1.end();
    expect(session.currentActivity).toBe(g2);
  });

  it("does not automatically advance to next activity when autoGoToNextActivity = false", async () => {
    session.options.autoGoToNextActivity = false;
    await session.initialize();
    await session.start();
    g1.end();
    expect(session.currentActivity).toBe(g1);
  });
});
