---
sidebar_position: 4
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Pointer Events

:::note

Pointer events are more "low level" than Tap events. You can stick with Tap events until you are doing more advanced things.

:::

A `PointerDown` event occurs under the same conditions as a `TapDown` event. A `PointerUp` event, however, occurs whenever a touch or click is released within the bounds of the node, *even if the touch or click was started outside the bounds of the node*.

A `PointerMove` event differs for mouse and touch. For mouse, the event occurs whenever the mouse pointer moves over the node; it does not matter if a mouse button is pressed or not. For touch, the event occurs whenever the touch moves.

`PointerMove` generates an event for every pixel the mouse or touch moves. This can be a lot of events. The example displays the timestamp of the event, so you can see each unique event.

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';

export const code = `const sceneOne = new Scene({ backgroundColor: WebColors.DeepSkyBlue });
game.addScene(sceneOne);
const pointerDownButton = new Button({
    text: "I respond to PointerDown",
    fontSize: 14,
    backgroundColor: WebColors.BlueViolet,
    size: { width: 170, height: 50 },
    position: { x: 100, y: 100 },
    isUserInteractionEnabled: true
});
sceneOne.addChild(pointerDownButton);
 
pointerDownButton.onPointerDown(() => {
    console.log("PointerDown event!");
});
 
const pointerUpButton = new Button({
    text: "I respond to PointerUp",
    fontSize: 14,
    backgroundColor: WebColors.Maroon,
    size: { width: 170, height: 50 },
    position: { x: 100, y: 200 },
    isUserInteractionEnabled: true
});
sceneOne.addChild(pointerUpButton);
 
pointerUpButton.onPointerUp(() => {
    console.log("PointerUp event!");
});
 
const pointerMoveButton = new Button({
    text: "I respond to PointerMove",
    fontSize: 14,
    backgroundColor: WebColors.Teal,
    size: { width: 170, height: 50 },
    position: { x: 100, y: 300 },
    isUserInteractionEnabled: true
});
sceneOne.addChild(pointerMoveButton);
 
pointerMoveButton.onPointerMove(() => {
    console.log("PointerMove event! " + new Date().toISOString());
    // print the time to differentiate the events, because the
    // console will rapidly show pointer move events
});`;

<CodeExample code={code} template={template} console="true"/>
