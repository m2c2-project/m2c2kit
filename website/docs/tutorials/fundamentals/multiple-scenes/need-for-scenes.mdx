---
sidebar_position: 1
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# The Need for Scenes

Assessments typically need more than one scene or "page."

For example, an assessment might have a series of scenes for instructions. The assessment itself usually has multiple phases, such as a fixation phase, a stimulus phase, and a response phase that forms a single trial. Each phase would be its own scene. Furthermore, as assessment often repeats trials, and each trial would repeat these phases a configurable number of times. Finally, some assessments provide feedback after each trial, and some assessments provide feedback after the entire assessment. In sum, a typical assessment might lead the user through _dozens_ of scenes.

So far, we've used only a single scene. It's time to change that.

To use multiple scenes, create them and add them to the game. When it's time to switch to a scene, use the `game.presentScene()` method to switch to the new scene.

Below, the example creates two scenes, `sceneOne` and `sceneTwo`. Each has a button. When the button is pressed, the scene switches to the other scene. The code that makes this happen is within the button event handlers:

```js
forwardButton.onTapDown(() => {
    game.presentScene(sceneTwo);
});
```

and

```js
backButton.onTapDown(() => {
    game.presentScene(sceneOne);
});
```

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';

export const code = `const sceneOne = new Scene({ backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
const title1 = new Label({
    text: "Scene I",
    position: { x: 100, y: 50 }
});
sceneOne.addChild(title1);
const forwardButton = new Button({
    text: "Forward!",
    fontSize: 14,
    backgroundColor: WebColors.RoyalBlue,
    size: { width: 160, height: 50 },
    position: { x: 100, y: 200 },
    isUserInteractionEnabled: true
});
sceneOne.addChild(forwardButton);
 
forwardButton.onTapDown(() => {
    game.presentScene(sceneTwo);
});
 
const sceneTwo = new Scene({ backgroundColor: WebColors.LightPink });
game.addScene(sceneTwo);
const title2 = new Label({
    text: "Scene II",
    position: { x: 100, y: 50 }
});
sceneTwo.addChild(title2);
const backButton = new Button({
    text: "Run away, run away!",
    fontSize: 14,
    backgroundColor: WebColors.DarkRed,
    size: { width: 160, height: 50 },
    position: { x: 100, y: 200 },
    isUserInteractionEnabled: true
});
sceneTwo.addChild(backButton);
 
backButton.onTapDown(() => {
    game.presentScene(sceneOne);
});
`;

export const more = [
{ description: <>Instead of using the JavaScript variable name in `presentScene()`, you can also use the scene's `name` property, if you [provided a name]. The forward button handler uses `game.presentScene("Action scene")` instead of `game.presentScene(sceneTwo);`</>,
code: `const sceneOne = new Scene({
    name: "Intro scene",
    backgroundColor: WebColors.WhiteSmoke
});
game.addScene(sceneOne);
const title1 = new Label({
    text: "Scene I",
    position: { x: 100, y: 50 }
});
sceneOne.addChild(title1);
const forwardButton = new Button({
    text: "Forward!",
    fontSize: 14,
    backgroundColor: WebColors.RoyalBlue,
    size: { width: 160, height: 50 },
    position: { x: 100, y: 200 },
    isUserInteractionEnabled: true
});
sceneOne.addChild(forwardButton);
 
forwardButton.onTapDown(() => {
    game.presentScene("Action scene");
});
 
const sceneTwo = new Scene({
    name: "Action scene",
    backgroundColor: WebColors.LightPink
});
game.addScene(sceneTwo);
const title2 = new Label({
    text: "Scene II",
    position: { x: 100, y: 50 }
});
sceneTwo.addChild(title2);
    const backButton = new Button({
    text: "Run away, run away!",
    fontSize: 14,
    backgroundColor: WebColors.DarkRed,
    size: { width: 160, height: 50 },
    position: { x: 100, y: 200 },
    isUserInteractionEnabled: true
});
sceneTwo.addChild(backButton);
 
backButton.onTapDown(() => {
    game.presentScene("Intro scene");
});
`},
{ description: <>Using the scene's `name` property, however, can be error-prone because it is easy to misspell the name (and this will not be caught by the code editor syntax checking). In [this example], the forward button handler uses `game.presentScene("action scene")`, which forgets to capitalize the word "action." If you try it, you will get an error when you click the button.</>,
code: `const sceneOne = new Scene({
    name: "Intro scene",
    backgroundColor: WebColors.WhiteSmoke
});
game.addScene(sceneOne);
const title1 = new Label({
    text: "Scene I",
    position: { x: 100, y: 50 }
});
sceneOne.addChild(title1);
const forwardButton = new Button({
    text: "Forward!",
    fontSize: 14,
    backgroundColor: WebColors.RoyalBlue,
    size: { width: 160, height: 50 },
    position: { x: 100, y: 200 },
    isUserInteractionEnabled: true
});
sceneOne.addChild(forwardButton);
 
forwardButton.onTapDown(() => {
    game.presentScene("action scene");
});
 
const sceneTwo = new Scene({
    name: "Action scene",
    backgroundColor: WebColors.LightPink
});
game.addScene(sceneTwo);
const title2 = new Label({
    text: "Scene II",
    position: { x: 100, y: 50 }
});
sceneTwo.addChild(title2);
const backButton = new Button({
    text: "Run away, run away!",
    fontSize: 14,
    backgroundColor: WebColors.DarkRed,
    size: { width: 160, height: 50 },
    position: { x: 100, y: 200 },
    isUserInteractionEnabled: true
});
sceneTwo.addChild(backButton);
 
backButton.onTapDown(() => {
    game.presentScene("Intro scene");
});
`}
]

<CodeExample code={code} more={more} template={template} console="true"/>
