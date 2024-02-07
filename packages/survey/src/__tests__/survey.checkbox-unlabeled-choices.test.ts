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
  name: "testing-survey unlabeled-choices",
  confirmSkipping: false,
  pages: [
    {
      name: "page1",
      elements: [
        {
          type: "checkbox",
          name: "who",
          title: "Who is around you? (Please select all that apply.)",
          choices: [
            {
              value: 1,
              text: "Spouse/Partner",
            },
            {
              value: 2,
              text: "Your child(ren) or grandchild(ren)",
            },
            {
              value: 3,
              text: "Other family member(s)",
            },
            {
              value: 4,
              text: "Other people",
            },
          ],
          hasNone: true,
          noneText: "Nobody",
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

describe("checkbox behavior, multiresponse", () => {
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

  test("adds skipped multiresponse checkbox dummy variables as null to newData and Data on page change", async () => {
    // begins on page 1, goes to page 2
    // _survey is private, so use bracket notation to access it
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
        expect.arrayContaining([
          { name: "who_1", value: null },
          { name: "who_2", value: null },
          { name: "who_3", value: null },
          { name: "who_4", value: null },
          { name: "who_Nobody", value: null },
        ]),
      );
      expect(data.variables as Array<SurveyVariable>).toEqual(
        expect.arrayContaining([
          { name: "who_1", value: null },
          { name: "who_2", value: null },
          { name: "who_3", value: null },
          { name: "who_4", value: null },
          { name: "who_Nobody", value: null },
        ]),
      );
    }
  });

  test("does not call onActivityResultsCallback when skipping an already skipped variable on page change", () => {
    // begins on page 2, back to page 1, advances to page 2
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

    expect(TestHelpers.callOnActivityResultsCallbackSpy).not.toHaveBeenCalled();
    expect(s1["responseIndex"]).toBe(responseIndex);
  });

  test("adds all multiresponse checkbox dummy variables to newData and Data when answering a previously skipped question", () => {
    // begins on page 2, back to page 1
    const surveyModel: SurveyReact.SurveyModel =
      s1["_survey"] ??
      (() => {
        throw new Error("surveyModel is nullish");
      })();
    TestHelpers.spyOnSurveyReactModel(surveyModel, onActivityResultsCallback);
    const responseIndex = s1["responseIndex"];
    surveyModel.prevPage();

    surveyModel.setValue("who", [1]);

    expect(s1["responseIndex"]).toBe(responseIndex + 1);
    function onActivityResultsCallback(
      newData: ActivityKeyValueData,
      data: ActivityKeyValueData,
    ) {
      expect(newData.variables as Array<SurveyVariable>).toEqual(
        expect.arrayContaining([
          { name: "who_1", value: 1 },
          { name: "who_2", value: 0 },
          { name: "who_3", value: 0 },
          { name: "who_4", value: 0 },
          { name: "who_Nobody", value: 0 },
        ]),
      );
      expect(data.variables as Array<SurveyVariable>).toEqual(
        expect.arrayContaining([
          { name: "who_1", value: 1 },
          { name: "who_2", value: 0 },
          { name: "who_3", value: 0 },
          { name: "who_4", value: 0 },
          { name: "who_Nobody", value: 0 },
        ]),
      );
    }
  });

  test("adds only changed multiresponse checkbox dummy variables to newData on next selection", () => {
    // begins on page 1
    const surveyModel: SurveyReact.SurveyModel =
      s1["_survey"] ??
      (() => {
        throw new Error("surveyModel is nullish");
      })();
    TestHelpers.spyOnSurveyReactModel(surveyModel, onActivityResultsCallback);
    const responseIndex = s1["responseIndex"];

    surveyModel.setValue("who", [1, 3]);

    expect(s1["responseIndex"]).toBe(responseIndex + 1);
    function onActivityResultsCallback(
      newData: ActivityKeyValueData,
      data: ActivityKeyValueData,
    ) {
      expect(newData.variables as Array<SurveyVariable>).toEqual(
        expect.arrayContaining([{ name: "who_3", value: 1 }]),
      );
      expect(data.variables as Array<SurveyVariable>).toEqual(
        expect.arrayContaining([
          { name: "who_1", value: 1 },
          { name: "who_2", value: 0 },
          { name: "who_3", value: 1 },
          { name: "who_4", value: 0 },
          { name: "who_Nobody", value: 0 },
        ]),
      );
    }
  });

  test("adds all multiresponse checkbox dummy variables as null to newData and Data on clearing selections", () => {
    // begins on page 1
    const surveyModel: SurveyReact.SurveyModel =
      s1["_survey"] ??
      (() => {
        throw new Error("surveyModel is nullish");
      })();
    TestHelpers.spyOnSurveyReactModel(surveyModel, onActivityResultsCallback);
    const responseIndex = s1["responseIndex"];

    surveyModel.setValue("who", []);

    expect(s1["responseIndex"]).toBe(responseIndex + 1);
    function onActivityResultsCallback(
      newData: ActivityKeyValueData,
      data: ActivityKeyValueData,
    ) {
      expect(newData.variables as Array<SurveyVariable>).toEqual(
        expect.arrayContaining([
          { name: "who_1", value: null },
          { name: "who_2", value: null },
          { name: "who_3", value: null },
          { name: "who_4", value: null },
          { name: "who_Nobody", value: null },
        ]),
      );
      expect(data.variables as Array<SurveyVariable>).toEqual(
        expect.arrayContaining([
          { name: "who_1", value: null },
          { name: "who_2", value: null },
          { name: "who_3", value: null },
          { name: "who_4", value: null },
          { name: "who_Nobody", value: null },
        ]),
      );
    }
  });

  test("adds none multiresponse checkbox selection and removes other existing selections on selecting none option", () => {
    // begins on page 1
    const surveyModel: SurveyReact.SurveyModel =
      s1["_survey"] ??
      (() => {
        throw new Error("surveyModel is nullish");
      })();
    TestHelpers.spyOnSurveyReactModel(surveyModel, () => {
      return;
    });
    surveyModel.setValue("who", [2, 3]);
    TestHelpers.spyOnSurveyReactModel(surveyModel, onActivityResultsCallback);
    const responseIndex = s1["responseIndex"];

    surveyModel.setValue("who", ["none"]);

    expect(s1["responseIndex"]).toBe(responseIndex + 1);
    function onActivityResultsCallback(
      newData: ActivityKeyValueData,
      data: ActivityKeyValueData,
    ) {
      expect(newData.variables as Array<SurveyVariable>).toEqual(
        expect.arrayContaining([
          { name: "who_2", value: 0 },
          { name: "who_3", value: 0 },
          { name: "who_Nobody", value: 1 },
        ]),
      );
      expect(data.variables as Array<SurveyVariable>).toEqual(
        expect.arrayContaining([
          { name: "who_1", value: 0 },
          { name: "who_2", value: 0 },
          { name: "who_3", value: 0 },
          { name: "who_4", value: 0 },
          { name: "who_Nobody", value: 1 },
        ]),
      );
    }
  });
});
