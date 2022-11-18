---
sidebar_position: 3
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Rectangles

A rectangle is a kind of `Shape`.

A `Shape` can be used to build rectangles, circles, paths, and more.

Below, we create a `Shape` that is a solid purple rectangle with a `size` of `height: 80` and `width: 120` and position it in the upper left of the screen. The center of this rectangle will be at `{ x: 80, y: 90 }`.

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';

export const code = `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
const rect = new Shape({
    rect: { size: { height: 80, width: 120 } },
    fillColor: WebColors.RebeccaPurple,
    position: { x: 80, y: 90 }
});
sceneOne.addChild(rect);`;

export const more = [
{ description: <>Add an [outline] to the shape by specifying its `strokeColor` and `lineWidth`.</>,
code: `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
const rect = new Shape({
    rect: { size: { height: 80, width: 120 } },
    fillColor: WebColors.RebeccaPurple,
    strokeColor: WebColors.DarkGoldenrod,
    lineWidth: 4,    
    position: { x: 80, y: 90 }
});
sceneOne.addChild(rect);`},
{ description: <>Make an [empty] shape by setting `fillColor` to `WebColors.Transparent`.</>,
code: `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
const rect = new Shape({
    rect: { size: { height: 80, width: 120 } },
    fillColor: WebColors.Transparent,
    strokeColor: WebColors.DarkGoldenrod,
    lineWidth: 4,    
    position: { x: 80, y: 90 }
});
sceneOne.addChild(rect);`},
{ description: <>Add [rounded corners] with the `cornerRadius` property.</>,
code: `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
const rect = new Shape({
    rect: { size: { height: 80, width: 120 } },
    cornerRadius: 8,
    fillColor: WebColors.RebeccaPurple,
    position: { x: 80, y: 90 }
});
sceneOne.addChild(rect);`}
]

<CodeExample code={code} more={more} template={template}/>
