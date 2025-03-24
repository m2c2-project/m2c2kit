import { n } from "../SummarizeOperations";
import { DataCalc } from "../DataCalc";
import { Observation } from "../Observation";

let d: Array<Observation>;
let d_empty: Array<Observation>;
let d_single: Array<Observation>;

describe("n tests", () => {
  beforeEach(() => {
    d = [
      { a: 1, b: 2, c: 3 },
      { a: 0, b: 8, c: 3 },
      { a: 9, b: 4, c: 7 },
      { a: 5, b: 0, c: 7 },
    ];

    d_empty = [];

    d_single = [{ a: 5, b: 3, c: 1 }];
  });

  it("counts the number of observations", () => {
    const dc = new DataCalc(d);
    expect(
      dc
        .summarize({
          count: n(),
        })
        .pull("count"),
    ).toEqual(4);
  });

  it("returns 0 for an empty dataset", () => {
    const dc = new DataCalc(d_empty);
    expect(
      dc
        .summarize({
          count: n(),
        })
        .pull("count"),
    ).toEqual(0);
  });

  it("returns 1 for a dataset with a single observation", () => {
    const dc = new DataCalc(d_single);
    expect(
      dc
        .summarize({
          count: n(),
        })
        .pull("count"),
    ).toEqual(1);
  });
});
