// for typescript, import the module without .js extension
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
  LabelHorizontalAlignmentMode,
  Transition,
  TransitionDirection,
} from "../../../lib/src/m2c2kit";
// for typescript, import the parent composites and stories modules
import { Button, Grid } from "../../../lib/src/addons/composites";
import { Instructions } from "../../../lib/src/addons/stories";

const game = new Game();
// for typescript, we need to caste window to any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as unknown as any).game = game;

game
  .init({
    showFps: true,
    // set this color so we can see the boundaries of the game
    bodyBackgroundColor: WebColors.Wheat,
    // note: using 2:1 aspect ratio, because that is closer to modern phones
    width: 400,
    height: 800,
    // set stretch to true if you want to fill the screen
    stretch: false,
    fontUrls: [
      "https://storage.googleapis.com/skia-cdn/google-web-fonts/Roboto-Regular.ttf",
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
    const instructionsScenes = Instructions.Create({
      sceneNamePrefix: "instructions",
      // the backgroundColor will be applied to all instruction scenes, unless we override
      backgroundColor: WebColors.Beige,
      instructionScenes: [
        {
          text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit,sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
          textFontSize: 24,
        },
        {
          text: "Same text, but shifted up the screen (vertical bias .25)\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
          textFontSize: 24,
          textVerticalBias: 0.25,
          backButtonBackgroundColor: WebColors.RebeccaPurple,
          nextButtonFontColor: WebColors.Yellow,
          nextSceneTransition: Transition.push(TransitionDirection.left, 250),
        },
        {
          title: "Title goes here",
          titleFontSize: 24,
          titleMarginTop: 64,
          text: "Title, text, and image.\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
          textAlignmentMode: LabelHorizontalAlignmentMode.center,
          // override this scene's color to be different
          backgroundColor: WebColors.WhiteSmoke,
          image: "star",
          imageAboveText: false,
          imageMarginTop: 32,
        },
        {
          title: "Title goes here",
          titleMarginTop: 64,
          text: "Shift down the screen (vertical bias .70).\nTitle, text, and image.\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
          textVerticalBias: 0.75,
          // override this scene's color to be different
          backgroundColor: WebColors.WhiteSmoke,
          image: "star",
          imageAboveText: false,
          imageMarginTop: 32,
        },
        {
          title: "Title goes here",
          titleMarginTop: 128,
          text: "Title, text, and image, but this time image on top.\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
          image: "star",
          imageMarginBottom: 8,
        },
        {
          title: "Last screen",
          text: "We're at the end. We've changed the next button text to \"Start\" for this last screen.",
          nextButtonText: "Start",
        },
      ],
      postInstructionsScene: "page1",
    });
    game.addScenes(instructionsScenes);

    // present simple primitives and show some actions as an example
    const page1 = new Scene({
      // give this scene a name so we can refer to it in the postInstructionScene property
      // when building our instructions
      name: "page1",
      backgroundColor: WebColors.Cornsilk,
    });
    game.addScene(page1);

    // create a button from primitives (rectangle, label)
    const page1ButtonRectangle = new Shape({
      rect: new Rect({ width: 300, height: 50, x: 200, y: 700 }),
      cornerRadius: 9,
      fillColor: WebColors.RebeccaPurple,
    });
    let clicks = 0;
    page1.addChild(page1ButtonRectangle);
    const buttonLabel = new Label({
      text: "click me -- see console!",
      fontColor: WebColors.White,
    });
    page1ButtonRectangle.addChild(buttonLabel);
    page1ButtonRectangle.isUserInteractionEnabled = true;
    page1ButtonRectangle.onTap(() => {
      clicks++;
      console.log(`clicked ${clicks} times!`);
      page1ButtonRectangle.run(
        Action.Sequence([
          Action.Scale({ scale: 0.95, duration: 100 }),
          Action.Scale({ scale: 1, duration: 100 }),
        ])
      );
    });

    // create a button from a pre-built composite (easy!)
    const easyButton = new Button({
      text: "click me!",
      position: new Point(200, 625),
    });
    page1.addChild(easyButton);
    easyButton.isUserInteractionEnabled = true;
    let easyClicks = 0;
    easyButton.onTap(() => {
      easyClicks++;
      console.log(`easy button clicked ${easyClicks} times!`);
      easyButton.run(
        Action.Sequence([
          Action.Scale({ scale: 0.95, duration: 100 }),
          Action.Scale({ scale: 1, duration: 100 }),
        ])
      );
    });

    const circle = new Shape({
      circleOfRadius: 80,
      fillColor: WebColors.LightBlue,
      strokeColor: WebColors.Red,
      lineWidth: 4,
      position: new Point(200, 200),
    });
    page1.addChild(circle);

    const starImage = new Sprite({ imageName: "star" });
    circle.addChild(starImage);

    const grid1 = new Grid({
      size: new Size(250, 250),
      position: new Point(200, 450),
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
      position: new Point(350, 180),
      horizontalAlignmentMode: LabelHorizontalAlignmentMode.right,
    });
    page1.addChild(wrappedLabel2);

    game.start("instructions-01");
  });
