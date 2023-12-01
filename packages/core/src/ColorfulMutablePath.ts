import { Point } from "./Point";
import { MutablePath } from "./MutablePath";
import { RgbaColor } from "./RgbaColor";
import { Constants } from "./Constants";
import { LinePresentation } from "./LinePresentation";

/**
 * Multi-color subpaths and methods for creating them.
 *
 * @remarks Subpaths are an array of lines that are drawn together.
 */
export class ColorfulMutablePath extends MutablePath {
  /** Stroke color to be applied to subsequent lines. */
  strokeColor: RgbaColor = Constants.DEFAULT_PATH_STROKE_COLOR;
  /** Line width to be applied to subsequent lines. */
  lineWidth: number = Constants.DEFAULT_PATH_LINE_WIDTH;
  /** Colors and widths of lines in the path. */
  linePresentations: Array<LinePresentation> = [];

  /**
   * Adds a straight line to the current subpath
   *
   * @remarks The line is added from the last point in the current subpath to
   * the given point, with the current stroke color and line width.
   *
   * @param point - location where the line will end
   */
  override addLine(point: Point): void {
    if (this.isNewLinePresentation()) {
      this.linePresentations.push({
        strokeColor: this.strokeColor,
        lineWidth: this.lineWidth,
        subpathIndex: this._subpaths.length,
        pointIndex: this.currentPath.length - 1,
      });
    }
    this.currentPath.push(point);
  }

  /**
   * Checks if the current line presentation (stroke color and line width) is
   * different from the last line presentation.
   *
   * @returns true if the current line presentation is different from the last
   */
  private isNewLinePresentation(): boolean {
    if (this.linePresentations.length === 0) {
      return true;
    }

    const currentLinePresentation =
      this.linePresentations[this.linePresentations.length - 1];
    return (
      currentLinePresentation.strokeColor !== this.strokeColor ||
      currentLinePresentation.lineWidth !== this.lineWidth
    );
  }

  /**
   * Removes all subpaths from the shape and resets the stroke color and line
   * width to their default values.
   */
  override clear(): void {
    // parent class method clears subpaths and currentPath
    super.clear();
    this.linePresentations = [];
    this.strokeColor = Constants.DEFAULT_PATH_STROKE_COLOR;
    this.lineWidth = Constants.DEFAULT_PATH_LINE_WIDTH;
  }

  /**
   * Makes a deep copy.
   *
   * @returns a deep copy
   */
  override duplicate(): ColorfulMutablePath {
    // parent class method duplicates _subpaths, and currentPath
    const newPath = super.duplicate() as ColorfulMutablePath;
    newPath.strokeColor = JSON.parse(JSON.stringify(this.strokeColor));
    newPath.lineWidth = this.lineWidth;
    newPath.linePresentations = JSON.parse(
      JSON.stringify(this.linePresentations),
    );
    return newPath;
  }
}
