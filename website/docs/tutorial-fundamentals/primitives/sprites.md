---
sidebar_position: 7
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Sprites

A `Sprite` is an image.

:::note

The example looks a little different because it exposes more boilerplate code for loading images.

:::

TODO: Add a description of how to load images.

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template-with-constructor.html';
export const code = `class DocsDemo extends Game {
    constructor() {
        const options = {
            width: 200, height: 400,
            images: [{
                imageName: "earth", height: 128, width: 128,
                url: "assets/docs/img/blue-marble.jpg",
            }]
        };
        super(options);
    }
    init() {
        const game = this;
        const sceneOne = new Scene({ backgroundColor: WebColors.SkyBlue });
        game.addScene(sceneOne);
        const earthSprite = new Sprite({
            imageName: "earth",
            position: { x: 100, y: 200 }
        });
        sceneOne.addChild(earthSprite);
    }
}`;

export const more = [
{ description: <>The image `url` can be any location, and it can be an [SVG], JPG, or PNG.</>,
code: `class DocsDemo extends Game {
    constructor() {
        const options = {
            width: 200, height: 400,
            images: [{
                imageName: "overlappingrectangles", height: 128, width: 128,
                url: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Svg_example3.svg",
            }]
        };
    super(options);
  }
  
    init() {
        const game = this;
        const sceneOne = new Scene({ backgroundColor: WebColors.SkyBlue });
        game.addScene(sceneOne);
        const earthSprite = new Sprite({
            imageName: "overlappingrectangles",
            position: { x: 100, y: 200 }
        });
        sceneOne.addChild(earthSprite);
    }
}`},
{ description: <>By setting the `height`and`width`, you can [resize] the image. The original resolution of the JPG is square, but we'll make it appear very skinny.</>,
code: `class DocsDemo extends Game {
    constructor() {
        const options = {
            width: 200, height: 400,
            images: [{
                imageName: "earth", height: 256, width: 64,
                url: "assets/docs/img/blue-marble.jpg",
            }]
        };
        super(options);
    }
    init() {
        const game = this;
        const sceneOne = new Scene({ backgroundColor: WebColors.SkyBlue });
        game.addScene(sceneOne);
        const earthSprite = new Sprite({
            imageName: "earth",
            position: { x: 100, y: 200 }
        });
        sceneOne.addChild(earthSprite);
    }
}`},
{ description: <>The same image `url`can be used to create [multiple] sprites.</>,
code:`class DocsDemo extends Game {
    constructor() {
        const options = {
            width: 200, height: 400,
            images: [{
                imageName: "bigEarth", height: 200, width: 200,
                url: "assets/docs/img/blue-marble.jpg",
            },
            {
                imageName: "smallEarth", height: 32, width: 32,
                url: "assets/docs/img/blue-marble.jpg",
            }]
        };
        super(options);
    }
    init() {
        const game = this;
        const sceneOne = new Scene({ backgroundColor: WebColors.SkyBlue });
        game.addScene(sceneOne);
        const earthSprite1 = new Sprite({
            imageName: "bigEarth",
            position: { x: 100, y: 200 }
        });
        const earthSprite2 = new Sprite({
            imageName: "smallEarth",
            position: { x: 100, y: 64 }
        });        
        sceneOne.addChild(earthSprite1);
        sceneOne.addChild(earthSprite2);
    }
}`},
];

<CodeExample code={code} more={more} template={template}/>
