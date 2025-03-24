import { DataCalc } from "../DataCalc";
import { Observation } from "../Observation";

let d: Array<Observation>;
let d_empty: Array<Observation>;
let d_complex: Array<Observation>;

describe("distinct tests", () => {
  beforeEach(() => {
    d = [
      { a: 1, b: 2, c: 3 },
      { a: 1, b: 2, c: 3 }, // Duplicate
      { a: 2, b: 3, c: 5 },
      { a: 1, b: 2, c: 3 }, // Another duplicate
      { a: 3, b: 3, c: 7 },
    ];

    d_empty = [];

    d_complex = [
      { a: 1, b: 2, c: { name: "dog" } },
      { a: 1, b: 2, c: { name: "dog" } }, // Duplicate with nested object
      { a: 2, b: 3, c: { name: "cat" } },
      { a: 3, b: 3, c: [1, 2, 3] },
      { a: 3, b: 3, c: [1, 2, 3] }, // Duplicate with array
    ];
  });

  it("removes duplicate observations", () => {
    const dc = new DataCalc(d);
    expect(dc.distinct().observations).toEqual([
      { a: 1, b: 2, c: 3 },
      { a: 2, b: 3, c: 5 },
      { a: 3, b: 3, c: 7 },
    ]);
  });

  it("handles empty datasets", () => {
    const dc = new DataCalc(d_empty);
    expect(dc.distinct().observations).toEqual([]);
  });

  it("returns a new DataCalc object, preserving original", () => {
    const dc = new DataCalc(d);
    const result = dc.distinct();

    expect(result).toBeInstanceOf(DataCalc);
    expect(result).not.toBe(dc);
    // Original should be unchanged
    expect(dc.observations).toEqual(d);
  });

  it("preserves group information", () => {
    const dc = new DataCalc(d);
    const grouped = dc.groupBy("c");
    const result = grouped.distinct();

    expect(result.groups).toEqual(["c"]);
  });

  it("handles complex nested objects correctly", () => {
    const dc = new DataCalc(d_complex);
    const result = dc.distinct();

    expect(result.observations).toEqual([
      { a: 1, b: 2, c: { name: "dog" } },
      { a: 2, b: 3, c: { name: "cat" } },
      { a: 3, b: 3, c: [1, 2, 3] },
    ]);
  });

  it("considers objects with different property orders as duplicates", () => {
    const dc = new DataCalc([
      { a: 1, b: 2, c: { name: "dog", color: "brown" } },
      { b: 2, a: 1, c: { color: "brown", name: "dog" } }, // Same data, different property order
    ]);
    const result = dc.distinct();

    expect(result.observations).toHaveLength(1);
  });

  it("returns the original dataset when all rows are already unique", () => {
    const uniqueData = [
      { a: 1, b: 2, c: 3 },
      { a: 2, b: 3, c: 4 },
      { a: 3, b: 4, c: 5 },
    ];
    const dc = new DataCalc(uniqueData);
    expect(dc.distinct().observations).toEqual(uniqueData);
  });

  it("handles deeply nested complex structures", () => {
    const dc = new DataCalc([
      { a: 1, b: { x: [1, 2], y: { z: "test" } } },
      { a: 1, b: { x: [1, 2], y: { z: "test" } } }, // Duplicate with complex nesting
      { a: 2, b: { x: [3, 4], y: { z: "other" } } },
    ]);
    const result = dc.distinct();

    expect(result.observations).toEqual([
      { a: 1, b: { x: [1, 2], y: { z: "test" } } },
      { a: 2, b: { x: [3, 4], y: { z: "other" } } },
    ]);
  });

  it("treats arrays with different order as different", () => {
    const dc = new DataCalc([
      { a: 1, b: [1, 2, 3] },
      { a: 1, b: [3, 2, 1] }, // Different array order
    ]);
    const result = dc.distinct();

    expect(result.observations).toHaveLength(2);
  });
});
