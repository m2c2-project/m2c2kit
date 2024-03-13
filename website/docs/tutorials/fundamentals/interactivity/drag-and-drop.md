---
sidebar_position: 7
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Drag and Drop

Drag and Drop lets users interact with objects on the screen.

To make a node support drag and drop, set both its `isUserInteractionEnabled` and `draggable` properties to `true`. The user can then drag the node around the screen.

## Drag Events

The following events are fired when the user drags a node:

- `DragStart` - When the user starts dragging the node.
- `Drag` - When the user continues to drag the node.
- `DragEnd` - When the user stops dragging the node.

These events also have a `position` property that is the position of the node at the time of the event.

The below example changes the circle's color to green when the dragging starts and changes it back to purple when the dragging stops. It also logs the position of the circle when the dragging starts and stops.

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';

export const code = `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
const circle = new Shape({
    circleOfRadius: 40,
    fillColor: WebColors.RebeccaPurple,
    position: { x: 100, y: 200 },
    isUserInteractionEnabled: true,
    draggable: true    
});
sceneOne.addChild(circle);

circle.onDragStart((e) => {
    circle.fillColor = WebColors.SeaGreen;
    console.log("Drag start: x = " + e.position.x + ", y = " + e.position.y);
});
circle.onDragEnd((e) => {
    circle.fillColor = WebColors.RebeccaPurple;
    console.log("Drag end: x = " + e.position.x + ", y = " + e.position.y);    
});
`;

export const more = [
{ description: <>To implement a [drop] functionality on a target, this example checks if the dragged circle is fully inside the box. If so, it changes the color of the circle from red to green.</>,
code: `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
 
const box = new Shape({
    rect: { width: 80, height: 80},
    fillColor: WebColors.Transparent,
    strokeColor: WebColors.Black,
    lineWidth: 2,
    position: { x: 100, y: 300}
});
sceneOne.addChild(box);
 
const circle = new Shape({
    circleOfRadius: 20,
    fillColor: WebColors.Red,
    position: { x: 100, y: 100 },
    isUserInteractionEnabled: true,
    draggable: true    
});
sceneOne.addChild(circle);
 
/**
 * This event handler is called when the user drags the circle. On each drag
 * event, it checks if the circle is fully inside the box and changes the
 * circle's color accordingly. The position of the circle refers to its
 * center, so the circle's radius must be added or subtracted to determine
 * if it is fully inside the box.
 */
circle.onDrag( (e) => {
    if ((e.position.x >= box.position.x - box.size.width / 2 + circle.circleOfRadius) &&
    (e.position.x <= box.position.x + box.size.width / 2 - circle.circleOfRadius) &&
    (e.position.y >= box.position.y - box.size.height / 2 + circle.circleOfRadius) &&
    (e.position.y <= box.position.y + box.size.height / 2 - circle.circleOfRadius))
     {
        circle.fillColor = WebColors.Green;
    } else {
        circle.fillColor = WebColors.Red;
    } 
});
`},
]

<CodeExample code={code} more={more} template={template} console="true"/>
