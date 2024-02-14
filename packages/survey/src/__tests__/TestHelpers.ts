/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ActivityKeyValueData } from "@m2c2kit/core";
import { Session } from "@m2c2kit/session";
import * as SurveyReact from "survey-react";
import {
  CompletingOptions,
  CurrentPageChangingOptions,
  Survey,
  ValueChangedOptions,
} from "..";
import { DomHelper } from "@m2c2kit/session";

export interface surveyJsCallbacks {
  onCurrentPageChangingCallback: (
    sender: SurveyReact.Model,
    options: CurrentPageChangingOptions,
  ) => void;
  onValueChangedCallback: (
    sender: SurveyReact.Model,
    options: ValueChangedOptions,
  ) => void;
  onCompletingCallback: (
    sender: SurveyReact.Model,
    options: CompletingOptions,
  ) => void;
}

export class TestHelpers {
  static setupDomAndGlobals(): void {
    const html = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
      <div id="m2c2kit">
      </div>
      </body>
    </html>`;
    document.documentElement.innerHTML = html;
    const root = document.getElementById("m2c2kit");
    if (!root) {
      throw new Error(`root element not found`);
    }
    DomHelper.createRoot(root);

    Object.defineProperty(window, "performance", {
      value: TestHelpers.performance,
    });
  }

  static perfCounter = 0;
  static requestedFrames = 0;
  static maxRequestedFrames = 0;

  static performance = {
    now: () => this.perfCounter,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static createM2c2KitMock(): any {
    const skiaCanvas = {
      save: () => undefined,
      scale: () => undefined,
      drawImage: () => undefined,
      drawCircle: () => undefined,
      drawRect: () => undefined,
      drawRRect: () => undefined,
      restore: () => undefined,
      drawText: () => undefined,
    };

    const requestAnimationFrame = (callback: (canvas: object) => void) => {
      this.perfCounter = this.perfCounter + 16.66666666666667;
      if (TestHelpers.requestedFrames < TestHelpers.maxRequestedFrames) {
        TestHelpers.requestedFrames++;
        callback(skiaCanvas);
      }
      return undefined;
    };

    // @ts-ignore
    Session.prototype.loadCanvasKit = jest.fn().mockReturnValue(
      Promise.resolve({
        PaintStyle: {
          Fill: undefined,
        },
        MakeCanvasSurface: () => {
          return {
            reportBackendTypeIsGPU: () => true,
            getCanvas: () => {
              return skiaCanvas;
            },
            makeImageSnapshot: () => {
              return {
                delete: () => undefined,
              };
            },
            requestAnimationFrame: (callback: (canvas: object) => void) => {
              return requestAnimationFrame(callback);
            },
            width: () => {
              return NaN;
            },
            height: () => {
              return NaN;
            },
          };
        },
        MakeWebGLCanvasSurface: () => {
          return {
            reportBackendTypeIsGPU: () => true,
            getCanvas: () => {
              return skiaCanvas;
            },
            makeImageSnapshot: () => {
              return {
                delete: () => undefined,
              };
            },
            requestAnimationFrame: (callback: (canvas: object) => void) => {
              return requestAnimationFrame(callback);
            },
            width: () => {
              return NaN;
            },
            height: () => {
              return NaN;
            },
          };
        },
        Font: function () {
          return {
            delete: () => undefined,
            isDeleted: () => undefined,
          };
        },
        Paint: function () {
          return {
            setColor: () => undefined,
            setAntiAlias: () => undefined,
            setStyle: () => undefined,
            setStrokeWidth: () => undefined,
            delete: () => undefined,
            isDeleted: () => undefined,
          };
        },
        Color: function () {
          return {};
        },
        LTRBRect: function () {
          return {};
        },
        RRectXY: function () {
          return {};
        },
      }),
    );
  }

  static callOnActivityResultsCallbackSpy?: jest.SpyInstance;

  static spyOnSurveyReactModel(
    surveyModel: SurveyReact.Model,
    onActivityResultsCallback: (
      newData: ActivityKeyValueData,
      data: ActivityKeyValueData,
    ) => void,
  ): void {
    this.callOnActivityResultsCallbackSpy = jest.spyOn(
      Survey.prototype,
      "callOnActivityResultsCallback",
    );
    this.callOnActivityResultsCallbackSpy.mockImplementation(
      (newData: ActivityKeyValueData, data: ActivityKeyValueData) => {
        onActivityResultsCallback(newData, data);
      },
    );

    jest
      // @ts-ignore
      .spyOn(Survey.prototype, "createSurveyReactModel")
      // @ts-ignore
      .mockImplementation(() => {
        return surveyModel;
      });
  }
}
