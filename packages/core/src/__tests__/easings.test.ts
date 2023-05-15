import { Easings } from "../Easings";

// For our reference, this is the type of EasingFunction:
//
// export type EasingFunction = (
//     /** elapsed time since start of action */
//     t: number,
//     /** start value of value to be eased */
//     b: number,
//     /** total change of value to be eased */
//     c: number,
//     /** total duration of action */
//     d: number
//   ) => number;

describe("Easings", () => {
  it("returns correct value for none", () => {
    expect(Easings.none(0, 0, 100, 100)).toBe(100);
    expect(Easings.none(50, 0, 100, 100)).toBe(100);
    expect(Easings.none(100, 0, 100, 100)).toBe(100);
  });

  it("returns correct value for linear", () => {
    expect(Easings.linear(0, 0, 100, 100)).toBe(0);
    expect(Easings.linear(50, 0, 100, 100)).toBe(50);
    expect(Easings.linear(100, 0, 100, 100)).toBe(100);
  });

  it("returns correct value for quadraticIn", () => {
    expect(Easings.quadraticIn(0, 0, 100, 100)).toBe(0);
    expect(Easings.quadraticIn(50, 0, 100, 100)).toBe(25);
    expect(Easings.quadraticIn(100, 0, 100, 100)).toBe(100);
  });

  it("returns correct value for quadraticOut", () => {
    expect(Easings.quadraticOut(0, 0, 100, 100)).toBe(0);
    expect(Easings.quadraticOut(50, 0, 100, 100)).toBe(75);
    expect(Easings.quadraticOut(100, 0, 100, 100)).toBe(100);
  });

  it("returns correct value for quadraticInOut", () => {
    expect(Easings.quadraticInOut(0, 0, 100, 100)).toBe(0);
    expect(Easings.quadraticInOut(50, 0, 100, 100)).toBe(50);
    expect(Easings.quadraticInOut(100, 0, 100, 100)).toBe(100);
  });

  it("returns correct value for cubicIn", () => {
    expect(Easings.cubicIn(0, 0, 100, 100)).toBe(0);
    expect(Easings.cubicIn(50, 0, 100, 100)).toBe(12.5);
    expect(Easings.cubicIn(100, 0, 100, 100)).toBe(100);
  });

  it("returns correct value for cubicOut", () => {
    expect(Easings.cubicOut(0, 0, 100, 100)).toBe(0);
    expect(Easings.cubicOut(50, 0, 100, 100)).toBe(87.5);
    expect(Easings.cubicOut(100, 0, 100, 100)).toBe(100);
  });

  it("returns correct value for cubicInOut", () => {
    expect(Easings.cubicInOut(0, 0, 100, 100)).toBe(0);
    expect(Easings.cubicInOut(50, 0, 100, 100)).toBe(50);
    expect(Easings.cubicInOut(100, 0, 100, 100)).toBe(100);
  });
});
