import { DataCalc } from "../DataCalc";
import { Observation } from "../Observation";

let d1: Array<Observation>;
let d2: Array<Observation>;
let d_empty: Array<Observation>;
let d_complex: Array<Observation>;
let d2_complex: Array<Observation>;

describe("innerJoin tests", () => {
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

    expect(dc1.innerJoin(dc2, ["id"]).observations).toEqual([
      { id: 1, x: "a", y: 100 },
      { id: 2, x: "b", y: 200 },
    ]);
  });

  it("returns only rows with matching values", () => {
    const dc1 = new DataCalc(d1);
    const dc2 = new DataCalc(d2);

    const result = dc1.innerJoin(dc2, ["id"]).observations;

    // Should not include id: 3 from d1 or id: 4 from d2
    expect(result.length).toBe(2);
    expect(result.find((obs) => obs.id === 3)).toBeUndefined();
    expect(result.find((obs) => obs.id === 4)).toBeUndefined();
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

    expect(dc1.innerJoin(dc2, ["id", "type"]).observations).toEqual([
      { id: 1, type: "A", value: 10, score: 100 },
    ]);
  });

  it("preserves complex object values", () => {
    const dc1 = new DataCalc(d_complex);
    const dc2 = new DataCalc(d2_complex);

    expect(dc1.innerJoin(dc2, ["id"]).observations).toEqual([
      { id: 1, obj: { name: "test1" }, arr: [1, 2, 3], data: { score: 95 } },
      { id: 2, obj: { name: "test2" }, arr: [4, 5, 6], data: { score: 87 } },
    ]);
  });

  it("handles multiple matches correctly", () => {
    const oneToMany1 = [
      { id: 1, x: "main" },
      { id: 2, x: "other" },
    ];

    const oneToMany2 = [
      { id: 1, y: "a" },
      { id: 1, y: "b" },
      { id: 1, y: "c" },
    ];

    const dc1 = new DataCalc(oneToMany1);
    const dc2 = new DataCalc(oneToMany2);

    expect(dc1.innerJoin(dc2, ["id"]).observations).toEqual([
      { id: 1, x: "main", y: "a" },
      { id: 1, x: "main", y: "b" },
      { id: 1, x: "main", y: "c" },
    ]);
  });

  it("returns an empty dataset when there are no matches", () => {
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

    expect(dc1.innerJoin(dc2, ["id"]).observations).toEqual([]);
  });

  it("throws an error when joining on grouped data", () => {
    const dc1 = new DataCalc(d1);
    const dc2 = new DataCalc(d2);

    const grouped1 = dc1.groupBy("id");

    expect(() => {
      grouped1.innerJoin(dc2, ["id"]);
    }).toThrow(/cannot be used on grouped data/);
  });

  it("throws an error when variables don't exist", () => {
    const dc1 = new DataCalc(d1);
    const dc2 = new DataCalc(d2);

    expect(() => {
      dc1.innerJoin(dc2, ["missing"]);
    }).toThrow(/Variable missing does not exist/);
  });

  it("returns a new DataCalc object", () => {
    const dc1 = new DataCalc(d1);
    const dc2 = new DataCalc(d2);

    const result = dc1.innerJoin(dc2, ["id"]);

    expect(result).toBeInstanceOf(DataCalc);
    expect(result).not.toBe(dc1);
    expect(result).not.toBe(dc2);
  });

  it("handles empty dataset correctly", () => {
    const dc1 = new DataCalc(d_empty);
    const dc2 = new DataCalc(d2);

    expect(dc1.innerJoin(dc2, ["id"]).observations).toEqual([]);
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

    expect(dc1.innerJoin(dc2, ["config"]).observations).toEqual([
      { config: { type: "A", level: 1 }, value: "first", score: 100 },
      { config: { type: "B", level: 2 }, value: "second", score: 200 },
    ]);
  });

  it("correctly handles missing properties in observations", () => {
    // Create datasets where some observations are missing properties
    const missingProps1 = [
      { id: 1, x: "a", extra: true },
      { id: 2, x: "b" }, // missing 'extra'
      { id: 3, x: "c", extra: false },
    ];

    const missingProps2 = [
      { id: 1, y: 100, z: "test" },
      { id: 2, y: 200 }, // missing 'z'
      { id: 4, y: 400, z: "other" },
    ];

    const dc1 = new DataCalc(missingProps1);
    const dc2 = new DataCalc(missingProps2);

    expect(dc1.innerJoin(dc2, ["id"]).observations).toEqual([
      { id: 1, x: "a", extra: true, y: 100, z: "test" },
      { id: 2, x: "b", extra: null, y: 200, z: null },
    ]);
  });

  it("handles complex objects with null nested properties", () => {
    const complexNulls1 = [
      { id: 1, config: { type: "A", level: 1 } },
      { id: 2, config: { type: "B", level: null } },
      { id: 3, config: null },
    ];

    const complexNulls2 = [
      { id: 1, config: { type: "A", level: 1 }, value: 100 },
      { id: 2, config: { type: "B", level: null }, value: 200 },
      { id: 3, config: null, value: 300 },
      { id: 4, config: { type: "D" }, value: 400 },
    ];

    const dc1 = new DataCalc(complexNulls1);
    const dc2 = new DataCalc(complexNulls2);

    // Should match on all two records with matching complex objects
    // Should not match on id: 3 because the value of config is null
    expect(dc1.innerJoin(dc2, ["id", "config"]).observations).toEqual([
      { id: 1, config: { type: "A", level: 1 }, value: 100 },
      { id: 2, config: { type: "B", level: null }, value: 200 },
    ]);
  });

  it("excludes records with null join keys from matching", () => {
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

    // Inner join should only match id=1, excluding records with null id
    expect(dc1.innerJoin(dc2, ["id"]).observations).toEqual([
      { id: 1, x: "a", y: 100 },
    ]);
  });

  it("excludes records with undefined join keys from matching", () => {
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

    // Inner join should only match id=1, excluding records with undefined id
    expect(dc1.innerJoin(dc2, ["id"]).observations).toEqual([
      { id: 1, x: "a", y: 100 },
    ]);
  });

  it("handles multiple null join keys correctly", () => {
    const multiKeyNull1 = [
      { id: 1, type: "A", x: "first" },
      { id: 2, type: null, x: "second" },
      { id: 3, type: "C", x: "third" },
    ];

    const multiKeyNull2 = [
      { id: 1, type: "A", y: 100 },
      { id: 2, type: null, y: 200 },
      { id: 3, type: "D", y: 300 },
    ];

    const dc1 = new DataCalc(multiKeyNull1);
    const dc2 = new DataCalc(multiKeyNull2);

    // Should match only on id=1,type=A
    // Should NOT match id=2 even though they both have type=null
    expect(dc1.innerJoin(dc2, ["id", "type"]).observations).toEqual([
      { id: 1, type: "A", x: "first", y: 100 },
    ]);
  });
});
