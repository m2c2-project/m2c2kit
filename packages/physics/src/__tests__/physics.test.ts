/* eslint-disable @typescript-eslint/ban-ts-comment */
import { TestHelpers } from "./TestHelpers";
import {
  Session,
  SessionOptions,
  Game,
  GameOptions,
  Scene,
  Shape,
} from "@m2c2kit/core";
import { Physics } from "../Physics";
import { PhysicsBody } from "../PhysicsBody";

TestHelpers.createM2c2KitMock();

let session: Session;

describe("physics gravity", () => {
  beforeEach(async () => {
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

      async initialize() {
        await super.initialize();
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const game = this;
        const physics = new Physics({ logEngineStats: true });
        await game.registerPlugin(physics);
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
        // @ts-ignore
        rect1.physicsBody = new PhysicsBody({
          rect: rect1.size,
        });
        s.addChild(rect1);
      }
    }

    const g1 = new Game1();
    const options: SessionOptions = {
      activities: [g1],
      canvasKitWasmUrl: "canvaskit.wasm",
      // don't autostart; we need to set frame counters and actions before starting
      autoStartAfterInit: false,
    };
    session = new Session(options);
    TestHelpers.setupDomAndGlobals();
    await session.initialize();
  });

  it("logs physics stats to console", async () => {
    TestHelpers.perfCounter = 0;
    TestHelpers.requestedFrames = 0;
    TestHelpers.maxRequestedFrames = 126;
    console.log = jest.fn();
    await session.start();
    console.debug(
      `frames requested: ${TestHelpers.requestedFrames}, elapsed virtual milliseconds: ${TestHelpers.perfCounter}`,
    );
    // @ts-ignore
    const logCalls = (console.log as jest.mock).mock.calls.filter((c) =>
      c[0].includes("average frame Engine.update() time"),
    );
    expect(logCalls.length).toBeGreaterThan(0);
  });

  it("shape with PhysicsBody drops off scene after 2 seconds", async () => {
    TestHelpers.perfCounter = 0;
    TestHelpers.requestedFrames = 0;
    TestHelpers.maxRequestedFrames = 126;
    await session.start();
    console.debug(
      `frames requested: ${TestHelpers.requestedFrames}, elapsed virtual milliseconds: ${TestHelpers.perfCounter}`,
    );
    const rect1 = (session.options.activities[0] as Game).entities
      .filter((e) => e.name === "myRect1")
      .find(Boolean);
    if (!rect1) {
      throw new Error("rect1 undefined");
    }
    expect(rect1.position.y).toBeGreaterThan(800);
    (session.options.activities[0] as Game).stop();
  });
});

describe("physics no gravity", () => {
  beforeEach(async () => {
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

      async initialize() {
        await super.initialize();
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const game = this;

        const physics = new Physics({ gravity: { dx: 0, dy: 0 } });
        await game.registerPlugin(physics);
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
        // @ts-ignore
        rect1.physicsBody = new PhysicsBody({
          rect: rect1.size,
        });
        s.addChild(rect1);
      }
    }

    const g1 = new Game1();
    const options: SessionOptions = {
      activities: [g1],
      canvasKitWasmUrl: "canvaskit.wasm",
      // don't autostart; we need to set frame counters and actions before starting
      autoStartAfterInit: false,
    };
    session = new Session(options);
    TestHelpers.setupDomAndGlobals();
    await session.initialize();
  });

  it("shape with PhysicsBody and no gravity does not change position", async () => {
    TestHelpers.perfCounter = 0;
    TestHelpers.requestedFrames = 0;
    TestHelpers.maxRequestedFrames = 126;
    await session.start();
    console.debug(
      `frames requested: ${TestHelpers.requestedFrames}, elapsed virtual milliseconds: ${TestHelpers.perfCounter}`,
    );
    const rect1 = (session.options.activities[0] as Game).entities
      .filter((e) => e.name === "myRect1")
      .find(Boolean);
    if (!rect1) {
      throw new Error("rect1 undefined");
    }
    expect(rect1.position.y).toBe(200);
  });
});

describe("physics collision", () => {
  let physics: Physics;
  let game: Game;
  const contactBeginHandler = jest.fn();
  const contactEndHandler = jest.fn();

  beforeEach(async () => {
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

      async initialize() {
        await super.initialize();
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        game = this;
        physics = new Physics({ showsPhysics: true });
        await game.registerPlugin(physics);
        const s = new Scene({
          name: "game1FirstScene",
        });
        game.addScene(s);
        game.entryScene = s;

        const rect1 = new Shape({
          rect: { size: { width: 100, height: 100 } },
          name: "myRect1",
          position: { x: 200, y: 400 },
        });
        // @ts-ignore
        rect1.physicsBody = new PhysicsBody({
          rect: rect1.size,
        });
        s.addChild(rect1);

        const circle1 = new Shape({
          circleOfRadius: 50,
          name: "myCircle1",
          position: { x: 200, y: 200 },
        });
        // @ts-ignore
        circle1.physicsBody = new PhysicsBody({
          circleOfRadius: circle1.circleOfRadius,
        });
        s.addChild(circle1);

        const edge = new Shape({
          rect: { width: 300, height: 700 },
          lineWidth: 1,
          position: { x: 200, y: 400 },
        });
        // @ts-ignore
        edge.physicsBody = new PhysicsBody({
          edgeLoop: { width: 400, height: 800 },
          restitution: 0.5,
        });
        s.addChild(edge);

        physics.onContactBegin(contactBeginHandler);
        physics.onContactEnd(contactEndHandler);
      }
    }

    const g1 = new Game1();
    const options: SessionOptions = {
      activities: [g1],
      canvasKitWasmUrl: "canvaskit.wasm",
      // don't autostart; we need to set frame counters and actions before starting
      autoStartAfterInit: false,
    };
    session = new Session(options);
    TestHelpers.setupDomAndGlobals();
    await session.initialize();
  });

  it("shape with PhysicsBody collides with edge loop", async () => {
    TestHelpers.perfCounter = 0;
    TestHelpers.requestedFrames = 0;
    TestHelpers.maxRequestedFrames = 126;
    await session.start();
    console.debug(
      `frames requested: ${TestHelpers.requestedFrames}, elapsed virtual milliseconds: ${TestHelpers.perfCounter}`,
    );
    expect(contactBeginHandler).toHaveBeenCalled();
    expect(contactEndHandler).toHaveBeenCalled();
  });

  it("showsPhysics option creates shape outlines", async () => {
    TestHelpers.perfCounter = 0;
    TestHelpers.requestedFrames = 0;
    TestHelpers.maxRequestedFrames = 126;
    await session.start();
    console.debug(
      `frames requested: ${TestHelpers.requestedFrames}, elapsed virtual milliseconds: ${TestHelpers.perfCounter}`,
    );
    const entityNames = game.entities.map((e) => e.name);
    const hasOutlines =
      entityNames.filter((n) => n.includes("__PhysicsBodyOutline")).length > 0;
    expect(hasOutlines).toBe(true);
  });
});

