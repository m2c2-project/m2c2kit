import { DataCalc } from "../DataCalc";
import { Observation } from "../Observation";
import { n } from "../SummarizeOperations";

let d: Array<Observation>;
let d_empty: Array<Observation>;

describe("select tests", () => {
  beforeEach(() => {
    d = [
      { a: 1, b: 2, c: 3, d: 4 },
      { a: 5, b: 6, c: 7, d: 8 },
    ];
    d_empty = [];
  });

  it("selects specific variables to keep", () => {
    const dc = new DataCalc(d);
    expect(dc.select("a", "c").observations).toEqual([
      { a: 1, c: 3 },
      { a: 5, c: 7 },
    ]);
  });

  it("excludes specific variables with - prefix", () => {
    const dc = new DataCalc(d);
    expect(dc.select("-b", "-d").observations).toEqual([
      { a: 1, c: 3 },
      { a: 5, c: 7 },
    ]);
  });

  it("combines includes and excludes", () => {
    const dc = new DataCalc(d);
    expect(dc.select("a", "b", "-c").observations).toEqual([
      { a: 1, b: 2 },
      { a: 5, b: 6 },
    ]);
  });

  it("returns a new DataCalc object", () => {
    const dc = new DataCalc(d);
    const result = dc.select("a", "c");

    expect(result).toBeInstanceOf(DataCalc);
    expect(result).not.toBe(dc);
    // Original should be unchanged
    expect(dc.observations).toEqual(d);
  });

  it("preserves group information", () => {
    const dc = new DataCalc(d);
    const grouped = dc.groupBy("a");
    const result = grouped.select("a", "c");

    // Should still be grouped by "a"
    expect(result.groups).toEqual(grouped.groups);
  });

  it("throws an error for non-existent variables", () => {
    const dc = new DataCalc(d);
    expect(() => {
      dc.select("x");
    }).toThrow();
  });

  it("throws an error for non-existent excluded variables", () => {
    const dc = new DataCalc(d);
    expect(() => {
      dc.select("-x");
    }).toThrow();
  });

  it("handles empty datasets", () => {
    const dc = new DataCalc(d_empty);
    expect(dc.select("a", "b").observations).toEqual([]);
  });

  it("selects a single variable", () => {
    const dc = new DataCalc(d);
    expect(dc.select("a").observations).toEqual([{ a: 1 }, { a: 5 }]);
  });

  it("excludes a single variable", () => {
    const dc = new DataCalc(d);
    expect(dc.select("-a").observations).toEqual([
      { b: 2, c: 3, d: 4 },
      { b: 6, c: 7, d: 8 },
    ]);
  });
});
