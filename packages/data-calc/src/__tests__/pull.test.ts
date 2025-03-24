import { DataCalc } from "../DataCalc";
import { Observation } from "../Observation";

let d: Array<Observation>;
let d_single: Array<Observation>;
let d_complex: Array<Observation>;
let d_empty: Array<Observation>;

describe("pull tests", () => {
  beforeEach(() => {
    d = [
      { a: 1, b: "hello", c: true },
      { a: 2, b: "world", c: false },
      { a: 3, b: "test", c: true },
    ];

    d_single = [{ a: 42, b: "singleton", c: { name: "test" } }];

    d_complex = [
      { a: { x: 1, y: 2 }, b: [1, 2, 3], c: "complex" },
      { a: { x: 3, y: 4 }, b: [4, 5, 6], c: "data" },
    ];

    d_empty = [];
  });

  it("returns a single value when there is only one observation", () => {
    const dc = new DataCalc(d_single);
    expect(dc.pull("a")).toBe(42);
    expect(dc.pull("b")).toBe("singleton");
    expect(dc.pull("c")).toEqual({ name: "test" });
  });

  it("returns an array of values when there are multiple observations", () => {
    const dc = new DataCalc(d);
    expect(dc.pull("a")).toEqual([1, 2, 3]);
    expect(dc.pull("b")).toEqual(["hello", "world", "test"]);
    expect(dc.pull("c")).toEqual([true, false, true]);
  });

  it("handles complex data types", () => {
    const dc = new DataCalc(d_complex);
    expect(dc.pull("a")).toEqual([
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ]);
    expect(dc.pull("b")).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);
  });

  it("throws an error when variable doesn't exist", () => {
    const dc = new DataCalc(d);
    expect(() => {
      dc.pull("nonexistent");
    }).toThrow(/Variable nonexistent does not exist/);
  });

  it("does not maintain the original reference to complex objects", () => {
    const dc = new DataCalc(d_complex);
    const result = dc.pull("a");

    // Modify the original data
    d_complex[0].a.x = 100;

    // The result should not reflect the change
    expect(result).toEqual([
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ]);
  });

  it("handles empty datasets", () => {
    const dc = new DataCalc(d_empty);
    expect(() => {
      dc.pull("a");
    }).toThrow(); // Should throw since there are no variables to verify
  });

  it("works with grouped data", () => {
    const dc = new DataCalc(d);
    const grouped = dc.groupBy("c");

    // Pull should still work on grouped data
    expect(grouped.pull("a")).toEqual([1, 2, 3]);
    expect(grouped.pull("b")).toEqual(["hello", "world", "test"]);
  });
});
