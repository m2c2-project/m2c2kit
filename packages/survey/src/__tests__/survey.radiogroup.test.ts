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
  name: "testing-survey radiogroup",
  confirmSkipping: false,
  pages: [
    {
      name: "page1",
      elements: [
        {
          type: "radiogroup",
          name: "where",
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

describe("radiogroup behavior", () => {
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

  test("adds skipped radiogroup variable as null to newData and Data on page change", async () => {
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
        expect.arrayContaining([{ name: "where", value: null }]),
      );
      expect(data.variables as Array<SurveyVariable>).toEqual(
        expect.arrayContaining([{ name: "where", value: null }]),
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

  test("changes radiogroup variable on selection", () => {
    // begins on page 1
    const surveyModel: SurveyReact.SurveyModel =
      s1["_survey"] ??
      (() => {
        throw new Error("surveyModel is nullish");
      })();
    TestHelpers.spyOnSurveyReactModel(surveyModel, onActivityResultsCallback);
    const responseIndex = s1["responseIndex"];

    surveyModel.setValue("where", 2);

    expect(s1["responseIndex"]).toBe(responseIndex + 1);
    function onActivityResultsCallback(
      newData: ActivityKeyValueData,
      data: ActivityKeyValueData,
    ) {
      expect(newData.variables as Array<SurveyVariable>).toEqual(
        expect.arrayContaining([{ name: "where", value: 2 }]),
      );
      expect(data.variables as Array<SurveyVariable>).toEqual(
        expect.arrayContaining([{ name: "where", value: 2 }]),
      );
    }
  });
});
