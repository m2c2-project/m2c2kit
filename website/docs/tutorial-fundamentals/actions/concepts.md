---
sidebar_position: 2
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Concepts

Actions are easy to use, but require a bit of understanding to get the most out of them.

## Actions are scheduled

Think of **Actions** as behaviors that are scheduled to happen: they may happen immediately, or they may happen later. An entity's **Actions** run only when the scene that contains the entity has fully appeared on the screen. This is important to understand, because it means that you can schedule an action to happen before the scene appears.

## Actions can be sequenced and grouped

You can schedule multiple actions to happen in a specific order (a "sequence"), or you can schedule multiple actions to happen at the same time (a "group"). This is useful for creating precisely timed behaviors.

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';
 
export const code = `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
const forwardButton = new Button({
    text: "Next",
    backgroundColor: WebColors.SeaGreen,
    size: { width: 180, height: 50 },
    position: { x: 100, y: 325 },
    isUserInteractionEnabled: true
});
sceneOne.addChild(forwardButton);
 
forwardButton.onTapDown(() => {
    game.presentScene(sceneTwo,
        Transition.slide({
            direction: TransitionDirection.Left,
            duration: 750,
            easing: Easings.quadraticInOut
        })
    );
});
 
const sceneTwo = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneTwo);
 
const movingLabel = new Label({
    text: "I'm rising!",
    position: { x: 100, y: 275 }
})
sceneTwo.addChild(movingLabel);
movingLabel.run(Action.move({
    point: { x: 100, y: 25 },
    duration: 500,
    runDuringTransition: false
}));
 
const backButton = new Button({
    text: "Back",
    backgroundColor: WebColors.RebeccaPurple,
    size: { width: 180, height: 50 },
    position: { x: 100, y: 325 },
    isUserInteractionEnabled: true
});
sceneTwo.addChild(backButton);
 
backButton.onTapDown(() => {
    game.presentScene(sceneOne,
        Transition.slide({
            direction: TransitionDirection.Right, duration: 750,
            easing: Easings.quadraticInOut
        })
    );
});`

<CodeExample code={code} template={template} console="true"/>

[^1]: Internally, m2c2kit runs a game loop, but this is abstracted away from the programmer through **Actions**.
