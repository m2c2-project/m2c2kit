---
sidebar_position: 2
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Physics Bodies

The physics engine will operate on an entity only if it has an attached `PhysicsBody`. A `PhysicsBody` models the physical properties of an entity within the engine. It is attached to an entity by setting the entity's `physicsBody` property to a `PhysicsBody` instance.

The m2c2kit physics engine supports the following types of physics bodies:
-  Circle: a circle centered on the entity's position.
-  Rectangle: a rectangle centered on the entity's position.
-  Edge Loop: a rectangle whose interior acts as a boundary for the physics engine. Entities with physics bodies are constrained by the edge loop.

Circle and rectangular physics bodies are dynamic, can move, and be affected by other physics bodies. An edge loop, however, is a static body that does not move or interact with other bodies.

## Attaching a Physics Body

Usually you attach a physics body to an entity when you create it and adjust the size of the physics body to match the size of the entity. For example, this code creates a circle shape with radius `40`. The corresponding physics body also has a radius of `40`:

```javascript
const pinkBall = new Shape( {
    circleOfRadius: 40,
    fillColor: WebColors.LightPink,
    position: { x: 100, y: 100 },
});
pinkBall.physicsBody = new PhysicsBody({
    circleOfRadius: 40,
});
```

## Resting a Physics Body

If an entity has a physics body, the physics engine will automatically update the entity's position and rotation. That could be a problem, because the user might not be ready for the entity to move! In the example below, the `resting` property of the pink ball's `PhysicsBody` is set to `true`. When a physics body is resting, the physics engine will not apply forces to it.

In the example, pressing the "Go" button will set the pink ball in motion: its `resting` property will be set to `false`, and the physics engine will apply the force of gravity.

Note two things in the example:
- The blue ball does not move or affect the pink ball's motion: the blue ball does not have a physics body, and thus it is ignored by the physics engine.
- The pink ball will not bounce off the bottom -- it will drop forever! That's because the physics engine does not know about the bottom of the scene. To make pink ball bounce off the bottom, you need to add an edge loop physics body to the scene.

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';

export const code = `const physics = new Physics({ game: game });
 
const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
 
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

const blueBall = new Shape( {
    circleOfRadius: 30,
    fillColor: WebColors.LightBlue,
    position: { x: 100, y: 300 },
});
sceneOne.addChild(blueBall);
 
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

export const more = [
{ description: <>For development purposes, it can be helpful to show the [outline] of the physics body that has been attached to an entity. To do this, pass the option `showsPhysics: true` into the physics engine constructor. A green outline now appears around the pink ball (because it has a physics body), but not the blue ball.</>,
code: `const physics = new Physics({ game: game, showsPhysics: true });
 
const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
 
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

const blueBall = new Shape( {
    circleOfRadius: 30,
    fillColor: WebColors.LightBlue,
    position: { x: 100, y: 300 },
});
sceneOne.addChild(blueBall);
 
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
`}
];


<CodeExample code={code} more={more} template={template} console="true"/>
