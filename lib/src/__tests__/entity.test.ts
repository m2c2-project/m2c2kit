import { Game, Scene, Label, Shape, Size } from "../../../dist/umd";

let game: Game;
let scene1: Scene;
let label1: Label;
let rect1: Shape;

beforeEach(() => {
  game = new Game();
  scene1 = new Scene({ name: "myScene1" });
  game.addScene(scene1);
  label1 = new Label({ text: "Hello", name: "myLabel1" });
  scene1.addChild(label1);
  rect1 = new Shape({ rect: { size: new Size(100, 100) }, name: "myRect1" });
  label1.addChild(rect1);
});

// describe("test parentScene() method", () => {
//   it("should return scene as parent scene of label", () => {
//     expect(label1.parentScene).toBe(scene1);
//     expect(label1.parentScene.name).toBe("myScene1");
//   });

//   it("should return scene as parent scene of rect", () => {
//     expect(rect1.parentScene).toBe(scene1);
//     expect(rect1.parentScene.name).toBe("myScene1");
//   });

//   it("should throw Error when calling parentScene on a scene", () => {
//     // see https://stackoverflow.com/a/46155381
//     const t = () => {
//       return scene1.parentScene;
//     };
//     expect(t).toThrow(Error);
//   });
// });

describe("test descendants()", () => {
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

describe("test descendant()", () => {
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

describe("test removeAllChildren()", () => {
  it("scene1 children should have length 0", () => {
    scene1.removeAllChildren();
    expect(scene1.children).toHaveLength(0);
  });
});

describe("test addChild()", () => {
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
