---
sidebar_position: 8
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Grids

A `Grid` holds other nodes in rows and columns.

Grids are common in assessments. A grid is a convenient way to position things on the screen. For example, if you had a 3x3 tic-tac-toe grid, you could manually calculate the centers the cells. But it would be easier simply to specify by row and column: the pre-built `Grid` does this.

Below, we create a 3x3 `Grid`. We also create a `Label` that says "Hi!" and a purple rectangle `Shape`. To place them in the grid, we don't have to calculate their coordinates on the scene. We simply insert them into the grid at the row and column in which we want them to appear using the `addAtCell()` method.

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';

export const code = `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
const myGrid = new Grid({
    rows: 3, columns: 3,
    size: { width: 180, height: 180 },
    gridLineColor: WebColors.Brown,
    gridLineWidth: 2,    
    backgroundColor: WebColors.White,
    position: { x: 100, y: 200 }
}); 
sceneOne.addChild(myGrid);
 
const hiLabel = new Label( { text: "Hi!"});
myGrid.addAtCell(hiLabel, 0, 2);
 
const square = new Shape({
    rect: { size: { height: 40, width: 40 } },
    fillColor: WebColors.RebeccaPurple,
});
myGrid.addAtCell(square, 1, 1);
`;

export const more = [
{ description: <>Set the position of the object you are adding to the grid to [offset] the object instead of centering it in the grid cell.</>,
code: `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
const myGrid = new Grid({
    rows: 3, columns: 3,
    size: { width: 180, height: 180 },
    gridLineColor: WebColors.Brown,
    gridLineWidth: 2,
    backgroundColor: WebColors.White,
    position: { x: 100, y: 200 }
});
sceneOne.addChild(myGrid);
 
const offsetLabel = new Label({
    text: "Offset",
    position: { x: -5, y: 16 }
});
myGrid.addAtCell(offsetLabel, 0, 2);`},
{ description: <>Grids can be useful for aligning things when you [hide] the grid lines.</>,
code: `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
const myGrid = new Grid({
    rows: 3, columns: 3,
    size: { width: 180, height: 180 },
    gridLineColor: WebColors.Transparent,
    gridLineWidth: 0,    
    backgroundColor: WebColors.Transparent,
    position: { x: 100, y: 120 }
}); 
sceneOne.addChild(myGrid);
 
const number1 = new Label( { text: "1"});
myGrid.addAtCell(number1, 1, 0);
const number2 = new Label( { text: "2"});
myGrid.addAtCell(number2, 0, 1);
const number3 = new Label( { text: "3"});
myGrid.addAtCell(number3, 1, 2);
const number4 = new Label( { text: "4"});
myGrid.addAtCell(number4, 2, 1);`},
{ description: <>A `Grid` cell can hold almost any node -- `Shape`, `Label`, `Sprite` -- even [another] `Grid`! (But you can't put a `Scene` inside a `Grid` cell.)</>,
code:`const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
const bigGrid = new Grid({
    rows: 3, columns: 3,
    size: { width: 180, height: 180 },
    gridLineColor: WebColors.Brown,
    gridLineWidth: 2,    
    backgroundColor: WebColors.White,
    position: { x: 100, y: 200 }
}); 
sceneOne.addChild(bigGrid);
 
const smallGrid = new Grid({
    rows: 2, columns: 2,
    size: { width: 50, height: 50 },
    gridLineColor: WebColors.Brown,
    gridLineWidth: 2,    
    backgroundColor: WebColors.White,
});
bigGrid.addAtCell(smallGrid, 1, 1);
 
const xLabel = new Label( { text: "X"});
smallGrid.addAtCell(xLabel, 0, 1);`}
];

<CodeExample code={code} more={more} template={template}/>
