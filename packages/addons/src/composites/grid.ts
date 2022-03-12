import { Canvas } from "canvaskit-wasm";
import {
  WebColors,
  Composite,
  CompositeOptions,
  RgbaColor,
  Size,
  Entity,
  Shape,
} from "@m2c2kit/core";

export interface GridOptions extends CompositeOptions {
  /** Number of rows in the grid. Must be 1 or greater */
  rows: number;
  /** Number of columns in the grid. Must be 1 or greater */
  columns: number;
  /** Size of the grid in pixels */
  size: Size;
  /** Background color of the grid. Default is a transparent gray */
  backgroundColor?: RgbaColor;
  /** Width of the grid lines. Default is 1 */
  gridLineWidth?: number;
  /** Color of the grid lines. Default is red */
  gridLineColor?: RgbaColor;
}

interface GridChild {
  entity: Entity;
  row: number;
  column: number;
}

export class Grid extends Composite {
  compositeType = "grid";
  // Grid options
  // TODO: make getter, setter for these so they can be changed after initial construction
  rows = 0;
  columns = 0;
  // default Grid is: transparent gray, red lines, line width 1
  gridBackgroundColor: RgbaColor = [0, 0, 233, 0.25];
  gridLineColor = WebColors.Red;
  gridLineWidth = 1;

  cellWidth: number;
  cellHeight: number;
  gridChildren = new Array<GridChild>();
  private gridBackground?: Shape;

  /**
   * A rectangular grid that supports placement of entities within the grid's cells.
   *
   * @remarks This composite entity is composed of rectangles and lines. It has convenience functions for placing and clearing entities on the grid by row and column position (zero-based indexing)
   *
   * @param options - {@link GridOptions}
   */
  constructor(options: GridOptions) {
    super(options);
    if (options.size) {
      this.size = options.size;
    } else {
      throw new Error("grid size must be specified");
    }
    if (options.rows) {
      if (options.rows >= 1) {
        this.rows = options.rows;
      } else {
        throw new Error("rows must be at least 1");
      }
    } else {
      throw new Error("rows must be specified");
    }
    if (options.columns) {
      if (options.columns >= 1) {
        this.columns = options.columns;
      } else {
        throw new Error("columns must be at least 1");
      }
    } else {
      throw new Error("columns must be specified");
    }
    if (options.backgroundColor) {
      this.gridBackgroundColor = options.backgroundColor;
    }
    if (options.gridLineColor) {
      this.gridLineColor = options.gridLineColor;
    }
    if (options.gridLineWidth) {
      this.gridLineWidth = options.gridLineWidth;
    }
    this.cellWidth = this.size.width / this.columns;
    this.cellHeight = this.size.height / this.rows;
  }

  override initialize(): void {
    // Remove all children, including gridLines because we may need to redraw them.
    // Call the base class (Entity) removeAllChildren. (hence, the super)
    // (note that we override removeAllChildren in this Grid class)
    super.removeAllChildren();
    this.gridBackground = new Shape({
      name: "_" + this.name + "-gridBackground",
      rect: { size: this.size },
      //size: this.size,
      fillColor: this.gridBackgroundColor,
      strokeColor: this.gridLineColor,
      lineWidth: this.gridLineWidth,
      isUserInteractionEnabled: this.isUserInteractionEnabled,
    });
    this.addChild(this.gridBackground);
    this.gridBackground.isUserInteractionEnabled =
      this.isUserInteractionEnabled;

    for (let col = 1; col < this.columns; col++) {
      const verticalLine = new Shape({
        name: "_" + this.name + "-gridVerticalLine-" + col,
        rect: {
          size: { width: this.gridLineWidth, height: this.size.height },
          origin: { x: -this.size.width / 2 + this.cellWidth * col, y: 0 },
        },
        fillColor: this.gridLineColor,
      });
      this.gridBackground.addChild(verticalLine);
    }

    for (let row = 1; row < this.rows; row++) {
      const horizontalLine = new Shape({
        name: "_" + this.name + "-gridHorizontalLine-" + row,
        rect: {
          size: { width: this.size.width, height: this.gridLineWidth },
          origin: { x: 0, y: -this.size.height / 2 + this.cellHeight * row },
        },
        fillColor: this.gridLineColor,
      });
      this.gridBackground.addChild(horizontalLine);
    }

    if (this.gridChildren) {
      this.gridChildren.forEach((gridChild) => {
        if (!this.cellWidth || !this.cellHeight || !this.gridBackground) {
          throw new Error(
            "cellWidth, cellHeight, or gridBackground undefined or null"
          );
        }
        const x =
          -this.size.width / 2 +
          this.cellWidth / 2 +
          gridChild.column * this.cellWidth;
        const y =
          -this.size.height / 2 +
          this.cellHeight / 2 +
          gridChild.row * this.cellHeight;
        gridChild.entity.position = { x: x, y: y };
        this.gridBackground.addChild(gridChild.entity);
      });
    }
    this.needsInitialization = false;
  }

  update(): void {
    super.update();
  }

  draw(canvas: Canvas): void {
    super.drawChildren(canvas);
  }

  // override Entity.RemoveAllChildren() so that when RemoveAllChildren() is called on a Grid,
  // it removes only entities added to the grid cells (what we call grid children), not the grid lines!
  // note: when we upgrade to typescript 4.3+, we can mark this with override keyword to make intention explicit
  /**
   * Removes all children from the grid, but retains grid lines.
   *
   */
  override removeAllChildren(): void {
    if (this.gridChildren.length === 0) {
      return;
    }
    while (this.gridChildren.length) {
      this.gridChildren.pop();
    }
    this.needsInitialization = true;
  }

  /**
   * Adds an entity to the grid at the specified row and column position.
   *
   * @param entity - entity to add to the grid
   * @param row  - row position within grid to add entity; zero-based indexing
   * @param column - column position within grid to add entity; zero-based indexing
   */
  addAtCell(entity: Entity, row: number, column: number): void {
    if (row < 0 || row >= this.rows || column < 0 || column >= this.columns) {
      console.warn(
        `warning: addAtCell() requested to add entity at row ${row}, column ${column}. This is outside the bounds of grid ${this.name}, which is size ${this.rows}x${this.columns}. Note that addAtCell() uses zero-based indexing. AddAtCell() will proceed, but may draw entities outside the grid`
      );
    }
    this.gridChildren.push({ entity: entity, row: row, column: column });
    this.needsInitialization = true;
  }

  /**
   * Removes all child entities at the specified row and column position.
   *
   * @param row - row position within grid at which to remove children; zero-based indexing
   * @param column - column position within grid at which to remove children; zero-based indexing
   */
  removeAllAtCell(row: number, column: number): void {
    this.gridChildren = this.gridChildren.filter(
      (gridChild) => gridChild.row != row && gridChild.column != column
    );
    this.needsInitialization = true;
  }

  // override Entity.RemoveChild() so that when RemoveChild() is called on a Grid, it removes the
  // entity from the gridBackground rectangle AND our grid's own list of children (in gridChildren)
  /**
   * Removes the child entity from the grid.
   *
   * @param entity - entity to remove
   */
  override removeChild(entity: Entity): void {
    if (!this.gridBackground) {
      throw new Error("gridBackground is null or undefined");
    }
    this.gridBackground.removeChild(entity);
    this.gridChildren = this.gridChildren.filter(
      (gridChild) => gridChild.entity != entity
    );
    this.needsInitialization = true;
  }
}
