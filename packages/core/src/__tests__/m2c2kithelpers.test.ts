import { TestHelpers } from "./TestHelpers";
import { Game, GameOptions, Scene, Shape } from "..";
import { M2c2KitHelpers } from "../M2c2KitHelpers";

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

    rect1 = new Shape({
      rect: { size: { width: 100, height: 100 } },
      name: "myRect1",
      position: { x: 140, y: 160 },
    });
    scene1.addChild(rect1);

    circle1 = new Shape({
      circleOfRadius: 30,
      name: "myCircle1",
      position: { x: 200, y: 600 },
    });
    scene1.addChild(circle1);
  }
}

let g1: Game1;
let scene1: Scene;
let rect1: Shape;
let circle1: Shape;

beforeEach(async () => {
  g1 = new Game1();
  TestHelpers.setupDomAndGlobals();
  await g1.initialize();
});

/**
 * In some of the below tests, we must start the session and simulate some
 * frame renders because some of the M2c2KitHelpers methods rely on a
 * node's absoluteBoundingBox property, which is calculated during the
 * render process.
 */

describe("test M2c2KitHelpers", () => {
  it("calculates scene absolute bounding box", async () => {
    TestHelpers.perfCounter = 0;
    TestHelpers.requestedFrames = 0;
    TestHelpers.maxRequestedFrames = 20;
    await g1.start();

    const bb = M2c2KitHelpers.calculateNodeAbsoluteBoundingBox(scene1);
    expect(bb.xMin).toBe(0);
    expect(bb.yMin).toBe(0);
    expect(bb.xMax).toBe(400);
    expect(bb.yMax).toBe(800);
  });

  it("calculates rect absolute bounding box", async () => {
    TestHelpers.perfCounter = 0;
    TestHelpers.requestedFrames = 0;
    TestHelpers.maxRequestedFrames = 20;
    await g1.start();

    const bb = M2c2KitHelpers.calculateNodeAbsoluteBoundingBox(rect1);
    // rect is 100x100, positioned at 140,160
    expect(bb.xMin).toBe(90);
    expect(bb.yMin).toBe(110);
    expect(bb.xMax).toBe(190);
    expect(bb.yMax).toBe(210);
  });

  it("calculates circle absolute bounding box", async () => {
    TestHelpers.perfCounter = 0;
    TestHelpers.requestedFrames = 0;
    TestHelpers.maxRequestedFrames = 20;
    await g1.start();

    const bb = M2c2KitHelpers.calculateNodeAbsoluteBoundingBox(circle1);
    // circle radius is 30, positioned at 200, 600
    expect(bb.xMin).toBe(170);
    expect(bb.yMin).toBe(570);
    expect(bb.xMax).toBe(230);
    expect(bb.yMax).toBe(630);
  });

  it("calculates scene rotation transforms", async () => {
    TestHelpers.perfCounter = 0;
    TestHelpers.requestedFrames = 0;
    TestHelpers.maxRequestedFrames = 20;
    await g1.start();
    scene1.zRotation = Math.PI / 2;

    const transforms = M2c2KitHelpers.calculateRotationTransforms(scene1);
    expect(transforms.length).toBe(1);
    expect(transforms[0].center.x).toBe(200);
    expect(transforms[0].center.y).toBe(400);
    expect(transforms[0].radians).toBe(Math.PI / 2);
  });

  it("rotates scene's bounding box points by pi/2 radians", async () => {
    TestHelpers.perfCounter = 0;
    TestHelpers.requestedFrames = 0;
    TestHelpers.maxRequestedFrames = 20;
    await g1.start();
    scene1.zRotation = Math.PI / 2;

    const points = M2c2KitHelpers.calculateRotatedPoints(scene1);
    // upper left corner of scene
    expect(points[0].x).toBeCloseTo(-200);
    expect(points[0].y).toBeCloseTo(600);
    // upper right corner of scene
    expect(points[1].x).toBeCloseTo(-200);
    expect(points[1].y).toBeCloseTo(200);
    // lower left corner of scene
    expect(points[2].x).toBeCloseTo(600);
    expect(points[2].y).toBeCloseTo(200);
    // lower right corner of scene
    expect(points[3].x).toBeCloseTo(600);
    expect(points[3].y).toBeCloseTo(600);
  });

  it("determines point is inside rectangle", () => {
    const point = { x: 15, y: 18 };
    const rectangle = [
      { x: 10, y: 20 },
      { x: 30, y: 20 },
      { x: 30, y: 10 },
      { x: 10, y: 10 },
    ];
    const inside = M2c2KitHelpers.isPointInsideRectangle(point, rectangle);
    expect(inside).toBe(true);
  });

  it("determines point is outside rectangle", () => {
    const point = { x: 0, y: 0 };
    const rectangle = [
      { x: 10, y: 20 },
      { x: 30, y: 20 },
      { x: 30, y: 10 },
      { x: 10, y: 10 },
    ];
    const inside = M2c2KitHelpers.isPointInsideRectangle(point, rectangle);
    expect(inside).toBe(false);
  });

  it("determines point on rectangle side is inside rectangle", () => {
    const point = { x: 10, y: 15 };
    const rectangle = [
      { x: 10, y: 20 },
      { x: 30, y: 20 },
      { x: 30, y: 10 },
      { x: 10, y: 10 },
    ];
    const inside = M2c2KitHelpers.isPointInsideRectangle(point, rectangle);
    expect(inside).toBe(true);
  });

  it("determines if node or ancestor has been rotated when node has been rotated", () => {
    scene1.zRotation = Math.PI / 2;
    const rotated = M2c2KitHelpers.nodeOrAncestorHasBeenRotated(scene1);
    expect(rotated).toBe(true);
  });

  it("determines if node or ancestor has been rotated when ancestor has been rotated", () => {
    scene1.zRotation = Math.PI / 2;
    const rotated = M2c2KitHelpers.nodeOrAncestorHasBeenRotated(rect1);
    expect(rotated).toBe(true);
  });
});
