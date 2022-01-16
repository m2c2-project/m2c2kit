import {
  Game,
  Action,
  Scene,
  Shape,
  Size,
  Point,
  Label,
  Transition,
  TransitionDirection,
  WebColors,
  Rect,
  RandomDraws,
  LabelHorizontalAlignmentMode,
  GameParameters,
  GameOptions,
  TrialSchema,
  Timer,
  Session,
  EventBase,
  EventType,
  SessionLifecycleEvent,
  GameTrialEvent,
  GameLifecycleEvent,
} from "@m2c2kit/core";
import { Button, Grid, Instructions } from "@m2c2kit/addons";
import { Survey } from "@m2c2kit/survey";

class GridMemory extends Game {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor() {
    const defaultParameters: GameParameters = {
      ReadyTime: {
        value: 1000,
        description: "How long the 'get ready' message is shown, milliseconds",
      },
      InterferenceTime: {
        value: 8000,
        description: "How long the grid of E/F is shown, milliseconds",
      },
      DotPresentTime: {
        value: 3000,
        description: "How long the dots are shown, milliseconds",
      },
      TrialNum: { value: 2, description: "How many trials to run" },
      InstructionType: { value: "short" },
    };

    const gridMemoryTrialSchema: TrialSchema = {
      timing_dotsdrawn: {
        type: "number",
        description: "How many dots to draw",
      },
      timing_getready: { type: "number" },
      timing_fs: { type: "number" },
      timing_userresponse: { type: "number" },
      random_cells: { type: "object" },
      tapped_cells: { type: "object" },
    };

    const img_default_size = 200;
    const options: GameOptions = {
      name: "Grid Memory",
      version: "0.0.1",
      shortDescription: "A short description of Grid Memory goes here...",
      longDescription:
        'Each trial of the dot memory task consisted of 3 phases: encoding, distraction, and retrieval. During the encoding phase, the participant was asked to remember the location three red dots appear on a 5 x 5 grid. After a 3-second study period, the grid was removed and the distraction phase began, during which the participant wasrequired to locate and touch Fs among an array of Es. After performing the distraction task for 8 seconds, and empty 5 x 5 grid reappeared on the screen and participants were then prompted to recall the locations of the 3 dots presented initially and press a button labeled "Done" after entering their responses to complete the trial. Participants completed 2 trials (encoding, distractor, retrieval) with a 1-second delay between trials. The dependent variable was an error score with partial credit given based on the deviation from the correct positions. If all dots were recalled in their correct location, the participant received a score ofzero. In the case of one or more retrieval errors, Euclidean distance of the location of the incorrect dot to the correct grid location was calculated, with higher scores indicating less accurate placement and poorer performance (Siedlecki, 2007). The rationale for our use of this task as an indicator of working memory has both an empirical and theoreticalbasis. Previous research (Miyake, Friedman, Rettinger, Shah, & Hegarty, 2001) has demonstrated that a similar dotmemory task loaded on a factor representing working memory. The authors of this study reasoned that the spatial dot memory task placed high demands on controlled attention—a hallmark of working memory tasks. Indeed, individual differences in working memory capacity arise "in situations where information needs to be actively maintained or when a controlled search of memory is required" (Unsworth & Engle, 2007, p. 123). The ambulatory dot memory task satisfies this requirement by using an interference task to prevent rehearsal and produce interference with encoded locations, which creates the demand for active maintenance and controlled retrieval of previously encoded location during the recall phase.',
      showFps: true,
      width: 400,
      height: 800,
      trialSchema: gridMemoryTrialSchema,
      parameters: defaultParameters,
      bodyBackgroundColor: WebColors.Gray,
      fontUrls: [
        "https://storage.googleapis.com/skia-cdn/google-web-fonts/FanwoodText-Regular.ttf",
      ],
      images: [
        {
          name: "grid",
          height: img_default_size,
          width: img_default_size,
          url: "img/dotmem1_grid.png",
        },
        {
          name: "fs",
          height: img_default_size,
          width: img_default_size,
          url: "img/dotmem2_fs.png",
        },
      ],
    };

    super(options);

    // just for convenience, alias the variable game to "this"
    // (even though eslint doesn't like it)
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const game = this;

