---
sidebar_position: 1
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Scenes

A `Scene` is the basic building block of m2c2kit.

The scene is the "screen" or "page" on which you build your assessment. Everything that will be displayed in an assessment must be added to a scene. The scene itself must be added to the assessment's `game` object using the `game.addScene()` method.

Below, we create a new scene with a blue background and add it to the game. You can change the scene's color by changing the `backgroundColor` property.

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';

export const code = `const sceneOne = new Scene({ backgroundColor: WebColors.DeepSkyBlue });
game.addScene(sceneOne);`;

export const more = [
{ description: <>Try [different] colors like `WebColors.Red`, `WebColors.Purple`, or any other standard <a href="https://en.wikipedia.org/wiki/Web_colors">Web color</a> name.</>,
code: `const sceneOne = new Scene({ backgroundColor: WebColors.Red });
game.addScene(sceneOne);`},
{ description: <>Use a color defined in [RGBA] format (red, blue, green, alpha), e.g., `backgroundColor: [139, 234, 10, .80]` for a greenish color with 80% opacity</>,
code: `const sceneOne = new Scene({ backgroundColor: [139, 234, 10, .80] });
game.addScene(sceneOne);`}  
]

<CodeExample code={code} more={more} template={template}/>
