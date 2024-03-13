---
sidebar_position: 2
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Hit area

The "hit area" or "hit box" is the area of a node that responds to user input. The hit area is the same as the node's size.

## Changing the hit area

You may want an area larger that the node's size to respond to user input. For example, you may need a button to respond to user input even if the user taps slightly outside the button's bounds.

To do this, create an "invisible" node that is larger than the node you want to respond to user input. For example, if the button is width 80 and height 50, create an invisible rectangle that is width 110 and height 80. Then, add the button as a child of the rectangle. Finally, handle user events on the rectangle, not the button.

Below, if you tap a little bit outside the button, the program still recognizes user input -- you're tapping the hit area of the invisible rectangle, not the button.

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';

export const code = `const sceneOne = new Scene({ backgroundColor: WebColors.DeepSkyBlue });
game.addScene(sceneOne);
 
const hitAreaRectangle = new Shape(
    { rect: { width: 110, height: 80 },
    position: { x: 100, y: 200 },
    fillColor: WebColors.Transparent,
    lineWidth: 0,
    isUserInteractionEnabled: true } );
sceneOne.addChild(hitAreaRectangle);
 
const button = new Button({
    text: "Press me",
    fontSize: 14,
    backgroundColor: WebColors.BlueViolet,
    size: { width: 80, height: 50 },
});
hitAreaRectangle.addChild(button);
  
let hitCount = 0;
hitAreaRectangle.onTapDown(() => {
    hitCount++;
    console.log("You tapped the hit area rectangle " + hitCount + " times.");
});
`;

<CodeExample code={code} template={template} console="true"/>