    // ============================================================================
    // variables for timing and user input
    let timing_dotsdrawn: number;
    let timing_getready: number;
    let timing_fs: number;
    let timing_userresponse: number;
    let randomCells: {
      row: number;
      column: number;
    }[];
    let tappedCells: {
      row: number;
      column: number;
    }[];

    // ============================================================================
    // SCENES: instructions
    const instructionsScenes = Instructions.Create({
      sceneNamePrefix: "instructions",
      backgroundColor: WebColors.White,
      nextButtonBackgroundColor: WebColors.Black,
      backButtonBackgroundColor: WebColors.Black,
      instructionScenes: [
        {
          title: "Activity: Grid Memory",
          text: "For this activity, try to remember the location of 3 dots.",
          image: "grid",
          imageAboveText: false,
          imageMarginTop: 12,
          textFontSize: 24,
          titleFontSize: 30,
          textVerticalBias: 0.25,
        },
        {
          title: "Activity: Grid Memory",
          text: "Before placing the 3 dots in their location, you will also have to tap some Fs on the screen as quickly as you can.",
          image: "fs",
          imageAboveText: false,
          imageMarginTop: 12,
          textFontSize: 24,
          titleFontSize: 30,
          textVerticalBias: 0.25,
        },
        {
          title: "Activity: Grid Memory",
          text: "Press START to begin!",
          textFontSize: 24,
          titleFontSize: 30,
          textAlignmentMode: LabelHorizontalAlignmentMode.center,
          nextButtonText: "START",
          nextButtonBackgroundColor: WebColors.Green,
        },
      ],
      postInstructionsScene: "getReadyScene",
    });
    game.addScenes(instructionsScenes);

    const nextScreenTransition = Transition.push(TransitionDirection.left, 500);
    const previousScreenTransition = Transition.push(
      TransitionDirection.right,
      500
    );

    // ============================================================================
    // SCENE: show get ready message, then advance after XXXX
    // milliseconds (as defined in ReadyTime parameter)
    const gridMemoryPage0 = new Scene({
      name: "getReadyScene",
      backgroundColor: WebColors.White,
    });
    game.addScene(gridMemoryPage0);

    const getReadyMessage = new Label({
      text: "Get Ready",
      fontSize: 24,
      position: new Point(200, 400),
    });
    gridMemoryPage0.addChild(getReadyMessage);

    gridMemoryPage0.setup(() => {
      gridMemoryPage0.run(
        Action.Sequence([
          Action.Wait({ duration: game.getParameter("ReadyTime") }),
          Action.Custom({
            callback: () => {
              timing_getready = performance.now();
              game.presentScene(gridMemoryPage1);
            },
          }),
        ])
      );
    });

    // ============================================================================
    // SCENE: show the dot placement
    const gridMemoryPage1 = new Scene({ backgroundColor: WebColors.White });
    game.addScene(gridMemoryPage1);

    const page1Message = new Label({
      text: "Remember the dot locations!",
      fontSize: 24,
      position: new Point(200, 150),
    });
    gridMemoryPage1.addChild(page1Message);

    const grid1 = new Grid({
      size: new Size(300, 300),
      position: new Point(200, 400),
      rows: 5,
      columns: 5,
      backgroundColor: WebColors.Silver,
      gridLineColor: WebColors.Black,
      gridLineWidth: 4,
    });
    gridMemoryPage1.addChild(grid1);

