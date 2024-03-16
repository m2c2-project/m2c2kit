---
sidebar_position: 1
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Timing User Behavior

How long a user takes to complete a task is an important metric for researchers. m2c2kit provides a `Timer` to measure these durations.

## How long to click the button?

In the below example, we will measure how long it takes a user to click a button. Click the "Begin" button to advance to the next scene. When the "CLICK ME!" button appears, click it as fast it as you can. A console message will show how long it took from when the button appeared until when you clicked it.

The relevant `Timer` code appears in two places. First, we start a new timer called `rt` (for "response time") in the `onAppear` event for the second scene:

```js
sceneTwo.onAppear(() => {
    console.log("sceneTwo onAppear event");
    clickMeButton.hidden = false;
    clickMeButton.isUserInteractionEnabled = true;
    Timer.startNew("rt");
});
```

Second, we calculate the duration of the timer in the `onTapDown` event handler for the button:

```js
clickMeButton.onTapDown(() => {
    clickMeButton.isUserInteractionEnabled = false;
    const clickDurationMs = Timer.elapsed("rt");
    Timer.remove("rt");
    console.log("You took " + clickDurationMs + " milliseconds");
    backButton.hidden = false;
});
```

:::tip

To prevent users from pushing the "CLICK ME!" button multiple times within the same trial, we disable user interaction in the `onTapDown` event handler for the "CLICK ME!" button immediately after it is pushed. We enable the button again in the `onAppear` event handler for `sceneTwo`.

:::

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
            duration: 500,
            easing: Easings.quadraticInOut
        }));
});
 
const sceneTwo = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneTwo);
 
sceneTwo.onSetup(() => {
    backButton.hidden = true;
    clickMeButton.hidden = true;
});
 
sceneTwo.onAppear(() => {
    console.log("sceneTwo onAppear event");
    clickMeButton.hidden = false;
    clickMeButton.isUserInteractionEnabled = true;
    Timer.startNew("rt");
});
 
const clickMeButton = new Button({
    text: 'CLICK ME!',
    backgroundColor: WebColors.Green,
    size: { width: 150, height: 100 },
    position: { x: 100, y: 100 },
    isUserInteractionEnabled: true,
    hidden: false
});
sceneTwo.addChild(clickMeButton);
clickMeButton.onTapDown(() => {
    clickMeButton.isUserInteractionEnabled = false;
    const clickDurationMs = Timer.elapsed("rt");
    Timer.remove("rt");
    console.log("You took " + clickDurationMs + " milliseconds");
    backButton.hidden = false;
});
 
const backButton = new Button({
    text: 'Back',
    backgroundColor: WebColors.PaleVioletRed,
    size: { width: 150, height: 50 },
    position: { x: 100, y: 325 },
    isUserInteractionEnabled: true,
    hidden: true
});
sceneTwo.addChild(backButton);
 
backButton.onTapDown(() => {
    game.presentScene(sceneOne,
        Transition.slide({
            direction: TransitionDirection.Right,
            duration: 500, easing: Easings.quadraticInOut
        }));
});
`;

<CodeExample code={code} template={template} console={"true"}/>
