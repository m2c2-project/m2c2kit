---
sidebar_position: 2
hide_table_of_contents: true
---

import CodeBlock from '@theme/CodeBlock';
import CodeExample from '@site/src/components/CodeExample';
import MDXPre from '@theme/MDXComponents/Pre';

# Actions are Scheduled

Think of Actions as behaviors that are scheduled to happen: they may happen immediately, or they may happen later.

To run an action, call the node's `run()` method, and provide the Action to run as the first argument.

:::tip

By default, a node's Actions run only when the scene that contains the node has fully appeared on the screen. This is important to understand, because it means that you can schedule an action to happen before the scene appears.

:::

Below, we run a `Move` action on the second scene's label to animate the label position on the screen. 

```js
movingLabel.run(Action.move({
    point: { x: 100, y: 25 },
    duration: 500,
}));
```

Two points:

1. The label's `Move` action will run only once the second scene has fully appeared on the screen (this coincides with the second scene's `OnAppear` event).
2. If you go "Back" and "Next" again, the label is already at the top. This is because we ran the action only once, and the action is now complete.

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
}));
 
sceneTwo.onSetup(() => {
    console.log("sceneTwo onSetup event");
});
 
sceneTwo.onAppear(() => {
    console.log("sceneTwo onAppear event");
});
 
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
            direction: TransitionDirection.Right, duration: 1000,
            easing: Easings.quadraticInOut
        })
    );
});`

export const more = [
{ description: <>If you want the Action to [run during the transition], set the option `runDuringTransition` to `true`:<br/><br/>
<pre>
  <code className="language-js">{`movingLabel.run(Action.move({
    point: { x: 100, y: 25 },
    duration: 500,
    runDuringTransition: true
}));`}
  </code>
</pre>
Now, when the second scene slides in, the label has already started its action.</>,
code: `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
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
    runDuringTransition: true
}));
 
sceneTwo.onSetup(() => {
    console.log("sceneTwo onSetup event");
});
 
sceneTwo.onAppear(() => {
    console.log("sceneTwo onAppear event");
});
 
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
            direction: TransitionDirection.Right, duration: 1000,
            easing: Easings.quadraticInOut
        })
    );
});`},{
description: <>If you want the label to reset itself and rise [every time] you come to the second screen:<br/>
<ul>
<li>Move the label's run action within the <code>sceneTwo.onAppear()</code> event handler so it runs every time the second scene appears and</li>
<li>Reset the label's position in the <code>backButton.onTapDown()</code> event handler</li>
</ul>
</>,
code: `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
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
 
sceneTwo.onSetup(() => {
    console.log("sceneTwo onSetup event");
});
 
sceneTwo.onAppear(() => {
    console.log("sceneTwo onAppear event");
    movingLabel.run(Action.move({
        point: { x: 100, y: 25 },
        duration: 500,
    }));
});
 
const backButton = new Button({
    text: "Back",
    backgroundColor: WebColors.RebeccaPurple,
    size: { width: 180, height: 50 },
    position: { x: 100, y: 325 },
    isUserInteractionEnabled: true
});
sceneTwo.addChild(backButton);
 
backButton.onTapDown(() => {
    movingLabel.position = { x: 100, y: 275 };
    game.presentScene(sceneOne,
        Transition.slide({
            direction: TransitionDirection.Right, duration: 1000,
            easing: Easings.quadraticInOut
        })
    );
});`}
]

<CodeExample code={code} template={template} more={more} console="true"/>

[^1]: Internally, m2c2kit runs a game loop, but this is abstracted away from the programmer through **Actions**.
