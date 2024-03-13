---
sidebar_position: 6
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Visual Responses

A useful assessment changes its appearance in response to the user.

We've demonstrated interactivity, but only with text in the console. Users don't see the console -- it's for programmers! Let's add some visual responses within the scene.

How you respond to user events is limited only by the requirements of your assessment and your imagination. All the properties we've used to configure the appearance of nodes can be changed in response to user events. For example, when the user taps a shape, you could:

- Change the shape's color or position.
- Scale the shape bigger or smaller.
- Show text within the shape.
- and more!

## Place code in the event handler to respond to user events

The below example shows a simple instruction ("Click the square"). When the user taps the square, the square's event handler executes code: a hello response appears, along with the cumulative number of hellos. The hello label scale increases with each click, and the text moves up the scene. After three clicks, no more are allowed: the square is hidden, and a final message is shown.

The logic for handling the user's tap is in the `onTapDown()` event handler:

```js
square.onTapDown(() => {
    if (helloCount === 3) {
      square.hidden = true;
      instructionsLabel.hidden = true;
      tooManyLabel.hidden = false;
    }

    helloCount++;
    helloLabel.text = "Hello #" + helloCount;
    helloLabel.scale = helloLabel.scale * 1.4;
    helloLabel.position.y = helloLabel.position.y - 10;
});
```

This example is nonsensical. It demonstrates, however, the many different ways to respond to user events, and it hints at how a real assessment could be built using the concepts shown here.

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';

export const code = `const sceneOne = new Scene({ backgroundColor: WebColors.DeepSkyBlue });
game.addScene(sceneOne);
const instructionsLabel = new Label({
    text: "Click the square",
    position: { x: 100, y: 50 }
})
sceneOne.addChild(instructionsLabel);
 
const square = new Shape({
    rect: { size: { height: 180, width: 180 } },
    fillColor: WebColors.RebeccaPurple,
    cornerRadius: 5,
    position: { x: 100, y: 180 },
    isUserInteractionEnabled: true
});
sceneOne.addChild(square);
 
const helloLabel = new Label({
    text: "",
    fontColor: WebColors.White,
});
square.addChild(helloLabel);
 
const tooManyLabel = new Label({
    text: "3 is enough times to say hello!",
    position: { x: 100, y: 200 },
    hidden: true
})
sceneOne.addChild(tooManyLabel);
 
let helloCount = 0;
square.onTapDown(() => {
    if (helloCount === 3) {
        square.hidden = true;
        instructionsLabel.hidden = true;
        tooManyLabel.hidden = false;
        return;
    }
 
    helloCount++;
    helloLabel.text = "Hello #" + helloCount;
    helloLabel.scale = helloLabel.scale * 1.4;
    helloLabel.position.y = helloLabel.position.y - 10;
});
`;

export const more = [
{ description: <>This example uses a [single] event handler and the event's `type` property to modify a label's text.</>,
code: `const sceneOne = new Scene({ backgroundColor: WebColors.DeepSkyBlue });
game.addScene(sceneOne);
const buttonOne = new Button({
    name: "First button",
    text: "Push me 1",
    fontSize: 14,
    backgroundColor: WebColors.DarkSalmon,
    size: { width: 160, height: 50 },
    position: { x: 100, y: 100 },
    isUserInteractionEnabled: true
});
sceneOne.addChild(buttonOne);
 
const buttonTwo = new Button({
    name: "Second button",
    text: "Push me 2",
    fontSize: 14,
    backgroundColor: WebColors.DarkSlateGray,
    size: { width: 160, height: 50 },
    position: { x: 100, y: 200 },
    isUserInteractionEnabled: true
});
sceneOne.addChild(buttonTwo);
 
const eventLabel = new Label({
    text: "",
    position: { x: 100, y: 300 }
});
sceneOne.addChild(eventLabel);
 
function buttonEventHandler(e) {
    eventLabel.text = e.target.name + " received event: " + e.type;
}
 
buttonOne.onTapDown(buttonEventHandler);
buttonOne.onTapUp(buttonEventHandler);
buttonOne.onTapLeave(buttonEventHandler);
buttonTwo.onTapDown(buttonEventHandler);
buttonTwo.onTapUp(buttonEventHandler);
buttonTwo.onTapLeave(buttonEventHandler);`},
]

<CodeExample code={code} more={more} template={template} console="true"/>