describe("physics gravity changed", () => {
  let physics: Physics;

  beforeEach(async () => {
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

      async initialize() {
        await super.initialize();
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const game = this;

        physics = new Physics();
        await game.registerPlugin(physics);
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
        // @ts-ignore
        rect1.physicsBody = new PhysicsBody({
          rect: rect1.size,
        });
        s.addChild(rect1);
      }
    }

    const g1 = new Game1();
    const options: SessionOptions = {
      activities: [g1],
      canvasKitWasmUrl: "canvaskit.wasm",
      // don't autostart; we need to set frame counters and actions before starting
      autoStartAfterInit: false,
    };
    session = new Session(options);
    TestHelpers.setupDomAndGlobals();
    await session.initialize();
  });

  it("shape with PhysicsBody and no gravity set after initialization does not change position", async () => {
    TestHelpers.perfCounter = 0;
    TestHelpers.requestedFrames = 0;
    TestHelpers.maxRequestedFrames = 126;
    physics.gravity = { dx: 0, dy: 0 };
    await session.start();
    console.debug(
      `frames requested: ${TestHelpers.requestedFrames}, elapsed virtual milliseconds: ${TestHelpers.perfCounter}`,
    );
    const rect1 = (session.options.activities[0] as Game).entities
      .filter((e) => e.name === "myRect1")
      .find(Boolean);
    if (!rect1) {
      throw new Error("rect1 undefined");
    }
    expect(rect1.position.y).toBe(200);
  });

  it("shape with PhysicsBody and no gravity (dx and dy set separately) set after initialization does not change position", async () => {
    TestHelpers.perfCounter = 0;
    TestHelpers.requestedFrames = 0;
    TestHelpers.maxRequestedFrames = 126;
    physics.gravity.dy = 0;
    physics.gravity.dx = 0;
    await session.start();
    console.debug(
      `frames requested: ${TestHelpers.requestedFrames}, elapsed virtual milliseconds: ${TestHelpers.perfCounter}`,
    );
    const rect1 = (session.options.activities[0] as Game).entities
      .filter((e) => e.name === "myRect1")
      .find(Boolean);
    if (!rect1) {
      throw new Error("rect1 undefined");
    }
    expect(rect1.position.y).toBe(200);
  });
});

describe("allows rotation", () => {
  let physics: Physics;
  let game: Game;
  let circle1: Shape;

  beforeEach(async () => {
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

      async initialize() {
        await super.initialize();
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        game = this;
        physics = new Physics({ showsPhysics: true });
        await game.registerPlugin(physics);
        const s = new Scene({
          name: "game1FirstScene",
        });
        game.addScene(s);
        game.entryScene = s;

        circle1 = new Shape({
          circleOfRadius: 50,
          name: "myCircle1",
          position: { x: 200, y: 200 },
        });
        // @ts-ignore
        circle1.physicsBody = new PhysicsBody({
          circleOfRadius: circle1.circleOfRadius,
          allowsRotation: false,
        });
        s.addChild(circle1);

        const edge = new Shape({
          rect: { width: 300, height: 700 },
          lineWidth: 1,
          position: { x: 200, y: 400 },
        });
        // @ts-ignore
        edge.physicsBody = new PhysicsBody({
          edgeLoop: { width: 400, height: 800 },
          restitution: 0.5,
        });
        s.addChild(edge);
      }
    }

    const g1 = new Game1();
    const options: SessionOptions = {
      activities: [g1],
      canvasKitWasmUrl: "canvaskit.wasm",
      // don't autostart; we need to set frame counters and actions before starting
      autoStartAfterInit: false,
    };
    session = new Session(options);
    TestHelpers.setupDomAndGlobals();
    await session.initialize();
  });

  it("does not rotate when constructed with allowsRotation: false", async () => {
    TestHelpers.perfCounter = 0;
    TestHelpers.requestedFrames = 0;
    TestHelpers.maxRequestedFrames = 126;
    await session.start();
    console.debug(
      `frames requested: ${TestHelpers.requestedFrames}, elapsed virtual milliseconds: ${TestHelpers.perfCounter}`,
    );
    const circle1 = (session.options.activities[0] as Game).entities
      .filter((e) => e.name === "myCircle1")
      .find(Boolean);
    if (!circle1) {
      throw new Error("rect1 undefined");
    }
    expect(circle1.zRotation).toBe(0);
  });
});
