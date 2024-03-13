---
sidebar_position: 9
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Parent-child Relationships

Nodes can contain other nodes. This is called a parent-child relationship. The parent node is the node that contains the child node. We've seen this already: a `Scene` has been the parent of all the other nodes we've created so far. For example, we added a `Label` to a `Scene` by calling `sceneOne.addChild(helloLabel)`.

But every node can be the parent of another node. For example, a `Scene` can be the parent of a `Shape`. That `Shape` can be the parent of another `Shape`. And that `Shape` can be the parent of a `Label`.

## Four things to know about parent-child relationships

1. A `Scene` can't be the child of another node. A `Scene` is the top of the hierarchy and can only be a parent.
2. A parent can have zero or more children, but a child can have only one parent.
3. When positioning children within a parent `Scene`, the `{ x: 0, y: 0 }` position is the upper-left corner of the `Scene` -- we've seen this already.
4. When positioning children within a parent of any other kind of node, the `{ x: 0, y: 0 }` position is the _center of the parent node_.

Why a different coordinate system for children when the parent is a `Scene` versus when the parent is any other kind of node? Because the `Scene` represents the entire display area, it's useful to have a coordinate system that starts in the upper-left corner. But when positioning children within a parent node, it's more useful to have a coordinate system that starts in the center of the parent node: usually, you want to position the child in the center of the parent.

:::note

All this talk about coordinate system sounds more complicated than it is in practice. You'll get the hang of it after you see some examples.

:::

Below, we create a rectangle `Shape` near the left hand side of the screen. To center a `Label` inside it, we simply call the `addChild()` method on the rectangle. We didn't specify a position for the label, so it takes the default position of `{ x: 0, y: 0 }` -- which is the center of the rectangle!

Except for scenes, when we add a child to a parent, we almost always want to center the child in the parent. This is what we get by default. But if you want to shift the child off-center within the parent, specify the `position` of the child as an offset from the center of the parent.

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';
export const code = `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
const rect = new Shape({
    rect: { size: { height: 80, width: 120 } },
    fillColor: WebColors.Transparent,
    strokeColor: WebColors.RebeccaPurple,
    lineWidth: 4,    
    position: { x: 70, y: 120 }
});
sceneOne.addChild(rect);
  
const centeredLabel = new Label( { text: "I'm centered"});
rect.addChild(centeredLabel);
`;

export const more = [
{ description: <>[Offset] the child's `position` if you don't want to center it.</>,
code: `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
const rect = new Shape({
    rect: { size: { height: 80, width: 120 } },
    fillColor: WebColors.Transparent,
    strokeColor: WebColors.RebeccaPurple,
    lineWidth: 4,
    position: { x: 70, y: 120 }
});
sceneOne.addChild(rect);
 
const offCenterLabel = new Label({
    text: "I'm up & left",
    position: { x: -15, y: -25 }
});
rect.addChild(offCenterLabel);`},
{ description: <>It is valid to position a child [beyond] the bounds of its parent.</>,
code: `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
const rect = new Shape({
    rect: { size: { height: 80, width: 120 } },
    fillColor: WebColors.Transparent,
    strokeColor: WebColors.RebeccaPurple,
    lineWidth: 4,
    position: { x: 70, y: 120 }
});
sceneOne.addChild(rect);
 
const outLabel = new Label({
    text: "Out of bounds!",
    position: { x: 0, y: 150 }
});
rect.addChild(outLabel);`}
]

<CodeExample code={code} more={more} template={template}/>
