---
sidebar_position: 5
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Instructions

One of the most common uses of multiple scenes is to create instructions. Instructions typically have headings, text, and images, as well as navigation buttons to move to the next or previous page.

Multiple instruction scenes can created with primitives (labels, buttons, images), button event handlers, and transitions, but this is tedious. m2c2kit has a helper method to make this easier: `Instructions.create()`.

## Customizing the instructions

The `Instructions.create()` method takes an [options object](/docs/reference/api-addons/interfaces/InstructionsOptions) with many properties for customizing the instructions. The options are applied to all instruction scenes, but these can be overridden and customized for each [individual instruction scene](/docs/reference/api-addons/interfaces/InstructionScene). The most important property on the options object is `instructionScenes`, which is an array that takes multiple objects that define the content of each instruction scene.

The method returns an *array* of scenes that can be added to the game using the `Game.addScenes()` method -- **not** `Game.addScene()`.


This sounds complicated, but it makes more sense when you see an example.

:::note

Why is the example text so small? `Instructions.create()` does not work on very small assessment screen sizes. In the hidden boilerplate code, this example uses a 400 x 800 assessment size. This is then scaled down on the page for the 200 x 400 space allocated to it.

In addition, the example uses an image, `odd-even-screenshot`, that the hidden boilerplate code has loaded.

:::

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template-400x800.html';

export const code = `const instructionsScenes = Instructions.create({
    instructionScenes: [
        {
            title: "Odd or Even (default font size)",
            text: "For this activity, indicate if the number is odd or even.",
        },
        {
            title: "Odd or Even (bigger font size)",
            titleFontSize: 30,            
            text: 'This number is even, so you would select the "Even" button.',
            textFontSize: 24,            
            textVerticalBias: 0.2,
            imageName: "odd-even-screenshot",
            imageAboveText: false,
            imageMarginTop: 32,            
            nextButtonText: "START",
            nextButtonBackgroundColor: WebColors.Green,
            nextSceneTransition: Transition.none(),
        },
    ],
});
 
game.addScenes(instructionsScenes);
 
const sceneOne = new Scene();
game.addScene(sceneOne);
const startLabel = new Label({
    text: "You assessment would start now...",
    position: {x: 200, y: 400}
});
sceneOne.addChild(startLabel);
`;

<CodeExample code={code} template={template} console="true"/>