    gridMemoryPage1.setup(() => {
      grid1.removeAllChildren();

      // randomly choose 3 cells that will have the red dots
      // on a grid of size 5 rows, 5 columns
      randomCells = RandomDraws.FromGridWithoutReplacement(3, 5, 5);
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
          Action.Wait({ duration: game.getParameter("DotPresentTime") }),
          Action.Custom({
            callback: () => {
              game.presentScene(gridMemoryPage2, nextScreenTransition);
              timing_dotsdrawn = performance.now();
            },
          }),
        ])
      );
    });

    // ============================================================================
    // SCENE: ask participant to the touch the Fs
    const gridMemoryPage2 = new Scene({ backgroundColor: WebColors.White });
    game.addScene(gridMemoryPage2);

    const touchTheFs = new Label({
      text: "Touch the F's!",
      position: new Point(200, 100),
    });
    gridMemoryPage2.addChild(touchTheFs);

    const grid = new Grid({
      size: new Size(300, 480),
      position: new Point(200, 400),
      rows: 8,
      columns: 5,
      backgroundColor: WebColors.Transparent,
      gridLineColor: WebColors.Transparent,
    });

    gridMemoryPage2.addChild(grid);

    gridMemoryPage2.setup(() => {
      Timer.Start("gridMemoryPage2 setup");

      // Advance to the next recall screen after "InterferenceTime" millisseconds
      gridMemoryPage2.run(
        Action.Sequence([
          Action.Wait({ duration: game.getParameter("InterferenceTime") }),
          Action.Custom({
            callback: () => {
              game.presentScene(gridMemoryPage3, previousScreenTransition);
            },
          }),
        ]),
        "advanceAfterInterference"
      );

      // While we're waiting until the "InterferenceTime" elapses via
      // the above action, start another action to show the grid of
      // E/F to tap
      gridMemoryPage2.run(
        Action.Custom({
          callback: () => {
            timing_fs = performance.now();
            ShowInterferenceActivity();
          },
        })
      );

      // On repeated showings of the grid, we will slide it into view
      // and slideGridIntoScene = true
      function ShowInterferenceActivity(slideGridIntoScene = false) {
        grid.removeAllChildren();
        let tappedFCount = 0;

        // randomly choose six cells to have F in them from the grid that
        // is of size 8 rows and 5 columns
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
              if (FCells[k].row === i && FCells[k].column === j) {
                letter = new Label({ text: "F", fontSize: 50 });
                letterIsF = true;
              }
            }

            if (letterIsF) {
              square.isUserInteractionEnabled = true;
              square.onTapDown(() => {
                if (square.userData === 0) {
                  tappedFCount++;
                  letter.text = "E";
                  letter.run(
                    Action.Sequence([
                      Action.Scale({ scale: 1.25, duration: 125 }),
                      Action.Scale({ scale: 1, duration: 125 }),
                    ])
                  );
                  square.userData = 1;
                  if (tappedFCount >= 6) {
                    // don't allow more taps on this current grid
                    grid.gridChildren.forEach((cell) => {
                      cell.entity.isUserInteractionEnabled = false;
                    });

                    // show a new interference grid
                    // but this time, slide it into view
                    ShowInterferenceActivity(true);
                  }
                }
              });
            }
            grid.addAtCell(letter, i, j);
            grid.addAtCell(square, i, j);
          }
        }

        if (slideGridIntoScene) {
          grid.position = new Point(200, 1040);
          grid.run(Action.Move({ point: new Point(200, 400), duration: 500 }));
        }
      }

      console.log(
        `gridMemoryPage2.setup() took ${Timer.Elapsed(
          "gridMemoryPage2 setup"
        )} ms.`
      );
      Timer.Remove("gridMemoryPage2 setup");
    });

    // ============================================================================
    // SCENE: ask participant to recall the dot positions
    const gridMemoryPage3 = new Scene({ backgroundColor: WebColors.White });
    game.addScene(gridMemoryPage3);

    const page3Message = new Label({
      text: "Where were the dots?",
      fontSize: 24,
      position: new Point(200, 150),
    });
    gridMemoryPage3.addChild(page3Message);

    const grid3 = new Grid({
      size: new Size(300, 300),
      position: new Point(200, 400),
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
      tappedCells = new Array<{
        row: number;
        column: number;
      }>();

      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          const cell = new Shape({
            // this rectangle will be the hit area for the cell
            // it's transparent -- we use it only for its hit
            // area. Make it 59 x 59 (not 60 x 60) to avoid overlap
            // of hit area on the borders
            rect: new Rect({ size: new Size(59, 59) }),
            fillColor: WebColors.Transparent,
          });
          // an entity's userData is a property we can use to store
          // anything we want. Here, we use it simply to keep track
          // of whether the cell has been tapped or not.
          cell.userData = 0;
          cell.onTapDown(() => {
            if (cell.userData === 0 && tappedCellCount < 3) {
              // cell has not been tapped, and there are not yet
              // 3 circles placed
              const circle = new Shape({
                circleOfRadius: 20,
                fillColor: WebColors.Red,
                strokeColor: WebColors.Black,
                lineWidth: 2,
              });
              cell.addChild(circle);
              cell.userData = 1;
              tappedCellCount++;
              tappedCells.push({ row: i, column: j });
            } else if (cell.userData === 1) {
              // this cell has been tapped. Remove the circle from here
              cell.removeAllChildren();
              cell.userData = 0;
              tappedCellCount--;
              // remove this "untapped" cell from the recorded data of tapped cells
              tappedCells = tappedCells.filter(
                (cell) => !(cell.row === i && cell.column === j)
              );
            }
          });
          cell.isUserInteractionEnabled = true;
          grid3.addAtCell(cell, i, j);
        }
      }
    });

    const gridMemoryPage3DoneButton = new Button({
      text: "Done",
      position: new Point(200, 700),
      size: new Size(300, 50),
    });
    gridMemoryPage3.addChild(gridMemoryPage3DoneButton);

    // place this warning message on the scene, but hide it
    // we'll unhide it, if needed.
    const youMustSelectAllMessage = new Label({
      text: "You must select all 3 locations!",
      position: new Point(200, 600),
    });
    youMustSelectAllMessage.hidden = true;
    gridMemoryPage3.addChild(youMustSelectAllMessage);

    gridMemoryPage3DoneButton.isUserInteractionEnabled = true;
    gridMemoryPage3DoneButton.onTapDown(() => {
      if (tappedCellCount < 3) {
        youMustSelectAllMessage.run(
          Action.Sequence([
            Action.Custom({
              callback: () => {
                youMustSelectAllMessage.hidden = false;
              },
            }),
            Action.Wait({ duration: 3000 }),
            Action.Custom({
              callback: () => {
                youMustSelectAllMessage.hidden = true;
              },
            }),
          ])
        );
      } else {
        timing_userresponse = performance.now();
        game.addTrialData("timing_dotsdrawn", timing_dotsdrawn);
        game.addTrialData("timing_getready", timing_getready);
        game.addTrialData("timing_fs", timing_fs);
        game.addTrialData("timing_userresponse", timing_userresponse);
        game.addTrialData("random_cells", randomCells);
        game.addTrialData("tapped_cells", tappedCells);
        game.trialComplete();
        if (game.trialIndex === game.getParameter("TrialNum")) {
          game.presentScene(endPage, nextScreenTransition);
        } else {
          game.presentScene(gridMemoryPage0, nextScreenTransition);
        }
      }
    });

    // ============================================================================
    // SCENE: placeholder end scene, with a button to restart it all again or exit
    const endPage = new Scene();
    game.addScene(endPage);
    const doneLabel = new Label({
      text: `This will be reassigned in the setup() callback. If you see this, something went wrong!`,
      position: new Point(200, 300),
    });
    endPage.addChild(doneLabel);

    const againButton = new Button({
      text: "Start over",
      position: new Point(200, 400),
    });
    againButton.isUserInteractionEnabled = true;
    againButton.onTapDown(() => {
      game.initData();
      game.presentScene(gridMemoryPage0);
    });
    endPage.addChild(againButton);

    const exitButton = new Button({
      text: "Exit",
      position: new Point(200, 475),
    });
    exitButton.isUserInteractionEnabled = true;
    exitButton.onTapDown(() => {
      // hide the start over button
      againButton.hidden = true;
      // don't allow repeat taps of exit button
      exitButton.isUserInteractionEnabled = false;
      game.end();
    });
    endPage.addChild(exitButton);

    endPage.setup(() => {
      doneLabel.text = `You did ${game.trialIndex} trials. You're done!`;
    });

    game.entryScene = "instructions-01";
  }
}

