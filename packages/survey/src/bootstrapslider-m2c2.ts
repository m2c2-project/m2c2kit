import Slider from "bootstrap-slider";
import * as Survey from "survey-react";
import { SliderOptions } from "./boostrapslider-types";

class bootstrapsliderQuestion extends Survey.Question {
  rangeMin?: number;
  rangeMax?: number;
  step?: number;
  orientation?: string;
  ticks?: number[];
  ticks_labels?: string[];
  initialValue?: number | number[];
  config?: SliderOptions;
  enabled?: boolean;
  bootstrapSlider?: Slider | null;
}

export function initbootstrapsliderm2c2() {
  const widget = {
    name: "bootstrapslider-m2c2",
    title: "Bootstrap Slider-m2c2",
    iconName: "icon-bootstrap-slider",
    widgetIsLoaded: function () {
      return typeof Slider !== "undefined";
    },
    isFit: function (question: Survey.Question) {
      return question.getType() === "bootstrapslider-m2c2";
    },
    htmlTemplate: "<div></div>",
    activatedByChanged: function (activatedBy: string) {
      Survey.JsonObject.metaData.addClass(
        "bootstrapslider-m2c2",
        [],
        undefined,
        "empty"
      );
      Survey.JsonObject.metaData.addProperties("bootstrapslider-m2c2", [
        {
          name: "step:number",
          default: 1,
          category: "general",
        },
        {
          name: "rangeMin:number",
          default: 0,
          category: "general",
        },
        {
          name: "rangeMax:number",
          default: 100,
          category: "general",
        },
        {
          name: "ticks:number[]",
          default: undefined,
          category: "general",
        },
        {
          name: "ticks_labels:string[]",
          default: undefined,
          category: "general",
        },
        {
          name: "initialValue:number|number[]",
          default: 0,
          category: "general",
        },
        {
          name: "orientation",
          default: "horizontal",
          choices: ["horizontal", "vertical"],
          category: "general",
        },
      ]);
      Survey.JsonObject.metaData.addProperty("bootstrapslider-m2c2", {
        name: "config",
        default: null,
        category: "general",
      });
    },
    afterRender: function (question: bootstrapsliderQuestion, el: HTMLElement) {
      el.style.paddingTop = "20px";
      el.style.paddingBottom = "17px";
      el.style.paddingLeft = "10px";
      const inputEl = document.createElement("input");
      inputEl.id = question.id;
      inputEl.type = "text";
      inputEl.setAttribute("data-slider-id", question.name + "_" + question.id);
      inputEl.setAttribute("data-slider-min", String(question.rangeMin));
      inputEl.setAttribute("data-slider-max", String(question.rangeMax));
      inputEl.setAttribute("data-slider-step", String(question.step));
      if (question.orientation == "vertical") {
        inputEl.setAttribute("data-slider-orientation", "vertical");
      }
      inputEl.setAttribute("data-slider-step", String(question.step));
      if (question.ticks) {
        inputEl.setAttribute(
          "data-slider-ticks",
          "[" + String(question.ticks) + "]"
        );
      }
      //   inputEl.setAttribute(
      //     "data-slider-value",
      //     question.value || question.rangeMin
      //   );
      inputEl.setAttribute(
        "data-slider-value",
        question.value || question.initialValue
      );
      el.appendChild(inputEl);

      const config = question.config || {};

      if (config.id === undefined) {
        config.id = question.name + "_" + question.id;
      }

      if (config.min === undefined) {
        config.min = question.rangeMin;
      }

      if (config.max === undefined) {
        config.max = question.rangeMax;
      }

      if (config.step === undefined) {
        config.step = question.step;
      }

      if (config.ticks === undefined) {
        config.ticks = question.ticks;
      }

      if (config.enabled === undefined) {
        config.enabled = !question.isReadOnly;
      }

      if (config.value === undefined) {
        config.value = question.value || question.initialValue;
      }

      const slider = new Slider(inputEl, config);

      slider.on("change", function (valueObj: any) {
        question.value = slider.getValue();
      });
      const updateValueHandler = function () {
        slider.setValue(question.value || question.rangeMin);
      };
      question.readOnlyChangedCallback = function () {
        if (question.isReadOnly) {
          slider.disable();
        } else {
          slider.enable();
        }
      };
      question.bootstrapSlider = slider;
      question.valueChangedCallback = updateValueHandler;
    },
    willUnmount: function (question: bootstrapsliderQuestion, el: HTMLElement) {
      question.bootstrapSlider && question.bootstrapSlider.destroy();
      question.bootstrapSlider = null;
      question.readOnlyChangedCallback = null;
    },
    pdfRender: function (_: any, options: any) {
      if (options.question.getType() === "bootstrapslider-m2c2") {
        const point = options.module.SurveyHelper.createPoint(
          options.module.SurveyHelper.mergeRects.apply(null, options.bricks)
        );
        point.xLeft += options.controller.unitWidth;
        point.yTop +=
          options.controller.unitHeight *
          options.module.FlatQuestion.CONTENT_GAP_VERT_SCALE;
        const rect = options.module.SurveyHelper.createTextFieldRect(
          point,
          options.controller
        );
        const textboxBrick = new options.module.TextFieldBrick(
          options.question,
          options.controller,
          rect,
          true,
          options.question.id,
          (
            options.question.value ||
            options.question.defaultValue ||
            ""
          ).toString(),
          "",
          options.question.isReadOnly,
          false,
          "text"
        );
        options.bricks.push(textboxBrick);
      }
    },
  };

  Survey.CustomWidgetCollection.Instance.addCustomWidget(widget, "customtype");
}
