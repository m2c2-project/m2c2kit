import { variance } from "../SummarizeOperations";
import { DataCalc } from "../DataCalc";
import { Observation } from "../Observation";

let d: Array<Observation>;
let d_1: Array<Observation>;
let d_2: Array<Observation>;

describe("variance tests", () => {
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

    d_2 = [{ a: 5, b: 3, c: 1 }];
  });

  it("calculates the variance of a column of numbers", () => {
    const dc = new DataCalc(d);
    expect(
      dc
        .summarize({
          varA: variance("a"),
        })
        .pull("varA"),
    ).toBeCloseTo(16.916666666666668); // Variance of [1, 0, 9, 5]
  });

  it("throws an error if column not found", () => {
    const dc = new DataCalc(d);
    expect(() =>
      dc.summarize({
        varX: variance("x"),
      }),
    ).toThrow();
  });

  it("throws an error if column is not numeric", () => {
    const dc = new DataCalc(d_1);
    expect(() =>
      dc.summarize({
        varA: variance("a"),
      }),
    ).toThrow();
  });

  it("returns null if column has nulls", () => {
    const dc = new DataCalc(d_1);
    expect(
      dc
        .summarize({
          varB: variance("b"),
        })
        .pull("varB"),
    ).toEqual(null);
  });

  it("returns null if column has undefined values", () => {
    const dc = new DataCalc(d_1);
    expect(
      dc
        .summarize({
          varD: variance("d"),
        })
        .pull("varD"),
    ).toEqual(null);
  });

  it("returns null if column has only one observation", () => {
    const dc = new DataCalc(d_2);
    expect(
      dc
        .summarize({
          varA: variance("a"),
        })
        .pull("varA"),
    ).toEqual(null);
  });

  it("coerces booleans to numbers if coerceBooleans is true", () => {
    const dc = new DataCalc(d_1);
    expect(
      dc
        .summarize({
          varA: variance("a", { coerceBooleans: true }),
        })
        .pull("varA"),
    ).toBeCloseTo(0.3333333333333333); // Variance of [1, 0, 1, 0]
  });

  it("throws an error if column has booleans", () => {
    const dc = new DataCalc(d_1);
    expect(() =>
      dc.summarize({
        varA: variance("a"),
      }),
    ).toThrow();
  });

  it("calculates the variance of a column with nulls ignored if skipMissing is true", () => {
    const dc = new DataCalc(d_1);
    expect(
      dc
        .summarize({
          varB: variance("b", { skipMissing: true }),
        })
        .pull("varB"),
    ).toBeCloseTo(16); // Variance of [8, 4, 0]
  });
});
