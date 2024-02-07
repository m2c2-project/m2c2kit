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
  test("throws error if m2c2kit-survey-div not found", async () => {
    const html = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
          <!-- <div id="m2c2kit-survey-div"></div> -->
          <div
            class="m2c2kit-full-viewport m2c2kit-flex-container"
            id="m2c2kit-container-div"
          >
          <canvas class="m2c2kit-full-viewport" id="m2c2kit-canvas"></canvas>
        </div>
      </body>
    </html>`;
    document.documentElement.innerHTML = html;
    await session.initialize();

    await expect(async () => {
      await session.start();
    }).rejects.toThrow();
  });

  test("starts the survey", async () => {
    const html = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
          <div id="m2c2kit-survey-div"></div>
          <div
            class="m2c2kit-full-viewport m2c2kit-flex-container"
            id="m2c2kit-container-div"
          >
          <canvas class="m2c2kit-full-viewport" id="m2c2kit-canvas"></canvas>
        </div>
      </body>
    </html>`;
    document.documentElement.innerHTML = html;
    await session.initialize();

    await expect(async () => {
      await session.start();
    }).not.toThrow();
  });
});
