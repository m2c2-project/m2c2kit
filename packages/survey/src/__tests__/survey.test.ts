import { Session, SessionOptions } from "@m2c2kit/core";
import { Survey } from "../../build-umd";

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
          type: "expression",
          name: "__welcome",
          title: "Welcome.",
        },
      ],
    },
  ],
};

describe("survey start", () => {
  beforeEach(() => {
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
