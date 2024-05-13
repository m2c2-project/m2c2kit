---
sidebar_position: 2
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Randomizing Grids

Grids are common in assessments, and nodes often need to be placed on the grid randomly.

The method `RandomDraws.FromGridWithoutReplacement()` simplifies the process of randomly placing nodes on a grid. This method takes `n`, `rows`, and `columns` arguments. It returns an array of `n` objects to represent the randomly chosen grid cells. The grid cells have `row` and `column` properties (these are 0-based). The grid cell positions are unique.

This code returns an array of 2 grid cells, each with a unique row and column, from a grid with 4 rows and 4 columns:

```js
const cells = RandomDraws.FromGridWithoutReplacement(2, 4, 4);
```

The `cells` object might look like this

```js
[
  { row: 2, column: 2 },
  { row: 0, column: 2 },
]
```

Below, we create a 6 x 6 grid. We randomly place an X on 4 grid cells. The cell positions are also printed to the console.

Click the "Run" button multiple times to see how the positions of the X change.

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';
export const code = `const sceneOne = new Scene({ backgroundColor: WebColors.Azure });
game.addScene(sceneOne);
 
const grid = new Grid({
    size: { width: 150, height: 150 },
    position: { x: 100, y: 200 },
    rows: 6,
    columns: 6,
    backgroundColor: WebColors.Silver,
    gridLineColor: WebColors.Black,
    gridLineWidth: 2,
});
sceneOne.addChild(grid);
 
const cells = RandomDraws.FromGridWithoutReplacement(4, 6, 6);
console.log("random cells are: " + JSON.stringify(cells));
 
for (let i = 0; i < cells.length; i++) {
    const xLabel = new Label({ text: "X" });
    grid.addAtCell(xLabel, cells[i].row, cells[i].column);
}`;

export const more = [
{ description: <>Advanced: <code>RandomDraws.FromGridWithoutReplacement()</code> optionally takes a fourth argument, `predicate`, which is a function that takes `row` and `column` arguments and returns a boolean indicating if the cell meets a certain condition. This is useful if we need to apply a restriction to the grid randomization. Perhaps certain cells are not allowed to be chosen, or chosen cells must follow a certain pattern. For example, if need to [restrict chosen cells to the diagonal], we could add a predicate function:
<pre>
  <code className="language-js">{`const cells = RandomDraws.FromGridWithoutReplacement(4, 6, 6, (row, column) => {
    if (row === column) {
        return true;
    } else {
        return false;
    }
});`}
  </code>
</pre>
</>,
code: `const sceneOne = new Scene({ backgroundColor: WebColors.Azure });
game.addScene(sceneOne);
 
const grid = new Grid({
    size: { width: 150, height: 150 },
    position: { x: 100, y: 200 },
    rows: 6,
    columns: 6,
    backgroundColor: WebColors.Silver,
    gridLineColor: WebColors.Black,
    gridLineWidth: 2,
});
sceneOne.addChild(grid);
 
const cells = RandomDraws.FromGridWithoutReplacement(4, 6, 6, (row, column) => {
    if (row === column) {
        return true;
    } else {
        return false;
    }
});
console.log("random cells are: " + JSON.stringify(cells));
 
for (let i = 0; i < cells.length; i++) {
    const xLabel = new Label({ text: "X" });
    grid.addAtCell(xLabel, cells[i].row, cells[i].column);
}`}
]

<CodeExample code={code} more={more} template={template} console={"true"}/>