// ===========================================================================

//#region to support m2c2kit in Android WebView
/** When running within an Android WebView, the below defines how the session
 * can communicate events back to the Android app. Note: names of this Android
 * namespace and its functions must match the corresponding Android code
 * in addJavascriptInterface() and @JavascriptInterface */
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Android {
  function onGameTrialComplete(gameTrialEventAsString: string): void;
  function onGameLifecycleChange(gameLifecycleEventAsString: string): void;
  function onSessionLifecycleChange(
    sessionLifecycleEventAsString: string
  ): void;
  /** if the Android native app will control the session execution and be
   * able to set custom game paraemters (which is probably what you want),
   * be sure that sessionManualStart() in the native code returns true */
  function sessionManualStart(): boolean;
}

function contextIsAndroidWebView(): boolean {
  return typeof Android !== "undefined";
}

function sendEventToAndroid(event: EventBase) {
  switch (event.eventType) {
    case EventType.sessionLifecycle: {
      Android.onSessionLifecycleChange(JSON.stringify(event));
      break;
    }
    case EventType.gameTrial: {
      Android.onGameTrialComplete(JSON.stringify(event));
      break;
    }
    case EventType.gameLifecycle: {
      Android.onGameLifecycleChange(JSON.stringify(event));
      break;
    }
    default:
      throw new Error(
        `attempt to send unknown event ${event.eventType} to Android`
      );
  }
}
//#endregion

