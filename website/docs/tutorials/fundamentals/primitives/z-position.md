---
sidebar_position: 14
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Z Axis Position

Determine how overlapping nodes appear.

If nodes overlap on a scene, the node that was added latest will appear on top. You can change this behavior by setting the `zPosition` property on a node. It is called Z because if X and Y are two-dimensional axes, you can imagine the Z-axis as a third dimension coming out of the screen. The `zPosition` property is a number. The higher the number, the higher the node's "layer" will be on the screen among overlapping nodes.

By default, all nodes have a `zPosition: 0`, in which case the latest node added will appear on top. But if you set `zPosition: 1` on a node, it will appear on top of all the other nodes with `zPosition: 0`.

Below, the square is added to the scene after the circle, so the square should appear on top. But, we set the `zPosition: 1` on the circle, so it appears on top of the square.

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';
export const code = `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
const circle = new Shape({
    circleOfRadius: 75,
    fillColor: WebColors.LightGreen,
    position: { x: 100, y: 100 },
    zPosition: 1
});
sceneOne.addChild(circle);
 
const square = new Shape({
    rect: { size: { height: 125, width: 125 } },
    fillColor: WebColors.RebeccaPurple,
    position: { x: 100, y: 180 },
});
sceneOne.addChild(square);`
 
export const more = [
{ description: <>See the example [without] the `zPosition` applied.</>,
code: `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
const circle = new Shape({
    circleOfRadius: 75,
    fillColor: WebColors.LightGreen,
    position: { x: 100, y: 100 },
});
sceneOne.addChild(circle);
 
const square = new Shape({
    rect: { size: { height: 125, width: 125 } },
    fillColor: WebColors.RebeccaPurple,
    position: { x: 100, y: 180 },
});
sceneOne.addChild(square);`},
{ description: <>`zPosition` values can be [any] numbers, and their values will be compared to decide the order in which to draw the nodes.</>,
code:`const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
const circle = new Shape({
    circleOfRadius: 75,
    fillColor: WebColors.LightGreen,
    position: { x: 100, y: 100 },
    zPosition: -3
});
sceneOne.addChild(circle);
 
const topLabel = new Label({
    text: "I have the lower zPosition!",  
    position: { x: 100, y: 100 },
    zPosition: -225.1124
});
sceneOne.addChild(topLabel);`},
{ description: <>Overlapping nodes with color opacity less than 1 results in blending. Set `zPosition` to put the [green] circle on top.</>,
code:`const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
const circle1 = new Shape({
    circleOfRadius: 75,
    fillColor: [0, 255, 0, .60],
    position: { x: 100, y: 100 },
});
sceneOne.addChild(circle1);
 
const circle2 = new Shape({
    circleOfRadius: 75,
    fillColor: [255, 0, 0, .60],
    position: { x: 100, y: 180 },
    zPosition: -1
});
sceneOne.addChild(circle2);`},
{ description: <>Set `zPosition` to put the [red] circle on top, and the blending is different.</>,
code:`const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
const circle1 = new Shape({
    circleOfRadius: 75,
    fillColor: [0, 255, 0, .60],
    position: { x: 100, y: 100 },
});
sceneOne.addChild(circle1);
 
const circle2 = new Shape({
    circleOfRadius: 75,
    fillColor: [255, 0, 0, .60],
    position: { x: 100, y: 180 },
    zPosition: 1
});
sceneOne.addChild(circle2);`},
]

<CodeExample code={code} more={more} template={template}/>
