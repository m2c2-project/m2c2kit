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
  name: "testing-survey radiogroup-completion",
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

describe.skip("radiogroup behavior on completion", () => {
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

  test("adds skipped radiogroup variable as null to newData and Data on survey completion", async () => {
    // begins on page 1, goes to page 2
    const surveyModel: SurveyReact.SurveyModel =
      s1["_survey"] ??
      (() => {
        throw new Error("surveyModel is nullish");
      })();
    TestHelpers.spyOnSurveyReactModel(surveyModel, onActivityResultsCallback);
    const responseIndex = s1["responseIndex"];

    surveyModel.completeLastPage();

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
});