const gridMemory = new GridMemory();
// default InterferenceTime is 8000 ms; this is how we can specify a different value
gridMemory.setParameters({ InterferenceTime: 1000, ReadyTime: 1000 });

const surveyJson = {
  pages: [
    {
      description: "Welcome to the WAKE UP Survey!",
      elements: [
        {
          name: "date",
          type: "bootstrapdatepicker",
          inputType: "date",
          title: "Your favorite date:",
          dateFormat: "mm/dd/yy",
          isRequired: true,
        },
        {
          type: "sortablelist",
          name: "lifepriority",
          title: "Life Priorities ",
          isRequired: true,
          choices: ["family", "work", "pets", "travels", "games"],
        },
        {
          type: "tagbox",
          isRequired: true,
          choices: [
            {
              value: 1,
              text: "USA",
            },
            {
              value: 2,
              text: "Mexico",
            },
            {
              value: 3,
              text: "Canada",
            },
          ],
          name: "countries",
          title:
            "Please select all countries you have been for the last 3 years.",
        },
        {
          name: "FirstName",
          title: "Enter your first name:",
          type: "text",
        },
        {
          type: "checkbox",
          name: "car",
          title: "What car are you driving?",
          isRequired: true,
          hasNone: true,
          colCount: 2,
          choices: [
            {
              value: 1,
              text: "Ford",
            },
            {
              value: 2,
              text: "Honda",
            },
            {
              value: 3,
              text: "BMW",
            },
          ],
        },
        {
          type: "radiogroup",
          name: "where",
          title: "Where are you right now?",
          isRequired: true,
          hasNone: false,
          colCount: 2,
          choices: ["Home", "School", "Work", "Other"],
        },
        {
          type: "nouislider",
          name: "stressed",
          title: "How stressed are you right now?",
        },
      ],
    },
  ],
};

const s1 = new Survey(surveyJson);

const session = new Session({
  activities: [s1, gridMemory],
  sessionCallbacks: {
    // onSessionLifecycleChange() will be called on events such
    // as when the session initialization is complete. Once initialized,
    // the session will automatically start, unless we're running
    // in an Android WebView and a manual start is desired.
    onSessionLifecycleChange: (ev: SessionLifecycleEvent) => {
      if (ev.initialized) {
        //#region to support m2c2kit in Android WebView
        if (contextIsAndroidWebView()) {
          sendEventToAndroid(ev);
        }
        if (contextIsAndroidWebView() && Android.sessionManualStart()) {
          return;
        }
        //#endregion
        session.start();
      }
      if (ev.ended) {
        console.log("session ended");
        //#region to support m2c2kit in Android WebView
        if (contextIsAndroidWebView()) {
          sendEventToAndroid(ev);
        }
        //#endregion
      }
    },
  },
  gameCallbacks: {
    // onGameTrialComplete() is where you insert code to post data to an API
    // or interop with a native function in the host app, if applicable
    onGameTrialComplete: (ev: GameTrialEvent) => {
      console.log(`********** trial (index ${ev.trialIndex}) complete`);
      console.log("data: " + JSON.stringify(ev.gameData));
      console.log("trial schema: " + JSON.stringify(ev.trialSchema));
      console.log("game parameters: " + JSON.stringify(ev.gameParameters));

      //#region to support m2c2kit in Android WebView
      if (contextIsAndroidWebView()) {
        sendEventToAndroid(ev);
      }
      //#endregion
    },
    onGameLifecycleChange: (ev: GameLifecycleEvent) => {
      if (ev.ended) {
        console.log(`ended game ${ev.gameName}`);
        if (session.nextActivity) {
          session.advanceToNextActivity();
        } else {
          session.end();
        }
        //#region to support m2c2kit in Android WebView
        if (contextIsAndroidWebView()) {
          sendEventToAndroid(ev);
        }
        //#endregion
      }
    },
  },
});

/** make session also available on window in case we want to control
 * the session through another means, such as other javascript or
 * browser code, or the Android WebView loadUrl() method */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as unknown as any).session = session;
session.init();
