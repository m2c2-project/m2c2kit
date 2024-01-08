---
sidebar_position: 7
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Collision filtering

By default, every `PhysicsBody` will collide with every other `PhysicsBody`. This may not be what you want. For example, you might want to have a ball that bounces off the walls of the scene, but passes through other balls. This is called collision filtering because you are allowing some collisions and filtering out others. You can control which physics bodies collide with each other by with two properties: `categoryBitMask` and `collisionBitMask`.

## A physics body's category

You can define up to 32 categories of physics bodies. Each category can have a different kind of collision behavior. For example, you might have a category for walls, a category for balls, a category for dogs, and categories for other objects. Category 1 is the default category, and all physics bodies will be this category unless you change it.

The `categoryBitMask` property of a `PhysicsBody` represents the category. A category is defined not by its value, but by its bit position. For example, category 1 is the first bit position, category 2 is the second bit position, category 3 is the third bit position, and so on. The `categoryBitMask` property is a 32-bit integer, so it can represent up to 32 categories.

In JavaScript, it is convenient to specify a binary number with the `0b` prefix:

- `0b00000001` has the first bit position set.
- `0b00000010` has the second bit position set.
- `0b00000100` has the third bit position set.
- `0b00001000` has the fourth bit position set.
- and so on...

:::tip

You do not need to specify all 32 bits when setting the bit position. For example, `0b0100` is the same as `0b100` and `0b00000000000000000000000000000100`.

:::

A physics body can belong to multiple categories. For example, `0b0101` would be a physics body that is a member of both categories 1 and 3.

## A physics body's collision filter

The `collisionBitMask` of a physics body controls which categories of physics bodies it will collide with. The default value is `0b11111111111111111111111111111111` (sometimes written in hexadecimal as `0xFFFFFFFF`), which means the physics body will collide with every category. You can change this value to control which categories the physics body will collide with.

For example, imagine we have two categories of physics bodies:

- walls (category 1, or `0b0001`)
- balls (category 2, or `0b0010`)

If you want a ball to collide only with walls (and pass through other balls), you would set every ball's `collisionBitMask` to `0b0001`. If you want a ball to collide with walls **and** other balls, you would set every ball's `collisionBitMask` to `0b0011`.

## A rainy example

In the example, there are three categories of physics bodies:

- the edge loop (category 1, or `0b0001`)
- the umbrella (category 2, or `0b0010`)
- the raindrops (category 3, or `0b0100`)

We want the raindrops to collide with the umbrella, but not with the edge loop (so the raindrops fall off the scene). To do this, each raindrop's `collisionBitMask` is set to `0b0010`.

Click "Rain" to make it rain. The raindrops will roll around the umbrella before falling off the scene.

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
    edgeLoop: edge.size,
    restitution: .7,
    // edge loop is category 1
    categoryBitMask: 0b0001
});
sceneOne.addChild(edge);
 
const umbrella = new Shape({
    path: {
        pathString: "M148.2 0c6.8.1 3.1 11.5 4.5 13 62.5 2.9 127.8 52.2 140.7 114.8 2.3 11.2 5.3 26.8-3.2 25.3-1.9-.3-14.2-14.2-33.5-16-30.3-2.9-39.6 15.9-42 16.5-5.7 1.5-8.5-6.3-16-11-15.3-9.6-39.5-8.1-46.8 10.8-1.2 25.6 2 123.1-1 137.5-6.8 32.7-49.5 33.4-56.5-5-.9-4.9-3.6-24.2 3.2-24.2 7.8 0 1.2 15.7 7.8 31.2 8.8 21.1 35.2 17.7 38-8.5 2.2-20.1-1.6-103.4 0-132-8-19-33.5-19-48.3-8.2-4.1 3-8.5 11.1-14 9.5-2.8-.8-16.2-25.4-53-14-16.3 5.1-22.6 17.6-27.2 12.2-2.9-3.4 2-26.7 3.5-32C20.9 61.2 83.2 15.9 143.2 13c1.2-1.2-2.2-13.1 5-13z",
        width: 80
    },
    fillColor: WebColors.Red,
    position: { x: 100, y: 250 }
});
umbrella.physicsBody = new PhysicsBody({
    circleOfRadius: 40,
    // umbrella is category 2
    categoryBitMask: 0b0010,
    resting: true
});
sceneOne.addChild(umbrella);
 
const rainDrops = [];
for (let i = 0; i < 50; i++) {
    const rainDrop = new Shape({
        path: {
            pathString: "M169.6 382.3c-.4.2-1 .3-1.5.5-6.9 2.6-15.8 5.3-23 6.5-14.9 2.5-30.1 2.5-45 0-35-5.9-66.8-28.7-84-59.8C-6.2 289-3.4 245.1 12.6 203c14.7-38.6 71.7-126.1 95.5-176.5 2.3-4.9 8.7-25.2 13.2-26.2 9.6-2.1 10.2 9.6 15.8 21.2C143 33.8 149.3 46 155.6 58c28.2 53 86.1 133.9 92.5 189.5 6.6 57.4-24.1 113.4-78.5 134.8z",
            height: 10
        },
        fillColor: WebColors.Blue,
        lineWidth: 0,
        // for now, position raindrops off the visible scene
        position: {
            x: -100,
            y: -100
        },
    });
    sceneOne.addChild(rainDrop)
    rainDrop.physicsBody = new PhysicsBody({
        circleOfRadius: 5,
        friction: 0,
        resting: true,
        // raindrops are category 3
        categoryBitMask: 0b0100,
        // raindrops collide only with category 2 (umbrella)
        collisionBitMask: 0b0010
    })
    rainDrops.push(rainDrop);
}
 
const button = new Button({
    text: "Rain",
    position: { x: 100, y: 45 },
    size: { width: 70, height: 50 },
    isUserInteractionEnabled: true,
});
sceneOne.addChild(button);
button.onTapDown(() => {
    button.run(Action.sequence([
        Action.custom({
          callback: () => {
              rainDrops.forEach(r => {
                  r.position = {
                      x: RandomDraws.SingleFromRange(15, 185),
                      y: RandomDraws.SingleFromRange(80, 110)
                  },
                  // raindrops may be falling and rotating from
                  // a prior run. Reset them.
                  r.zRotation = 0;
                  r.physicsBody.velocity = { dx: 0, dy: 0 }
                  r.physicsBody.resting = true;
              })
          }
        }),
      Action.wait({ duration: 250 }),
      Action.custom({
          callback: () => {
              rainDrops.forEach(r => {
                  r.physicsBody.resting = false;
              })
          }
      })
    ]))
});
`

<CodeExample code={code} template={template} console="true"/>
