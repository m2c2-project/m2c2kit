import { DataCalc } from "../DataCalc";
import { Observation } from "../Observation";

let d: Array<Observation>;
let d_empty: Array<Observation>;

describe("slice tests", () => {
  beforeEach(() => {
    d = [
      { a: 1, b: 2, c: 3 },
      { a: 4, b: 5, c: 6 },
      { a: 7, b: 8, c: 9 },
      { a: 10, b: 11, c: 12 },
    ];

    d_empty = [];
  });

  it("slices observations from start to end", () => {
    const dc = new DataCalc(d);
    expect(dc.slice(1, 3).observations).toEqual([
      { a: 4, b: 5, c: 6 },
      { a: 7, b: 8, c: 9 },
    ]);
  });

  it("slices a single observation at start when end is omitted", () => {
    const dc = new DataCalc(d);
    expect(dc.slice(2).observations).toEqual([{ a: 7, b: 8, c: 9 }]);
  });

  it("returns an empty array when start is greater than array length", () => {
    const dc = new DataCalc(d);
    expect(dc.slice(10).observations).toEqual([]);
  });

  it("returns an empty array when start equals end", () => {
    const dc = new DataCalc(d);
    expect(dc.slice(2, 2).observations).toEqual([]);
  });

  it("handles negative indices", () => {
    const dc = new DataCalc(d);
    expect(dc.slice(-3).observations).toEqual([{ a: 4, b: 5, c: 6 }]);
  });

  it("returns a new DataCalc object, preserving original", () => {
    const dc = new DataCalc(d);
    const result = dc.slice(1, 3);

    expect(result).toBeInstanceOf(DataCalc);
    expect(result).not.toBe(dc);
    // Original should be unchanged
    expect(dc.observations).toEqual(d);
  });

  it("handles empty datasets", () => {
    const dc = new DataCalc(d_empty);
    expect(dc.slice(0, 1).observations).toEqual([]);
  });

  it("throws an error when used on grouped data", () => {
    const dc = new DataCalc(d);
    const grouped = dc.groupBy("a");

    expect(() => {
      grouped.slice(1, 2);
    }).toThrow(/slice\(\) cannot be used on grouped data/);
  });
});
