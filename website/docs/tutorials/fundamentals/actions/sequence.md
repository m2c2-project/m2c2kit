---
sidebar_position: 10
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Sequence

The `Sequence` Action runs Actions one after another. The next Action does not begin until the current one has finished. The `Sequence` Action is considered finished when all of its Actions are finished.

## Running three Actions in sequence

Below, we run three Actions on the label after the "GO" button is pushed. An animation to move the label to `{ x: 100, y: 50 }`, a wait of 250 milliseconds, and then another action to move the label back to where it started at `{ x: 100, y: 300 }`. Thus, the total duration of the sequence is 1250 milliseconds (500 for the move + 250 for the wait + 500 for the second move).

```js
moveLabel.run(Action.sequence([
    Action.move({ point: { x: 100, y: 50 }, duration: 500 }),
    Action.wait({ duration: 250 }),
    Action.move({ point: { x: 100, y: 300 }, duration: 500 }),
]));
```

:::note

The argument to `Action.sequence()` is an **array** of Actions. Notice the square brackets enclosing the move and wait Actions: `Action.sequence([ ... ])`.

:::

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';

export const code = `const sceneOne = new Scene({ backgroundColor: WebColors.LightBlue });
game.addScene(sceneOne);
const moveLabel = new Label({ text: "I move up then down.", position: { x: 100, y: 300 } });
sceneOne.addChild(moveLabel);
 
const goButton = new Button({
    text: "GO",
    size: { width: 100, height: 50 },
    position: { x: 100, y: 350 },
    isUserInteractionEnabled: true
});
sceneOne.addChild(goButton);
 
goButton.onTapDown(() => {
    moveLabel.run(Action.sequence([
        Action.move({ point: { x: 100, y: 50 }, duration: 500 }),
        Action.wait({ duration: 250 }),
        Action.move({ point: { x: 100, y: 300 }, duration: 500 }),
    ]));
    console.log("Sequence action has begun.");
});`;

export const more = [
{ description: <>Clicking "GO" multiple times quickly will interfere with the smooth animation. This is because the `run()` method will immediately replace any existing Action that is running on the node. To fix this, to the `Sequence` Action, add Actions [before and after] the animations to disable and re-enable the button:
<ul>
<li>A <code>Custom</code> Action sets the <code>isUserInteractionEnabled</code> property of the button to <code>false</code> before the animations begin. This prevents additional clicks.</li>
<li>When the animations are complete, a <code>Custom</code> Action sets the <code>isUserInteractionEnabled</code> property of the button to <code>true</code> so it again responds to clicks.</li>
</ul>
<pre>
  <code className="language-js">{`goButton.onTapDown(() => {
    moveLabel.run(Action.sequence([
        Action.custom({
            callback: () => {
                goButton.isUserInteractionEnabled = false;
            }
        })        
        Action.move({ point: { x: 100, y: 50 }, duration: 500 }),
        Action.wait({ duration: 250 }),
        Action.move({ point: { x: 100, y: 300 }, duration: 500 }),
        Action.custom({
            callback: () => {
                goButton.isUserInteractionEnabled = true;
            }
        })
    ]));
    console.log("Sequence action has begun.");
});`}
  </code>
</pre>
Now, the user can repeatedly hit the "GO" button, but the animations will not be interrupted.
</>,
code: `const sceneOne = new Scene({ backgroundColor: WebColors.LightBlue });
game.addScene(sceneOne);
const moveLabel = new Label({ text: "I move up then down.", position: { x: 100, y: 300 } });
sceneOne.addChild(moveLabel);
 
const goButton = new Button({
    text: "GO",
    size: { width: 100, height: 50 },
    position: { x: 100, y: 350 },
    isUserInteractionEnabled: true
});
sceneOne.addChild(goButton);
 
goButton.onTapDown(() => {
    moveLabel.run(Action.sequence([
        Action.custom({
            callback: () => {
                goButton.isUserInteractionEnabled = false;
            }
        }),
        Action.move({ point: { x: 100, y: 50 }, duration: 500 }),
        Action.wait({ duration: 250 }),
        Action.move({ point: { x: 100, y: 300 }, duration: 500 }),
        Action.custom({
            callback: () => {
                goButton.isUserInteractionEnabled = true;
            }
        })
    ]));
    console.log("Sequence action has begun.");
});`},
];

<CodeExample code={code} more={more} template={template} console="true"/>
