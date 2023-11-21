---
sidebar_position: 7
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Wait

The `Wait` action waits for a specified duration.

The options object for the `Wait` action has the following properties:

- `duration`: The duration of the wait in milliseconds.
- `runDuringTransition`: A boolean indicating whether the action should run during a transition. This is an optional property. If not specified, the default is `false`.

The below example waits for 750 milliseconds when the button is clicked.

```js
clickMeButton.onTapDown(() => {
    circle.run(Action.wait({
        duration: 750,
    }));
    console.log("Circle wait action has begun.");
});
```

:::note

As we see in this example, on its own, the `Wait` action isn't very useful. Its power comes when you [combine](./combining-actions.md) it with other Actions.

:::

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
    position: { x: 100, y: 200 }
});
sceneOne.addChild(circle);
 
clickMeButton.onTapDown(() => {
    circle.run(Action.wait({
        duration: 750,
    }));
    console.log("Circle wait action has begun.");
});`

<CodeExample code={code} template={template} console="true"/>