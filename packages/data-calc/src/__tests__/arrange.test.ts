import { DataCalc } from "../DataCalc";
import { Observation } from "../Observation";

let d: Array<Observation>;
let d_mixed_types: Array<Observation>;
let d_empty: Array<Observation>;
let d_single: Array<Observation>;

describe("arrange tests", () => {
  beforeEach(() => {
    d = [
      { a: 5, b: 2, c: 3 },
      { a: 3, b: 7, c: 3 },
      { a: 5, b: 1, c: 7 },
      { a: 9, b: 4, c: 7 },
    ];

    d_mixed_types = [
      { a: "z", b: 2, c: true },
      { a: "a", b: 7, c: false },
      { a: 5, b: 1, c: true },
      { a: 10, b: 4, c: false },
    ];

    d_empty = [];

    d_single = [{ a: 5, b: 3, c: 1 }];
  });

  it("arranges observations by a single variable (ascending)", () => {
    const dc = new DataCalc(d);
    expect(dc.arrange("a").observations).toEqual([
      { a: 3, b: 7, c: 3 },
      { a: 5, b: 2, c: 3 },
      { a: 5, b: 1, c: 7 },
      { a: 9, b: 4, c: 7 },
    ]);
  });

  it("arranges observations by a single variable (descending)", () => {
    const dc = new DataCalc(d);
    expect(dc.arrange("-a").observations).toEqual([
      { a: 9, b: 4, c: 7 },
      { a: 5, b: 2, c: 3 },
      { a: 5, b: 1, c: 7 },
      { a: 3, b: 7, c: 3 },
    ]);
  });

  it("arranges observations by multiple variables", () => {
    const dc = new DataCalc(d);
    expect(dc.arrange("a", "b").observations).toEqual([
      { a: 3, b: 7, c: 3 },
      { a: 5, b: 1, c: 7 },
      { a: 5, b: 2, c: 3 },
      { a: 9, b: 4, c: 7 },
    ]);
  });

  it("arranges observations with mixed ascending/descending", () => {
    const dc = new DataCalc(d);
    expect(dc.arrange("a", "-b").observations).toEqual([
      { a: 3, b: 7, c: 3 },
      { a: 5, b: 2, c: 3 },
      { a: 5, b: 1, c: 7 },
      { a: 9, b: 4, c: 7 },
    ]);
  });

  it("handles ties in the first variable correctly", () => {
    const dc = new DataCalc(d);
    expect(dc.arrange("c", "a").observations).toEqual([
      { a: 3, b: 7, c: 3 },
      { a: 5, b: 2, c: 3 },
      { a: 5, b: 1, c: 7 },
      { a: 9, b: 4, c: 7 },
    ]);
  });

  it("handles mixed data types by converting to strings", () => {
    const dc = new DataCalc(d_mixed_types);
    expect(dc.arrange("a").observations).toEqual([
      { a: 5, b: 1, c: true },
      { a: 10, b: 4, c: false },
      { a: "a", b: 7, c: false },
      { a: "z", b: 2, c: true },
    ]);
  });

  it("returns a new DataCalc object, preserving original", () => {
    const dc = new DataCalc(d);
    const result = dc.arrange("a");

    expect(result).toBeInstanceOf(DataCalc);
    expect(result).not.toBe(dc);
    // Original should be unchanged
    expect(dc.observations).toEqual(d);
  });

  it("handles empty datasets", () => {
    const dc = new DataCalc(d_empty);
    expect(dc.arrange("a").observations).toEqual([]);
  });

  it("handles single observation datasets", () => {
    const dc = new DataCalc(d_single);
    expect(dc.arrange("a").observations).toEqual(d_single);
  });

  it("throws an error for non-existent variables", () => {
    const dc = new DataCalc(d);
    expect(() => {
      dc.arrange("x");
    }).toThrow(/variable x does not exist/);
  });

  it("throws an error when arranging grouped data", () => {
    const dc = new DataCalc(d);
    const grouped = dc.groupBy("c");
    expect(() => {
      grouped.arrange("a");
    }).toThrow(/arrange\(\) cannot be used on grouped data/);
  });
});
