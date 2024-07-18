import { Canvas } from "canvaskit-wasm";
import {
  WebColors,
  Composite,
  CompositeOptions,
  RgbaColor,
  Size,
  M2Node,
  Shape,
  IDrawable,
  M2c2KitHelpers,
  Equal,
  M2NodeConstructor,
  EventStoreMode,
} from "@m2c2kit/core";

export interface GridOptions extends CompositeOptions {
  /** Number of rows in the grid. Must be 1 or greater */
  rows: number;
  /** Number of columns in the grid. Must be 1 or greater */
  columns: number;
  /** Size of the grid in pixels */
  size: Size;
  /** Background color of the grid. Default is a transparent blue */
  backgroundColor?: RgbaColor;
  /** Width of the grid lines. Default is 1 */
  gridLineWidth?: number;
  /** Color of the grid lines. Default is red */
  gridLineColor?: RgbaColor;
}

export interface GridChild {
  node: M2Node;
  row: number;
  column: number;
}

interface SerializedGridChild {
  node: string;
  row: number;
  column: number;
}

export class Grid extends Composite implements GridOptions {
  compositeType = "Grid";
  // Grid options
  private _rows = 0;
  private _columns = 0;
  // default Grid is: transparent blue, red lines, line width 1
  private _gridBackgroundColor: RgbaColor = [0, 0, 255, 0.25];
  private _gridLineColor = WebColors.Red;
  private _gridLineWidth = 1;

  cellWidth: number;
  cellHeight: number;
  private _gridChildren = new Array<GridChild>();
  private cellContainers = new Array<Array<Shape>>();
  private _gridBackground?: Shape;

  /**
   * A rectangular grid that supports placement of nodes within the grid's
   * cells.
   *
   * @remarks This composite node is composed of rectangles and lines. It
   * has convenience functions for placing and clearing nodes on the grid
   * by row and column position (zero-based indexing)
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
        throw new Error("grid rows must be at least 1");
      }
    } else {
      throw new Error("grid rows must be specified");
    }
    if (options.columns) {
      if (options.columns >= 1) {
        this.columns = options.columns;
      } else {
        throw new Error("grid columns must be at least 1");
      }
    } else {
      throw new Error("grid columns must be specified");
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
    this.saveNodeNewEvent();
  }

  override get completeNodeOptions() {
    return {
      ...this.options,
      ...this.getNodeOptions(),
      ...this.getDrawableOptions(),
      rows: this.rows,
      columns: this.columns,
      size: this.size,
      backgroundColor: this.gridBackgroundColor,
      gridLineWidth: this.gridLineWidth,
      gridLineColor: this.gridLineColor,
    };
  }

  override initialize(): void {
    /**
     * Remove all existing children, and recursively remove each child's
     * children so we can start fresh.
     */
    this.descendants.forEach((d) => {
      if (d.parent === this) {
        // to avoid triggering the warning in Grid.removeChild(), below
        super.removeChild(d);
      } else {
        d.parent?.removeChild(d);
      }
    });

    this.gridBackground = new Shape({
      name: "__" + this.name + "-gridRectangle",
      rect: { size: this.size },
      fillColor: this.gridBackgroundColor,
      strokeColor: this.gridLineColor,
      lineWidth: this.gridLineWidth,
      isUserInteractionEnabled: this.isUserInteractionEnabled,
      suppressEvents: true,
    });
    super.addChild(this.gridBackground);
    this.gridBackground.isUserInteractionEnabled =
      this.isUserInteractionEnabled;

    for (let col = 1; col < this.columns; col++) {
      const verticalLine = new Shape({
        name: "__" + this.name + "-gridVerticalLine-" + (col - 1),
        rect: {
          size: { width: this.gridLineWidth, height: this.size.height },
          origin: { x: -this.size.width / 2 + this.cellWidth * col, y: 0 },
        },
        fillColor: this.gridLineColor,
        suppressEvents: true,
      });
      this.gridBackground.addChild(verticalLine);
    }

    for (let row = 1; row < this.rows; row++) {
      const horizontalLine = new Shape({
        name: "__" + this.name + "-gridHorizontalLine-" + (row - 1),
        rect: {
          size: { width: this.size.width, height: this.gridLineWidth },
          origin: { x: 0, y: -this.size.height / 2 + this.cellHeight * row },
        },
        fillColor: this.gridLineColor,
        suppressEvents: true,
      });
      this.gridBackground.addChild(horizontalLine);
    }

