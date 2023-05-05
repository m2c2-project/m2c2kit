/* eslint-disable @typescript-eslint/ban-ts-comment */
import noUiSlider from "nouislider";
import * as Survey from "survey-react";

export function initnouisliderm2c2() {
  const iconId = "icon-nouislider";
  //Survey.SvgRegistry && Survey.SvgRegistry.registerIconFromSvg(iconId, require('svg-inline-loader?classPrefix!./images/nouislider.svg'), "");
  const widget = {
    name: "nouislider-m2c2",
    title: "noUiSlider-m2c2",
    iconName: iconId,
    widgetIsLoaded: function () {
      return typeof noUiSlider != "undefined";
    },
    isFit: function (question: Survey.Question) {
      return question.getType() === "nouislider-m2c2";
    },
    htmlTemplate: "<div><div></div></div>",
    activatedByChanged: function (activatedBy: string) {
      Survey.JsonObject.metaData.addClass(
        "nouislider-m2c2",
        [],
        undefined,
        "empty"
      );
      Survey.JsonObject.metaData.addProperties("nouislider-m2c2", [
        {
          name: "step:number",
          category: "slider",
          categoryIndex: 1,
          default: 1,
        },
        {
          name: "rangeMin:number",
          category: "slider",
          default: 0,
        },
        {
          name: "rangeMax:number",
          category: "slider",
          default: 100,
        },
        {
          name: "pipsMode",
          category: "slider",
          default: "positions",
        },
        {
          name: "pipsValues:itemvalues",
          category: "slider",
          default: [0, 25, 50, 75, 100],
        },
        {
          name: "pipsText:itemvalues",
          category: "slider",
          default: [0, 25, 50, 75, 100],
        },
        {
          name: "showOnlyPipsWithPipsText:boolean",
          category: "slider",
          default: false,
        },
        {
          name: "pipsDensity:number",
          category: "slider",
          default: 5,
        },
        {
          name: "orientation",
          category: "slider",
          default: "horizontal",
          choices: ["horizontal", "vertical"],
        },
        {
          name: "direction:string",
          category: "slider",
          default: "ltr",
        },
        {
          name: "tooltips:boolean",
          category: "slider",
          default: true,
        },
      ]);
    },
    afterRender: function (question: any, el: any) {
      el.style.paddingBottom = "19px";
      el.style.paddingLeft = "20px";
      el.style.paddingRight = "20px";
      el.style.paddingTop = "44px";
      el = el.children[0];
      el.style.marginBottom = "60px";
      if (question.orientation === "vertical") {
        el.style.height = "250px";
        el.style.marginLeft = "60px";
      }
      const slider = noUiSlider.create(el, {
        start:
          question.rangeMin <= question.value &&
          question.value <= question.rangeMax
            ? question.value
            : (question.rangeMin + question.rangeMax) / 2,
        //connect: [true, false],
        step: question.step,
        // tooltips: question.tooltips,
        pips: {
          mode: question.pipsMode || "positions",
          filter: (value: any, type: any) => {
            if (question.showOnlyPipsWithPipsText) {
              const pipsProvidedValues = question.pipsText.map(
                (p: { value: string }) => p.value
              );
              if (pipsProvidedValues.includes(value)) {
                return 1;
              }
              return -1;
            } else {
              return type;
            }
          },
          values: question.pipsValues.map(function (pVal: any) {
            let pipValue = pVal;
            if (pVal.value !== undefined) {
              pipValue = pVal.value;
            }
            return parseInt(pipValue);
          }),
          density: question.pipsDensity || 5,
          format: {
            to: function (pVal) {
              let pipText = pVal;
              question.pipsText.map(function (el: any) {
                if (el.text !== undefined && pVal === el.value) {
                  pipText = el.text;
                }
              });
              return pipText;
            },
          },
        },
        range: {
          min: question.rangeMin,
          max: question.rangeMax,
        },
        orientation: question.orientation,
        direction: question.direction,
      });
      slider.on("change", function () {
        question.value = Number(slider.get());
      });
      question.updateSliderProperties = function () {
        const elems = document.getElementsByClassName("noUi-pips");
        // @ts-ignore
        if (elems.length > 0) elems[elems.length - 1].style.display = "none";
        // @ts-ignore
        if (elems.length > 1) elems[elems.length - 2].style.display = "none";
        const getStart = function (currentStart: any) {
          return (
            question.rangeMin +
            Math.round((currentStart - question.rangeMin) / question.step) *
              question.step
          );
        };
        slider.updateOptions(
          {
            step: question.step,
            start:
              question.rangeMin <= question.value &&
              question.value <= question.rangeMax
                ? getStart(question.value)
                : getStart((question.rangeMin + question.rangeMax) / 2),
            range: {
              min: question.rangeMin,
              max: question.rangeMax,
            },
          },
          true
        );
        // slider.pips(
        //   { mode: question.pipsMode || "positions",
        //     values: question.pipsValues.map(function (pVal: any) {
        //       let pipValue = pVal;
        //       if (pVal.value !== undefined) {
        //         pipValue = pVal.value;
        //       }
        //       return parseInt(pipValue);
        //     }),
        //     density: question.pipsDensity || 5,
        //     format: {
        //         to: function (pVal) {
        //           let pipText = pVal;
        //           question.pipsText.map(function (el: any) {
        //             if (el.text !== undefined && pVal === el.value) {
        //               pipText = el.text;
        //             }
        //           });
        //           return pipText;
        //       },
        //     },
        //   });
      };
      const updateValueHandler = function () {
        slider.set(question.value);
      };
      if (question.isReadOnly) {
        el.setAttribute("disabled", true);
      }
      updateValueHandler();
      question.noUiSlider = slider;
      question.registerFunctionOnPropertiesValueChanged(
        [
          "pipsValues",
          "step",
          "rangeMin",
          "rangeMax",
          "pipsMode",
          "pipsDensity",
        ],
        question.updateSliderProperties
      );
      question.valueChangedCallback = updateValueHandler;
      question.readOnlyChangedCallback = function () {
        if (question.isReadOnly) {
          el.setAttribute("disabled", true);
        } else {
          el.removeAttribute("disabled");
        }
      };
    },
    willUnmount: function (question: any, el: any) {
      // eslint-disable-next-line no-extra-boolean-cast
      if (!!question.noUiSlider) {
        question.noUiSlider.destroy();
        question.noUiSlider = null;
      }
      question.readOnlyChangedCallback = null;
      question.valueChangedCallback = null;

      if (!question.updateSliderProperties) return;
      question.unRegisterFunctionOnPropertiesValueChanged(
        [
          "pipsValues",
          "step",
          "rangeMin",
          "rangeMax",
          "pipsMode",
          "pipsDensity",
        ],
        question.updateSliderProperties
      );
      question.updateSliderProperties = undefined;
    },
    pdfRender: function (_: any, options: any) {
      if (options.question.getType() === "nouislider-m2c2") {
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
          options.question.value || options.question.defaultValue || "",
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
