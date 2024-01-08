---
sidebar_position: 9
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Performance

Although the physics functionality requires substantial mathematical calculations each frame, in most cases it will have very little impact on performance. Unlike a complex video game, cognitive assessments will not have many physics bodies in a scene.

To monitor the impact of the physics engine on performance, pass the option `logEngineStats: true` when creating the `Physics` instance. This will log to the console the average duration, over the last 60 frames, the physics engine has taken to process a single frame.

When the assessment is running at 60 frames per second, there are 1000 / 60 or about 16 milliseconds maximum available for computation. Usually the physics engine takes only a fraction of a millisecond to update each frame.

After you press "Go", the example drops 50 balls. Click on a ball to apply an upward force to it. 50 is probably more physics bodies than you would ever need in a real assessment, but try increasing `NUMBER_OF_BALLS` until it starts to affect performance -- or crashes your web browser! (Be sure to click "Run" again after changing `NUMBER_OF_BALLS`).

:::warning

Usually, a developer's desktop computer can handle many more physics bodies than a mobile device. Always test your assessment on the lowest-powered mobile device you expect your users to have to make sure it performs well.

:::

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';

export const code = `const NUMBER_OF_BALLS = 50;
const physics = new Physics({ logEngineStats: true });
await game.registerPlugin(physics);
 
const sceneOne = new Scene({
    backgroundColor: WebColors.WhiteSmoke
});
game.addScene(sceneOne);
 
const edge = new Shape({
    rect: { width: 200, height: 400 },
    fillColor: WebColors.Transparent,
    strokeColor: WebColors.Black,
    lineWidth: 1,
    position: { x: 100, y: 200 },
});
edge.physicsBody = new PhysicsBody({
    edgeLoop: { width: 200, height: 400, thickness: 1000 },
    restitution: 0,
});
sceneOne.addChild(edge);
 
const balls = [];
 
for (let i = 0; i < NUMBER_OF_BALLS; i++) {
    const ball = new Shape({
        circleOfRadius: 5,
        fillColor: WebColors.Red,
        strokeColor: WebColors.Black,
        lineWidth: .5,
        position: {
            x: RandomDraws.SingleFromRange(10, 190),
            y: RandomDraws.SingleFromRange(10, 100)
        },
        isUserInteractionEnabled: true
    });
    ball.physicsBody = new PhysicsBody({
        circleOfRadius: ball.circleOfRadius,
        restitution: .2,
        resting: true
    });
    ball.onTapDown(() => {
        ball.physicsBody.applyForce({
            dx: (Math.random() - .5) / 100, dy: -.004
        });
    });
    sceneOne.addChild(ball);
    balls.push(ball);
}
 
const button = new Button({
    text: "Go",
    position: { x: 100, y: 200 },
    backgroundColor: WebColors.Green,
    size: { width: 70, height: 30 },
    isUserInteractionEnabled: true,
});
sceneOne.addChild(button);
button.physicsBody = new PhysicsBody({
    rect: { width: 70, height: 30 },
    restitution: 0,
    resting: true
});
button.onTapDown(() => {
    if (button.text === "Go") {
        button.text = "Reset";
        for (let i = 0; i < NUMBER_OF_BALLS; i++) {
            balls[i].physicsBody.resting = false;
        }
    } else {
        button.text = "Go";
        for (let i = 0; i < NUMBER_OF_BALLS; i++) {
            balls[i].physicsBody.resting = true;
            balls[i].position = {
                x: RandomDraws.SingleFromRange(10, 190),
                y: RandomDraws.SingleFromRange(10, 100)
            }
        }
    }
});
`

<CodeExample code={code} template={template} console="true"/>
