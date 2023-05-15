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
  GameParameters,
} from "..";

TestHelpers.createM2c2KitMock();

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

describe("GameOptions", () => {
  class Game3 extends Game {
    constructor() {
      // @ts-ignore
      const gameOptions: GameOptions = {
        name: "game2",
        version: "0.1",
      };

      super(gameOptions);
    }
  }

  it("throws error if id is not provided", () => {
    const t = () => new Game3();
    expect(t).toThrowError();
  });
});

describe("parameters", () => {
  class Game4 extends Game {
    constructor() {
      const defaultParameters: GameParameters = {
        number_of_trials: {
          type: "integer",
          default: 5,
          description: "How many trials to run.",
        },
        show_fps: {
          type: "boolean",
          default: false,
          description: "Should the FPS be shown?",
        },
      };

      const gameOptions: GameOptions = {
        name: "game4",
        id: "game4",
        version: "0.1",
        width: 400,
        height: 800,
        parameters: defaultParameters,
      };

      super(gameOptions);
    }
  }

  let g4: Game;
  beforeEach(async () => {
    g4 = new Game4();

    const options: SessionOptions = {
      activities: [g4],
      canvasKitWasmUrl: "canvaskit.wasm",
    };
    session = new Session(options);
    TestHelpers.setupDomAndGlobals();
    await session.init();
  });

  it("setParameters sets a game parameter", () => {
    g4.setParameters({ number_of_trials: 10 });
    expect(g4.options?.parameters?.number_of_trials.default).toEqual(10);
  });

  it("setParameters warns to console when setting non-existent game parameter", () => {
    console.warn = jest.fn();
    g4.setParameters({ number_of_puppies: 10 });
    expect(console.warn).toHaveBeenCalled();
  });

  it("getParameter gets a game parameter", () => {
    const trials = g4.getParameter("number_of_trials");
    expect(trials).toEqual(5);
  });

  it("getParameter throws error when getting a non-existent game parameter", () => {
    const t = () => g4.getParameter("number_of_puppies");
    expect(t).toThrowError();
  });

  it("getParameterOrFallback gets an existing game parameter", () => {
    const trials = g4.getParameterOrFallback("number_of_trials", 10);
    expect(trials).toEqual(5);
  });

  it("getParameterOrFallback gets fallback for non-existent game parameter", () => {
    const trials = g4.getParameterOrFallback("number_of_puppies", 10);
    expect(trials).toEqual(10);
  });

  it("hasParameter returns true for existing parameter", () => {
    expect(g4.hasParameter("number_of_trials")).toEqual(true);
  });

  it("hasParameter returns false for non-existing parameter", () => {
    expect(g4.hasParameter("number_of_puppies")).toEqual(false);
  });
});

describe("scene add/remove", () => {
  beforeEach(async () => {
    g1 = new Game1();

    const options: SessionOptions = {
      activities: [g1],
      canvasKitWasmUrl: "canvaskit.wasm",
    };
    session = new Session(options);
    TestHelpers.setupDomAndGlobals();
    await session.init();
  });

  it("addScene adds a scene", () => {
    const addedScene = new Scene({
      name: "addedScene",
    });
    g1.addScene(addedScene);
    expect(g1.scenes).toContain(addedScene);
  });

  it("addScenes adds multiple scenes", () => {
    const addedScene = new Scene({
      name: "addedScene",
    });
    const addedScene2 = new Scene({
      name: "addedScene2",
    });

    g1.addScenes([addedScene, addedScene2]);
    expect(g1.scenes).toContain(addedScene);
    expect(g1.scenes).toContain(addedScene2);
  });

  it("removeScene removes a scene by object", () => {
    const addedScene = new Scene({
      name: "addedScene",
    });
    g1.addScene(addedScene);
    g1.removeScene(addedScene);
    expect(g1.scenes).not.toContain(addedScene);
  });

  it("removeScene removes a scene by name", () => {
    const addedScene = new Scene({
      name: "addedScene",
    });
    g1.addScene(addedScene);
    g1.removeScene("addedScene");
    expect(g1.scenes).not.toContain(addedScene);
  });

  it("removeScene throws error when removing a non-added scene by object", () => {
    const nonAddedScene = new Scene({
      name: "addedScene",
    });
    const t = () => g1.removeScene(nonAddedScene);
    expect(t).toThrowError();
  });

  it("removeScene throws error when removing a non-added scene by name", () => {
    const t = () => g1.removeScene("not added scene");
    expect(t).toThrowError();
  });
});

