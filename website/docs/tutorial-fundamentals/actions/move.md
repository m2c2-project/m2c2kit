---
sidebar_position: 3
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Move

The `Move` action animates an entity's position over time.

The options object for the `Move` action has the following properties:

- `point`: The point to move to. This is an object with `x` and `y` properties.
- `duration`: The duration of the animation in milliseconds.
- `easing`: The easing function to use. This is an optional property. If not specified, the default `Linear` easing function is used.
- `runDuringTransition`: A boolean indicating whether the action should run during a transition. This is an optional property. If not specified, the default is `false`.

The below example will move the circle when the button is clicked.

```js
clickMeButton.onTapDown(() => {
    circle.run(Action.move({
        point: { x: 50, y: 50 },
        duration: 1500,
        easing: Easings.quadraticInOut
    }));
    console.log("Circle move action has begun.");
});`
```

Note that the message, "Circle move action has begun," will be printed to the console *immediately* after the button is clicked and does not wait until the move animation is done. This is because the `run()` method is asynchronous -- it schedules the `Action.move()` Action to begin running in the background. Then the `run()` method finishes, and execution proceeds to the next line: `console.log()` to print the message.

Repeated clicks will run the move action again, but because the circle is already at its destination of `{ x: 50, y: 50 }`, there will be no visible change.

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';

export const code = `const sceneOne = new Scene({ backgroundColor: WebColors.Aquamarine });
game.addScene(sceneOne);
 
const clickMeButton = new Button({
    text: "Click me",
    size: { width: 100, height: 50 },
    position: { x: 100, y: 350 },
    isUserInteractionEnabled: true
});
sceneOne.addChild(clickMeButton);
 
const circle = new Shape({
    circleOfRadius: 40,
    fillColor: WebColors.DodgerBlue,
    position: { x: 100, y: 250 }
});
sceneOne.addChild(circle);
 
clickMeButton.onTapDown(() => {
    circle.run(Action.move({
        point: { x: 50, y: 50 },
        duration: 1500,
        easing: Easings.quadraticInOut
    }));
    console.log("Circle move action has begun.");
});`

<CodeExample code={code} template={template} console="true"/>