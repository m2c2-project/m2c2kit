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
import * as SurveyKO from "survey-knockout";
import widgets from "surveyjs-widgets";
import select2 from "select2";
import "bootstrap-datepicker";
import "sortablejs";

/**
 * The structure of options object that is returned in SurveyJs callbacks.
 *
 * @remarks Note that the interface definition is not complete; different
 * SurveyJs callbacks have additional properties not listed below. Check
 * survey.ko.d.ts for more.
 */
interface SurveyJsOptions {
  name: string;
  question: SurveyKO.Question;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
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
  private _survey?: SurveyKO.Survey;

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
    // This modern theme doesn't seem as polished as
    // survey theme. It has some minor issues with margins and
    // the bootstrap-datepicker
    // SurveyKO.StylesManager.applyTheme("modern");
    SurveyKO.StylesManager.applyTheme("survey");

    // custom widgets need to be separately initialized by widget
    widgets.nouislider(SurveyKO);
    select2($);
    widgets.select2tagbox(SurveyKO, $);
    widgets.sortablejs(SurveyKO);
    widgets.bootstrapdatepicker(SurveyKO, $);

    this.survey = new SurveyKO.Survey(this._surveyJson);
    this.survey.focusFirstQuestionAutomatic = false;
    this.survey.completeText = "Next";
    // this hides the default surveyjs default completion html
    this.survey.completedHtml = `<html></html>`;

    /**
     * Next we hook into SurveyJS callbacks we are interested in. SurveyJS
     * has many callbacks, so there could be more functionalty we could tap
     * into.
     */

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.survey.onComplete.add(() => {
      if (this.session.options.activityCallbacks?.onActivityLifecycle) {
        this.session.options.activityCallbacks.onActivityLifecycle({
          type: EventType.ActivityEnd,
          target: this,
        });
      }
    });

    this.survey.onValueChanged.add(
      (sender: SurveyKO.Survey, options: SurveyJsOptions) => {
        /**
         * SurveyJS onValueChanged sends back 1) the just completed question
         * as a key-value pair in the options object, and 2) all the completed
         * questions as multiple key-value pairs in the sender.data object.
         * These match up with the types we need, newData and e.g., ActivityData.
         */
        if (this.session.options.activityCallbacks?.onActivityResults) {
          this.session.options.activityCallbacks.onActivityResults({
            type: EventType.ActivityData,
            target: this,
            newData: { [options.name]: options.value },
            newDataSchema: {},
            data: sender.data as unknown as ActivityKeyValueData,
            dataSchema: {},
            activityConfiguration: {},
            activityConfigurationSchema: {},
          });
        }
      }
    );

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
    this.survey.render("m2c2kit-survey-div");
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

  private get survey(): SurveyKO.Survey {
    if (!this._survey) {
      throw new Error("survey (SurveyKO.Survey) is undefined");
    }
    return this._survey;
  }

  private set survey(survey: SurveyKO.Survey) {
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
