import { median } from "../SummarizeOperations";
import { DataCalc } from "../DataCalc";
import { Observation } from "../Observation";

let d: Array<Observation>;
let d_1: Array<Observation>;
let d_2: Array<Observation>;

describe("median tests", () => {
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

  it("calculates the median of a column of numbers with odd length", () => {
    const dc = new DataCalc([
      { a: 1, b: 2, c: 3 },
      { a: 0, b: 8, c: 3 },
      { a: 9, b: 4, c: 7 },
    ]);
    expect(
      dc
        .summarize({
          medianA: median("a"),
        })
        .pull("medianA"),
    ).toEqual(1); // Median of [0, 1, 9]
  });

  it("calculates the median of a column of numbers with even length", () => {
    const dc = new DataCalc(d);
    expect(
      dc
        .summarize({
          medianA: median("a"),
        })
        .pull("medianA"),
    ).toEqual(3); // Median of [0, 1, 5, 9]
  });

  it("calculates the median of a single value", () => {
    const dc = new DataCalc(d_2);
    expect(
      dc
        .summarize({
          medianA: median("a"),
        })
        .pull("medianA"),
    ).toEqual(5); // Median of [5]
  });

  it("throws an error if column not found", () => {
    const dc = new DataCalc(d);
    expect(() =>
      dc.summarize({
        medianX: median("x"),
      }),
    ).toThrow();
  });

  it("throws an error if column is not numeric", () => {
    const dc = new DataCalc(d_1);
    expect(() =>
      dc.summarize({
        medianA: median("a"),
      }),
    ).toThrow();
  });

  it("returns null if column has nulls", () => {
    const dc = new DataCalc(d_1);
    expect(
      dc
        .summarize({
          medianB: median("b"),
        })
        .pull("medianB"),
    ).toEqual(null);
  });

  it("returns null if column has undefined values", () => {
    const dc = new DataCalc(d_1);
    expect(
      dc
        .summarize({
          medianD: median("d"),
        })
        .pull("medianD"),
    ).toEqual(null);
  });

  it("coerces booleans to numbers if coerceBooleans is true", () => {
    const dc = new DataCalc(d_1);
    expect(
      dc
        .summarize({
          medianA: median("a", { coerceBooleans: true }),
        })
        .pull("medianA"),
    ).toEqual(0.5); // Median of [0, 0, 1, 1]
  });

  it("throws an error if column has booleans", () => {
    const dc = new DataCalc(d_1);
    expect(() =>
      dc.summarize({
        medianA: median("a"),
      }),
    ).toThrow();
  });

  it("calculates the median of a column with nulls ignored if skipMissing is true", () => {
    const dc = new DataCalc(d_1);
    expect(
      dc
        .summarize({
          medianB: median("b", { skipMissing: true }),
        })
        .pull("medianB"),
    ).toEqual(4); // Median of [0, 4, 8]
  });
});
