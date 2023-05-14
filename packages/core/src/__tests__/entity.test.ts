/* eslint-disable @typescript-eslint/ban-ts-comment */
import { TestHelpers } from "./TestHelpers";
import {
  Session,
  SessionOptions,
  Game,
  GameOptions,
  Scene,
  Label,
  Shape,
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

    scene1 = new Scene({ name: "myScene1" });
    game.addScene(scene1);
    label1 = new Label({ text: "Hello", name: "myLabel1" });
    scene1.addChild(label1);
    label2 = new Label({ text: "Bye", name: "myLabel2" });
    scene1.addChild(label2);

    rect1 = new Shape({
      rect: { size: { width: 100, height: 100 } },
      name: "myRect1",
    });
    label1.addChild(rect1);

    game.addScene(scene1);
    game.entryScene = scene1;
  }
}

let session: Session;
let g1: Game1;
let scene1: Scene;
let label1: Label;
let label2: Label;
let rect1: Shape;

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

describe("test descendants", () => {
  it("descendants of scene1 contain label1 and rect1", () => {
    expect(scene1.descendants).toContain(label1);
    expect(scene1.descendants).toContain(rect1);
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
  it("removes all children from scene1", () => {
    scene1.removeAllChildren();
    expect(scene1.children).toHaveLength(0);
  });
});

describe("removeChildren", () => {
  it("removes the children from scene1", () => {
    scene1.removeChildren([label1, label2]);
    expect(scene1.children).toHaveLength(0);
  });

  it("throws Error when removing a child that is not added to the parent", () => {
    const l3 = new Label();
    const t = () => {
      scene1.removeChildren([l3]);
    };
    expect(t).toThrowError();
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
