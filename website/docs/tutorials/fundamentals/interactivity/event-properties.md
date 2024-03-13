---
sidebar_position: 5
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Event Properties

Events have properties that describe the event.

In the event handler code for an event, you know what event has occurred. For example, if you are handling a `TapDown` event, you know that the user has tapped down on the node. But what if you need to know where the user tapped down?

The Tap and Pointer events all contain these additional properties:

- `point` - the point on the node where the event occurred.
- `buttons` - the buttons that were pressed when the event occurred.
- `type` - the type of event that occurred, as a string, such as `TapDown` or `PointerMove`.
- `target` - the node on which the event occurred.[^1]
- `handled` - a boolean value that indicates whether the event has been handled. If the event has been handled, then the event will not be passed to any other nodes. This is useful for preventing the event from being handled by multiple nodes.

:::note

The event's `point` property is the most useful Tap and Pointer event property. The others are for more advanced scenarios.

:::

The below example prints where on the button the user tapped down. To access the event properties, you provide a variable to represent the event in the event handler code. The variable name can be anything you want, but by convention it is common to use the name `e`, `ev`, or `event`.

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';

export const code = `const sceneOne = new Scene({ backgroundColor: WebColors.DeepSkyBlue });
game.addScene(sceneOne);
const tapDownButton = new Button({
    text: "I know where you tap!",
    fontSize: 14,
    backgroundColor: WebColors.BlueViolet,
    size: { width: 160, height: 50 },
    position: { x: 100, y: 200 },
    isUserInteractionEnabled: true
});
sceneOne.addChild(tapDownButton);
 
tapDownButton.onTapDown((e) => {
    console.log("TapDown event at point: " + e.point.x + ", " + e.point.y);
});`;

export const more = [
{ description: <>A more advanced example: use a [single] event handler, called `buttonEventHandler()` for different buttons and events. Examine the event's `type` property to know which event occurred and the `target` property to know which button had the event.</>,
code: `const sceneOne = new Scene({ backgroundColor: WebColors.DeepSkyBlue });
game.addScene(sceneOne);
const buttonOne = new Button({
    name: "The first button",
    text: "Push me 1",
    fontSize: 14,
    backgroundColor: WebColors.DarkSalmon,
    size: { width: 160, height: 50 },
    position: { x: 100, y: 150 },
    isUserInteractionEnabled: true
});
sceneOne.addChild(buttonOne);
 
const buttonTwo = new Button({
    name: "The second button",
    text: "Push me 2",
    fontSize: 14,
    backgroundColor: WebColors.DarkSlateGray,
    size: { width: 160, height: 50 },
    position: { x: 100, y: 250 },
    isUserInteractionEnabled: true
});
sceneOne.addChild(buttonTwo);
 
function buttonEventHandler(e) {
    console.log(e.target.name + " received event: " + e.type);
}
 
buttonOne.onTapDown(buttonEventHandler);
buttonOne.onTapUp(buttonEventHandler);
buttonOne.onTapLeave(buttonEventHandler);
buttonTwo.onTapDown(buttonEventHandler);
buttonTwo.onTapUp(buttonEventHandler);
buttonTwo.onTapLeave(buttonEventHandler);`},
]

<CodeExample code={code} more={more} template={template} console="true"/>

[^1]: `target` is similar to the concept of `sender` in C# event handling and the object returned by `EventObject.getSource()` in Java.