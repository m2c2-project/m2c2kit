---
sidebar_position: 2
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Labels

A `Label` is text of any length.

The `text` property is what will be shown. The `position` property is where the label will be shown.

This demo has a game area that is 200 pixels wide and 400 pixels high. The `position` coordinate `{ x: 0, y: 0 }` is the upper left, and `{ x: 200, y: 400 }` is the lower right. The `position` coordinate `{ x: 100, y: 200 }` is the center of the scene. By default, the label will be centered on the `position` you specify.

For the label to be visible, it must be added to the scene using the `scene.addChild()` method. Because the scene contains the label, the scene is the parent and the label is the child.

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';

export const code = `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
const helloLabel = new Label({ text: "Hello, world.", position: { x: 100, y: 200 } });
sceneOne.addChild(helloLabel);`

export const more = [
{ description: <>[Move] the label further down the scene by changing the value of `y` on the label's `position`.</>,
code: `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
const helloLabel = new Label({ text: "Hello, world.", position: { x: 100, y: 350 } });
sceneOne.addChild(helloLabel);`},
{ description: <>Add [another label].</>,
code: `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
const helloLabel = new Label({ text: "Hello, world.", position: { x: 100, y: 200 } });
sceneOne.addChild(helloLabel);
 
const secondLabel = new Label({ text: "Top of the world!",
position: { x: 100, y: 25 } });
sceneOne.addChild(secondLabel);`},
{ description: <>Customize the label's [appearance] with `fontColor`, `backgroundColor`, and `fontSize`.</>,
code: `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
const helloLabel = new Label({
    text: "I'm m2c2kit.",
    position: { x: 100, y: 200 },
    fontColor: WebColors.Red,
    backgroundColor: WebColors.Yellow,
    fontSize: 32
});
sceneOne.addChild(helloLabel);`},
{ description: <>By default, long labels will wrap to fit the width of the scene. You can [change] this behavior by setting `preferredMaxLayoutWidth`.</>,
code: `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
const helloLabel = new Label({
    text: "Hello, world. This is now a longer label wrapped to a narrow width.",
    position: { x: 100, y: 200 },
    preferredMaxLayoutWidth: 50,
});
sceneOne.addChild(helloLabel);`},
{ description: <>What happens if you [forget] to add the label to the scene and don't use the `scene.addChild()` method? Your code will run, but the label will not display.</>,
code: `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
const helloLabel = new Label({ text: "Hello, world." });`},  
 { description: <>What happens if you [omit] the `position` property? The `position` will default to `&#123; x: 0, y: 0 &#125;`, and the label will centered on the upper-left corner -- not a good look!</>,
code: `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
const helloLabel = new Label({ text: "Hello, world." });
sceneOne.addChild(helloLabel);`},
]

<CodeExample code={code} more={more} template={template}/>
