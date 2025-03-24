import { DataCalc } from "../DataCalc";
import { Observation } from "../Observation";

let d: Array<Observation>;
let d_1: Array<Observation>;

describe("filter tests", () => {
  beforeEach(() => {
    d = [
      { a: 1, b: 2, c: 3 },
      { a: 0, b: 8, c: 3 },
      { a: 9, b: 4, c: 7 },
      { a: 5, b: 0, c: 7 },
    ];

    d_1 = [
      { a: 1, b: null, c: undefined },
      { a: 0, b: 8, c: "a" },
      { a: true, b: 4, c: 7 },
      { a: false, b: 0, c: 7 },
    ];
  });

  it("filters observations based on a predicate", () => {
    const dc = new DataCalc(d);
    const filtered = dc.filter((obs) => obs.a > 3);
    expect(filtered.observations).toEqual([
      { a: 9, b: 4, c: 7 },
      { a: 5, b: 0, c: 7 },
    ]);
  });

  it("returns a new DataCalc object with the filtered observations", () => {
    const dc = new DataCalc(d);
    const filtered = dc.filter((obs) => obs.b > 3);
    expect(filtered).toBeInstanceOf(DataCalc);
    expect(filtered).not.toBe(dc); // Should be a different object
    expect(filtered.observations).toEqual([
      { a: 0, b: 8, c: 3 },
      { a: 9, b: 4, c: 7 },
    ]);
  });

  it("returns empty result when no observations match the filter", () => {
    const dc = new DataCalc(d);
    const filtered = dc.filter((obs) => obs.a > 10);
    expect(filtered.observations).toEqual([]);
    expect(filtered.length).toBe(0);
  });

  it("returns all observations when all match the filter", () => {
    const dc = new DataCalc(d);
    const filtered = dc.filter((obs) => obs.a >= 0);
    expect(filtered.observations).toEqual(d);
    expect(filtered.length).toBe(4);
  });

  it("filters observations with complex conditions", () => {
    const dc = new DataCalc(d);
    const filtered = dc.filter((obs) => obs.a > 0 && obs.b < 5);
    expect(filtered.observations).toEqual([
      { a: 1, b: 2, c: 3 },
      { a: 9, b: 4, c: 7 },
      { a: 5, b: 0, c: 7 },
    ]);
  });

  it("filters observations with mixed data types", () => {
    const dc = new DataCalc(d_1);
    const filtered = dc.filter((obs) => obs.b !== null && obs.b > 3);
    expect(filtered.observations).toEqual([
      { a: 0, b: 8, c: "a" },
      { a: true, b: 4, c: 7 },
    ]);
  });

  it("throws an error when used on grouped data", () => {
    const dc = new DataCalc(d);
    const grouped = dc.groupBy("c");
    expect(() => {
      grouped.filter((obs) => obs.a > 0);
    }).toThrow();
  });
});
