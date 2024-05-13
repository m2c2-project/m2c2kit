---
sidebar_position: 1
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Why Physics?

Physics allow nodes to respond to forces as if they were objects in the real world. This is useful for creating realistic animations and interactions.

:::tip

Physics are an advanced feature and not necessary for most assessments. If you are just starting out, you can skip this section!

:::

The m2c2kit physics functionality uses the [Matter.js](https://github.com/liabru/matter-js) physics engine. Matter.js is a powerful physics engine, and m2c2kit uses only a subset of its features.

In the below example, press the "Go" button to show how the labels are affected by gravity and interactions with each other. Press "Reset" to put the labels back in their original positions.

If you run the example multiple times, you will get slightly different results in the labels' movements . This is because the Matter.js engine is [non-deterministic](https://en.wikipedia.org/wiki/Nondeterministic_algorithm).

:::warning

Physics in m2c2kit is experimental, and the API may change in the future.

:::

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';

export const code = `const physics = new Physics();
await game.registerPlugin(physics);
 
const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
 
const edge = new Shape({
    rect: { width: 180, height: 380 },
    fillColor: WebColors.Transparent,
    strokeColor: WebColors.Black,
    lineWidth: 1,
    position: { x: 100, y: 200 },
});
edge.physicsBody = new PhysicsBody({
    edgeLoop: { width: 180,
        height: 380,
        thickness: 50 },
    restitution: .95,
});
sceneOne.addChild(edge);
 
const button = new Button( {
    text: "Go",
    position: { x: 100, y: 50},
    size: { width: 70, height: 50},
    isUserInteractionEnabled: true,
});
sceneOne.addChild(button);
 
const aLabel = new Label({ text: "a", position: { x: 100, y: 100 } });
sceneOne.addChild(aLabel);
aLabel.physicsBody = new PhysicsBody({
  // make the physics body a circle so it can roll
  circleOfRadius: 10,
  resting: true,
  restitution: .9,
});
const physicsLabel = new Label({ text: "physics", position: { x: 70, y: 130 } });
sceneOne.addChild(physicsLabel);
physicsLabel.physicsBody = new PhysicsBody({
  rect: { width: 60, height: 20},
  resting: true,
  restitution: .9,
});
const demoLabel = new Label({ text: "demo", position: { x: 125, y: 130 } });
sceneOne.addChild(demoLabel);
demoLabel.physicsBody = new PhysicsBody({
  rect: { width: 40, height: 20},
  resting: true,
  restitution: .9,
});
 
button.onTapDown( () => {
    if (button.text === "Go") {
      button.text = "Reset";
      aLabel.physicsBody.resting = false;
      physicsLabel.physicsBody.resting = false;
      demoLabel.physicsBody.resting = false;
    } else {
      button.text = "Go";
        aLabel.physicsBody.resting = true;
        physicsLabel.physicsBody.resting = true;
        demoLabel.physicsBody.resting = true;
        aLabel.position = { x: 100, y: 100 };
        aLabel.zRotation = 0;
        physicsLabel.position = { x: 70, y: 130 };
        physicsLabel.zRotation = 0;
        demoLabel.position = { x: 125, y: 130 };
        demoLabel.zRotation = 0;
    }
});
`

<CodeExample code={code} template={template} console="true"/>
