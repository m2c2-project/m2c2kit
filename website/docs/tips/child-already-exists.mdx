---
sidebar_position: 4
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Error: Child Already Exists on Parent

You might come across this error:

```
Uncaught Error: Cannot add child node Shape (2717f16e-682f-4cb1-bbc2-4fe34d3ec2de)
to parent node Shape (921cf9e6-7970-4702-aa4a-3cc1cc8f8e59).
This child already exists on this parent. The child cannot be added again.
```

or

```
Uncaught Error: Cannot add child node Shape (3a43596c-c9a3-4158-8ab0-110442f701d5)
to parent node Shape (68004c48-6ac9-43f8-8430-e28b09388fa9). This child already exists
on other parent node: Shape (dbbfe9ed-d44e-471e-8127-d2230d09dc8e).
Remove the child from the other parent first.
```

In m2c2kit, a child node can have only one parent node. In other words, a node can't "have two parents at once." If you add a child node to a parent node, but the child node already has a parent, you'll get an error. Similarly, if you add a child node to a parent node for a second time, you'll also get an error.

## Demonstration of the problem

In the simple example below, there are two scenes. After pressing the start button in `sceneOne`, the task is presented in `taskScene`. A blue circle will randomly appear in one of two rectangles. The task is to tap the circle. After you tap the circle, an animation will briefly grow and shrink it. Then the task will repeat by presenting `taskScene` again.

Once you tap the circle, however, you will get an error. The problem is in this code:

```js
taskScene.onSetup(() => {
    const rectangleNumber = RandomDraws.SingleFromRange(1,2);
    if (rectangleNumber === 1) {
        console.log("Adding the circle to the top rectangle");
        rectangle1.addChild(circle);
    } else {
        console.log("Adding the circle to the bottom rectangle");
        rectangle2.addChild(circle);
    }
 });
```

The first time `taskScene` is presented (after you press start), the `onSetup` callback places the circle in one of the rectangles. The second time `taskScene` is presented (after you tap the circle), the `onSetup` callback tries to place the circle in one of the rectangles again. But the circle already has a parent (the rectangle it was placed in the first time). So you get an error.

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';

export const code = `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
 
const startButton = new Button({
    text: "Start",
    fontSize: 14,
    backgroundColor: WebColors.Green,
    size: { width: 120, height: 50 },
    position: { x: 100, y: 200 },
    isUserInteractionEnabled: true
});
sceneOne.addChild(startButton);
 
startButton.onTapDown(() => {
    game.presentScene(taskScene);
})
 
const taskScene = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(taskScene);
 
const instruction = new Label({ text: "Tap the circle!", position: { x: 100, y: 50 } });
taskScene.addChild(instruction);
 
const rectangle1 = new Shape({
    rect: { width: 120, height: 100 },
    position: { x: 100, y: 150 },
    fillColor: WebColors.Transparent,
    lineWidth: 2,
    strokeColor: WebColors.Red
});
taskScene.addChild(rectangle1);
 
const rectangle2 = new Shape({
    rect: { width: 120, height: 100 },
    position: { x: 100, y: 300 },
    fillColor: WebColors.Transparent,
    lineWidth: 2,
    strokeColor: WebColors.Green
});
taskScene.addChild(rectangle2);
 
const circle = new Shape({
    circleOfRadius: 32,
    fillColor: WebColors.RoyalBlue,
    isUserInteractionEnabled: true
});
circle.onTapUp(() => {
    circle.run(Action.sequence([
        Action.scale({ scale: 1.25, duration: 100 }),
        Action.scale({ scale: 1, duration: 100 }),
        Action.custom( { callback: ()=> {
            game.presentScene(taskScene);
        }})
    ]))
})
 
taskScene.onSetup(() => {
    const rectangleNumber = RandomDraws.SingleFromRange(1,2);
    if (rectangleNumber === 1) {
        console.log("Adding the circle to the top rectangle");
        rectangle1.addChild(circle);
    } else {
        console.log("Adding the circle to the bottom rectangle");
        rectangle2.addChild(circle);
    }
 });
`;

<CodeExample code={code} template={template} console="true" consoleId="1"/>

## Solution

The solution is to remove the circle from its parent before adding it to a new parent. Parent nodes have three functions[^1] to remove children:

- `removeChild(child: M2Node)` - remove the specified child.
- `removeChildren(children: M2Node[])` - remove the specified children.
- `removeAllChildren()` - remove all children.

In our example, the circle could either be a child of `rectangle1` or `rectangle2`. Rather than checking which rectangle the circle is a child of, we can remove all children (which will include the circle) from both rectangles. Then we can add the circle to the new rectangle:

```js
taskScene.onSetup(() => {
    // highlight-start
    rectangle1.removeAllChildren();
    rectangle2.removeAllChildren();
    // highlight-end
    const rectangleNumber = RandomDraws.SingleFromRange(1,2);
    if (rectangleNumber === 1) {
        console.log("Adding the circle to the top rectangle");
        rectangle1.addChild(circle);
    } else {
        console.log("Adding the circle to the bottom rectangle");
        rectangle2.addChild(circle);
    }
 });
```

The example now works without error.

export const code2 = `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
 
const startButton = new Button({
    text: "Start",
    fontSize: 14,
    backgroundColor: WebColors.Green,
    size: { width: 120, height: 50 },
    position: { x: 100, y: 200 },
    isUserInteractionEnabled: true
});
sceneOne.addChild(startButton);
 
startButton.onTapDown(() => {
    game.presentScene(taskScene);
})
 
const taskScene = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(taskScene);
 
const instruction = new Label({ text: "Tap the circle!", position: { x: 100, y: 50 } });
taskScene.addChild(instruction);
 
const rectangle1 = new Shape({
    rect: { width: 120, height: 100 },
    position: { x: 100, y: 150 },
    fillColor: WebColors.Transparent,
    lineWidth: 2,
    strokeColor: WebColors.Red
});
taskScene.addChild(rectangle1);
 
const rectangle2 = new Shape({
    rect: { width: 120, height: 100 },
    position: { x: 100, y: 300 },
    fillColor: WebColors.Transparent,
    lineWidth: 2,
    strokeColor: WebColors.Green
});
taskScene.addChild(rectangle2);
 
const circle = new Shape({
    circleOfRadius: 32,
    fillColor: WebColors.RoyalBlue,
    isUserInteractionEnabled: true
});
circle.onTapUp(() => {
    circle.run(Action.sequence([
        Action.scale({ scale: 1.25, duration: 100 }),
        Action.scale({ scale: 1, duration: 100 }),
        Action.custom( { callback: ()=> {
            game.presentScene(taskScene);
        }})
    ]))
})
 
taskScene.onSetup(() => {
    rectangle1.removeAllChildren();
    rectangle2.removeAllChildren();
    const rectangleNumber = RandomDraws.SingleFromRange(1,2);
    if (rectangleNumber === 1) {
        console.log("Adding the circle to the top rectangle");
        rectangle1.addChild(circle);
    } else {
        console.log("Adding the circle to the bottom rectangle");
        rectangle2.addChild(circle);
    }
 });
 `;

<CodeExample code={code2} template={template} console="true" consoleId="2"/>

[^1]: An important difference between these functions is that `removeAllChildren()` is [idempotent](https://en.wikipedia.org/wiki/Idempotence). You can call it multiple times without error. The other two functions will throw an error if you try to remove a child that is not a child of the parent, such as if you already removed the child on an earlier function call and try to remove it again.