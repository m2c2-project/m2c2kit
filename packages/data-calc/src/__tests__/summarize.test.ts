import { DataCalc } from "../DataCalc";
import { Observation } from "../Observation";
import {
  mean,
  sum,
  median,
  variance,
  max,
  min,
  sd,
  n,
} from "../SummarizeOperations";

let d: Array<Observation>;
let d_empty: Array<Observation>;
let d_multi: Array<Observation>;

describe("summarize tests", () => {
  beforeEach(() => {
    d = [
      { a: 1, b: 2, c: 3 },
      { a: 0, b: 8, c: 3 },
      { a: 9, b: 4, c: 7 },
      { a: 5, b: 0, c: 7 },
    ];

    d_empty = [];

    d_multi = [
      { a: 1, b: 3, c: 1 },
      { a: 1, b: 2, c: 2 },
      { a: 1, b: 2, c: 3 },
      { a: 1, b: 3, c: 1 },
      { a: 4, b: 2, c: 5 },
      { a: 4, b: 2, c: 1 },
      { a: 4, b: 3, c: 10 },
      { a: 4, b: 3, c: 12 },
    ];
  });

  it("calculates a single summary statistic", () => {
    const dc = new DataCalc(d);
    const result = dc.summarize({
      meanA: mean("a"),
    });
    expect(result.observations).toEqual([{ meanA: 3.75 }]);
  });

  it("calculates multiple summary statistics", () => {
    const dc = new DataCalc(d);
    const result = dc.summarize({
      meanA: mean("a"),
      sumB: sum("b"),
      medianC: median("c"),
    });
    expect(result.observations).toEqual([
      { meanA: 3.75, sumB: 14, medianC: 5 },
    ]);
  });

  it("returns a new DataCalc object", () => {
    const dc = new DataCalc(d);
    const result = dc.summarize({ meanA: mean("a") });
    expect(result).toBeInstanceOf(DataCalc);
    expect(result).not.toBe(dc);
    // Original should be unchanged
    expect(dc.observations).toEqual(d);
  });

  it("returns a single observation for ungrouped data", () => {
    const dc = new DataCalc(d);
    const result = dc.summarize({
      meanA: mean("a"),
      varA: variance("a"),
    });
    expect(result.observations.length).toBe(1);
  });

  it("calculates summaries for grouped data", () => {
    const dc = new DataCalc(d);
    const grouped = dc.groupBy("c");
    const result = grouped.summarize({
      meanA: mean("a"),
      sumB: sum("b"),
    });

    expect(result.observations).toEqual([
      { c: 3, meanA: 0.5, sumB: 10 }, // Group c=3: a=[1,0], b=[2,8]
      { c: 7, meanA: 7, sumB: 4 }, // Group c=7: a=[9,5], b=[4,0]
    ]);
  });

  it("calculates summaries for multi-level grouped data", () => {
    const dc = new DataCalc(d_multi);
    const result = dc.groupBy("a", "b").summarize({
      meanC: mean("c"),
      sumC: sum("c"),
    });

    expect(result.observations).toHaveLength(4);
    expect(result.observations).toContainEqual({
      a: 1,
      b: 2,
      meanC: 2.5,
      sumC: 5,
    });
    expect(result.observations).toContainEqual({
      a: 1,
      b: 3,
      meanC: 1,
      sumC: 2,
    });
    expect(result.observations).toContainEqual({
      a: 4,
      b: 2,
      meanC: 3,
      sumC: 6,
    });
    expect(result.observations).toContainEqual({
      a: 4,
      b: 3,
      meanC: 11,
      sumC: 22,
    });
  });

  it("handles specific multi-level grouping example from prompt", () => {
    const dc = new DataCalc(d_multi);
    const result = dc.groupBy("a").summarize({
      meanC: mean("c"),
    });

    expect(result.observations).toHaveLength(2);
    expect(result.observations).toContainEqual({ a: 1, meanC: 1.75 }); // Mean of [1,2,3,1]
    expect(result.observations).toContainEqual({ a: 4, meanC: 7 }); // Mean of [5,1,10,12]
  });

  it("preserves group variables in the output", () => {
    const dc = new DataCalc(d);
    const result = dc.groupBy("c").summarize({ meanA: mean("a") });

    expect(result.observations[0]).toHaveProperty("c");
    expect(result.observations[1]).toHaveProperty("c");
  });

  it("handles empty datasets", () => {
    const dc = new DataCalc(d_empty);
    const result = dc.summarize({ count: n() });

    expect(result.observations).toEqual([{ count: 0 }]);
  });

  it("returns null for invalid variable name used in summarize operation", () => {
    const dc = new DataCalc(d);
    expect(dc.summarize({ meanX: mean("x") }).pull("meanX")).toBeNull();
  });

  it("handles all summary operation types", () => {
    const dc = new DataCalc(d);
    const result = dc.summarize({
      meanA: mean("a"),
      sumB: sum("b"),
      medianC: median("c"),
      varA: variance("a"),
      minA: min("a"),
      maxA: max("a"),
      sdA: sd("a"),
      count: n(),
    });

    expect(result.observations[0]).toHaveProperty("meanA");
    expect(result.observations[0]).toHaveProperty("sumB");
    expect(result.observations[0]).toHaveProperty("medianC");
    expect(result.observations[0]).toHaveProperty("varA");
    expect(result.observations[0]).toHaveProperty("minA");
    expect(result.observations[0]).toHaveProperty("maxA");
    expect(result.observations[0]).toHaveProperty("sdA");
    expect(result.observations[0]).toHaveProperty("count");
  });

  it("supports chaining operations on summarized data", () => {
    const dc = new DataCalc(d_multi);
    const result = dc
      .groupBy("a", "b")
      .summarize({ meanC: mean("c") })
      .ungroup()
      .summarize({ overallMean: mean("meanC") });

    expect(result.observations).toEqual([{ overallMean: 4.375 }]); // Mean of [2.5, 1, 3, 11]
  });
});
