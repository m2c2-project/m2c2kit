/* eslint-disable @typescript-eslint/ban-ts-comment */
import { TestHelpers } from "./TestHelpers";
import {
  Session,
  SessionOptions,
  Game,
  GameOptions,
  Action,
  Scene,
  Shape,
  TrialSchema,
  Label,
} from "../../build-umd";

TestHelpers.cryptoGetRandomValuesPolyfill();
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

    const rect1 = new Shape({
      rect: { size: { width: 100, height: 100 } },
      name: "myRect1",
      position: { x: 200, y: 200 },
    });
    s.addChild(rect1);
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
      stretch: true,
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

describe("actions", () => {
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

  it("shape completes move from 200, 200 to 50, 50", async () => {
    TestHelpers.perfCounter = 0;
    TestHelpers.requestedFrames = 0;
    TestHelpers.maxRequestedFrames = 66;
    const rect1 = g1.entities.filter((e) => e.name === "myRect1").find(Boolean);
    if (!rect1) {
      throw new Error("rect1 undefined");
    }
    rect1.run(Action.move({ point: { x: 50, y: 50 }, duration: 1000 }));
    await session.start();
    console.debug(
      `frames requested: ${TestHelpers.requestedFrames}, ellapsed virtual milliseconds: ${TestHelpers.perfCounter}`
    );
    expect(rect1.position).toEqual({ x: 50, y: 50 });
  });

  it("shape is exactly midway halfway through move from 200, 200 to 50, 50", () => {
    TestHelpers.perfCounter = 0;
    TestHelpers.requestedFrames = 0;
    /**
     * Why 35 frames? The game loop begins and 4 preliminary frames are done:
     * 3 to warm up shaders, and 1 to hide the loader elements. For these
     * first 4 frames, game time is NOT updated.
     *
     * The next loop call is the first true frame that is part of the game
     * presented to the user. This is frame 5. During this first true frame
     * loop call, the action is queued to run. It will begin movement on the
     * next loop pass. Thus, we need 30 MORE frames (frames 6 to 35) to get
     * halfway through the 1000 ms action. This is a total of 35 frames.
     */
    TestHelpers.maxRequestedFrames = 35;
    const rect1 = g1.entities.filter((e) => e.name === "myRect1").find(Boolean);
    if (!rect1) {
      throw new Error("rect1 undefined");
    }

    rect1.run(Action.move({ point: { x: 50, y: 50 }, duration: 1000 }));
    session.start();
    console.debug(
      `frames requested: ${TestHelpers.requestedFrames}, ellapsed virtual milliseconds: ${TestHelpers.perfCounter}`
    );
    expect(Math.round(rect1.position.x)).toEqual(125);
    expect(Math.round(rect1.position.y)).toEqual(125);
  });
});

describe("Game start", () => {
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

  it("scales down on smaller screen that is half the size", async () => {
    global.window.innerWidth = 200;
    global.window.innerHeight = 400;
    await session.start();
    expect(Globals.rootScale).toBe(0.5);
  });

  it("scales down on smaller screen with different aspect ratio", async () => {
    global.window.innerWidth = 400;
    global.window.innerHeight = 200;
    await session.start();
    expect(Globals.rootScale).toBe(0.25);
  });

  it("scales up on larger screen that is double the size when stretch is true", async () => {
    global.window.innerWidth = 800;
    global.window.innerHeight = 1600;
    await session.start();
    await session.advanceToNextActivity();
    expect(Globals.rootScale).toBe(2);
  });

  it("scales up on larger screen with different aspect ratio when stretch is true", async () => {
    global.window.innerWidth = 1200;
    global.window.innerHeight = 1200;
    await session.start();
    await session.advanceToNextActivity();
    expect(Globals.rootScale).toBe(1.5);
  });
});

