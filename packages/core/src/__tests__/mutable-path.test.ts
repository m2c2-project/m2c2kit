import { MutablePath } from "../MutablePath";

describe("MutablePath", () => {
  it("first move creates 1 subpath with 1 point", () => {
    const path = new MutablePath();
    path.move({ x: 1, y: 2 });
    expect(path.subpaths.length).toEqual(1);
    expect(path.subpaths[0].length).toEqual(1);
    expect(path.subpaths[0][0].x).toEqual(1);
    expect(path.subpaths[0][0].y).toEqual(2);
  });

  it("draws 2 separate lines", () => {
    const path = new MutablePath();
    path.move({ x: 1, y: 2 });
    path.addLine({ x: 3, y: 4 });
    path.move({ x: 10, y: 10 });
    path.addLine({ x: 20, y: 20 });
    path.addLine({ x: 20, y: 2 });
    expect(path.subpaths.length).toEqual(2);
    expect(path.subpaths[0].length).toEqual(2);
    expect(path.subpaths[0][1].x).toEqual(3);
    expect(path.subpaths[0][1].y).toEqual(4);
    expect(path.subpaths[1].length).toEqual(3);
  });

  it("clears existing paths", () => {
    const path = new MutablePath();
    path.move({ x: 10, y: 10 });
    path.addLine({ x: 20, y: 20 });
    path.addLine({ x: 20, y: 2 });
    path.clear();
    expect(path.subpaths.length).toEqual(0);
  });

  it("duplicates", () => {
    const path = new MutablePath();
    path.move({ x: 10, y: 10 });
    path.addLine({ x: 20, y: 20 });
    const dup = path.duplicate();
    // it is a deep copy, so dup and properties do not
    // points to same object as path
    expect(dup).not.toBe(path);
    expect(dup.subpaths).not.toBe(path.subpaths);
    expect(dup.subpaths[0]).not.toBe(path.subpaths[0]);
    // we do expect the values to be equal
    expect(dup.subpaths[0][0].x).toEqual(path.subpaths[0][0].x);
    expect(dup.subpaths[0][0].y).toEqual(path.subpaths[0][0].y);
  });
});