describe("presentScene", () => {
  beforeEach(async () => {
    g1 = new Game1();

    const options: SessionOptions = {
      activities: [g1],
      canvasKitWasmUrl: "canvaskit.wasm",
    };
    session = new Session(options);
    TestHelpers.setupDomAndGlobals();
    await session.init();
  });

  it("presentScene throws error if non-added scene is presented by name", () => {
    const t = () => g1.presentScene("not added scene");
    expect(t).toThrowError();
  });

  it("presentScene throws error if non-added scene is presented by object", () => {
    const addedScene = new Scene({
      name: "nonAddedScene",
    });
    const t = () => g1.presentScene(addedScene);
    expect(t).toThrowError();
  });
});

describe("actions", () => {
  beforeEach(async () => {
    g1 = new Game1();
    g2 = new Game2();

    const options: SessionOptions = {
      activities: [g1, g2],
      canvasKitWasmUrl: "canvaskit.wasm",
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
      `frames requested: ${TestHelpers.requestedFrames}, elapsed virtual milliseconds: ${TestHelpers.perfCounter}`
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
      `frames requested: ${TestHelpers.requestedFrames}, elapsed virtual milliseconds: ${TestHelpers.perfCounter}`
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
      canvasKitWasmUrl: "canvaskit.wasm",
    };
    session = new Session(options);
    TestHelpers.setupDomAndGlobals();
    await session.init();
  });

  it("throws error if entryScene as object has not been added to game", async () => {
    g1.entryScene = new Scene();
    await expect(session.start()).rejects.toThrowError();
  });

  it("throws error if entryScene as name has not been added to game", async () => {
    g1.entryScene = "not added scene";
    await expect(session.start()).rejects.toThrowError();
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
    await session.goToNextActivity();
    expect(Globals.rootScale).toBe(2);
  });

  it("scales up on larger screen with different aspect ratio when stretch is true", async () => {
    global.window.innerWidth = 1200;
    global.window.innerHeight = 1200;
    await session.start();
    await session.goToNextActivity();
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
      canvasKitWasmUrl: "canvaskit.wasm",
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
      canvasKitWasmUrl: "canvaskit.wasm",
    };
    session = new Session(options);
    TestHelpers.setupDomAndGlobals();
    await session.init();
    await session.start();
  });

  it("adds boolean data", () => {
    g3.addTrialData("boolean_data", true);
  });

  it("adds string data", () => {
    g3.addTrialData("string_data", "hello");
  });

  it("adds integer data", () => {
    g3.addTrialData("integer_data", 10);
  });

  it("adds number data", () => {
    g3.addTrialData("number_data", 5.5);
  });

  it("adds object data", () => {
    g3.addTrialData("object_data", { a: 1, b: 2 });
  });

  it("adds array data", () => {
    g3.addTrialData("array_data", [1, 2, 3]);
  });

  it("adds null data", () => {
    g3.addTrialData("null_data", null);
  });

  it("adds undefined data", () => {
    g3.addTrialData("null_data", undefined);
  });

  it("adds string data to string | null schema", () => {
    g3.addTrialData("string_or_null_data", "hello");
  });

  it("throws error when adding string data to boolean schema", () => {
    const t = () => g3.addTrialData("boolean_data", "hello");
    expect(t).toThrow(Error);
  });

  it("throws error when adding null data to boolean schema", () => {
    const t = () => g3.addTrialData("boolean_data", null);
    expect(t).toThrowError();
  });

  it("throws error when adding non-integer number to integer schema", () => {
    const t = () => g3.addTrialData("integer_data", 5.5);
    expect(t).toThrowError();
  });

  it("throws error when adding to non-existent variable", () => {
    const t = () => g3.addTrialData("pizzas_eaten", 2);
    expect(t).toThrowError();
  });
});

describe("time stepping", () => {
  class Game5 extends Game {
    constructor() {
      const gameOptions: GameOptions = {
        name: "game5",
        id: "game5",
        version: "0.1",
        showFps: true,
        width: 400,
        height: 800,
        timeStepping: true,
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

  let g5: Game5;
  beforeEach(async () => {
    g5 = new Game5();

    const options: SessionOptions = {
      activities: [g5],
      canvasKitWasmUrl: "canvaskit.wasm",
    };
    session = new Session(options);
    TestHelpers.setupDomAndGlobals();
    await session.init();
    await session.start();
  });

  it("adds time stepping controls", () => {
    expect(document.getElementById("m2c2kit-time-stepping-div")).not.toBeNull();
  });

  it("removes time stepping controls", () => {
    // @ts-ignore
    g5.removeTimeSteppingControlsFromDom();
    expect(document.getElementById("m2c2kit-time-stepping-div")).toBeNull();
  });
});
