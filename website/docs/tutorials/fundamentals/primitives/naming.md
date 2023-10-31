---
sidebar_position: 14
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# Naming

Every entity has an optional `name` property.

Using JavaScript, each entity is created and assigned to a variable that has a name, such as `sceneOne` or `helloLabel`. Usually, you don't need to give an entity an additional name, because you can refer to it by its variable name. Internally, however, you can also assign a name to an entity using the `name` property, and this will be visible to the m2c2kit engine. This name does not have to match the variable name.

Below, we give names to the `Scene` and the `Button`. The names can be any string.

:::note

Normally, you don't need to give an entity a name. But it can be useful for debugging or other advanced scenarios.

:::

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';
export const code = `const sceneOne = new Scene({
    name: "The first scene",
    backgroundColor: WebColors.WhiteSmoke });
game.addScene(sceneOne);
 
const button = new Button({
    name: "A Button",
    text: "A",
    size: { width: 100, height: 50},
    position: { x: 100, y: 100 }});
sceneOne.addChild(button);`

<CodeExample code={code} template={template}/>
