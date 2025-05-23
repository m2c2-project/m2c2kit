import {
  Action,
  ActivityType,
  Game,
  Scene,
  WebColors,
  Timer,
} from "@m2c2kit/core";
import { Session } from "@m2c2kit/session";
import { Survey } from "@m2c2kit/survey";
import { Button } from "@m2c2kit/addons";
import { SymbolSearch } from "@m2c2kit/assessment-symbol-search";
import { DataCalc, max, mean, min, n } from "@m2c2kit/data-calc";

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

    const NoBundlerTrialSchema = {
      click_duration_ms: {
        type: "number",
        description:
          "Duration elapsed, in milliseconds, between each button click.",
      },
    };

    const options = {
      name: "No JavaScript Bundler Development Example",
      version: "0.0.1",
      id: "no-bundler-example",
      publishUuid: "7d0bfc64-3b31-4f17-b786-f94b65f7e8f2",
      showFps: false,
      width: 400,
      height: 800,
      trialSchema: NoBundlerTrialSchema,
      parameters: defaultParameters,
      bodyBackgroundColor: WebColors.WhiteSmoke,
      fonts: [
        {
          fontName: "roboto",
          url: "fonts/roboto/Roboto-Regular.ttf",
        },
      ],
    };

    super(options);
  }

  async initialize() {
    await super.initialize();
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const game = this;
    const sceneOne = new Scene();
    game.addScene(sceneOne);

    sceneOne.onAppear(() => {
      Timer.startNew("buttonTimer");
    });

    const pushMeButton = new Button({
      text: "Click me",
      position: { x: 200, y: 200 },
      isUserInteractionEnabled: true,
    });
    sceneOne.addChild(pushMeButton);

    pushMeButton.onTapDown(() => {
      const elapsedDuration = Timer.elapsed("buttonTimer");
      Timer.startNew("buttonTimer");
      game.addTrialData("click_duration_ms", elapsedDuration);
      game.trialComplete();
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
        ]),
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
      const dc = new DataCalc(game.data.trials);

      const stats = dc.summarize({
        n: n(),
        mean_rt: mean("click_duration_ms"),
        min_rt: min("click_duration_ms"),
        max_rt: max("click_duration_ms"),
      });
      console.log("number of trials: " + stats.pull("n"));
      console.log("mean response time: " + stats.pull("mean_rt"));
      console.log("min response time: " + stats.pull("min_rt"));
      console.log("max response time: " + stats.pull("max_rt"));

      game.end();
    });
  }
}

const noBundlerAssessment = new NoBundler();

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
const activities = [symbolSearch, noBundlerAssessment, survey];

const session = new Session({
  activities: activities,
});

/**
 * An event handler provided to session.onActivityData() will be called
 * when a trial or survey question is completed. It will be passed an
 * ActivityResultsEvent object, which is named ev in the example below.
 *
 * The event handler is where you insert code to post data to an API or, in
 * the example below, simply log the data to the console.
 *
 * ev.newData is the data that was just generated by the completed trial or
 * survey question.
 * ev.data is all the data, cumulative of all trials or questions in the
 * activity, that have been generated.
 *
 * We separate out newData from data in case you want to alter the execution
 * based on the most recent trial, e.g., maybe you want to stop after
 * a certain user behavior or performance threshold in the just completed
 * trial.
 *
 * ev.activityConfiguration is the game parameters that were used.
 *
 * The schema for all of the above are in JSON Schema format.
 * Currently, only games generate schema.
 */
session.onActivityData((ev) => {
  if (ev.target.type === ActivityType.Game) {
    console.log(`✅ trial completed:`);
  } else if (ev.target.type === ActivityType.Survey) {
    console.log(`✅ survey response completed:`);
  }
  console.log("  newData: " + JSON.stringify(ev.newData));
  console.log("  newData schema: " + JSON.stringify(ev.newDataSchema));
  console.log("  data: " + JSON.stringify(ev.data));
  console.log("  data schema: " + JSON.stringify(ev.dataSchema));
  console.log(
    "  activity parameters: " + JSON.stringify(ev.activityConfiguration),
  );
  console.log(
    "  activity parameters schema: " +
      JSON.stringify(ev.activityConfigurationSchema),
  );
});

window.m2c2kitSession = session;
session.initialize();
