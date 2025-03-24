import { DataCalc } from "../DataCalc";
import { Observation } from "../Observation";

let d1: Array<Observation>;
let d2: Array<Observation>;
let d_empty: Array<Observation>;
let d_complex: Array<Observation>;
let d2_complex: Array<Observation>;

describe("rightJoin tests", () => {
  beforeEach(() => {
    d1 = [
      { id: 1, x: "a" },
      { id: 2, x: "b" },
      { id: 3, x: "c" },
    ];

    d2 = [
      { id: 1, y: 100 },
      { id: 2, y: 200 },
      { id: 4, y: 400 },
    ];

    d_empty = [];

    d_complex = [
      { id: 1, obj: { name: "test1" }, arr: [1, 2, 3] },
      { id: 2, obj: { name: "test2" }, arr: [4, 5, 6] },
    ];

    d2_complex = [
      { id: 1, data: { score: 95 } },
      { id: 2, data: { score: 87 } },
      { id: 3, data: { score: 72 } },
    ];
  });

  it("joins two datasets on a common variable", () => {
    const dc1 = new DataCalc(d1);
    const dc2 = new DataCalc(d2);

    expect(dc1.rightJoin(dc2, ["id"]).observations).toEqual([
      { id: 1, x: "a", y: 100 },
      { id: 2, x: "b", y: 200 },
      { id: 4, x: null, y: 400 },
    ]);
  });

  it("keeps all rows from the right dataset", () => {
    const dc1 = new DataCalc(d1);
    const dc2 = new DataCalc(d2);

    const result = dc1.rightJoin(dc2, ["id"]).observations;

    // Should include id: 4 from d2 even though it doesn't match
    expect(result.length).toBe(3);
    expect(result.find((obs) => obs.id === 4)).toBeDefined();
    // Should not include id: 3 from d1 (left side only)
    expect(result.find((obs) => obs.id === 3)).toBeUndefined();
  });

  it("joins on multiple variables", () => {
    const multiKeyData1 = [
      { id: 1, type: "A", value: 10 },
      { id: 1, type: "B", value: 20 },
      { id: 2, type: "A", value: 30 },
    ];

    const multiKeyData2 = [
      { id: 1, type: "A", score: 100 },
      { id: 1, type: "C", score: 200 },
      { id: 2, type: "B", score: 300 },
    ];

    const dc1 = new DataCalc(multiKeyData1);
    const dc2 = new DataCalc(multiKeyData2);

    expect(dc1.rightJoin(dc2, ["id", "type"]).observations).toEqual([
      { id: 1, type: "A", value: 10, score: 100 },
      { id: 1, type: "C", value: null, score: 200 },
      { id: 2, type: "B", value: null, score: 300 },
    ]);
  });

  it("preserves complex object values", () => {
    const dc1 = new DataCalc(d_complex);
    const dc2 = new DataCalc(d2_complex);

    expect(dc1.rightJoin(dc2, ["id"]).observations).toEqual([
      { id: 1, obj: { name: "test1" }, arr: [1, 2, 3], data: { score: 95 } },
      { id: 2, obj: { name: "test2" }, arr: [4, 5, 6], data: { score: 87 } },
      { id: 3, obj: null, arr: null, data: { score: 72 } },
    ]);
  });

  it("can join by complex object values", () => {
    const complexKey1 = [
      { config: { type: "A", level: 1 }, value: "first" },
      { config: { type: "B", level: 2 }, value: "second" },
      { config: { level: 3, type: "C" }, value: "third" }, // Different property order
    ];

    const complexKey2 = [
      { config: { type: "A", level: 1 }, score: 100 },
      { config: { level: 2, type: "B" }, score: 200 },
      { config: { type: "D", level: 4 }, score: 400 },
    ];

    const dc1 = new DataCalc(complexKey1);
    const dc2 = new DataCalc(complexKey2);

    expect(dc1.rightJoin(dc2, ["config"]).observations).toEqual([
      { config: { type: "A", level: 1 }, value: "first", score: 100 },
      { config: { type: "B", level: 2 }, value: "second", score: 200 },
      { config: { type: "D", level: 4 }, value: null, score: 400 },
    ]);
  });

  it("handles multiple matches correctly", () => {
    const oneToMany1 = [
      { id: 1, x: "a" },
      { id: 1, x: "b" },
      { id: 2, x: "c" },
    ];

    const oneToMany2 = [
      { id: 1, y: "main" },
      { id: 3, y: "other" },
    ];

    const dc1 = new DataCalc(oneToMany1);
    const dc2 = new DataCalc(oneToMany2);

    expect(dc1.rightJoin(dc2, ["id"]).observations).toEqual([
      { id: 1, x: "a", y: "main" },
      { id: 1, x: "b", y: "main" },
      { id: 3, x: null, y: "other" },
    ]);
  });

  it("returns right dataset when there are no matches", () => {
    const noMatches1 = [
      { id: 1, x: "a" },
      { id: 2, x: "b" },
    ];

    const noMatches2 = [
      { id: 3, y: "c" },
      { id: 4, y: "d" },
    ];

    const dc1 = new DataCalc(noMatches1);
    const dc2 = new DataCalc(noMatches2);

    expect(dc1.rightJoin(dc2, ["id"]).observations).toEqual([
      { id: 3, y: "c" },
      { id: 4, y: "d" },
    ]);
  });

  it("throws an error when joining on grouped data", () => {
    const dc1 = new DataCalc(d1);
    const dc2 = new DataCalc(d2);

    const grouped2 = dc2.groupBy("id");

    expect(() => {
      dc1.rightJoin(grouped2, ["id"]);
    }).toThrow(/cannot be used on grouped data/);
  });

  it("throws an error when variables don't exist", () => {
    const dc1 = new DataCalc(d1);
    const dc2 = new DataCalc(d2);

    expect(() => {
      dc1.rightJoin(dc2, ["missing"]);
    }).toThrow(/Variable missing does not exist/);
  });

  it("returns a new DataCalc object", () => {
    const dc1 = new DataCalc(d1);
    const dc2 = new DataCalc(d2);

    const result = dc1.rightJoin(dc2, ["id"]);

    expect(result).toBeInstanceOf(DataCalc);
    expect(result).not.toBe(dc1);
    expect(result).not.toBe(dc2);
  });

  it("handles empty right dataset correctly", () => {
    const dc1 = new DataCalc(d1);
    const dc2 = new DataCalc(d_empty);

    expect(dc1.rightJoin(dc2, ["id"]).observations).toEqual([]);
  });

  it("handles empty left dataset correctly", () => {
    const dc1 = new DataCalc(d_empty);
    const dc2 = new DataCalc(d2);

    expect(dc1.rightJoin(dc2, ["id"]).observations).toEqual([
      { id: 1, y: 100 },
      { id: 2, y: 200 },
      { id: 4, y: 400 },
    ]);
  });

  it("includes right records with null join keys but doesn't match them", () => {
    const nullKeys1 = [
      { id: 1, x: "a" },
      { id: null, x: "b" },
      { id: 3, x: "c" },
    ];

    const nullKeys2 = [
      { id: 1, y: 100 },
      { id: null, y: 200 },
      { id: 4, y: 400 },
    ];

    const dc1 = new DataCalc(nullKeys1);
    const dc2 = new DataCalc(nullKeys2);

    // Right join should include all rows from right dataset
    // The record with id=null from right should be included but NOT matched with left
    expect(dc1.rightJoin(dc2, ["id"]).observations).toEqual([
      { id: 1, x: "a", y: 100 },
      { id: null, x: null, y: 200 },
      { id: 4, x: null, y: 400 },
    ]);
  });

  it("includes right records with undefined join keys but doesn't match them", () => {
    const undefinedKeys1 = [
      { id: 1, x: "a" },
      { x: "b" }, // id is undefined
      { id: 3, x: "c" },
    ];

    const undefinedKeys2 = [
      { id: 1, y: 100 },
      { y: 200 }, // id is undefined
      { id: 4, y: 400 },
    ];

    const dc1 = new DataCalc(undefinedKeys1);
    const dc2 = new DataCalc(undefinedKeys2);

    // Right join should include all rows from right dataset
    // The record with undefined id from right should be included but NOT matched
    expect(dc1.rightJoin(dc2, ["id"]).observations).toEqual([
      { id: 1, x: "a", y: 100 },
      { id: null, x: null, y: 200 },
      { id: 4, x: null, y: 400 },
    ]);
  });
});
