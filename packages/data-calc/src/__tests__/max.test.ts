import { max } from "../SummarizeOperations";
import { DataCalc } from "../DataCalc";
import { Observation } from "../Observation";

let d: Array<Observation>;
let d_1: Array<Observation>;

describe("max tests", () => {
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

  it("finds the maximum value in a column of numbers", () => {
    const dc = new DataCalc(d);
    expect(
      dc
        .summarize({
          maxA: max("a"),
        })
        .pull("maxA"),
    ).toEqual(9); // Max of [1, 0, 9, 5]
  });

  it("finds the maximum value of a single number", () => {
    const dc = new DataCalc(d);
    expect(
      dc
        .summarize({
          maxA: max(4),
        })
        .pull("maxA"),
    ).toEqual(4);
  });

  it("finds the maximum value in a column of numbers from a filtered dataset", () => {
    const dc = new DataCalc(d);
    expect(
      dc
        .summarize({
          maxA: max(dc.filter((obs) => obs.b > 2).pull("a")),
        })
        .pull("maxA"),
    ).toEqual(9);
  });

  it("returns null from empty filtered dataset", () => {
    const dc = new DataCalc(d);
    expect(
      dc
        .filter((obs) => obs.b > 100)
        .summarize({
          maxA: max("a"),
        })
        .pull("maxA"),
    ).toBeNull();
  });

  it("returns null if column not found", () => {
    const dc = new DataCalc(d);
    expect(
      dc
        .summarize({
          maxX: max("x"),
        })
        .pull("maxX"),
    ).toEqual(null);
  });

  it("throws an error if column has undefined values", () => {
    const dc = new DataCalc(d_1);
    expect(() =>
      dc.summarize({
        maxC: max("c"),
      }),
    ).toThrow();
  });

  it("coerces booleans to numbers if coerceBooleans is true", () => {
    const dc = new DataCalc(d_1);
    expect(
      dc
        .summarize({
          maxA: max("a", { coerceBooleans: true }),
        })
        .pull("maxA"),
    ).toEqual(1); // Max of [1, 0, 1, 0]
  });

  it("throws an error if column has booleans and coerce booleans is false", () => {
    const dc = new DataCalc(d_1);
    expect(() =>
      dc.summarize({
        maxA: max("a", { coerceBooleans: false }),
      }),
    ).toThrow();
  });

  it("returns null if column contains nulls", () => {
    const dc = new DataCalc(d_1);
    expect(
      dc
        .summarize({
          maxB: max("b"),
        })
        .pull("maxB"),
    ).toEqual(null); // Max of [null, 8, 4, 0]
  });

  it("returns null if column contains undefined", () => {
    const dc = new DataCalc(d_1).filter((obs) => obs.c !== "a");
    expect(
      dc
        .summarize({
          maxC: max("c"),
        })
        .pull("maxC"),
    ).toEqual(null); // Max of [undefined, "a", 7, 7]
  });

  it("finds the maximum of a column with nulls ignored if skipMissing is true", () => {
    const dc = new DataCalc(d_1);
    expect(
      dc
        .summarize({
          maxB: max("b", { skipMissing: true }),
        })
        .pull("maxB"),
    ).toEqual(8); // Max of [8, 4, 0]
  });
});
