---
sidebar_position: 5
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Arbitrary forces

A physics body is affected by forces of gravity and by interactions with other physics bodies. You can also apply arbitrary forces to a physics body.

The `applyForce()` method of a `PhysicsBody` applies a force to the body. The method takes a `Vector` as an argument. The `dx` and `dy` components of the vector represent the force to apply in the horizontal and vertical directions, respectively. Optionally, it also takes a `Point` as a second argument. The `x` and `y` components of the point represent the position of application of the force. If the position is not specified, the force is applied to the center of the physics body.

The example is a simple slingshot. Drag the pink ball to aim it and adjust the draw length. Release the ball to fire it. The ball will bounce off the edges of the boundary.

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
    restitution: .5,
});
sceneOne.addChild(edge);
 
const pinkBall = new Shape({
    circleOfRadius: 20,
    fillColor: WebColors.LightPink,
    position: { x: 100, y: 355 },
    isUserInteractionEnabled: true
});
pinkBall.physicsBody = new PhysicsBody({
    circleOfRadius: 20,
});
sceneOne.addChild(pinkBall);
const hiLabel = new Label({
    text: "Hi"
});
pinkBall.addChild(hiLabel);
 
const aimBall = new Shape({
    circleOfRadius: 20,
    fillColor: WebColors.Transparent,
    strokeColor: WebColors.Transparent,
    position: { x: 100, y: 355 },
    isUserInteractionEnabled: true,
    draggable: true
});
sceneOne.addChild(aimBall);
 
pinkBall.onPointerDown(() => {
    // The position is a Point, which is a reference type. The next line will
    // "de-link" the aimBall's position from the pinkBall's position. Otherwise,
    // the pinkBall's physics will interfere with the aimBall's dragging.
    aimBall.position = { x: pinkBall.position.x, y: pinkBall.position.y };
});
 
aimBall.onDragStart(() => {
    aimBall.position.x = pinkBall.position.x;
    aimBall.position.y = pinkBall.position.y;
    pinkBall.fillColor = WebColors.Transparent;
    hiLabel.text = "";
    pinkBall.strokeColor = WebColors.Black;
    pinkBall.lineWidth = 1;
    aimBall.fillColor = WebColors.LightPink;
});
 
aimBall.onDragEnd((e) => {
    aimBall.fillColor = WebColors.Transparent;
    pinkBall.fillColor = WebColors.LightPink;
    pinkBall.strokeColor = WebColors.Transparent;
    hiLabel.text = "Hi!";
    const xSign = aimBall.position.x < pinkBall.position.x ? 1 : -1;
    const ySign = aimBall.position.y < pinkBall.position.y ? 1 : -1;
    const force = {
        dx: xSign * (Math.pow(Math.abs((pinkBall.position.x - aimBall.position.x) / 800), 1.1)),
        dy: ySign * (Math.pow(Math.abs((pinkBall.position.y - aimBall.position.y) / 800), 1.1))
    }
    pinkBall.physicsBody.applyForce(force);
    console.log("Applied force: dx = " + force.dx + ", dy = " + force.dy)
    // The position is a Point, which is a reference type. The next line will link
    // the aimBall's position to the pinkBall's position while the pinkBall is moving.
    aimBall.position = pinkBall.position;
})
`

export const more = [
{ description: <>If we draw the slingshot back as far as we can, it will apply a lot of force, and the ball will move at a high speed. To avoid tunneling, the `thickness` of the edge loop was set to `1000`. See what happens if you draw the slingshot back as far as you can (to the top of the scene) with the `thickness` option [removed] (which sets it to the default value of `50`). Goodbye ball!</>,
code: `const physics = new Physics();
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
    edgeLoop: { width: 150, height: 350 },
    restitution: .5,
});
sceneOne.addChild(edge);
 
const pinkBall = new Shape({
    circleOfRadius: 20,
    fillColor: WebColors.LightPink,
    position: { x: 100, y: 355 },
    isUserInteractionEnabled: true
});
pinkBall.physicsBody = new PhysicsBody({
    circleOfRadius: 20,
});
sceneOne.addChild(pinkBall);
const hiLabel = new Label({
    text: "Hi"
});
pinkBall.addChild(hiLabel);
 
const aimBall = new Shape({
    circleOfRadius: 20,
    fillColor: WebColors.Transparent,
    strokeColor: WebColors.Transparent,
    position: { x: 100, y: 355 },
    isUserInteractionEnabled: true,
    draggable: true
});
sceneOne.addChild(aimBall);
 
pinkBall.onPointerDown(() => {
    // The position is a Point, which is a reference type. The next line will
    // "de-link" the aimBall's position from the pinkBall's position. Otherwise,
    // the pinkBall's physics will interfere with the aimBall's dragging.
    aimBall.position = { x: pinkBall.position.x, y: pinkBall.position.y };
});
 
aimBall.onDragStart(() => {
    aimBall.position.x = pinkBall.position.x;
    aimBall.position.y = pinkBall.position.y;
    pinkBall.fillColor = WebColors.Transparent;
    hiLabel.text = "";
    pinkBall.strokeColor = WebColors.Black;
    pinkBall.lineWidth = 1;
    aimBall.fillColor = WebColors.LightPink;
});
 
aimBall.onDragEnd((e) => {
    aimBall.fillColor = WebColors.Transparent;
    pinkBall.fillColor = WebColors.LightPink;
    pinkBall.strokeColor = WebColors.Transparent;
    hiLabel.text = "Hi!";
    const xSign = aimBall.position.x < pinkBall.position.x ? 1 : -1;
    const ySign = aimBall.position.y < pinkBall.position.y ? 1 : -1;
    const force = {
        dx: xSign * (Math.pow(Math.abs((pinkBall.position.x - aimBall.position.x) / 800), 1.1)),
        dy: ySign * (Math.pow(Math.abs((pinkBall.position.y - aimBall.position.y) / 800), 1.1))
    }
    pinkBall.physicsBody.applyForce(force);
    console.log("Applied force: dx = " + force.dx + ", dy = " + force.dy)
    // The position is a Point, which is a reference type. The next line will link
    // the aimBall's position to the pinkBall's position while the pinkBall is moving.
    aimBall.position = pinkBall.position;
})
`}
];


<CodeExample code={code} more={more} template={template} console="true"/>
