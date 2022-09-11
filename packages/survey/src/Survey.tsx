import {
  Session,
  Uuid,
  Activity,
  ActivityKeyValueData,
  ActivityType,
  EventType,
  Timer,
} from "@m2c2kit/core";
import $ from "jquery";
import * as SurveyReact from "survey-react";
import { createRoot } from "react-dom/client";
import widgets from "surveyjs-widgets";
import select2 from "select2";
import "bootstrap-datepicker";
import "sortablejs";
import "bootstrap-slider";
import initbootstrapsliderm2c2 from "./bootstrapslider-m2c2";
import initnouisliderm2c2 from "./nouislider-m2c2";
import { IElement, ISurveyElement, IQuestion } from "survey-react";

/**
 * The structure of options object that is returned in SurveyJs
 * onValueChanged event
 */
interface ValueChangedOptions {
  name: string;
  question: SurveyReact.Question;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}

/**
 * The structure of options object that is returned in SurveyJs
 * onCurrentPageChanging event
 */
interface OnCurrentPageChangingOptions {
  oldCurrentPage: SurveyReact.PageModel;
  newCurrentPage: SurveyReact.PageModel;
  allowChanging: boolean;
  isNextPage: boolean;
  isPrevPage: boolean;
}

/**
 * Definition of object to hold names of elements that have been
 * skipped by the participant.
 */
interface SkippedElements {
  [key: string]: null;
}

/**
 * The class for presenting surveys.
 *
 * @remarks There should not be any need to extend this class.
 *
 * @param surveyJson - The JSON survey definition, following the SurveyJS
 * specifications
 */
export class Survey implements Activity {
  readonly type = ActivityType.Survey;
  private _session?: Session;
  name: string;
  uuid = Uuid.generate();
  private _surveyJson?: unknown;
  beginTimestamp = NaN;
  beginIso8601Timestamp = "";
  private _survey?: SurveyReact.Model;

  private skippedElements: SkippedElements = {};

