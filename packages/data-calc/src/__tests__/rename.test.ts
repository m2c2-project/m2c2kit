import { DataCalc } from "../DataCalc";
import { Observation } from "../Observation";

let d: Array<Observation>;
let d_empty: Array<Observation>;

describe("rename tests", () => {
  beforeEach(() => {
    d = [
      { a: 1, b: 2, c: 3 },
      { a: 4, b: 5, c: 6 },
      { a: 7, b: 8, c: 9 },
    ];

    d_empty = [];
  });

  it("renames a single variable", () => {
    const dc = new DataCalc(d);
    expect(dc.rename({ x: "a" }).observations).toEqual([
      { x: 1, b: 2, c: 3 },
      { x: 4, b: 5, c: 6 },
      { x: 7, b: 8, c: 9 },
    ]);
  });

  it("renames multiple variables", () => {
    const dc = new DataCalc(d);
    expect(dc.rename({ x: "a", y: "b", z: "c" }).observations).toEqual([
      { x: 1, y: 2, z: 3 },
      { x: 4, y: 5, z: 6 },
      { x: 7, y: 8, z: 9 },
    ]);
  });

  it("preserves variables that aren't being renamed", () => {
    const dc = new DataCalc(d);
    expect(dc.rename({ x: "a" }).observations).toEqual([
      { x: 1, b: 2, c: 3 },
      { x: 4, b: 5, c: 6 },
      { x: 7, b: 8, c: 9 },
    ]);
  });

  it("returns a new DataCalc object, preserving original", () => {
    const dc = new DataCalc(d);
    const result = dc.rename({ x: "a" });

    expect(result).toBeInstanceOf(DataCalc);
    expect(result).not.toBe(dc);
    // Original should be unchanged
    expect(dc.observations).toEqual(d);
  });

  it("preserves group information", () => {
    const dc = new DataCalc(d);
    const grouped = dc.groupBy("c");
    const result = grouped.rename({ x: "a" });

    expect(result.groups).toEqual(["c"]);
  });

  it("throws an error for non-existent variables", () => {
    const dc = new DataCalc(d);
    expect(() => {
      dc.rename({ x: "nonexistent" });
    }).toThrow();
  });

  it("throw an error on empty dataset", () => {
    const dc = new DataCalc(d_empty);
    expect(() => {
      dc.rename({ x: "a" });
    }).toThrow(); // Should throw since there are no variables to verify
  });

  it("can be chained with other methods", () => {
    const dc = new DataCalc(d);
    expect(
      dc.rename({ x: "a" }).filter((obs) => obs.x > 3).observations,
    ).toEqual([
      { x: 4, b: 5, c: 6 },
      { x: 7, b: 8, c: 9 },
    ]);
  });

  it("works with complex variable values", () => {
    const complexData = [
      { id: 1, data: { x: 10, y: 20 }, arr: [1, 2, 3] },
      { id: 2, data: { x: 30, y: 40 }, arr: [4, 5, 6] },
    ];
    const dc = new DataCalc(complexData);

    expect(dc.rename({ info: "data", list: "arr" }).observations).toEqual([
      { id: 1, info: { x: 10, y: 20 }, list: [1, 2, 3] },
      { id: 2, info: { x: 30, y: 40 }, list: [4, 5, 6] },
    ]);
  });
});
