---
sidebar_position: 8
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# More properties

Physics bodies have many more properties that control their behavior within the physics engine.

- `friction` controls how much friction the physics body experiences.
- `restitution` controls how much energy is lost when the physics body collides with another physics body.
- `angularVelocity` controls how fast the physics body rotates.
- and more...

Refer to the `PhysicsBody` [API reference](/docs/reference/api-physics/classes/PhysicsBody) for a complete list of properties. Because the m2c2kit physics functionality uses the Matter.js engine, the `Matter.Body` [API reference](https://brm.io/matter-js/docs/classes/Body.html) will offer even more detail on these properties.

The example increases the angular velocity of the label each time the "GO" button is press. Press the button a few times to see the label spin faster and faster!

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';

export const code = `const physics = new Physics();
await game.registerPlugin(physics);
physics.gravity = { dx: 0, dy: 0 };
 
const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
 
const spinMeLabel = new Label({
    text: "I spin around!",
    fontColor: WebColors.RoyalBlue,
    position: { x: 100, y: 200 },
});
spinMeLabel.physicsBody = new PhysicsBody({
    rect: { width: 120, height: 25 },
});
sceneOne.addChild(spinMeLabel);
 
const button = new Button({
    text: "Go",
    position: { x: 100, y: 50 },
    size: { width: 70, height: 50 },
    isUserInteractionEnabled: true,
});
sceneOne.addChild(button);
button.onTapDown(() => {
    spinMeLabel.physicsBody.angularVelocity =
      spinMeLabel.physicsBody.angularVelocity + .1;
});
`

<CodeExample code={code} template={template} console="true"/>
