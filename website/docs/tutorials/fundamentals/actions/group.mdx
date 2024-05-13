---
sidebar_position: 11
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Group

The `Group` Action runs multiple Actions simultaneously. All Actions begin at the same time. The `Group` Action is considered finished when the Action with the longest duration has completed.

## Running two Actions as a group

Below, we run two simultaneous Actions on the "A" label after the "GO" button is pushed:

- A `Move` Action moves the label to `{ x: 100, y: 75 }`.
- A `Scale` Action scales the Action to 10 times its original size.

```js
aLabel.run(Action.group([
    Action.move({ point: { x: 100, y: 75 }, duration: 1000 }),
    Action.scale({ scale: 10, duration: 500 }),
]));
```

The `Move` action takes 1000 milliseconds to complete, while the `Scale` action takes only 500 milliseconds. Thus, the total duration of the group Action is 1000 milliseconds.

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';

export const code = `const sceneOne = new Scene({ backgroundColor: WebColors.LightBlue });
game.addScene(sceneOne);
const aLabel = new Label({ text: "A", position: { x: 100, y: 300 } });
sceneOne.addChild(aLabel);
 
const goButton = new Button({
    text: "GO",
    size: { width: 100, height: 50 },
    position: { x: 100, y: 350 },
    isUserInteractionEnabled: true
});
sceneOne.addChild(goButton);
 
goButton.onTapDown(() => {
    aLabel.run(Action.group([
        Action.move({ point: { x: 100, y: 75 }, duration: 1000 }),
        Action.scale({ scale: 10, duration: 500 }),
    ]));
    console.log("Group action has begun.");
});`;

export const more = [
{ description: <>How can we apply a group Action to [two different nodes]? For example, what if we want to move and scale two different labels, "A" and "B", at the same time? In the group Action for the "A" label, move and scale it as before. Then, add an additional Action within the group: a custom Action to move and scale the "B" label:
<pre>
  <code className="language-js">{`aLabel.run(Action.group([
    Action.move({ point: { x: 40, y: 75 }, duration: 1000 }),
    Action.scale({ scale: 4, duration: 500 }),
    Action.custom({
        callback: () => {
            bLabel.run(Action.group([
                Action.move({ point: { x: 160, y: 75 }, duration: 1000 }),
                Action.scale({ scale: 4, duration: 500 }),
            ]));
        }
    })
]));`}
  </code>
</pre>
Now, both labels move and scale at the same time.
</>,
code: `const sceneOne = new Scene({ backgroundColor: WebColors.LightBlue });
game.addScene(sceneOne);
const aLabel = new Label({ text: "A", position: { x: 40, y: 300 } });
sceneOne.addChild(aLabel);
const bLabel = new Label({ text: "B", position: { x: 160, y: 300 } });
sceneOne.addChild(bLabel);
 
const goButton = new Button({
    text: "GO",
    size: { width: 100, height: 50 },
    position: { x: 100, y: 350 },
    isUserInteractionEnabled: true
});
sceneOne.addChild(goButton);
 
goButton.onTapDown(() => {
    aLabel.run(Action.group([
        Action.move({ point: { x: 40, y: 75 }, duration: 1000 }),
        Action.scale({ scale: 4, duration: 500 }),
        Action.custom({
            callback: () => {
                bLabel.run(Action.group([
                    Action.move({ point: { x: 160, y: 75 }, duration: 1000 }),
                    Action.scale({ scale: 4, duration: 500 }),
                ]));
            }
        })
    ]));
    console.log("Group action has begun.");
});`},
];

<CodeExample code={code} more={more} template={template} console="true"/>
