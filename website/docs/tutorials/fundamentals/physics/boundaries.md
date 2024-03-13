---
sidebar_position: 3
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Boundaries

If there is no boundary, the physics engine will not constrain the nodes in the scene. In the previous example, the pink ball will drop forever because there is no physics boundary.

To add a boundary, add an edge loop physics body to the scene. The edge loop physics body is a rectangle whose interior acts as a boundary for the physics engine. Nodes with physics bodies are constrained by the edge loop.

The example adds an edge loop physics body to the scene. The pink ball no longer falls off the scene!

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';

## Tunneling

If a node moves too fast, it might pass through the edge loop. This is called [tunneling](https://gamedev.stackexchange.com/a/192403). To prevent tunneling, edge loops have a default thickness of `50`. If you still find that a fast-moving node penetrates the edge loop, increase the `thickness` property of the edge loop. The thickness is applied to the outside of the edge loop, and thus it will not affect the interior boundary size.

export const code = `const physics = new Physics();
await game.registerPlugin(physics);
 
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

export const more = [
{ description: <>If we show the physics body [outlines], we see that the edge loop is simply a collection of non-dynamic (static) rectangles. You could have assembled this boundary by placing four non-dynamic rectangles, but the edge loop is a convenient shortcut. Note: The rectangle outlines appear as lines instead of full rectangles because portions of the rectangles are beyond the visible scene.</>,
code: `const physics = new Physics({ showsPhysics: true });
await game.registerPlugin(physics);
 
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
`}
];


<CodeExample code={code} more={more} template={template} console="true"/>
