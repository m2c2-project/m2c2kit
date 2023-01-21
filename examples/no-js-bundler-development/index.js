import {
  Action,
  ActivityType,
  Game,
  Scene,
  EventType,
  WebColors,
  Session,
} from "./lib/m2c2kit.core.esm.js";
import { Survey } from "./lib/m2c2kit.survey.esm.js";
import { Button } from "./lib/m2c2kit.addons.esm.js";
import { SymbolSearch } from "./lib/m2c2kit.assessment-symbol-search.esm.min.js";

/**
 * Example of how to use the SymbolSearch assessment.
 */
const symbolSearch = new SymbolSearch();
// default is 5 trials; customize to 4 trials.
symbolSearch.setParameters({ number_of_trials: 4 });

/**
 * Example of how to create a new assessment.
 */
class NoBundler extends Game {
  constructor() {
    const defaultParameters = {};

    const starterTrialSchema = {};

    const options = {
      name: "No JavaScript Bundler Development Example",
      version: "0.0.1",
      id: "no-js-bundler-survey",
      showFps: false,
      width: 400,
      height: 800,
      trialSchema: starterTrialSchema,
      parameters: defaultParameters,
      bodyBackgroundColor: WebColors.WhiteSmoke,
      fontUrls: ["assets/no-bundler-example/fonts/roboto/Roboto-Regular.ttf"],
    };

    super(options);
  }

  async init() {
    await super.init();
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const game = this;
    const sceneOne = new Scene();
    game.addScene(sceneOne);

    const pushMeButton = new Button({
      text: "Click me",
      position: { x: 200, y: 200 },
      isUserInteractionEnabled: true,
    });
    sceneOne.addChild(pushMeButton);

    pushMeButton.onTapDown(() => {
      console.log("I've been clicked!");
      pushMeButton.run(
        Action.sequence([
          Action.custom({
            callback: () => {
              pushMeButton.isUserInteractionEnabled = false;
              pushMeButton.backgroundColor = WebColors.Red;
            },
          }),
          Action.move({ point: { x: 200, y: 180 }, duration: 50 }),
          Action.move({ point: { x: 200, y: 220 }, duration: 50 }),
          Action.move({ point: { x: 200, y: 200 }, duration: 50 }),
          Action.custom({
            callback: () => {
              pushMeButton.backgroundColor = WebColors.Black;
              pushMeButton.isUserInteractionEnabled = true;
            },
          }),
        ])
      );
    });

    const nextButton = new Button({
      text: "Next",
      backgroundColor: WebColors.RoyalBlue,
      position: { x: 200, y: 500 },
      isUserInteractionEnabled: true,
    });
    sceneOne.addChild(nextButton);
    nextButton.onTapDown(() => {
      game.end();
    });
  }
}

const activity = new NoBundler();

/**
 * Example of using survey questions (with SurveyJs).
 */
const surveyJson = {
  title: "m2c2kit no js bundler example survey",
  name: "no-js-bundler-survey",
  confirmSkipping: true,
  pages: [
    {
      name: "page1",
      elements: [
        {
          type: "radiogroup",
          name: "where_now",
          title: "Where are you?",
          choices: [
            {
              value: 1,
              text: "Your home",
            },
            {
              value: 2,
              text: "Other person's home",
            },
            {
              value: 3,
              text: "Office or other work place",
            },
            {
              value: 4,
              text: "Other",
            },
          ],
        },
      ],
      description: "Open the console to see the survey results.",
    },
    {
      name: "page2",
      elements: [
        {
          type: "nouislider-m2c2",
          name: "like_bundlers",
          title: "How much do you like using JavaScript bundlers?",
          rangeMin: 0,
          rangeMax: 100,
          pipsDensity: -1,
          showOnlyPipsWithPipsText: true,
          pipsText: [
            {
              value: 0,
              text: "Not at all",
            },
            {
              value: 100,
              text: "Very Much",
            },
          ],
        },
      ],
    },
  ],
};

const survey = new Survey(surveyJson);

const session = new Session({
  canvasKitWasmUrl: "assets/canvaskit.wasm",
  activities: [symbolSearch, activity, survey],
  activityCallbacks: {
    onActivityLifecycle: async (ev) => {
      if (
        ev.type === EventType.ActivityEnd ||
        ev.type === EventType.ActivityCancel
      ) {
        const nextActivity = session.nextActivity;
        if (nextActivity) {
          await session.goToNextActivity();
        } else {
          session.end();
        }
      }
    },
    onActivityResults: (ev) => {
      if (ev.target.type === ActivityType.Game) {
        console.log(`✅ trial complete:`);
      } else if (ev.target.type === ActivityType.Survey) {
        console.log(`✅ survey response:`);
      }
      console.log("  newData: " + JSON.stringify(ev.newData));
      console.log("  data: " + JSON.stringify(ev.data));
    },
  },
  sessionCallbacks: {
    onSessionLifecycle: async (ev) => {
      if (ev.type === EventType.SessionInitialize) {
        await session.start();
      }
      if (ev.type === EventType.SessionEnd) {
        console.log("🔴 ended session");
      }
    },
  },
});

window.session = session;
session.init();