describe("free entities", () => {
  beforeEach(async () => {
    g1 = new Game1();
    g2 = new Game2();

    g1.addFreeEntity(new Shape({ circleOfRadius: 10, name: "the-circle" }));
    const options: SessionOptions = {
      activities: [g1, g2],
      canvasKitWasmUrl: "assets/canvaskit.wasm",
    };
    session = new Session(options);
    TestHelpers.setupDomAndGlobals();
    await session.init();
  });

  it("removes all free entities", () => {
    const game = g1;
    const label = new Label({ text: "label text" });
    game.addFreeEntity(label);
    game.removeAllFreeEntities();
    expect(game.freeEntities.length).toBe(0);
  });

  it("adds a free entity", () => {
    const game = g1;
    const label = new Label({ text: "label text" });
    game.addFreeEntity(label);
    expect(game.freeEntities.length).toBe(2);
  });

  it("adds a free entity and removes free entity by object", () => {
    const game = g1;
    const label = new Label({ text: "label text" });
    game.addFreeEntity(label);
    game.removeFreeEntity(label);
    expect(game.freeEntities.length).toBe(1);
  });

  it("adds a free entity and removes free entity by name", () => {
    const game = g1;
    const label = new Label({ text: "label text", name: "the-label" });
    game.addFreeEntity(label);
    game.removeFreeEntity("the-label");
    expect(game.freeEntities.length).toBe(1);
  });

  it("throws error when attempting to remove entity object that has not been added as a free entity", () => {
    const game = g1;
    const label = new Label({ text: "label text", name: "the-label" });
    const t = () => game.removeFreeEntity(label);
    expect(t).toThrowError();
  });

  it("throws error when attempting to remove entity name that has not been added as a free entity", () => {
    const game = g1;
    const t = () => game.removeFreeEntity("some-entity");
    expect(t).toThrowError();
  });
});

class Game3 extends Game {
  constructor() {
    const trialSchema: TrialSchema = {
      boolean_data: {
        type: "boolean",
      },
      string_data: {
        type: "string",
      },
      integer_data: {
        type: "integer",
      },
      number_data: {
        type: "number",
      },
      object_data: {
        type: "object",
      },
      array_data: {
        type: "array",
      },
      null_data: {
        type: "null",
      },
      string_or_null_data: {
        type: ["string", "null"],
      },
    };

    const gameOptions: GameOptions = {
      name: "game3",
      id: "game3",
      version: "0.1",
      width: 400,
      height: 800,
      trialSchema: trialSchema,
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

let g3: Game3;

describe("addTrialData", () => {
  beforeEach(async () => {
    g3 = new Game3();
    const options: SessionOptions = {
      activities: [g3],
      canvasKitWasmUrl: "assets/canvaskit.wasm",
    };
    session = new Session(options);
    TestHelpers.setupDomAndGlobals();
    await session.init();
  });

  it("adds boolean data", async () => {
    await session.start();
    g3.addTrialData("boolean_data", true);
  });

  it("adds string data", async () => {
    await session.start();
    g3.addTrialData("string_data", "hello");
  });

  it("adds integer data", async () => {
    await session.start();
    g3.addTrialData("integer_data", 10);
  });

  it("adds number data", async () => {
    await session.start();
    g3.addTrialData("number_data", 5.5);
  });

  it("adds object data", async () => {
    await session.start();
    g3.addTrialData("object_data", { a: 1, b: 2 });
  });

  it("adds array data", async () => {
    await session.start();
    g3.addTrialData("array_data", [1, 2, 3]);
  });

  it("adds null data", async () => {
    await session.start();
    g3.addTrialData("null_data", null);
  });

  it("adds undefined data", async () => {
    await session.start();
    g3.addTrialData("null_data", undefined);
  });

  it("adds string data to string | null schema", async () => {
    await session.start();
    g3.addTrialData("string_or_null_data", "hello");
  });

  it("throws error when adding string data to boolean schema", async () => {
    await session.start();
    const t = () => g3.addTrialData("boolean_data", "hello");
    expect(t).toThrow(Error);
  });

  it("throws error when adding null data to boolean schema", async () => {
    await session.start();
    const t = () => g3.addTrialData("boolean_data", null);
    expect(t).toThrowError();
  });

  it("throws error when adding non-integer number to integer schema", async () => {
    await session.start();
    const t = () => g3.addTrialData("integer_data", 5.5);
    expect(t).toThrowError();
  });
});
