import { Equals } from "..";

describe("Equals", () => {
  it("returns true for equal colors", () => {
    expect(Equals.rgbaColor([255, 255, 0, 1], [255, 255, 0, 1])).toBe(true);
  });

  it("returns false for unequal colors", () => {
    expect(Equals.rgbaColor([255, 255, 0, 1], [255, 0, 0, 1])).toBe(false);
  });

  it("returns false for missing color to compare", () => {
    expect(Equals.rgbaColor([255, 255, 0, 1])).toBe(false);
  });
});
