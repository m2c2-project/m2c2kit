import { mean } from "../SummarizeOperations";
import { DataCalc } from "../DataCalc";
import { Observation } from "../Observation";

let d: Array<Observation>;
let d_1: Array<Observation>;

describe("mean tests", () => {
  beforeEach(() => {
    d = [
      { a: 1, b: 2, c: 3 },
      { a: 0, b: 8, c: 3 },
      { a: 9, b: 4, c: 7 },
      { a: 5, b: 0, c: 7 },
    ];

    d_1 = [
      { a: 1, b: null, c: undefined, d: undefined },
      { a: 0, b: 8, c: "a", d: 2 },
      { a: true, b: 4, c: 7, d: 5 },
      { a: false, b: 0, c: 7, d: 9 },
    ];
  });

  it("calculates the mean of a column of numbers", () => {
    const dc = new DataCalc(d);
    expect(
      dc
        .summarize({
          meanA: mean("a"),
        })
        .pull("meanA"),
    ).toBeCloseTo(3.75);
  });

  it("throws an error if column not found", () => {
    const dc = new DataCalc(d);
    expect(() =>
      dc.summarize({
        meanX: mean("x"),
      }),
    ).toThrow();
  });

  it("throws an error if column is not numeric", () => {
    const dc = new DataCalc(d_1);
    expect(() =>
      dc.summarize({
        meanA: mean("a"),
      }),
    ).toThrow();
  });

  it("returns null if column has nulls", () => {
    const dc = new DataCalc(d_1);
    expect(
      dc
        .summarize({
          meanB: mean("b"),
        })
        .pull("meanB"),
    ).toEqual(null);
  });

  it("returns null if column has undefined values", () => {
    const dc = new DataCalc(d_1);
    expect(
      dc
        .summarize({
          meanD: mean("d"),
        })
        .pull("meanD"),
    ).toEqual(null);
  });

  it("coerces booleans to numbers if coerceBooleans is true", () => {
    const dc = new DataCalc(d_1);
    expect(
      dc
        .summarize({
          meanA: mean("a", { coerceBooleans: true }),
        })
        .pull("meanA"),
    ).toBeCloseTo(0.5); // (1 + 0 + 1 + 0) / 4 = 0.5
  });

  it("throws an error if column has booleans", () => {
    const dc = new DataCalc(d_1);
    expect(() =>
      dc.summarize({
        meanA: mean("a"),
      }),
    ).toThrow();
  });

  it("calculates the mean of a column with nulls ignored if skipMissing is true", () => {
    const dc = new DataCalc(d_1);
    expect(
      dc
        .summarize({
          meanB: mean("b", { skipMissing: true }),
        })
        .pull("meanB"),
    ).toEqual(4); // (8 + 4 + 0) / 3 = 4
  });
});
