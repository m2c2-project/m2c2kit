---
sidebar_position: 4
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Scene Events

Change a scene's appearance before or after it appears.

When a new scene is presented with a transition, it begins to show but is not completely visible. This is because the transition is an animation that takes time to complete. Depending on your assessment, you may need the scene to have a specific configuration during the transition but then change once the transition is complete.

For example, maybe your scene has a square in which there is a word. You want the square to be visible _during_ the transition, but the word must be visible only _after_ the transition is complete.

When the game presents a scene, the scene will receive two different events:[^1]

- `Setup` - occurs when the `presentScene()` method is called. At this point, the incoming scene is not yet visible, but the scene can change its appearance to prepare for the transition.
- `Appear` - occurs when the scene has finished its transition and is completely visible.

# A Scene that changes appearance every time it is presented

In the example below, the second scene shows a square with a word. The word is not visible during the transition, but it is visible after the transition is complete. In addition, across repeated trials, the word changes and the square's color alternates between red and green (do another trial by going back to the first scene and clicking "Begin" again).

Because the the square's color and the word change at each trial, these characteristics need to be set each time the scene is presented. Therefore, we:

1. Set the square's color in the `onSetup()` event handler so the color is correct as the scene slides into view during the transition. Also, set the label text to the correct word, but make it hidden so it is not visible during the transition.

```js
sceneTwo.onSetup(() => {
    console.log("sceneTwo onSetup event");
    if (wordIndex % 2 == 0) {
        // % is the modulus operator, which returns the remainder of a division
        // we use this to alternate between red and green
        square.strokeColor = WebColors.Red;
    } else {
        square.strokeColor = WebColors.Green;
    }
    wordLabel.text = wordLibrary[wordIndex];
    wordLabel.hidden = true;
});
```

2. Unhide the label in the `onAppear()` event handler so the word is visible once the transition is complete.

```js
sceneTwo.onAppear(() => {
    console.log("sceneOne onAppear event");
    wordLabel.hidden = false;
});
```

The example also prints messages to the console log to show when the `onSetup` and `onAppear` events occur.

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';

export const code = `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
const beginButton = new Button({
    text: "Begin",
    backgroundColor: WebColors.Chocolate,
    size: { width: 150, height: 50 },
    position: { x: 100, y: 325 },
    isUserInteractionEnabled: true
});
sceneOne.addChild(beginButton);
 
beginButton.onTapDown(() => {
    game.presentScene(sceneTwo,
    Transition.slide({
        direction: TransitionDirection.Left,
        duration: 1000,
        easing: Easings.quadraticInOut
    }));
});
 
const sceneTwo = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneTwo);
let wordIndex = 0;
 
const square = new Shape({
    rect: { size: { width: 150, height: 150 } },
    position: { x: 100, y: 200 },
    fillColor: WebColors.Transparent,
    lineWidth: 2
});
sceneTwo.addChild(square);
 
const wordLibrary = ["dog", "cat", "tree", "world"];
 
const wordLabel = new Label({ text: "" });
square.addChild(wordLabel);
 
sceneTwo.onSetup(() => {
    console.log("sceneTwo onSetup event");
    if (wordIndex % 2 == 0) {
        // % is the modulus operator, which returns the remainder of a division
        // we use this to alternate between red and green  
        square.strokeColor = WebColors.Red;
    } else {
        square.strokeColor = WebColors.Green;
    }
    wordLabel.text = wordLibrary[wordIndex];
    wordLabel.hidden = true;
});
 
sceneTwo.onAppear(() => {
    console.log("sceneTwo onAppear event");
    wordLabel.hidden = false;
});
 
const backButton = new Button({
    text: 'Back',
    backgroundColor: WebColors.PaleVioletRed,
    size: { width: 150, height: 50 },
    position: { x: 100, y: 325 },
    isUserInteractionEnabled: true
});
sceneTwo.addChild(backButton);
 
backButton.onTapDown(() => {
    wordIndex++;
    if (wordIndex > 3) {
        wordIndex = 0;
    }
    game.presentScene(sceneOne,
    Transition.slide({
        direction: TransitionDirection.Right,
        duration: 500, easing: Easings.quadraticInOut
    }));
});
`;

<CodeExample code={code} template={template} console="true"/>

[^1]: If a scene is presented without any transition, the `Setup` event occurs and the `Appear` event immediately follows.
