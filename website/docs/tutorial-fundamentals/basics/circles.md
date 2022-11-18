---
sidebar_position: 4
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Circles

A circle is a kind of `Shape`.

Below, we create a `Shape` that is a solid circle with a radius of `60` pixels. The center of this circle will be at `{ x: 120, y: 240 }`.

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';
export const code = `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
const circle = new Shape({
    circleOfRadius: 60,
    fillColor: WebColors.RoyalBlue,
    position: { x: 120, y: 240 }
});
sceneOne.addChild(circle);`;

export const more = [
{ description: <>Like rectangles, you can change the [appearance] of the shape by specifying its `strokeColor` and `lineWidth`.</>,
code: `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
const circle = new Shape({
    circleOfRadius: 60,
    fillColor: WebColors.RoyalBlue,
    strokeColor: WebColors.Orchid,
    lineWidth: 12,
    position: { x: 120, y: 240 }
});
sceneOne.addChild(circle);`}
]

<CodeExample code={code} more={more} template={template}/>
