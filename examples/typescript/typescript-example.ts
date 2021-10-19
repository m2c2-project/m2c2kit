import { LabelHorizontalAlignmentMode } from "./../../src/m2c2kit";
import {
  Game,
  Action,
  Scene,
  Shape,
  Size,
  Point,
  Label,
  Sprite,
  WebColors,
  Rect,
} from "../../src/m2c2kit";

import { Grid } from "../../src/composites";

const game = new Game();
// the next two lines is the only difference between this and the javascript example
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as unknown as any).game = game;

game
  .init({
    canvasId: "mainCanvas",
    showFps: true,
    width: 360,
    height: 600,
    fontUrls: [
      "https://storage.googleapis.com/skia-cdn/google-web-fonts/Roboto-Regular.ttf",
      "https://fonts.cdnfonts.com/s/5244/Quickie.ttf",
    ],
    // each svgImage below, you specify either a tag of an svg in the property "svgString" (as I do below)
    // or you specify a URL to an svg in the property "url", such as url: 'https://dev.w3.org/SVG/tools/svgweb/samples/svg-files/android.svg'
    svgImages: [
      {
        name: "star",
        height: 60,
        width: 60,
        svgString:
          '<svg xmlns="http://www.w3.org/2000/svg" width="304" height="290"> <path d="M2,111 h300 l-242.7,176.3 92.7,-285.3 92.7,285.3 z" style="fill:#00FF00;stroke:#0000FF;stroke-width:15;stroke-linejoin:round"/></svg>',
      },
    ],
  })
  .then(() => {
    // present simple primitives and show some actions as an example

    const page1 = new Scene({ backgroundColor: WebColors.Cornsilk });
    game.addScene(page1);

    // create a button from primitvies (rectangle, label)
    const page1ButtonRectangle = new Shape({
      rect: new Rect({ width: 300, height: 50, x: 180, y: 500 }),
      cornerRadius: 9,
      fillColor: WebColors.RebeccaPurple,
    });
    let clicks = 0;
    page1.addChild(page1ButtonRectangle);
    const buttonLabel = new Label({
      text: "click me -- see log!",
      fontColor: WebColors.White,
    });
    page1ButtonRectangle.addChild(buttonLabel);
    page1ButtonRectangle.isUserInteractionEnabled = true;
    page1ButtonRectangle.onTap(() => {
      clicks++;
      console.log(`clicked ${clicks} times!`);
      page1ButtonRectangle.run(
        Action.Sequence(Action.Scale(0.95, 100), Action.Scale(1, 100))
      );
    });

    const circle = new Shape({
      circleOfRadius: 80,
      fillColor: WebColors.LightBlue,
      strokeColor: WebColors.Red,
      lineWidth: 4,
      position: new Point(180, 100),
    });
    page1.addChild(circle);

    const starImage = new Sprite({ imageName: "star" });
    circle.addChild(starImage);

    const grid1 = new Grid({
      size: new Size(200, 200),
      position: new Point(180, 325),
      rows: 5,
      columns: 5,
      backgroundColor: WebColors.Silver,
      gridLineColor: WebColors.Black,
      gridLineWidth: 4,
    });
    page1.addChild(grid1);

    // make star image smaller so it fits in cell, then place along diagonal
    for (let i = 0; i < 5; i++) {
      const smallstar = new Sprite({ imageName: "star", scale: 0.5 });
      grid1.addAtCell(smallstar, i, i);
    }

    const wrappedLabel = new Label({
      text: "center: this is a long line of text that has been wrapped so it stays within the bounds we want.",
      preferredMaxLayoutWidth: 60,
      position: new Point(40, 180),
    });
    page1.addChild(wrappedLabel);

    const wrappedLabel2 = new Label({
      text: "right justified: this is a long line of text that has been wrapped so it stays within the bounds we want.",
      preferredMaxLayoutWidth: 60,
      position: new Point(315, 180),
      horizontalAlignmentMode: LabelHorizontalAlignmentMode.right,
    });
    page1.addChild(wrappedLabel2);

    game.presentScene(page1);
  });
