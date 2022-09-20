/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Session, SessionOptions, ActivityKeyValueData } from "@m2c2kit/core";
import { Survey } from "../../build-umd";
import { surveyJsCallbacks, TestHelpers } from "./TestHelpers";

let session: Session;
let s1: Survey;
const callbacks: surveyJsCallbacks = {
  onCurrentPageChangingCallback: function (): void {
    throw new Error("Function not implemented.");
  },
  onValueChangedCallback: function (): void {
    throw new Error("Function not implemented.");
  },
  onCompletingCallback: function (): void {
    throw new Error("Function not implemented.");
  },
};

describe("survey start", () => {
  beforeEach(() => {
    const surveyJson = {
      title: "m2c2kit demo survey",
      name: "demo-survey",
      showNavigationButtons: "top",
      confirmSkipping: false,
      pages: [
        {
          name: "page1",
          elements: [
            {
              type: "expression",
              name: "__welcome",
              title: "This is an example welcome screen.",
            },
          ],
        },
      ],
    };

    s1 = new Survey(surveyJson);

    const options: SessionOptions = {
      activities: [s1],
      canvasKitWasmUrl: "assets/canvaskit.wasm",
    };
    session = new Session(options);
  });

  test("throws error if m2c2kit-survey-div not found", () => {
    const html = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
          <canvas style="height: 100vh; width: 100vw"></canvas>
      </body>
    </html>`;
    document.documentElement.innerHTML = html;

    expect(() => {
      session.start();
    }).toThrow();
  });

  test("starts the survey", () => {
    const html = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
          <div id="m2c2kit-survey-div"></div>         
          <canvas style="height: 100vh; width: 100vw"></canvas>
      </body>
    </html>`;
    document.documentElement.innerHTML = html;

    expect(() => {
      session.start();
    }).not.toThrow();
  });
});

