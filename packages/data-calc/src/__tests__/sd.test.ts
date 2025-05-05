import { sd } from "../SummarizeOperations";
import { DataCalc } from "../DataCalc";
import { Observation } from "../Observation";

let d: Array<Observation>;
let d_1: Array<Observation>;
let d_2: Array<Observation>;

describe("sd tests", () => {
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

  it("calculates the standard deviation of a column of numbers", () => {
    const dc = new DataCalc(d);
    expect(
      dc
        .summarize({
          sdA: sd("a"),
        })
        .pull("sdA"),
    ).toBeCloseTo(4.112987559751022); // SD of [1, 0, 9, 5]
  });

  it("calculates the standard deviation of a column of numbers from a filtered dataset", () => {
    const dc = new DataCalc(d);
    expect(
      dc
        .summarize({
          sdA: sd(dc.filter((obs) => obs.b > 2).pull("a")),
        })
        .pull("sdA"),
    ).toBeCloseTo(6.363961);
  });

  it("returns null from empty filtered dataset", () => {
    const dc = new DataCalc(d);
    expect(
      dc
        .summarize({
          sdA: sd(dc.filter((obs) => obs.b > 100).pull("a")),
        })
        .pull("sdA"),
    ).toBeNull();
  });

  it("returns null if column not found", () => {
    const dc = new DataCalc(d);
    expect(
      dc
        .summarize({
          sdX: sd("x"),
        })
        .pull("sdX"),
    ).toEqual(null);
  });

  it("throws an error if column is not numeric", () => {
    const dc = new DataCalc(d_1);
    expect(() =>
      dc.summarize({
        sdC: sd("c"),
      }),
    ).toThrow();
  });

  it("returns null if column has nulls", () => {
    const dc = new DataCalc(d_1);
    expect(
      dc
        .summarize({
          sdB: sd("b"),
        })
        .pull("sdB"),
    ).toEqual(null);
  });

  it("returns null if column has undefined values", () => {
    const dc = new DataCalc(d_1);
    expect(
      dc
        .summarize({
          sdD: sd("d"),
        })
        .pull("sdD"),
    ).toEqual(null);
  });

  it("returns null if column has only one observation", () => {
    const dc = new DataCalc(d_2);
    expect(
      dc
        .summarize({
          sdA: sd("a"),
        })
        .pull("sdA"),
    ).toEqual(null);
  });

  it("returns null if provided a single number", () => {
    const dc = new DataCalc(d_2);
    expect(
      dc
        .summarize({
          sdA: sd(24),
        })
        .pull("sdA"),
    ).toEqual(null);
  });

  it("coerces booleans to numbers if coerceBooleans is true", () => {
    const dc = new DataCalc(d_1);
    expect(
      dc
        .summarize({
          sdA: sd("a", { coerceBooleans: true }),
        })
        .pull("sdA"),
    ).toBeCloseTo(0.5773502691896257); // SD of [1, 0, 1, 0]
  });

  it("throws an error if column has booleans and coerce booleans is false", () => {
    const dc = new DataCalc(d_1);
    expect(() =>
      dc.summarize({
        sdA: sd("a", { coerceBooleans: false }),
      }),
    ).toThrow();
  });

  it("calculates the standard deviation of a column with nulls ignored if skipMissing is true", () => {
    const dc = new DataCalc(d_1);
    expect(
      dc
        .summarize({
          sdB: sd("b", { skipMissing: true }),
        })
        .pull("sdB"),
    ).toEqual(4); // SD of [8, 4, 0]
  });
});