    this.cellContainers = new Array<Array<Shape>>(this.rows)
      .fill([])
      .map(() => new Array<Shape>(this.columns));
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        const cellContainer = new Shape({
          name: "__" + this.name + "-gridCellContainer-" + row + "-" + col,
          rect: {
            size: { width: this.cellWidth, height: this.cellHeight },
            origin: {
              x:
                -this.size.width / 2 +
                this.cellWidth * col +
                this.cellWidth / 2,
              y:
                -this.size.height / 2 +
                this.cellHeight * row +
                this.cellHeight / 2,
            },
          },
          fillColor: WebColors.Transparent,
          lineWidth: 0,
          suppressEvents: true,
        });
        this.gridBackground.addChild(cellContainer);
        this.cellContainers[row][col] = cellContainer;
      }
    }

    if (this.gridChildren.length > 0) {
      this.gridChildren.forEach((gridChild) => {
        if (!this.cellWidth || !this.cellHeight || !this.gridBackground) {
          throw new Error(
            "cellWidth, cellHeight, or gridBackground undefined or null",
          );
        }

        /**
         * Pay attention to the type assertions here to account for how the
         * structure of gridChildren is different in replay versus other
         * modes.
         */
        if (this.game.eventStore.mode === EventStoreMode.Replay) {
          /**
           * When in event replay, the gridChild is of type
           * SerializedGridChild, and gridChild.node is the uuid of the grid
           * child node.
           */
          const childNode = [
            ...this.game.nodes,
            ...this.game.materializedNodes,
          ].find(
            (n) =>
              // gridChild.node is the uuid of the child node here!
              n.uuid === (gridChild as unknown as SerializedGridChild).node,
          );
          if (!childNode) {
            throw new Error("grid: child node not found");
          }
          childNode?.parent?.removeChild(childNode);
          this.cellContainers[gridChild.row][gridChild.column].addChild(
            childNode,
          );
        } else {
          // Not in replay mode, gridChild is of type GridChild
          gridChild.node.parent?.removeChild(gridChild.node);
          this.cellContainers[gridChild.row][gridChild.column].addChild(
            gridChild.node,
          );
        }
      });
    }
    this.needsInitialization = false;
  }

  private get gridBackground(): Shape {
    if (!this._gridBackground) {
      throw new Error("gridBackground is null or undefined");
    }
    return this._gridBackground;
  }

  private set gridBackground(gridBackground: Shape) {
    this._gridBackground = gridBackground;
  }

  /**
   * note: below we do not have getter and setter for size because the getter
   * and setter in M2Node will handle it.
   */

  get rows(): number {
    return this._rows;
  }
  set rows(rows: number) {
    if (Equal.value(this._rows, rows)) {
      return;
    }
    this._rows = rows;
    this.needsInitialization = true;
  }

  get columns(): number {
    return this._columns;
  }
  set columns(columns: number) {
    if (Equal.value(this._columns, columns)) {
      return;
    }
    this._columns = columns;
    this.needsInitialization = true;
  }

  get gridBackgroundColor(): RgbaColor {
    return this._gridBackgroundColor;
  }
  set gridBackgroundColor(backgroundColor: RgbaColor) {
    if (Equal.value(this._gridBackgroundColor, backgroundColor)) {
      return;
    }
    this._gridBackgroundColor = backgroundColor;
    this.needsInitialization = true;
  }

  get gridLineWidth(): number {
    return this._gridLineWidth;
  }
  set gridLineWidth(gridLineWidth: number) {
    if (Equal.value(this._gridLineWidth, gridLineWidth)) {
      return;
    }
    this._gridLineWidth = gridLineWidth;
    this.needsInitialization = true;
  }

  get gridLineColor(): RgbaColor {
    return this._gridLineColor;
  }
  set gridLineColor(gridLineColor: RgbaColor) {
    if (Equal.value(this._gridLineColor, gridLineColor)) {
      return;
    }
    this._gridLineColor = gridLineColor;
    this.needsInitialization = true;
  }

  // all nodes that make up grid are added as children, so they
  // have their own dispose methods
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  override dispose(): void {}

  /**
   * Duplicates a node using deep copy.
   *
   * @remarks This is a deep recursive clone (node and children).
   * The uuid property of all duplicated nodes will be newly created,
   * because uuid must be unique.
   *
   * @param newName - optional name of the new, duplicated node. If not
   * provided, name will be the new uuid
   */
  override duplicate(newName?: string): Grid {
    const dest = new Grid({
      ...this.getNodeOptions(),
      ...this.getDrawableOptions(),
      rows: this.rows,
      columns: this.columns,
      size: this.size,
      backgroundColor: this.gridBackgroundColor,
      gridLineWidth: this.gridLineWidth,
      gridLineColor: this.gridLineColor,
      name: newName,
    });

    if (this.children.length > 0) {
      dest.children = this.children.map((child) => {
        const clonedChild = child.duplicate();
        clonedChild.parent = dest;
        return clonedChild;
      });
    }

    return dest;
  }

  update(): void {
    super.update();
  }

  draw(canvas: Canvas): void {
    super.drawChildren(canvas);
  }

  warmup(canvas: Canvas): void {
    this.initialize();
    this.children
      .filter((child) => child.isDrawable)
      .forEach((child) => {
        (child as unknown as IDrawable).warmup(canvas);
      });
  }

  /**
   * The child nodes that have been added to the grid.
   *
   * @remarks Do not set this property directly. Use the methods for adding
   * and removing grid children, such as `addAtCell()`, `removeAllAtCell()`,
   * `removeGridChild()`, and `removeAllGridChildren()`.
   */
  get gridChildren() {
    return this._gridChildren;
  }
  set gridChildren(gridChildren: Array<GridChild>) {
    this._gridChildren = gridChildren;
    this.needsInitialization = true;

    /**
     * Save the gridChildren property change event. The gridChild node is not
     * serializable, so we can't pass the gridChildren object directly to
     * savePropertyChangeEvent. Instead, we pass in the SerializedGridChild
     * objects, which have the node's uuid in the node property.
     */
    this.savePropertyChangeEvent(
      "gridChildren",
      this.gridChildren.map(
        (gridChild) =>
          ({
            node: gridChild.node.uuid,
            row: gridChild.row,
            column: gridChild.column,
          }) as SerializedGridChild,
      ),
    );
  }

  /**
   * Removes all grid children from the grid.
   *
   * @remarks This retains grid lines and grid appearance.
   */
  removeAllGridChildren(): void {
    if (this.gridChildren.length === 0) {
      return;
    }
    while (this.gridChildren.length) {
      this.gridChildren = this.gridChildren.slice(0, -1);
    }
    this.needsInitialization = true;
  }

  /**
   * Adds a node as a grid child to the grid at the specified row and column
   * position.
   *
   * @param node - node to add to the grid
   * @param row  - row position within grid to add node; zero-based indexing
   * @param column - column position within grid to add node; zero-based indexing
   */
  addAtCell(node: M2Node, row: number, column: number): void {
    if (row < 0 || row >= this.rows || column < 0 || column >= this.columns) {
      console.warn(
        `warning: addAtCell() requested to add node at row ${row}, column ${column}. This is outside the bounds of grid ${this.name}, which is size ${this.rows}x${this.columns}. Note that addAtCell() uses zero-based indexing. AddAtCell() will proceed, but may draw nodes outside the grid`,
      );
    }
    this.gridChildren = [
      ...this.gridChildren,
      { node: node, row: row, column: column },
    ];
    this.needsInitialization = true;
  }

  /**
   * Removes all grid child nodes at the specified row and column position.
   *
   * @param row - row position within grid at which to remove grid children; zero-based indexing
   * @param column - column position within grid at which to remove grid children; zero-based indexing
   */
  removeAllAtCell(row: number, column: number): void {
    this.gridChildren = this.gridChildren.filter(
      (gridChild) => gridChild.row !== row && gridChild.column !== column,
    );
    this.needsInitialization = true;
  }

  /**
   * Removes the grid child node from the grid.
   *
   * @param node - node to remove
   */
  removeGridChild(node: M2Node): void {
    this.gridChildren = this.gridChildren.filter(
      (gridChild) => gridChild.node != node,
    );
    this.needsInitialization = true;
  }

  // The Grid manages its own children (background, lines, and cell
  // containers). It is probably a mistake when the user tries to add or remove
  // these children. The user probably meant to add or remove grid children
  // instead. Warn the user about this.

  override addChild(child: M2Node): void {
    console.warn(
      "Grid.addChild() was called -- did you mean to call addAtCell() instead?",
    );
    super.addChild(child);
  }

  override removeAllChildren(): void {
    console.warn(
      "Grid.removeAllChildren() was called -- did you mean to call removeAllGridChildren() instead?",
    );
    super.removeAllChildren();
  }

  override removeChild(child: M2Node): void {
    console.warn(
      "Grid.removeChild() was called -- did you mean to call removeGridChild() instead?",
    );
    super.removeChild(child);
  }

  override removeChildren(children: M2Node[]): void {
    console.warn(
      "Grid.removeChildren() was called -- did you mean to call removeGridChild() instead?",
    );
    super.removeChildren(children);
  }
}

M2c2KitHelpers.registerM2NodeClass(Grid as unknown as M2NodeConstructor);
