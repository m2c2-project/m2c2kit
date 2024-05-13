---
sidebar_position: 4
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Gravitational force

By default, the physics engine applies a downward force to all dynamic physics bodies. This force is called gravity. You can change the gravity by setting the `gravity` property of the `Physics` instance.

The default gravity is a `Vector` with `dx` and `dy` components of `0` and `1`, respectively. This means that the force of gravity is `0` in the horizontal direction and `1` in the vertical direction. In other words, the force of gravity is downward.

:::note

In m2c2kit, the origin is at the top-left corner of the scene. Thus, the positive `dy` direction is downward.

:::

## Changing gravity

To change the gravity, set the `gravity` property of the `Physics` instance.

The [moon's gravity](https://en.wikipedia.org/wiki/Gravitation_of_the_Moon) is 1/6 that of earth's. The below example simulates the moon's gravity by setting the `gravity` property to `{ dx: 0, dy: .1666}`.

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';

export const code = `const physics = new Physics();
await game.registerPlugin(physics);
physics.gravity = { dx: 0, dy: .1666 };
 
const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
 
const edge = new Shape({
    rect: { width: 190, height: 390 },
    fillColor: WebColors.Transparent,
    strokeColor: WebColors.Transparent,
    position: { x: 100, y: 200 },
});
edge.physicsBody = new PhysicsBody({
    edgeLoop: { width: 190, height: 390 },
    restitution: .5,
});
sceneOne.addChild(edge);
 
const pinkBall = new Shape( {
    circleOfRadius: 40,
    fillColor: WebColors.LightPink,
    position: { x: 100, y: 130 },
});
pinkBall.physicsBody = new PhysicsBody({
    circleOfRadius: 40,
    resting: true,
});
sceneOne.addChild(pinkBall);
 
const button = new Button( {
    text: "Go",
    position: { x: 100, y: 50},
    size: { width: 70, height: 50},
    isUserInteractionEnabled: true,
});
sceneOne.addChild(button);
button.onTapDown( () => {
    if (button.text === "Go") {    
        button.text = "Reset";
        pinkBall.physicsBody.resting = false;
    } else {
        button.text = "Go";
        pinkBall.position = { x: 100, y: 130};
        pinkBall.physicsBody.resting = true;
    }
});
`

<CodeExample code={code} template={template} console="true"/>
