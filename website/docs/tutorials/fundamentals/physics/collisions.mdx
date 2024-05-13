---
sidebar_position: 6
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Collisions

When a node has an attached `PhysicsBody`, the physics engine takes care of calculating its position as a result of interactions with other physics bodies and forces. Sometimes you need to know what is happening within the physics engine. For example, you might want to know when two physics bodies collide, so it can trigger something else to happen. You can do this by adding an event handler to the `Physics` instance. 

## Physics events

There are two types of physics events:

- `ContactBegin` occurs when two physics bodies start to collide.
- `ContactEnd` occurs when two physics bodies stop colliding.

When a physics event occurs, the `Physics` instance will emit an event with the type of the event type (`ContactBegin` or `ContactEnd`). The event object will have a `bodyA` property and a `bodyB` property, each of which is a `PhysicsBody` in the collision. Note that a `PhysicsBody` has a property called `node` that is a reference to the node to which the `PhysicsBody` is attached. You can use this to determine which nodes are involved in the collision and trigger other behaviors.

:::tip

`bodyA` and `bodyB` are the two physics bodies involved in the collision. The order of the bodies has no significance. For example, if a ball collides with a wall, `bodyA` could be the ball, and  `bodyB` could be the wall, or vice versa. Furthermore, the next time the two bodies collide,  `bodyA` and `bodyB` could be reversed.

:::

## Colorful collisions

The example has two balls. The first one is a random color, the second is transparent with a black outline. Whenever the first ball begins a collision with another physics body (a `ContactBegin` event), it changes to a new random color. The second ball never changes color.

```js
physics.onContactBegin((e) => {
  // the rgb ball could be bodyA or bodyB, so we need to check both
  // the name property was set when the ball's Shape was created
  if (e.bodyA.node.name === "rgb-ball") {
    e.bodyA.node.fillColor = randomColor();
  }
  if (e.bodyB.node.name === "rgb-ball") {
    e.bodyB.node.fillColor = randomColor();
  }
});
```

Click either ball to apply a random upward force to it.

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';

export const code = `const physics = new Physics();
await game.registerPlugin(physics);
 
const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
 
const edge = new Shape({
  rect: { width: 150, height: 350 },
  fillColor: WebColors.Transparent,
  strokeColor: WebColors.Black,
  lineWidth: 1,
  position: { x: 100, y: 200 },
});
edge.physicsBody = new PhysicsBody({
  edgeLoop: { width: 150, height: 350, thickness: 1000 },
  restitution: .7,
});
sceneOne.addChild(edge);
 
function randomColor() {
  const r = RandomDraws.SingleFromRange(0, 255);
  const g = RandomDraws.SingleFromRange(0, 255);
  const b = RandomDraws.SingleFromRange(0, 255);
  return [r, g, b, 1];
}
 
const rgbBall = new Shape({
  circleOfRadius: 20,
  fillColor: randomColor(),
  position: { x: 75, y: 50 },
  isUserInteractionEnabled: true,
  // give the ball a name so we can identify it in the physics event handler
  name: "rgb-ball"
});
rgbBall.physicsBody = new PhysicsBody({
  circleOfRadius: rgbBall.circleOfRadius,
});
sceneOne.addChild(rgbBall);
rgbBall.onTapDown(() => {
  rgbBall.physicsBody.applyForce({
    dx: RandomDraws.SingleFromRange(-5, 5) / 100, dy: -.10
  });
});
 
const emptyBall = new Shape({
  circleOfRadius: 20,
  fillColor: WebColors.Transparent,
  strokeColor: WebColors.Black,
  lineWidth: 1,
  position: { x: 125, y: 50 },
  isUserInteractionEnabled: true
});
emptyBall.physicsBody = new PhysicsBody({
  circleOfRadius: emptyBall.circleOfRadius,
});
sceneOne.addChild(emptyBall);
emptyBall.onTapDown(() => {
  emptyBall.physicsBody.applyForce({
    dx: RandomDraws.SingleFromRange(-5, 5) / 100, dy: -.10
  });
});
 
physics.onContactBegin((e) => {
  // the rgb ball could be bodyA or bodyB, so we need to check both
  if (e.bodyA.node.name === "rgb-ball") {
    e.bodyA.node.fillColor = randomColor();
  }
  if (e.bodyB.node.name === "rgb-ball") {
    e.bodyB.node.fillColor = randomColor();
  }
});
`

<CodeExample code={code} template={template} console="true"/>
