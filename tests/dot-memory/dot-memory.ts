import {
  Game,
  Action,
  Transition,
  TransitionDirection,
  Scene,
  Shape,
  Size,
  Point,
  Label,
  WebColors,
  Rect,
  RandomDraws,
} from "../../src/m2c2kit";

import { Button, Grid } from "../../src/composites";

const game = new Game();
(window as unknown as any).game = game;

game
  .init({
    showFps: true,
    width: 360,
    height: 600,
    fontUrls: [
      "https://storage.googleapis.com/skia-cdn/google-web-fonts/Roboto-Regular.ttf",
    ],
  })
  .then(() => {
    // instructions screen push left or right when advancing or going back, duration is 500ms
    const nextScreenTransition = Transition.push(TransitionDirection.left, 500);
    const previousScreenTransition = Transition.push(
      TransitionDirection.right,
      500
    );

    const page00 = new Scene({ backgroundColor: WebColors.WhiteSmoke });
    game.addScene(page00);

    const button = new Button({ text: "Start", position: new Point(180, 500) });
    button.isUserInteractionEnabled = true;
    button.onTap(() => {
      console.log("tapped");
      game.presentScene(gridMemoryPage0, nextScreenTransition);
    });
    page00.addChild(button);

    const gridMemoryPage0 = new Scene({ backgroundColor: WebColors.White });
    game.addScene(gridMemoryPage0);

    const getReadyMessage = new Label({
      text: "Get Ready",
      position: new Point(180, 360),
    });
    gridMemoryPage0.addChild(getReadyMessage);

    gridMemoryPage0.setup(() => {
      gridMemoryPage0.run(
        Action.Sequence([
          Action.Wait(2000),
          Action.Code(() => {
            game.presentScene(gridMemoryPage1);
          }),
        ])
      );
    });

    const gridMemoryPage1 = new Scene({ backgroundColor: WebColors.White });
    game.addScene(gridMemoryPage1);

    const page1Message = new Label({
      text: "Remember the dot locations!",
      fontSize: 24,
      position: new Point(180, 60),
    });
    gridMemoryPage1.addChild(page1Message);

    const grid1 = new Grid({
      size: new Size(300, 300),
      position: new Point(180, 275),
      rows: 5,
      columns: 5,
      backgroundColor: WebColors.Silver,
      gridLineColor: WebColors.Black,
      gridLineWidth: 4,
    });
    gridMemoryPage1.addChild(grid1);

    gridMemoryPage1.setup(() => {
      grid1.removeAllChildren();

      const randomCells = RandomDraws.FromGridWithoutReplacement(3, 5, 5);
      for (let i = 0; i < 3; i++) {
        const circle = new Shape({
          circleOfRadius: 20,
          fillColor: WebColors.Red,
          strokeColor: WebColors.Black,
          lineWidth: 2,
        });
        grid1.addAtCell(circle, randomCells[i].row, randomCells[i].column);
      }

      gridMemoryPage1.run(
        Action.Sequence([
          Action.Wait(2000),
          Action.Code(() => {
            game.presentScene(gridMemoryPage2, nextScreenTransition);
          }),
        ])
      );
    });

    const gridMemoryPage2 = new Scene({ backgroundColor: WebColors.White });
    game.addScene(gridMemoryPage2);

    const touchTheFs = new Label({
      text: "Touch the F's!",
      position: new Point(180, 30),
    });
    gridMemoryPage2.addChild(touchTheFs);

    const grid = new Grid({
      size: new Size(300, 480),
      position: new Point(180, 275),
      rows: 8,
      columns: 5,
      backgroundColor: WebColors.Transparent,
      gridLineColor: WebColors.Transparent,
    });

    gridMemoryPage2.addChild(grid);

    gridMemoryPage2.setup(() => {
      console.log("beginning setup " + window.performance.now());
      grid.removeAllChildren();
      let tappedFCount = 0;

      const FCells = RandomDraws.FromGridWithoutReplacement(6, 8, 5);
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 5; j++) {
          const square = new Shape({
            rect: new Rect({ size: new Size(59, 59) }),
            fillColor: WebColors.Transparent,
          });
          square.userData = 0;

          let letterIsF = false;
          let letter: Label;
          letter = new Label({ text: "E", fontSize: 50 });
          for (let k = 0; k < 6; k++) {
            if (FCells[k].row == i && FCells[k].column == j) {
              letter = new Label({ text: "F", fontSize: 50 });
              letterIsF = true;
            }
          }

          if (letterIsF) {
            square.onTap(() => {
              if (square.userData === 0) {
                tappedFCount++;
                letter.text = "E";
                letter.run(
                  Action.Sequence([
                    Action.Scale(1.25, 125),
                    Action.Scale(1, 125),
                  ])
                );
                square.userData = 1;
                if (tappedFCount >= 6) {
                  // don't allow more grid taps
                  grid.gridChildren.forEach((cell) => {
                    cell.entity.isUserInteractionEnabled = false;
                  });
                  square.run(
                    Action.Sequence([
                      Action.Wait(1000),
                      Action.Code(() => {
                        game.presentScene(
                          gridMemoryPage3,
                          previousScreenTransition
                        );
                      }),
                    ])
                  );
                }
              }
            });
            square.isUserInteractionEnabled = true;
          }
          grid.addAtCell(letter, i, j);
          grid.addAtCell(square, i, j);
        }
      }

      console.log("setup done " + window.performance.now());
    });

    const gridMemoryPage3 = new Scene({ backgroundColor: WebColors.White });
    game.addScene(gridMemoryPage3);

    const page3Message = new Label({
      text: "Where were the dots?",
      fontSize: 24,
      position: new Point(180, 60),
    });
    gridMemoryPage3.addChild(page3Message);

    const grid3 = new Grid({
      size: new Size(300, 300),
      position: new Point(180, 275),
      rows: 5,
      columns: 5,
      backgroundColor: WebColors.Silver,
      gridLineColor: WebColors.Black,
      gridLineWidth: 4,
    });
    gridMemoryPage3.addChild(grid3);

    let tappedCellCount = 0;

    gridMemoryPage3.setup(() => {
      grid3.removeAllChildren();

      tappedCellCount = 0;

      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          const cell = new Shape({
            rect: new Rect({ size: new Size(59, 59) }),
            fillColor: WebColors.Transparent,
          });
          cell.userData = 0;
          cell.onTap(() => {
            if (cell.userData === 0 && tappedCellCount < 3) {
              const circle = new Shape({
                circleOfRadius: 20,
                fillColor: WebColors.Red,
                strokeColor: WebColors.Black,
                lineWidth: 2,
              });
              cell.addChild(circle);
              cell.userData = 1;
              tappedCellCount++;
            } else if (cell.userData === 1) {
              cell.removeAllChildren();
              cell.userData = 0;
              tappedCellCount--;
            }
          });
          cell.isUserInteractionEnabled = true;
          grid3.addAtCell(cell, i, j);
        }
      }
    });

    const gridMemoryPage3DoneButton = new Shape({
      rect: new Rect({ size: new Size(300, 50) }),
      cornerRadius: 9,
      position: new Point(180, 500),
      fillColor: [44, 90, 255, 1],
    });
    gridMemoryPage3.addChild(gridMemoryPage3DoneButton);

    const gridDoneLabel = new Label({
      text: "Done",
      fontSize: 20,
      fontColor: [255, 255, 255, 1],
    });
    gridMemoryPage3DoneButton.addChild(gridDoneLabel);

    const youMustSelectAllMessage = new Label({
      text: "You must select all 3 locations!",
      position: new Point(180, 450),
    });
    youMustSelectAllMessage.hidden = true;
    gridMemoryPage3.addChild(youMustSelectAllMessage);

    const gridMemoryTrials = 2;
    let gridMemoryTrialCount = 0;

    gridMemoryPage3DoneButton.isUserInteractionEnabled = true;
    gridMemoryPage3DoneButton.onTap(() => {
      if (tappedCellCount < 3) {
        youMustSelectAllMessage.run(
          Action.Sequence([
            Action.Code(() => {
              youMustSelectAllMessage.hidden = false;
            }),
            Action.Wait(3000),
            Action.Code(() => {
              youMustSelectAllMessage.hidden = true;
            }),
          ])
        );
      } else {
        gridMemoryTrialCount++;
        if (gridMemoryTrialCount == gridMemoryTrials) {
          game.presentScene(endPage, nextScreenTransition);
        } else {
          game.presentScene(gridMemoryPage0, nextScreenTransition);
        }
      }
    });

    const endPage = new Scene();
    game.addScene(endPage);
    const doneLabel = new Label({
      text: "You're done!",
      position: new Point(180, 300),
    });
    endPage.addChild(doneLabel);

    const againButton = new Button({
      text: "Start over",
      position: new Point(180, 400),
    });
    againButton.isUserInteractionEnabled = true;
    againButton.onTap(() => {
      gridMemoryTrialCount = 0;
      game.presentScene(gridMemoryPage0);
    });
    endPage.addChild(againButton);

    game.entryScene = page00;
    game.start();
  });