describe("surveyjs callbacks", () => {
  beforeEach(() => {
    const surveyJson = {
      title: "m2c2kit demo survey",
      name: "demo-survey",
      confirmSkipping: false,
      pages: [
        {
          name: "page1",
          elements: [
            {
              type: "expression",
              name: "__welcome",
              title: "This is an example welcome screen.",
            },
          ],
        },
      ],
    };

    s1 = new Survey(surveyJson);

    const options: SessionOptions = {
      activities: [s1],
      canvasKitWasmUrl: "assets/canvaskit.wasm",
    };
    session = new Session(options);
    TestHelpers.setupDomAndGlobals();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("adds newly skipped variable to newData and Data on page change", () => {
    TestHelpers.spyOnSurveyReactModel(onActivityResultsCallback, callbacks);
    session.start();
    const sender = {
      data: {
        income: 55000,
      },
    };
    const options = {
      oldCurrentPage: {
        elements: [
          {
            name: "age",
            value: undefined,
          },
        ],
      },
    };

    // @ts-ignore
    callbacks.onCurrentPageChangingCallback(sender, options);

    function onActivityResultsCallback(
      newData: ActivityKeyValueData,
      data: ActivityKeyValueData
    ) {
      expect(newData.variables as Array<any>).toEqual(
        expect.arrayContaining([{ name: "age", value: null }])
      );
      expect(data.variables as Array<any>).toEqual(
        expect.arrayContaining([
          { name: "age", value: null },
          { name: "income", value: 55000 },
        ])
      );
    }
  });

  test("does not call onActivityResultsCallback when skipping an already skipped variable on page change", () => {
    function onActivityResultsCallback() {
      return;
    }
    TestHelpers.spyOnSurveyReactModel(onActivityResultsCallback, callbacks);
    session.start();
    const sender = {
      data: {
        income: 55000,
      },
    };
    const options = {
      oldCurrentPage: {
        elements: [
          {
            name: "age",
            value: undefined,
          },
        ],
      },
    };
    // @ts-ignore
    s1.skippedElements.push("age");

    // @ts-ignore
    callbacks.onCurrentPageChangingCallback(sender, options);

    expect(TestHelpers.callOnActivityResultsCallbackSpy).not.toHaveBeenCalled();
  });

  test("does not increase response index when skipping an already skipped variable on page change", () => {
    function onActivityResultsCallback() {
      return;
    }
    TestHelpers.spyOnSurveyReactModel(onActivityResultsCallback, callbacks);
    session.start();
    const sender = {
      data: {
        income: 55000,
      },
    };
    const options = {
      oldCurrentPage: {
        elements: [
          {
            name: "age",
            value: undefined,
          },
        ],
      },
    };
    // @ts-ignore
    s1.skippedElements.push("age");
    // @ts-ignore
    const responseIndex = s1.responseIndex;

    // @ts-ignore
    callbacks.onCurrentPageChangingCallback(sender, options);

    // @ts-ignore
    expect(s1.responseIndex).toBe(responseIndex);
  });

  test("does not call onActivityResultsCallback when skipping an already skipped variable on completion", () => {
    function onActivityResultsCallback() {
      return;
    }
    TestHelpers.spyOnSurveyReactModel(onActivityResultsCallback, callbacks);
    session.start();
    const sender = {
      data: {
        income: 55000,
      },
      currentPage: {
        elements: [{ name: "age", value: undefined }],
      },
    };
    const options = {
      allowComplete: false,
    };
    // @ts-ignore
    s1.skippedElements.push("age");

    // @ts-ignore
    callbacks.onCompletingCallback(sender, options);

    expect(TestHelpers.callOnActivityResultsCallbackSpy).not.toHaveBeenCalled();
  });

  test("does not increase response index when skipping an already skipped variable on completion", () => {
    function onActivityResultsCallback() {
      return;
    }
    TestHelpers.spyOnSurveyReactModel(onActivityResultsCallback, callbacks);
    session.start();
    const sender = {
      data: {
        income: 55000,
      },
      currentPage: {
        elements: [{ name: "age", value: undefined }],
      },
    };
    const options = {
      allowComplete: false,
    };
    // @ts-ignore
    s1.skippedElements.push("age");
    // @ts-ignore
    const responseIndex = s1.responseIndex;

    // @ts-ignore
    callbacks.onCompletingCallback(sender, options);

    // @ts-ignore
    expect(s1.responseIndex).toBe(responseIndex);
  });

  test("increases response index after skipping new variable on page change", () => {
    function onActivityResultsCallback() {
      return;
    }
    TestHelpers.spyOnSurveyReactModel(onActivityResultsCallback, callbacks);
    session.start();
    const sender = {
      data: {
        income: 55000,
      },
    };
    const options = {
      oldCurrentPage: {
        elements: [
          {
            name: "age",
            value: undefined,
          },
        ],
      },
    };
    // @ts-ignore
    const responseIndex = s1.responseIndex;

    // @ts-ignore
    callbacks.onCurrentPageChangingCallback(sender, options);

    // @ts-ignore
    expect(s1.responseIndex).toBe(responseIndex + 1);
  });

  test("adds newly skipped variable to newData and Data on completion", () => {
    TestHelpers.spyOnSurveyReactModel(onActivityResultsCallback, callbacks);
    session.start();
    const sender = {
      data: {
        income: 55000,
      },
      currentPage: {
        elements: [{ name: "age", value: undefined }],
      },
    };
    const options = {
      allowComplete: false,
    };

    // @ts-ignore
    callbacks.onCompletingCallback(sender, options);

    function onActivityResultsCallback(
      newData: ActivityKeyValueData,
      data: ActivityKeyValueData
    ) {
      expect(newData.variables as Array<any>).toEqual(
        expect.arrayContaining([{ name: "age", value: null }])
      );
      expect(data.variables as Array<any>).toEqual(
        expect.arrayContaining([
          { name: "age", value: null },
          { name: "income", value: 55000 },
        ])
      );
    }
  });

  test("increases response index after skipping new variable on completion", () => {
    function onActivityResultsCallback() {
      return;
    }
    TestHelpers.spyOnSurveyReactModel(onActivityResultsCallback, callbacks);
    session.start();
    const sender = {
      data: {
        income: 55000,
      },
      currentPage: {
        elements: [{ name: "age", value: undefined }],
      },
    };
    const options = {
      allowComplete: false,
    };
    // @ts-ignore
    const responseIndex = s1.responseIndex;

    // @ts-ignore
    callbacks.onCompletingCallback(sender, options);

    // @ts-ignore
    expect(s1.responseIndex).toBe(responseIndex + 1);
  });

  test("adds newly answered single value variable to newData and Data on value change", () => {
    TestHelpers.spyOnSurveyReactModel(onActivityResultsCallback, callbacks);
    session.start();
    const sender = {
      data: {
        income: 55000,
        age: 42,
      },
    };
    const options = {
      name: "age",
      value: 42,
    };

    // @ts-ignore
    callbacks.onValueChangedCallback(sender, options);

    function onActivityResultsCallback(
      newData: ActivityKeyValueData,
      data: ActivityKeyValueData
    ) {
      expect(newData.variables as Array<any>).toEqual(
        expect.arrayContaining([{ name: "age", value: 42 }])
      );
      expect(data.variables as Array<any>).toEqual(
        expect.arrayContaining([
          { name: "age", value: 42 },
          { name: "income", value: 55000 },
        ])
      );
    }
  });

  test("adds newly answered multiple value variable to newData and Data on value change", () => {
    TestHelpers.spyOnSurveyReactModel(onActivityResultsCallback, callbacks);
    session.start();
    const sender = {
      data: {
        income: 55000,
        age: 42,
        reasons: [1, 2, 3],
      },
    };
    const options = {
      name: "reasons",
      value: [1, 2, 3],
    };

    // @ts-ignore
    callbacks.onValueChangedCallback(sender, options);

    function onActivityResultsCallback(
      newData: ActivityKeyValueData,
      data: ActivityKeyValueData
    ) {
      expect(newData.variables as Array<any>).toEqual(
        expect.arrayContaining([{ name: "reasons", value: [1, 2, 3] }])
      );
      expect(data.variables as Array<any>).toEqual(
        expect.arrayContaining([
          { name: "reasons", value: [1, 2, 3] },
          { name: "age", value: 42 },
          { name: "income", value: 55000 },
        ])
      );
    }
  });

  test("adds newly unaswered multiple value variable to newData and Data on value change", () => {
    TestHelpers.spyOnSurveyReactModel(onActivityResultsCallback, callbacks);
    session.start();
    const sender = {
      data: {
        income: 55000,
      },
    };
    const options = {
      name: "age",
      value: [],
    };

    // @ts-ignore
    callbacks.onValueChangedCallback(sender, options);

    function onActivityResultsCallback(
      newData: ActivityKeyValueData,
      data: ActivityKeyValueData
    ) {
      expect(newData.variables as Array<any>).toEqual(
        expect.arrayContaining([{ name: "age", value: null }])
      );
      expect(data.variables as Array<any>).toEqual(
        expect.arrayContaining([
          { name: "age", value: null },
          { name: "income", value: 55000 },
        ])
      );
    }
  });
});
