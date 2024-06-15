import { TestHelpers } from "./TestHelpers";
import {
  Game,
  GameOptions,
  Scene,
  Action,
  TrialSchema,
  M2EventType,
  ActivityEvent,
} from "@m2c2kit/core";
import { Session, SessionOptions } from "..";
import { SessionEvent, SessionEventType } from "../SessionEvent";

TestHelpers.createM2c2KitMock();

class Game1 extends Game {
  constructor() {
    const testSchema: TrialSchema = {
      trial_index: {
        type: "integer",
        description: "Index of the trial within this assessment, 0-based.",
      },
    };

    const gameOptions: GameOptions = {
      name: "game1",
      id: "game1",
      publishUuid: "00000000-0000-0000-0000-000000000000",
      version: "0.1",
      showFps: true,
      width: 400,
      height: 800,
      trialSchema: testSchema,
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

let session: Session;
let g1: Game1;

let genericEvent: SessionEvent | ActivityEvent;
const genericHandler: (ev: SessionEvent | ActivityEvent) => void = (ev) => {
  genericEvent = ev;
};

beforeEach(() => {
  g1 = new Game1();

  const options: SessionOptions = {
    activities: [g1],
    autoStartAfterInit: false,
  };
  session = new Session(options);
  TestHelpers.setupDomAndGlobals();
});

describe("Session event handlers", () => {
  it("calls session.onInitialize callback when session initializes", async () => {
    const handler = jest.fn();
    session.onInitialize(() => handler());
    await session.initialize();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("session.onInitialize callback is provided correct event type", async () => {
    session.onInitialize(genericHandler);
    await session.initialize();
    expect(genericEvent.type).toBe(SessionEventType.SessionInitialize);
  });

  it("calls session.onStart callback when session starts", async () => {
    const handler = jest.fn();
    session.onStart(() => handler());
    await session.initialize();
    await session.start();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("calls session.onStart callback after init when autoStartAfterInit = true", async () => {
    const handler = jest.fn();
    session.onStart(() => handler());
    session.options.autoStartAfterInit = true;
    await session.initialize();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not call session.onStart callback after init when autoStartAfterInit = false", async () => {
    const handler = jest.fn();
    session.onStart(() => handler());
    session.options.autoStartAfterInit = false;
    await session.initialize();
    expect(handler).toHaveBeenCalledTimes(0);
  });

  it("session.onStart callback is provided correct event type", async () => {
    session.onStart(genericHandler);
    await session.initialize();
    await session.start();
    expect(genericEvent.type).toBe(SessionEventType.SessionStart);
  });

  it("calls session.onEnd callback when session ends", async () => {
    const handler = jest.fn();
    session.onEnd(() => handler());
    await session.initialize();
    (g1.entryScene as Scene).run(
      Action.custom({
        callback: () => {
          g1.end();
        },
      }),
    );
    TestHelpers.perfCounter = 0;
    TestHelpers.requestedFrames = 0;
    TestHelpers.maxRequestedFrames = 5;
    await session.start();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not call session.onEnd callback when last game ends and autoEndAfterLastActivity = false", async () => {
    const handler = jest.fn();
    session.onEnd(() => handler());
    session.options.autoEndAfterLastActivity = false;
    await session.initialize();
    (g1.entryScene as Scene).run(
      Action.custom({
        callback: () => {
          g1.end();
        },
      }),
    );
    TestHelpers.perfCounter = 0;
    TestHelpers.requestedFrames = 0;
    TestHelpers.maxRequestedFrames = 5;
    await session.start();
    expect(handler).not.toHaveBeenCalled();
  });

  it("session.onEnd callback is provided correct event type", async () => {
    session.onEnd(genericHandler);
    await session.initialize();
    (g1.entryScene as Scene).run(
      Action.custom({
        callback: () => {
          g1.end();
        },
      }),
    );
    TestHelpers.perfCounter = 0;
    TestHelpers.requestedFrames = 0;
    TestHelpers.maxRequestedFrames = 5;
    await session.start();
    expect(genericEvent.type).toBe(SessionEventType.SessionEnd);
  });

  it("calls multiple session.onEnd callbacks when session ends", async () => {
    const handler = jest.fn();
    session.onEnd(() => handler());
    const handler2 = jest.fn();
    session.onEnd(() => handler2());
    await session.initialize();
    (g1.entryScene as Scene).run(
      Action.custom({
        callback: () => {
          g1.end();
        },
      }),
    );
    TestHelpers.perfCounter = 0;
    TestHelpers.requestedFrames = 0;
    TestHelpers.maxRequestedFrames = 5;
    await session.start();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it("calls only the second session.onEnd callback if it was added with CallbackOption replaceExisting: true", async () => {
    const handler = jest.fn();
    session.onEnd(() => handler());
    const handler2 = jest.fn();
    session.onEnd(() => handler2(), { replaceExisting: true });
    await session.initialize();
    (g1.entryScene as Scene).run(
      Action.custom({
        callback: () => {
          g1.end();
        },
      }),
    );
    TestHelpers.perfCounter = 0;
    TestHelpers.requestedFrames = 0;
    TestHelpers.maxRequestedFrames = 5;
    await session.start();
    expect(handler).toHaveBeenCalledTimes(0);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it("calls session.onActivityData callback when an activity generates data", async () => {
    const handler = jest.fn();
    session.onActivityData(() => handler());
    await session.initialize();
    (g1.entryScene as Scene).run(
      Action.custom({
        callback: () => {
          g1.trialComplete();
        },
      }),
    );
    TestHelpers.perfCounter = 0;
    TestHelpers.requestedFrames = 0;
    TestHelpers.maxRequestedFrames = 5;
    await session.start();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("session.onActivityData callback is provided correct event type", async () => {
    session.onActivityData(genericHandler);
    await session.initialize();
    (g1.entryScene as Scene).run(
      Action.custom({
        callback: () => {
          g1.trialComplete();
        },
      }),
    );
    TestHelpers.perfCounter = 0;
    TestHelpers.requestedFrames = 0;
    TestHelpers.maxRequestedFrames = 5;
    await session.start();
    expect(genericEvent.type).toBe(M2EventType.ActivityData);
  });
});
