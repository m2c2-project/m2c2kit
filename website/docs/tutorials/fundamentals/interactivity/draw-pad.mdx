---
sidebar_position: 9
hide_table_of_contents: true
---

import CodeExample from '@site/src/components/CodeExample';

# DrawPad

A `DrawPad` is an area on which the user can draw strokes (lines)

Allowing the user to draw on a screen is useful for many kinds of assessments, such as the [trailing making test](https://en.wikipedia.org/wiki/Trail_Making_Test).

The lines a user draws are called strokes. When the user interacts with the `DrawPad`, each interaction raises an event. When the user first taps down on the `DrawPad`, a `StrokeStart` event is raised. Moving the finger or mouse while the tap is down raises a `StrokeMove` event. When the user releases the tap, a `StrokeEnd` event is raised. You can listen for these events and execute code when they occur:

```js
drawPad.onStrokeStart((e) => {
    console.log(`StrokeStart at position ${e.position.x}, ${e.position.y}`);
});
```

The record of all the stroke interactions is stored in the `strokes` property of the `DrawPad`. The `strokes` property is an array of arrays of `StrokeInteraction` objects, each with the type of interaction, position, and timestamp. It is an "array of arrays" because each stroke is an array, and there could be multiple strokes recorded.

## Interacting with items

More common than simply having the user draw on a blank area is asking the user to draw strokes that interact with objects. For example, you might show a series of circles and ask the user to connect to them with lines. Nodes that we add to the `DrawPad` for the purpose of interacting with them are called `DrawPadItems`. A `DrawPadItem` is a `Shape`, `Sprite`, or any other node that we add to the `DrawPad`. We can then listen for events on the `DrawPadItem` and execute code when they occur.

To use a `DrawPadItem`, we create the node and add it to the `DrawPad` using the `addItem()` method. `addItem()` returns the node as a `DrawPadItem`, which has extra properties and methods for interacting with strokes.

:::caution

Once the node has been added to the `DrawPad`, we can no longer access it directly. Instead, we **must** access it only through the `DrawPadItem` that was returned by `addItem()`.

:::

For example, we can listen for the `StrokeEnter` event on a `DrawPadItem` and execute code when the user draws a stroke that enters the `DrawPadItem`.

```js
const rectangle = new Shape({
    rect: { width: 40, height: 40 },
    fillColor: WebColors.Red,
});
const itemRect = drawPad.addItem(rectangle);
itemRect.drawPadPosition = { x: 70, y: 30 };
itemRect.onStrokeEnter(() => {
    console.log("entered the rectangle");
});
```

:::caution

The coordinate system of the `DrawPad` has its origin (0, 0) in its upper-left corner. In addition, the `drawPadPosition` property of the `DrawPadItem` must be used to set its position. Using the item's `position` property will result in unexpected behavior.

:::

## Customizing appearance and behavior

`DrawPadOptions` allows customization of appearance and behavior. By default, the user can draw multiple, disconnected strokes. To allow only one continuous stroke, set the `continuousDrawingOnly` property to `true`. With this, the `DrawPad` will not allow another stroke to be started once the user lifts their finger or mouse button. To enforce a single stroke but also allow the user to "start again" near where they left off, set the `continuousDrawingOnlyExceptionDistance` property to a number of pixels. For example, setting it to 10 will allow the user to start a new stroke if they are within 10 pixels of where they left off.

The below example adds three numbered circles to the `DrawPad`. When the user draws a stroke that enters a circle, the circle changes color. After pressing the "Reset" button, the `DrawPad` is cleared and the circles are reset to their original color, and drawing can start over. Pressing the "Results" button logs the stroke data to the console. The user can draw only one continuous stroke.

import template from '!!raw-loader!@site/src/m2c2kit-index-html-templates/basic-template.html';

export const code = `const scene1 = new Scene();
game.addScene(scene1);
 
const drawPad = new DrawPad({
    size: { width: 180, height: 300 },
    lineColor: WebColors.Blue,
    lineWidth: 1,
    position: { x: 100, y: 210 },
    continuousDrawingOnly: true,
});
scene1.addChild(drawPad);
 
const circle1 = new Shape({
    circleOfRadius: 20,
    fillColor: WebColors.Coral,
});
const label1 = new Label({ text: "1" });
circle1.addChild(label1);
const item1 = drawPad.addItem(circle1);
// Once circle1 is added to the DrawPad, we can no longer
// access it directly. Instead, we access it through the
// DrawPadItem that was returned by addItem(), which in
// this case is item1.
item1.drawPadPosition = { x: 40, y: 80 };
item1.onStrokeEnter(() => {
    item1.fillColor = WebColors.LightBlue;
});
 
const circle2 = new Shape({
    circleOfRadius: 20,
    fillColor: WebColors.Coral,
});
const label2 = new Label({ text: "2" });
circle2.addChild(label2);
const item2 = drawPad.addItem(circle2);
item2.drawPadPosition = { x: 90, y: 240 };
item2.onStrokeEnter(() => {
    item2.fillColor = WebColors.LightBlue;
});
 
const circle3 = new Shape({
    circleOfRadius: 20,
    fillColor: WebColors.Coral,
});
const label3 = new Label({ text: "3" });
circle3.addChild(label3);
const item3 = drawPad.addItem(circle3);
item3.drawPadPosition = { x: 125, y: 120 };
item3.onStrokeEnter(() => {
    item3.fillColor = WebColors.LightBlue;
});
 
const reset = new Button({
    text: "Reset",
    isUserInteractionEnabled: true,
    size: { width: 80, height: 50 },
    position: { x: 50, y: 25 },
});
scene1.addChild(reset);
reset.onTapDown(() => {
    drawPad.clear();
    item1.fillColor = WebColors.Coral;
    item2.fillColor = WebColors.Coral;
    item3.fillColor = WebColors.Coral;
});
 
const results = new Button({
    text: "Results",
    isUserInteractionEnabled: true,
    size: { width: 100, height: 50 },
    position: { x: 150, y: 25 },
});
scene1.addChild(results);
results.onTapDown(() => {
    console.log(JSON.stringify(drawPad.strokes));
});
`;

export const more = [
{ description: <>Setting `continuousDrawingOnlyExceptionDistance` to `10` will allow the user to [continue] drawing if they restart within 10 pixels of where the previous stroke ended. This is a good choice if you intend the user to draw a single stroke, but allow for "mistakes" (e.g., lifting the pointer, going out of bounds), as long as they continue near where they left off.</>,
code: `const scene1 = new Scene();
game.addScene(scene1);
 
const drawPad = new DrawPad({
    size: { width: 180, height: 300 },
    lineColor: WebColors.Blue,
    lineWidth: 1,
    position: { x: 100, y: 210 },
    continuousDrawingOnly: true,
    continuousDrawingOnlyExceptionDistance: 10,
});
scene1.addChild(drawPad);
 
const circle1 = new Shape({
    circleOfRadius: 20,
    fillColor: WebColors.Coral,
});
const label1 = new Label({ text: "1" });
circle1.addChild(label1);
const item1 = drawPad.addItem(circle1);
// Once circle1 is added to the DrawPad, we can no longer
// access it directly. Instead, we access it through the
// DrawPadItem that was returned by addItem(), which in
// this case is item1.
item1.drawPadPosition = { x: 40, y: 80 };
item1.onStrokeEnter(() => {
    item1.fillColor = WebColors.LightBlue;
});
 
const circle2 = new Shape({
    circleOfRadius: 20,
    fillColor: WebColors.Coral,
});
const label2 = new Label({ text: "2" });
circle2.addChild(label2);
const item2 = drawPad.addItem(circle2);
item2.drawPadPosition = { x: 90, y: 240 };
item2.onStrokeEnter(() => {
    item2.fillColor = WebColors.LightBlue;
});
 
const circle3 = new Shape({
    circleOfRadius: 20,
    fillColor: WebColors.Coral,
});
const label3 = new Label({ text: "3" });
circle3.addChild(label3);
const item3 = drawPad.addItem(circle3);
item3.drawPadPosition = { x: 125, y: 120 };
item3.onStrokeEnter(() => {
    item3.fillColor = WebColors.LightBlue;
});
 
const reset = new Button({
    text: "Reset",
    isUserInteractionEnabled: true,
    size: { width: 80, height: 50 },
    position: { x: 50, y: 25 },
});
scene1.addChild(reset);
reset.onTapDown(() => {
    drawPad.clear();
    item1.fillColor = WebColors.Coral;
    item2.fillColor = WebColors.Coral;
    item3.fillColor = WebColors.Coral;
});
 
const results = new Button({
    text: "Results",
    isUserInteractionEnabled: true,
    size: { width: 100, height: 50 },
    position: { x: 150, y: 25 },
});
scene1.addChild(results);
results.onTapDown(() => {
    console.log(JSON.stringify(drawPad.strokes));
});
`},
{ description: <>Setting `continuousDrawingOnly` to `false` will allow the user to draw multiple strokes [anywhere]. Note: This means they could simply click the items without attempting to connect them with strokes. You probably don't want that!</>,
code: `const scene1 = new Scene();
game.addScene(scene1);
 
const drawPad = new DrawPad({
    size: { width: 180, height: 300 },
    lineColor: WebColors.Blue,
    lineWidth: 1,
    position: { x: 100, y: 210 },
    continuousDrawingOnly: false,
});
scene1.addChild(drawPad);
 
const circle1 = new Shape({
    circleOfRadius: 20,
    fillColor: WebColors.Coral,
});
const label1 = new Label({ text: "1" });
circle1.addChild(label1);
const item1 = drawPad.addItem(circle1);
// Once circle1 is added to the DrawPad, we can no longer
// access it directly. Instead, we access it through the
// DrawPadItem that was returned by addItem(), which in
// this case is item1.
item1.drawPadPosition = { x: 40, y: 80 };
item1.onStrokeEnter(() => {
    item1.fillColor = WebColors.LightBlue;
});
 
const circle2 = new Shape({
    circleOfRadius: 20,
    fillColor: WebColors.Coral,
});
const label2 = new Label({ text: "2" });
circle2.addChild(label2);
const item2 = drawPad.addItem(circle2);
item2.drawPadPosition = { x: 90, y: 240 };
item2.onStrokeEnter(() => {
    item2.fillColor = WebColors.LightBlue;
});
 
const circle3 = new Shape({
    circleOfRadius: 20,
    fillColor: WebColors.Coral,
});
const label3 = new Label({ text: "3" });
circle3.addChild(label3);
const item3 = drawPad.addItem(circle3);
item3.drawPadPosition = { x: 125, y: 120 };
item3.onStrokeEnter(() => {
    item3.fillColor = WebColors.LightBlue;
});
 
const reset = new Button({
    text: "Reset",
    isUserInteractionEnabled: true,
    size: { width: 80, height: 50 },
    position: { x: 50, y: 25 },
});
scene1.addChild(reset);
reset.onTapDown(() => {
    drawPad.clear();
    item1.fillColor = WebColors.Coral;
    item2.fillColor = WebColors.Coral;
    item3.fillColor = WebColors.Coral;
});
 
const results = new Button({
    text: "Results",
    isUserInteractionEnabled: true,
    size: { width: 100, height: 50 },
    position: { x: 150, y: 25 },
});
scene1.addChild(results);
results.onTapDown(() => {
    console.log(JSON.stringify(drawPad.strokes));
});
`},
{ description: <>If the user draws the line out of bounds, the [line will be clipped] to the bounds of the `DrawPad`, and the `interpolated` property of the `StrokeInteraction` will be set to `true`. This example will log to the console the last 4 stroke interactions. First, draw a line completely within bounds. None of these are interpolated. Next, draw a line quickly out of bounds. Here, the last two stroke interactions are interpolated to end exactly at the boundary of the `DrawPad`.</>,
code: `const scene1 = new Scene();
game.addScene(scene1);
 
const drawPad = new DrawPad({
    size: { width: 180, height: 300 },
    borderColor: WebColors.RebeccaPurple,
    borderWidth: 2,
    lineColor: WebColors.Red,
    lineWidth: 1,
    position: { x: 100, y: 210 },
    continuousDrawingOnly: false,
});
scene1.addChild(drawPad);
 
drawPad.onStrokeEnd((e) => {
    const lastStroke = drawPad.strokes[drawPad.strokes.length - 1];
    const interactionCount = lastStroke.length;
    if (interactionCount > 3) {
        console.log("Last 4 interactions of the stroke:")
        for (let i = interactionCount - 4; i < interactionCount; i++) {
            console.log("  Interaction: " + lastStroke[i].type + ", position.x: "
                + lastStroke[i].position.x + ", position.y: " + lastStroke[i].position.y
                + ", interpolated: " + lastStroke[i].interpolated);
        }
    }
});
 
const reset = new Button({
    text: "Reset",
    isUserInteractionEnabled: true,
    size: { width: 80, height: 50 },
    position: { x: 50, y: 25 },
});
scene1.addChild(reset);
reset.onTapDown(() => {
    drawPad.clear();
});
`}
];

<CodeExample code={code} more={more} template={template} console="true"/>
