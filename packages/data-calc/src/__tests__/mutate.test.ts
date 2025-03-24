import { DataCalc } from "../DataCalc";
import { Observation } from "../Observation";

let d: Array<Observation>;
let d_1: Array<Observation>;

describe("mutate tests", () => {
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

  it("adds a new variable based on an existing variable", () => {
    const dc = new DataCalc(d);
    const mutated = dc.mutate({ doubledA: (obs) => obs.a * 2 });
    expect(mutated.observations).toEqual([
      { a: 1, b: 2, c: 3, doubledA: 2 },
      { a: 0, b: 8, c: 3, doubledA: 0 },
      { a: 9, b: 4, c: 7, doubledA: 18 },
      { a: 5, b: 0, c: 7, doubledA: 10 },
    ]);
  });

  it("adds multiple new variables", () => {
    const dc = new DataCalc(d);
    const mutated = dc.mutate({
      doubledA: (obs) => obs.a * 2,
      sumAB: (obs) => obs.a + obs.b,
    });
    expect(mutated.observations).toEqual([
      { a: 1, b: 2, c: 3, doubledA: 2, sumAB: 3 },
      { a: 0, b: 8, c: 3, doubledA: 0, sumAB: 8 },
      { a: 9, b: 4, c: 7, doubledA: 18, sumAB: 13 },
      { a: 5, b: 0, c: 7, doubledA: 10, sumAB: 5 },
    ]);
  });

  it("returns a new DataCalc object", () => {
    const dc = new DataCalc(d);
    const mutated = dc.mutate({ doubledA: (obs) => obs.a * 2 });
    expect(mutated).toBeInstanceOf(DataCalc);
    expect(mutated).not.toBe(dc); // Should be a different object
    // Original should be unchanged
    expect(dc.observations).toEqual(d);
  });

  it("handles mixed data types", () => {
    const dc = new DataCalc(d_1);
    const mutated = dc.mutate({
      typeofA: (obs) => typeof obs.a,
      typeofB: (obs) => typeof obs.b,
    });
    expect(mutated.observations).toEqual([
      { a: 1, b: null, c: undefined, typeofA: "number", typeofB: "object" },
      { a: 0, b: 8, c: "a", typeofA: "number", typeofB: "number" },
      { a: true, b: 4, c: 7, typeofA: "boolean", typeofB: "number" },
      { a: false, b: 0, c: 7, typeofA: "boolean", typeofB: "number" },
    ]);
  });

  it("can create complex derived variables", () => {
    const dc = new DataCalc(d);
    const mutated = dc.mutate({
      isAGreaterThanB: (obs) => obs.a > obs.b,
      categorizeA: (obs) => {
        if (obs.a < 2) return "low";
        if (obs.a < 6) return "medium";
        return "high";
      },
    });
    expect(mutated.observations).toEqual([
      { a: 1, b: 2, c: 3, isAGreaterThanB: false, categorizeA: "low" },
      { a: 0, b: 8, c: 3, isAGreaterThanB: false, categorizeA: "low" },
      { a: 9, b: 4, c: 7, isAGreaterThanB: true, categorizeA: "high" },
      { a: 5, b: 0, c: 7, isAGreaterThanB: true, categorizeA: "medium" },
    ]);
  });

  it("throws an error if used on grouped data", () => {
    const dc = new DataCalc(d);
    const grouped = dc.groupBy("c");
    expect(() => {
      grouped.mutate({ doubledA: (obs) => obs.a * 2 });
    }).toThrow();
  });

  it("overwrites an existing variable when the new variable has the same name", () => {
    const dc = new DataCalc(d);
    const mutated = dc.mutate({ a: (obs) => obs.a + 100 });
    expect(mutated.observations).toEqual([
      { a: 101, b: 2, c: 3 },
      { a: 100, b: 8, c: 3 },
      { a: 109, b: 4, c: 7 },
      { a: 105, b: 0, c: 7 },
    ]);
  });
});
