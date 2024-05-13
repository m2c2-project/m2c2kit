---
sidebar_position: 12
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Nesting Sequence & Group

The `Sequence` and `Group` Actions can hold any other Actions -- including *other* `Sequence` and `Group` Actions! This allows you to create very complex Actions customized to your needs.

## A group nested within a sequence

This example modifies a [previous example](./group). Previously, the label moved up and scaled larger. Now, we have two additional requirements:

1. After the label has reached the top, it should move back down to its original position and scale.
2. Prevent the "GO" button from being clicked multiple times and interfering with the Actions.

To do this, we use a `Sequence` as the root containing action. This sequence has 4 Actions:

1. A `Custom` Action to disable the "GO" button.
2. A `Group` Action that moves the label up and scales it larger.
3. A `Group` Action that moves the label down and scales it to its original size.
4. A `Custom` Action to enable the "GO" button and print a message to the console.

```js
aLabel.run(Action.sequence([
    Action.custom({
        callback: () => {
            goButton.isUserInteractionEnabled = false;
        }
    }),
    Action.group([
        Action.move({ point: { x: 100, y: 75 }, duration: 750 }),
        Action.scale({ scale: 10, duration: 750 }),
    ]),
    Action.group([
        Action.move({ point: { x: 100, y: 300 }, duration: 750 }),
        Action.scale({ scale: 1, duration: 750 }),
    ]),
    Action.custom({
        callback: () => {
            goButton.isUserInteractionEnabled = true;
            console.log("Sequence action has completed.");
        }
    })
]));
```

:::tip

When there are nested Actions, use indentation to organize `Sequence` and `Group` Actions so the ordering is clear.

:::

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
    aLabel.run(Action.sequence([
        Action.custom({
            callback: () => {
                goButton.isUserInteractionEnabled = false;
            }
        }),
        Action.group([
            Action.move({ point: { x: 100, y: 75 }, duration: 750 }),
            Action.scale({ scale: 10, duration: 750 }),
        ]),
        Action.group([
            Action.move({ point: { x: 100, y: 300 }, duration: 750 }),
            Action.scale({ scale: 1, duration: 750 }),
        ]),
        Action.custom({
            callback: () => {
                goButton.isUserInteractionEnabled = true;
                console.log("Sequence action has completed.");
            }
        })
    ]));
    console.log("Sequence action has begun.");
});`;

<CodeExample code={code} template={template} console="true"/>
