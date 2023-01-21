import { Session, SessionOptions, ActivityKeyValueData } from "@m2c2kit/core";
import { Survey, SurveyVariable } from "../../build-umd";
import { TestHelpers } from "./TestHelpers";
import * as SurveyReact from "survey-react";

let session: Session;
let s1: Survey;

const surveyJson = {
  title: "m2c2kit testing json",
  name: "testing-survey",
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
              name: "spousepartner",
            },
            {
              value: 2,
              text: "Your child(ren) or grandchild(ren)",
              name: "children",
            },
            {
              value: 3,
              text: "Other family member(s)",
              name: "otherfamily",
            },
            {
              value: 4,
              text: "Other people",
              name: "otherpeople",
            },
          ],
          hasNone: true,
          noneText: "Nobody",
          noneName: "nobody",
        },
      ],
    },
  ],
};

describe("checkbox behavior on survey completion, multiresponse", () => {
  beforeAll(() => {
    TestHelpers.setupDomAndGlobals();
    s1 = new Survey(surveyJson);
    const options: SessionOptions = {
      activities: [s1],
      canvasKitWasmUrl: "assets/canvaskit.wasm",
    };
    session = new Session(options);
    // note: we are not running await session.init() here because these survey
    // methods do not need our m2c2 DOM elements to test their functionality.
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("adds skipped multiresponse checkbox dummy variables as null to newData and Data on survey completion", async () => {
    // begins on page 1, goes to page 2
    await session.start();
    // _survey is private, so use bracket notation to access it
    const surveyModel: SurveyReact.SurveyModel = s1["_survey"];
    TestHelpers.spyOnSurveyReactModel(surveyModel, onActivityResultsCallback);
    const responseIndex = s1["responseIndex"];

    surveyModel.completeLastPage();

    expect(s1["responseIndex"]).toBe(responseIndex + 1);
    function onActivityResultsCallback(
      newData: ActivityKeyValueData,
      data: ActivityKeyValueData
    ) {
      expect(newData.variables as Array<SurveyVariable>).toEqual(
        expect.arrayContaining([
          { name: "who_spousepartner", value: null },
          { name: "who_children", value: null },
          { name: "who_otherfamily", value: null },
          { name: "who_otherpeople", value: null },
          { name: "who_nobody", value: null },
        ])
      );
      expect(data.variables as Array<SurveyVariable>).toEqual(
        expect.arrayContaining([
          { name: "who_spousepartner", value: null },
          { name: "who_children", value: null },
          { name: "who_otherfamily", value: null },
          { name: "who_otherpeople", value: null },
          { name: "who_nobody", value: null },
        ])
      );
    }
  });
});
