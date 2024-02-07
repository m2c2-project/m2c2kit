import { ActivityKeyValueData } from "@m2c2kit/core";
import { Session, SessionOptions } from "@m2c2kit/session";
import { Survey, SurveyVariable } from "..";
import { TestHelpers } from "./TestHelpers";
import * as SurveyReact from "survey-react";

TestHelpers.createM2c2KitMock();

let session: Session;
let s1: Survey;

const surveyJson = {
  title: "m2c2kit testing json",
  name: "testing-survey nouislider-m2c2",
  confirmSkipping: false,
  pages: [
    {
      name: "page1",
      elements: [
        {
          type: "nouislider-m2c2",
          name: "mood",
          title: "How is your overall MOOD?",
          rangeMin: 0,
          rangeMax: 100,
          pipsDensity: -1,
          showOnlyPipsWithPipsText: true,
          pipsText: [
            {
              value: 0,
              text: "Very Bad",
            },
            {
              value: 100,
              text: "Very Good",
            },
          ],
        },
      ],
    },
    {
      name: "page2",
      elements: [
        {
          type: "expression",
          name: "__welcome",
          title: "Welcome.",
        },
      ],
    },
  ],
};

describe("nouislider-m2c2 behavior", () => {
  beforeAll(async () => {
    TestHelpers.setupDomAndGlobals();
    s1 = new Survey(surveyJson);
    const options: SessionOptions = {
      activities: [s1],
    };
    session = new Session(options);
    await session.initialize();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("adds skipped nouislider-m2c2 variable as null to newData and Data on page change", async () => {
    // begins on page 1, goes to page 2
    const surveyModel: SurveyReact.SurveyModel =
      s1["_survey"] ??
      (() => {
        throw new Error("surveyModel is nullish");
      })();
    TestHelpers.spyOnSurveyReactModel(surveyModel, onActivityResultsCallback);
    const responseIndex = s1["responseIndex"];

    surveyModel.nextPage();

    expect(s1["responseIndex"]).toBe(responseIndex + 1);
    function onActivityResultsCallback(
      newData: ActivityKeyValueData,
      data: ActivityKeyValueData,
    ) {
      expect(newData.variables as Array<SurveyVariable>).toEqual(
        expect.arrayContaining([{ name: "mood", value: null }]),
      );
      expect(data.variables as Array<SurveyVariable>).toEqual(
        expect.arrayContaining([{ name: "mood", value: null }]),
      );
    }
  });

  test("does not call onActivityResultsCallback when skipping an already skipped variable on page change", () => {
    // begins on page 2, back to page 1, advances to page 2, back to page 1
    function onActivityResultsCallback() {
      return;
    }
    const surveyModel: SurveyReact.SurveyModel =
      s1["_survey"] ??
      (() => {
        throw new Error("surveyModel is nullish");
      })();
    TestHelpers.spyOnSurveyReactModel(surveyModel, onActivityResultsCallback);
    const responseIndex = s1["responseIndex"];

    surveyModel.prevPage(); // should not trigger onActivityResultsCallback (page 2 has no variables)
    surveyModel.nextPage(); // should not trigger onActivityResultsCallback (page 1 has been previously skipped)
    surveyModel.prevPage(); // should not trigger onActivityResultsCallback (page 2 has no variables)

    expect(TestHelpers.callOnActivityResultsCallbackSpy).not.toHaveBeenCalled();
    expect(s1["responseIndex"]).toBe(responseIndex);
  });

  test("changes nouislider-m2c2 variable on selection", () => {
    // begins on page 1
    const surveyModel: SurveyReact.SurveyModel =
      s1["_survey"] ??
      (() => {
        throw new Error("surveyModel is nullish");
      })();
    TestHelpers.spyOnSurveyReactModel(surveyModel, onActivityResultsCallback);
    const responseIndex = s1["responseIndex"];

    surveyModel.setValue("mood", 77);

    expect(s1["responseIndex"]).toBe(responseIndex + 1);
    function onActivityResultsCallback(
      newData: ActivityKeyValueData,
      data: ActivityKeyValueData,
    ) {
      expect(newData.variables as Array<SurveyVariable>).toEqual(
        expect.arrayContaining([{ name: "mood", value: 77 }]),
      );
      expect(data.variables as Array<SurveyVariable>).toEqual(
        expect.arrayContaining([{ name: "mood", value: 77 }]),
      );
    }
  });
});
