import { Session, SessionOptions } from "@m2c2kit/session";
import { Survey } from "..";
import { TestHelpers } from "./TestHelpers";

TestHelpers.createM2c2KitMock();

let session: Session;
let s1: Survey;

const surveyJson = {
  title: "m2c2kit testing json",
  name: "testing-survey survey",
  confirmSkipping: false,
  pages: [
    {
      name: "page1",
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

describe("survey start", () => {
  beforeEach(async () => {
    s1 = new Survey(surveyJson);

    const options: SessionOptions = {
      activities: [s1],
      autoStartAfterInit: false,
    };
    session = new Session(options);
  });

  // https://stackoverflow.com/a/69372861 for async test that expect toThrow
  test("starts the survey", async () => {
    TestHelpers.setupDomAndGlobals();

    await session.initialize();

    await expect(async () => {
      await session.start();
    }).not.toThrow();
  });
});