  constructor(surveyJson?: unknown) {
    this._surveyJson = surveyJson;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.name = (surveyJson as any)?.name ?? "unnamed survey";
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  init() {}

  /**
   * Sets the JSON survey definition, if it was not already set in
   * the constructor.
   *
   * @param surveyJson - The JSON survey definition, following the SurveyJS
   * specifications
   */
  setParameters(surveyJson: unknown): void {
    this._surveyJson = surveyJson;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.name = (surveyJson as any)?.name ?? "unnamed survey";
  }

  start(): void {
    this.beginTimestamp = Timer.now();
    this.beginIso8601Timestamp = new Date().toISOString();
    // SurveyReact.StylesManager.applyTheme("modern");
    SurveyReact.StylesManager.applyTheme("defaultV2");

    // custom widgets need to be separately initialized by widget
    //widgets.nouislider(SurveyReact);
    select2($);
    widgets.select2tagbox(SurveyReact, $);
    widgets.sortablejs(SurveyReact);
    widgets.bootstrapdatepicker(SurveyReact, $);
    //widgets.bootstrapslider(SurveyReact);
    initbootstrapsliderm2c2();
    initnouisliderm2c2();

    this.survey = new SurveyReact.Model(this._surveyJson);
    this.survey.focusFirstQuestionAutomatic = false;
    // this.survey.completeText = "Next";
    // this hides the default surveyjs default completion html
    this.survey.completedHtml = `<html></html>`;

    /**
     * Next we hook into SurveyJS callbacks we are interested in. SurveyJS
     * has many callbacks, so there could be more functionalty we could tap
     * into.
     */

    /**
     * SurveyJS raises a value changed event only when an element receives
     * user interaction. Non-required elements that are skipped will not
     * raise events. Thus, to record skippped elements, we hook into an
     * event when the page is about to change. We look at all the elements
     * on the page, find elements whose values are undefined, and add these
     * to our object of skipped elemements.
     *
     * With this change, every elements will generate "data" if they are
     * skipped. To create elements that are simply informational pages
     * that should not collect data (variables), give them a name that
     * starts with "__" (two underscores). These elements can be skipped
     * and they will not generate m2c2kig events.
     */
    this.survey.onCurrentPageChanging.add(
      (sender: SurveyReact.Model, options: OnCurrentPageChangingOptions) => {
        const newSkippedElements: { [key: string]: null } = {};
        const elements = options.oldCurrentPage.elements as Array<IElement>;
        elements
          .map((e) => e as unknown as ISurveyElement & IQuestion)
          .forEach((e) => {
            if (
              typeof e.name === "string" &&
              typeof e.value !== undefined &&
              !e.name.startsWith("__")
            ) {
              if (
                e.value === undefined &&
                !this.skippedElementsContainsElementName(e.name)
              ) {
                this.addElementNameTopSkippedElements(e.name);
                newSkippedElements[e.name] = null;
              }

              // element might be a checkbox with nothing checked
              if (
                Array.isArray(e.value) &&
                e.value.length === 0 &&
                !this.skippedElementsContainsElementName(e.name)
              ) {
                this.addElementNameTopSkippedElements(e.name);
                newSkippedElements[e.name] = null;
              }
            }
          });

        if (Object.keys(newSkippedElements).length > 0) {
          if (this.session.options.activityCallbacks?.onActivityResults) {
            this.session.options.activityCallbacks.onActivityResults({
              type: EventType.ActivityData,
              target: this,
              newData: newSkippedElements,
              newDataSchema: {},
              data: this.addSkippedElementsToData(
                sender.data,
                this.skippedElements
              ),
              dataSchema: {},
              activityConfiguration: {},
              activityConfigurationSchema: {},
            });
          }
        }
      }
    );

    /**
     * When a value has changed, raise an ActivityData event
     */
    this.survey.onValueChanged.add(
      (sender: SurveyReact.Model, options: ValueChangedOptions) => {
        /**
         * SurveyJS onValueChanged sends back 1) the just completed question
         * as a key-value pair in the options object, and 2) all the completed
         * questions as multiple key-value pairs in the sender.data object.
         * These match up with the types we need, newData and e.g., ActivityData.
         */

        const newData = { [options.name]: options.value };

        /**
         * User may have answered an element that was previously skipped; no
         * longer consider this element as skipped.
         */
        if (
          (!Array.isArray(options.value) && options.value !== undefined) ||
          (Array.isArray(options.value) && options.value.length !== 0)
        ) {
          this.removeElementNameFromSkippedElements(options.name);
        }
        /**
         * Conversely, see if they removed a value (eg, unselected a checkbox)
         * and created a new skipped element. We will return an
         * empty array as null, not []
         */
        if (Array.isArray(options.value) && options.value.length === 0) {
          this.addElementNameTopSkippedElements(options.name);
          newData[options.name] = null;
        }

        if (this.session.options.activityCallbacks?.onActivityResults) {
          this.session.options.activityCallbacks.onActivityResults({
            type: EventType.ActivityData,
            target: this,
            newData: newData,
            newDataSchema: {},
            data: this.addSkippedElementsToData(
              sender.data,
              this.skippedElements
            ),
            dataSchema: {},
            activityConfiguration: {},
            activityConfigurationSchema: {},
          });
        }
      }
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.survey.onComplete.add(() => {
      if (this.session.options.activityCallbacks?.onActivityLifecycle) {
        this.session.options.activityCallbacks.onActivityLifecycle({
          type: EventType.ActivityEnd,
          target: this,
        });
      }
    });

    if (this.session.options.activityCallbacks?.onActivityLifecycle) {
      this.session.options.activityCallbacks.onActivityLifecycle({
        type: EventType.ActivityStart,
        target: this,
      });
    }

    const surveyDiv = document.getElementById("m2c2kit-survey-div");
    if (!surveyDiv) {
      throw new Error(
        "m2c2kit-survey-div not found in DOM. cannot start survey."
      );
    }
    //this.survey.render("m2c2kit-survey-div");
    // const rootElement = document.getElementById("m2c2kit-survey-div");
    // if (!rootElement) {
    //   throw new Error("");
    // }
    const root = createRoot(surveyDiv);
    root.render(<SurveyReact.Survey model={this.survey} />);
  }

  stop(): void {
    /**
     * According to the docs, https://surveyjs.io/Documentation/Library?id=surveymodel#dispose,
     * we should call dispose(). But this is throwing an error messsage in the
     * console. This doesn't seem to have any effect on later activities
     * (m2c2kit games or surveys), but to be safe, we will not call dispose().
     * However, keep this issue in mind in case of memory leaks.
     */
    // this.survey.dispose();
  }

  private removeElementNameFromSkippedElements(elementName: string): void {
    if (elementName in this.skippedElements) {
      delete this.skippedElements[elementName];
    }
  }

  private addElementNameTopSkippedElements(elementName: string): void {
    this.skippedElements[elementName] = null;
  }

  private skippedElementsContainsElementName(elementName: string): boolean {
    return elementName in this.skippedElements;
  }

  private addSkippedElementsToData(
    data: ActivityKeyValueData,
    skippedElements: SkippedElements
  ): ActivityKeyValueData {
    return {
      ...skippedElements,
      ...data,
    };
  }

  /**
   * Returns the session that contains this survey.
   */
  get session(): Session {
    if (!this._session) {
      throw new Error("session is undefined");
    }
    return this._session;
  }

  /**
   * Sets the session that contains this survey.
   */
  set session(session: Session) {
    this._session = session;
  }

  private get survey(): SurveyReact.Model {
    if (!this._survey) {
      throw new Error("survey (SurveyReact.Model) is undefined");
    }
    return this._survey;
  }

  private set survey(survey: SurveyReact.Model) {
    this._survey = survey;
  }

  /**
   * DO NOT USE THIS METHOD.
   *
   * @remarks For some reason, rollup-plugin-dts is dropping the
   * ActivityType enum. This is a workaround to get it back.
   *
   * @param __y
   */
  __x(__y: ActivityType): void {
    if (__y === ActivityType.Survey) {
      console.log("");
    }
  }
}
