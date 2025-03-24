import { DataCalc } from "../DataCalc";
import { Observation } from "../Observation";

let d1: Array<Observation>;
let d2: Array<Observation>;
let d_empty: Array<Observation>;
let d_different_schema: Array<Observation>;

describe("bindRows tests", () => {
  beforeEach(() => {
    d1 = [
      { a: 1, b: 2, c: 3 },
      { a: 4, b: 5, c: 6 },
    ];

    d2 = [
      { a: 7, b: 8, c: 9 },
      { a: 10, b: 11, c: 12 },
    ];

    d_empty = [];

    d_different_schema = [
      { a: 13, b: 14, d: 15 },
      { x: 16, y: 17, z: 18 },
    ];
  });

  it("combines observations from two DataCalc objects", () => {
    const dc1 = new DataCalc(d1);
    const dc2 = new DataCalc(d2);

    expect(dc1.bindRows(dc2).observations).toEqual([
      { a: 1, b: 2, c: 3 },
      { a: 4, b: 5, c: 6 },
      { a: 7, b: 8, c: 9 },
      { a: 10, b: 11, c: 12 },
    ]);
  });

  it("preserves the order of observations", () => {
    const dc1 = new DataCalc(d1);
    const dc2 = new DataCalc(d2);

    const result = dc1.bindRows(dc2).observations;

    // First observations should be from dc1, then dc2
    expect(result[0]).toEqual(d1[0]);
    expect(result[1]).toEqual(d1[1]);
    expect(result[2]).toEqual(d2[0]);
    expect(result[3]).toEqual(d2[1]);
  });

  it("returns a new DataCalc object, preserving original", () => {
    const dc1 = new DataCalc(d1);
    const dc2 = new DataCalc(d2);

    const result = dc1.bindRows(dc2);

    expect(result).toBeInstanceOf(DataCalc);
    expect(result).not.toBe(dc1);
    expect(result).not.toBe(dc2);
    // Original should be unchanged
    expect(dc1.observations).toEqual(d1);
    expect(dc2.observations).toEqual(d2);
  });

  it("can bind datasets with different variables", () => {
    const dc1 = new DataCalc(d1);
    const dc2 = new DataCalc(d_different_schema);

    expect(dc1.bindRows(dc2).observations).toEqual([
      { a: 1, b: 2, c: 3, d: null, x: null, y: null, z: null },
      { a: 4, b: 5, c: 6, d: null, x: null, y: null, z: null },
      { a: 13, b: 14, d: 15, c: null, x: null, y: null, z: null },
      { x: 16, y: 17, z: 18, a: null, b: null, c: null, d: null },
    ]);
  });

  it("handles binding with an empty dataset (first)", () => {
    const dc1 = new DataCalc(d_empty);
    const dc2 = new DataCalc(d2);

    expect(dc1.bindRows(dc2).observations).toEqual(d2);
  });

  it("handles binding with an empty dataset (second)", () => {
    const dc1 = new DataCalc(d1);
    const dc2 = new DataCalc(d_empty);

    expect(dc1.bindRows(dc2).observations).toEqual(d1);
  });

  it("works with both empty datasets", () => {
    const dc1 = new DataCalc(d_empty);
    const dc2 = new DataCalc(d_empty);

    expect(dc1.bindRows(dc2).observations).toEqual([]);
  });

  it("correctly handles datasets with complex object values", () => {
    const complex1 = [{ id: 1, data: { name: "first", value: 100 } }];

    const complex2 = [{ id: 2, data: { name: "second", value: 200 } }];

    const dc1 = new DataCalc(complex1);
    const dc2 = new DataCalc(complex2);

    expect(dc1.bindRows(dc2).observations).toEqual([
      { id: 1, data: { name: "first", value: 100 } },
      { id: 2, data: { name: "second", value: 200 } },
    ]);
  });

  it("it drops all groups from grouped data", () => {
    const dc1 = new DataCalc(d1).groupBy("a");
    const dc2 = new DataCalc(d2).groupBy("b");

    // Binding should preserve groups from first dataset
    const result = dc1.bindRows(dc2);
    expect(result.groups).toEqual([]);
  });

  it("warns when combining datasets with different types for common variables", () => {
    // Mock console.warn
    const originalWarn = console.warn;
    const mockWarn = jest.fn();
    console.warn = mockWarn;

    try {
      // Create datasets with type mismatch in variable 'a'
      const typeMismatch1 = [
        { a: 1, b: 2 },
        { a: 3, b: 4 },
      ];

      const typeMismatch2 = [
        { a: "string", b: 6 },
        { a: "another", b: 8 },
      ];

      const dc1 = new DataCalc(typeMismatch1);
      const dc2 = new DataCalc(typeMismatch2);

      // This should trigger a warning
      const result = dc1.bindRows(dc2);

      // Verify warning was logged
      expect(mockWarn).toHaveBeenCalledWith(
        expect.stringContaining(
          "bindRows() is combining datasets with different data types for variable 'a'",
        ),
      );
      expect(mockWarn).toHaveBeenCalledWith(
        expect.stringContaining(
          "Left dataset has type 'number' and right dataset has type 'string'",
        ),
      );

      // Verify binding still works
      expect(result.observations).toEqual([
        { a: 1, b: 2 },
        { a: 3, b: 4 },
        { a: "string", b: 6 },
        { a: "another", b: 8 },
      ]);
    } finally {
      // Restore original console.warn
      console.warn = originalWarn;
    }
  });
});
