import { sum } from "../SummarizeOperations";
import { DataCalc } from "../DataCalc";
import { Observation } from "../Observation";

let d: Array<Observation>;
let d_1: Array<Observation>;

describe("sum tests", () => {
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

  it("sums a column of numbers", () => {
    const dc = new DataCalc(d);
    expect(
      dc
        .summarize({
          sumA: sum("a"),
        })
        .pull("sumA"),
    ).toEqual(15);
  });

  it("throws an error if column not found", () => {
    const dc = new DataCalc(d);
    expect(() =>
      dc.summarize({
        sumX: sum("x"),
      }),
    ).toThrow();
  });

  it("throws an error if column is not numeric", () => {
    const dc = new DataCalc(d_1);
    expect(() =>
      dc.summarize({
        sumA: sum("a"),
      }),
    ).toThrow();
  });

  it("returns null if column has nulls", () => {
    const dc = new DataCalc(d_1);
    expect(
      dc
        .summarize({
          sumB: sum("b"),
        })
        .pull("sumB"),
    ).toEqual(null);
  });

  it("returns null if column has undefined values", () => {
    const dc = new DataCalc(d_1);
    expect(
      dc
        .summarize({
          sumD: sum("d"),
        })
        .pull("sumD"),
    ).toEqual(null);
  });

  it("coerces booleans to numbers if coerceBooleans is true", () => {
    const dc = new DataCalc(d_1);
    expect(
      dc
        .summarize({
          sumA: sum("a", { coerceBooleans: true }),
        })
        .pull("sumA"),
    ).toEqual(2);
  });

  it("throws an error if column has booleans", () => {
    const dc = new DataCalc(d_1);
    expect(() =>
      dc.summarize({
        sumA: sum("a"),
      }),
    ).toThrow();
  });

  it("sums a column of numbers with nulls ignored if skipMissing is true", () => {
    const dc = new DataCalc(d_1);
    expect(
      dc
        .summarize({
          sumB: sum("b", { skipMissing: true }),
        })
        .pull("sumB"),
    ).toEqual(12);
  });
});
