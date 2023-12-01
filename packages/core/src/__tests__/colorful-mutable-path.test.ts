import { ColorfulMutablePath } from "../ColorfulMutablePath";
import { Constants } from "../Constants";
import { WebColors } from "../WebColors";

describe("ColorfulMutablePath", () => {
  it("draws 2 separate lines with different colors and widths", () => {
    const path = new ColorfulMutablePath();
    path.strokeColor = WebColors.Red;
    path.lineWidth = 2;
    path.move({ x: 1, y: 2 });
    path.addLine({ x: 3, y: 4 });
    path.strokeColor = WebColors.Green;
    path.lineWidth = 4;
    path.move({ x: 10, y: 10 });
    path.addLine({ x: 20, y: 20 });
    path.addLine({ x: 20, y: 2 });
    expect(path.linePresentations.length).toEqual(2);
    expect(path.linePresentations[0].strokeColor).toEqual(WebColors.Red);
    expect(path.linePresentations[0].lineWidth).toEqual(2);
    expect(path.linePresentations[0].subpathIndex).toEqual(0);
    expect(path.linePresentations[0].pointIndex).toEqual(0);
    expect(path.linePresentations[1].strokeColor).toEqual(WebColors.Green);
    expect(path.linePresentations[1].lineWidth).toEqual(4);
    expect(path.linePresentations[1].subpathIndex).toEqual(1);
    expect(path.linePresentations[1].pointIndex).toEqual(0);
  });

  it("clears existing paths and resets line presentations, stroke color, and line widths", () => {
    const path = new ColorfulMutablePath();
    path.strokeColor = WebColors.Red;
    path.lineWidth = 2;
    path.move({ x: 1, y: 2 });
    path.addLine({ x: 3, y: 4 });
    path.clear();
    expect(path.subpaths.length).toEqual(0);
    expect(path.linePresentations.length).toEqual(0);
    expect(path.strokeColor).toEqual(Constants.DEFAULT_PATH_STROKE_COLOR);
    expect(path.lineWidth).toEqual(Constants.DEFAULT_PATH_LINE_WIDTH);
  });

  it("duplicates", () => {
    const path = new ColorfulMutablePath();
    path.strokeColor = WebColors.Red;
    path.lineWidth = 2;
    path.move({ x: 10, y: 10 });
    path.addLine({ x: 20, y: 20 });
    const dup = path.duplicate();
    // it is a deep copy, so dup and properties do not
    // points to same object as path
    expect(dup).not.toBe(path);
    expect(dup.subpaths).not.toBe(path.subpaths);
    expect(dup.subpaths[0]).not.toBe(path.subpaths[0]);
    expect(dup.linePresentations).not.toBe(path.linePresentations);
    expect(dup.linePresentations[0]).not.toBe(path.linePresentations[0]);
    // we do expect the values to be equal
    expect(dup.linePresentations[0].strokeColor).toEqual(
      path.linePresentations[0].strokeColor,
    );
    expect(dup.linePresentations[0].lineWidth).toEqual(
      path.linePresentations[0].lineWidth,
    );
  });
});
