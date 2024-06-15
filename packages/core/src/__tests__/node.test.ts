import { TestHelpers } from "./TestHelpers";
import { Game, GameOptions, Scene, Label, Shape } from "..";

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

    game.entryScene = scene1;
  }
}

let g1: Game1;
let scene1: Scene;
let label1: Label;
let label2: Label;
let rect1: Shape;

beforeEach(async () => {
  g1 = new Game1();
  TestHelpers.setupDomAndGlobals();
  await g1.initialize();
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
    const children = scene1.children;
    scene1.removeAllChildren();
    expect(scene1.children).toHaveLength(0);
    expect(children.map((c) => c.parent === undefined).every((c) => c)).toBe(
      true,
    );
  });
});

describe("removeChildren", () => {
  it("removes the children from scene1", () => {
    scene1.removeChildren([label1, label2]);
    expect(scene1.children).toHaveLength(0);
    expect(label1.parent).toBeUndefined();
    expect(label2.parent).toBeUndefined();
  });

  it("throws Error when removing a child that is not added to the parent", () => {
    const l3 = new Label();
    const t = () => {
      scene1.removeChildren([l3]);
    };
    expect(t).toThrow();
  });
});

describe("removeChild", () => {
  it("removes child from parent", () => {
    label1.removeChild(rect1);
    expect(label1.children).not.toContain(rect1);
    expect(rect1.parent).toBeUndefined();
  });

  it("throws Error when removing child that does not exist on parent", () => {
    const t = () => {
      label1.removeChild(label2);
    };
    expect(t).toThrow(Error);
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

  it("throws Error when adding scene to another node", () => {
    const newScene = new Scene({ name: "myNewScene" });
    const t = () => {
      label1.addChild(newScene);
    };
    expect(t).toThrow(Error);
  });

  it("throws Error when adding child with a duplicated name", () => {
    const newLabel = new Label({ text: "words", name: "myLabel1" });
    const t = () => {
      scene1.addChild(newLabel);
    };
    expect(t).toThrow(Error);
  });

  it("throws Error when adding child to parent again", () => {
    const t = () => {
      scene1.addChild(label1);
    };
    expect(t).toThrow(Error);
  });

  it("throws Error when adding child to another parent without removing it from the original parent", () => {
    const t = () => {
      label2.addChild(rect1);
    };
    expect(t).toThrow(Error);
  });

  it("throws Error when adding node as a child to itself", () => {
    const t = () => {
      label1.addChild(label1);
    };
    expect(t).toThrow(Error);
  });

  it("adds child to another parent after removing child from prior parent", () => {
    label1.removeChild(rect1);
    label2.addChild(rect1);
    expect(label2.children).toContain(rect1);
    expect(label1.children).not.toContain(rect1);
  });

  it("adds child to another parent even if parent is not part of game", () => {
    const newLabel1 = new Label({ text: "words", name: "myLabel1" });
    const newLabel2 = new Label({ text: "words", name: "myLabel2" });
    newLabel1.addChild(newLabel2);
    expect(newLabel1.children).toContain(newLabel2);
    expect(newLabel2.parent).toBe(newLabel1);
  });

  it("throws Error when adding child to parent, not yet added to game object, without removing it from another parent", () => {
    const newLabel1 = new Label({ text: "words", name: "myLabel1" });
    const newLabel2 = new Label({ text: "words", name: "myLabel2" });
    const newLabel3 = new Label({ text: "words", name: "myLabel3" });
    newLabel1.addChild(newLabel2);
    newLabel2.addChild(newLabel3);
    const t = () => {
      newLabel1.addChild(newLabel3);
    };
    expect(t).toThrow(Error);
  });
});

describe("test scale", () => {
  it("new label is initialized with correct scale", () => {
    const newLabel = new Label({
      text: "words",
      name: "myNewLabel",
      scale: 0.5,
    });
    scene1.addChild(newLabel);
    expect(newLabel.scale).toEqual(0.5);
  });

  it("child of node inherits parent node scale", async () => {
    /**
     * Once a session is started, labels require a font to be loaded before
     * they can be drawn. Avoid loading a font, and test alpha with shapes
     * instead.
     */
    scene1.removeChild(label1);
    scene1.removeChild(label2);
    const newRect1 = new Shape({
      rect: { size: { width: 100, height: 100 } },
      name: "newRect1",
      scale: 0.8,
    });
    scene1.addChild(newRect1);
    const newRect2 = new Shape({
      rect: { size: { width: 100, height: 100 } },
      name: "newRect2",
      scale: 0.6,
    });
    newRect1.addChild(newRect2);
    TestHelpers.perfCounter = 0;
    TestHelpers.requestedFrames = 0;
    TestHelpers.maxRequestedFrames = 20;
    await g1.start();
    // .8 parent scale * .6 child scale = child absolute scale .48
    expect(newRect2.absoluteScale).toEqual(0.48);
  });
});

describe("test alpha", () => {
  it("new label is initialized with correct alpha", () => {
    const newLabel = new Label({
      text: "words",
      name: "myNewLabel",
      alpha: 0.5,
    });
    scene1.addChild(newLabel);
    expect(newLabel.alpha).toEqual(0.5);
  });

  it("child of node inherits parent node alpha", async () => {
    /**
     * Once a session is started, labels require a font to be loaded before
     * they can be drawn. Avoid loading a font, and test alpha with shapes
     * instead.
     */
    scene1.removeChild(label1);
    scene1.removeChild(label2);
    const newRect1 = new Shape({
      rect: { size: { width: 100, height: 100 } },
      name: "newRect1",
      alpha: 0.2,
    });
    scene1.addChild(newRect1);
    const newRect2 = new Shape({
      rect: { size: { width: 100, height: 100 } },
      name: "newRect2",
      alpha: 0.5,
    });
    newRect1.addChild(newRect2);
    TestHelpers.perfCounter = 0;
    TestHelpers.requestedFrames = 0;
    TestHelpers.maxRequestedFrames = 10;
    await g1.start();
    // .2 parent alpha * .5 child alpha = child absolute alpha .1
    expect(newRect2.absoluteAlpha).toEqual(0.1);
  });
});

describe("test zRotation", () => {
  it("new label is initialized with correct zRotation", () => {
    const newLabel = new Label({
      text: "words",
      name: "myNewLabel",
      zRotation: Math.PI / 2,
    });
    scene1.addChild(newLabel);
    expect(newLabel.zRotation).toEqual(Math.PI / 2);
  });
});
