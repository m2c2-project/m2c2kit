import { min } from "../SummarizeOperations";
import { DataCalc } from "../DataCalc";
import { Observation } from "../Observation";

let d: Array<Observation>;
let d_1: Array<Observation>;

describe("min tests", () => {
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

  it("finds the minimum value in a column of numbers", () => {
    const dc = new DataCalc(d);
    expect(
      dc
        .summarize({
          minA: min("a"),
        })
        .pull("minA"),
    ).toEqual(0); // Min of [1, 0, 9, 5]
  });

  it("throws an error if column not found", () => {
    const dc = new DataCalc(d);
    expect(() =>
      dc.summarize({
        minX: min("x"),
      }),
    ).toThrow();
  });

  it("throws an error if column is not numeric", () => {
    const dc = new DataCalc(d_1);
    expect(() =>
      dc.summarize({
        minA: min("a"),
      }),
    ).toThrow();
  });

  it("throws an error if column has undefined values", () => {
    const dc = new DataCalc(d_1);
    expect(() =>
      dc.summarize({
        minC: min("c"),
      }),
    ).toThrow();
  });

  it("coerces booleans to numbers if coerceBooleans is true", () => {
    const dc = new DataCalc(d_1);
    expect(
      dc
        .summarize({
          minA: min("a", { coerceBooleans: true }),
        })
        .pull("minA"),
    ).toEqual(0); // Min of [1, 0, 1, 0]
  });

  it("throws an error if column has booleans", () => {
    const dc = new DataCalc(d_1);
    expect(() =>
      dc.summarize({
        minA: min("a"),
      }),
    ).toThrow();
  });

  it("returns null if column contains nulls", () => {
    const dc = new DataCalc(d_1);
    expect(
      dc
        .summarize({
          maxB: min("b"),
        })
        .pull("maxB"),
    ).toEqual(null); // Max of [null, 8, 4, 0]
  });

  it("returns null if column contains undefined", () => {
    const dc = new DataCalc(d_1).filter((obs) => obs.c !== "a");
    expect(
      dc
        .summarize({
          maxC: min("c"),
        })
        .pull("maxC"),
    ).toEqual(null); // Max of [undefined, "a", 7, 7]
  });

  it("finds the minimum of a column with nulls ignored if skipMissing is true", () => {
    const dc = new DataCalc(d_1);
    expect(
      dc
        .summarize({
          minB: min("b", { skipMissing: true }),
        })
        .pull("minB"),
    ).toEqual(0); // Min of [8, 4, 0]
  });
});
