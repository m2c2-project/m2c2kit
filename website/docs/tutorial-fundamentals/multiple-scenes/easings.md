---
sidebar_position: 3
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Easings

Control the rate of change over time.

The purpose of animations isn't simply to look nice. Well-chosen animations help users understand the flow of the assessment, and the animations can mimic physical movement across space. In the real world, however, the rate of change over time is not constant. For example, when you drop a ball, it starts out slowly, but due to gravity it accelerates as it approaches the ground. Similarly, when you walk, you start out slowly, accelerate, and then slow down as you approach your destination.

The `easing` property of a transition defines the rate of change over time. The default is `Easings.linear`, which is a constant speed over time. This appears unnatural to the human eye because it doesn't mimic the real world. It gives a "conveyor belt" effect, where everything moves at the same speed.

Modern user interfaces use a variety of easings to make animations appear more natural. Along with linear, available easings in m2c2kit[^1] are:

- quadratic
- cubic
- quartic
- quintic
- sinusoidal
- exponential
- circular

In addition to the form of the easing, the easing can be applied to the only the beginning of the transition ("In"), only the end of the transition ("Out"), or both ("InOut"). For example, `Easings.quadraticInOut` is a quadratic easing applied to both the beginning and end of the transition.

This [interactive page](https://easings.net/) demonstrates different easing functions.

:::tip

Confused about all the easing options? Just use `Easings.quadraticInOut`. If you don't like it, try another easing!

:::

Below, the transition from the first to the second scene uses `easing: Easings.quadraticInOut`. The return transition does not specify an easing, which defaults to `Easings.linear`. Although both scene transitions take 750 milliseconds to occur, the first seems more natural and makes the interface feel more responsive.

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';

export const code = `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
const forwardButton = new Button({
    text: "Natural movement next",
    fontSize: 14,
    backgroundColor: WebColors.SeaGreen,
    size: { width: 180, height: 50 },
    position: { x: 100, y: 200 },
    isUserInteractionEnabled: true
});
sceneOne.addChild(forwardButton);
 
forwardButton.onTapDown(() => {
    game.presentScene(sceneTwo,
    Transition.slide({
        direction: TransitionDirection.Left,
        duration: 750,
        easing: Easings.quadraticInOut
    }));
});
 
const sceneTwo = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneTwo);
const backButton = new Button({
    text: '"Conveyor belt" effect back',
    fontSize: 14,
    backgroundColor: WebColors.RebeccaPurple,
    size: { width: 180, height: 50 },
    position: { x: 100, y: 200 },
    isUserInteractionEnabled: true
});
sceneTwo.addChild(backButton);
 
backButton.onTapDown(() => {
    game.presentScene(sceneOne,
    Transition.slide({ direction: TransitionDirection.Right, duration: 750 }));
});
`;

export const more = [
{ description: <>Using animation mathematics, you can make custom transitions. In this example, a custom easing function provides a [bounce] transition in which the second scene slides past its destination before bouncing back.</>,
code: `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
const forwardButton = new Button({
    text: '"Bounce" easing forward',
    fontSize: 14,
    backgroundColor: WebColors.SeaGreen,
    size: { width: 180, height: 50 },
    position: { x: 100, y: 200 },
    isUserInteractionEnabled: true
});
sceneOne.addChild(forwardButton);
 
function bounce (t, b, c, d) {    
    let ts = (t /= d) * t;
    let tc = ts * t;
    return b + c * (-8.1525 * tc * ts + 28.5075 * ts * ts + -35.105 * tc + 16 * ts + -0.25 * t);
    // from https://stackoverflow.com/a/5493683
}
 
forwardButton.onTapDown(() => {
    game.presentScene(sceneTwo,
        Transition.slide({
            direction: TransitionDirection.Left,
            duration: 1000,
            easing: bounce
        })
    );
});
 
const sceneTwo = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneTwo);
const backButton = new Button({
    text: "Quintic easing back",
    fontSize: 14,
    backgroundColor: WebColors.RebeccaPurple,
    size: { width: 180, height: 50 },
    position: { x: 100, y: 200 },
    isUserInteractionEnabled: true
});
sceneTwo.addChild(backButton);
 
backButton.onTapDown(() => {
    game.presentScene(sceneOne,
        Transition.slide({
            direction: TransitionDirection.Right,
            duration: 750,
            easing: Easings.quinticInOut
        })
    );
});
`}
]

<CodeExample code={code} more={more} template={template} console="true"/>

[^1]: The easing functions in m2c2kit are based on [Robert Penner's easing functions](http://robertpenner.com/easing/).
