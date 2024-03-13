---
sidebar_position: 6
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Rotate

The `Rotate` action changes the node's `zRotation` over time.

The options object for the `Rotate` action has the following properties:

- `byAngle`: Relative amount to rotate the node, in counter-clockwise radians.
- `toAngle`: Absolute angle to which rotate the node, in counter-clockwise radians.
- `shortestUnitArc`: If `toAngle` is provided, should the rotation be performed in the direction that leads to the smallest rotation? Default is true.
- `duration`: The duration of the animation in milliseconds.
- `runDuringTransition`: A boolean indicating whether the action should run during a transition. This is an optional property. If not specified, the default is `false`.

In the below example, clicking "L" will rotate the "Rotate Me" rectangle by a small amount (π/16 radians) to the left. Clicking "R" rotates it to the right. Clicking "Reset" will rotate it back to its original position.

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';

export const code = `const sceneOne = new Scene({ backgroundColor: WebColors.Aquamarine });
game.addScene(sceneOne);
 
const leftButton = new Button({
    text: "L",
    size: { width: 50, height: 50 },
    position: { x: 50, y: 50 },
    isUserInteractionEnabled: true
});
sceneOne.addChild(leftButton);

const rightButton = new Button({
    text: "R",
    size: { width: 50, height: 50 },
    position: { x: 150, y: 50 },
    isUserInteractionEnabled: true
});
sceneOne.addChild(rightButton);

const resetButton = new Button({
    text: "Reset",
    size: { width: 100, height: 50 },
    position: { x: 100, y: 350 },
    isUserInteractionEnabled: true
});
sceneOne.addChild(resetButton);
 
const rect = new Shape({
    rect: { width: 120, height: 40 },
    fillColor: WebColors.DodgerBlue,
    position: { x: 100, y: 200 },
    cornerRadius: 8
});
sceneOne.addChild(rect);
 
const rotateMeLabel = new Label( {
    text: "Rotate Me",
    fontColor: WebColors.White,
})
rect.addChild(rotateMeLabel);
 
leftButton.onTapDown(() => {
    rect.run(Action.rotate({
        byAngle: Math.PI / 16,
        duration: 200,
    }));
    console.log("Begin rotate action from " + rect.zRotation + " to " + (rect.zRotation + Math.PI / 16) + " radians.");
});
 
rightButton.onTapDown(() => {
    rect.run(Action.rotate({
        byAngle: -Math.PI / 16,
        duration: 200,
    }));
    console.log("Begin rotate action from " + rect.zRotation + " to " + (rect.zRotation - Math.PI / 16) + " radians.");
});
 
resetButton.onTapDown(() => {
    rect.run(Action.rotate({
        toAngle: 0,
        duration: 200,
    }));
    console.log("Begin rotate action from " + rect.zRotation + " to " + 0 + " radians.");
});`

<CodeExample code={code} template={template} console="true"/>
