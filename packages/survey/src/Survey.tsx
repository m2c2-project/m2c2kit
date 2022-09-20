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
import { ValueChangedOptions } from "./ValueChangedOptions";
import { CurrentPageChangingOptions } from "./CurrentPageChangingOptions";
import { CompletingOptions } from "./CompletingOptions";
import { AutomaticSurveyDataProperties } from "./AutomaticSurveyDataProperties";
import { SurveyVariable } from "./SurveyVariable";

const CONFIRM_SKIP_TEXT = "Are you sure you want to skip these questions?";

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
  name = "unnamed survey";
  id = "survey";
  uuid = Uuid.generate();
  private _surveyJson?: unknown;
  beginTimestamp = NaN;
  beginIso8601Timestamp = "";
  private _survey?: SurveyReact.Model;
  private responseIndex = 0;
  private skippedElements = new Array<string>();
  private confirmSkipping = false;

  constructor(surveyJson?: unknown) {
    if (surveyJson) {
      this.setParameters(surveyJson);
    }
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.id = (surveyJson as any)?.id ?? (surveyJson as any)?.name ?? "survey";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((surveyJson as any)?.confirmSkipping !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.confirmSkipping = (surveyJson as any)?.confirmSkipping;
    }
  }

  start(): void {
    this.beginTimestamp = Timer.now();
    this.beginIso8601Timestamp = new Date().toISOString();
    this.logConfigurationWarnings();

    SurveyReact.StylesManager.applyTheme("defaultV2");
    this.initializeCustomWidgets();
    this.survey = this.createSurveyReactModel(this._surveyJson);

    this.modifyDefaultSurveyJsConfiguration();
    this.addSurveyJsEventCallbacks();
    this.addM2c2kitEventCallbacks();
    this.renderSurveyJs();
  }

  stop(): void {
    this.survey.dispose();
  }

  private logConfigurationWarnings() {
    if (this.name === "unnamed survey") {
      console.warn(
        `Survey json has no name property. Using "unnamed survey" as the name. It is highly recommended to set name property in survey json.`
      );
    }
  }

  private modifyDefaultSurveyJsConfiguration() {
    this.survey.focusFirstQuestionAutomatic = false;
    // this hides the default surveyjs default completion html
    this.survey.completedHtml = `<html></html>`;
  }

  private renderSurveyJs() {
    const surveyDiv = document.getElementById("m2c2kit-survey-div");
    if (!surveyDiv) {
      throw new Error(
        "m2c2kit-survey-div not found in DOM. cannot start survey."
      );
    }
    const root = createRoot(surveyDiv);
    root.render(<SurveyReact.Survey model={this.survey} />);
  }

  /**
   * Hooks into SurveyJS callbacks based on user interaction.
   *
   * @remarks SurveyJS has many callbacks, so there could be more functionalty
   * we could tap into.
   */
  private addSurveyJsEventCallbacks() {
    /**
     * SurveyJS raises a value changed event only when an element receives
     * user interaction. Non-required elements that are skipped will not
     * raise events. Thus, to record skippped elements, we hook into an
     * event when the page is about to change. We look at all the elements
     * on the page, find elements whose values are undefined, and add these
     * to our object of skipped elements.
     */

    this.survey.onCurrentPageChanging.add(
      (sender: SurveyReact.Model, options: CurrentPageChangingOptions) => {
        const elements = options.oldCurrentPage.elements as Array<IElement>;
        if (this.shouldShowSkipConfirmation(elements)) {
          {
            if (!confirm(CONFIRM_SKIP_TEXT)) {
              options.allowChanging = false;
              return;
            }
          }
        }

        const newSkippedElements = this.getNewSkippedElements(elements);
        if (newSkippedElements.length > 0) {
          this.skippedElements.push(...newSkippedElements);
          const newData =
            this.makeNewDataObjectFromSkippedElements(newSkippedElements);
          const data = this.makeDataObject(sender);
          this.callOnActivityResultsCallback(newData, data);
          this.responseIndex++;
        }
      }
    );

    /**
     * When a value has changed, raise an ActivityData event.
     */
    this.survey.onValueChanged.add(
      (sender: SurveyReact.Model, options: ValueChangedOptions) => {
        const newResponse = { [options.name]: options.value };

        if (this.valueChangedFromNull(options)) {
          this.removeElementNameFromSkippedElements(options.name);
        }
        if (this.arrayValueChangedToNull(options)) {
          this.addElementNameToSkippedElements(options.name);
          /**
           * Element that is an array response (e.g., check all that apply),
           * but now has no selections, will be returned as null, not []
           */
          newResponse[options.name] = null;
        }

        const newData = this.makeNewDataFromChangedValue(newResponse);
        const data = this.makeDataObject(sender);
        this.callOnActivityResultsCallback(newData, data);
        this.responseIndex++;
      }
    );

    this.survey.onCompleting.add(
      (sender: SurveyReact.Model, options: CompletingOptions) => {
        const elements = sender.currentPage.elements as Array<IElement>;
        if (this.shouldShowSkipConfirmation(elements)) {
          {
            if (!confirm(CONFIRM_SKIP_TEXT)) {
              options.allowComplete = false;
              return;
            }
          }
        }

        const newSkippedElements = this.getNewSkippedElements(elements);
        if (newSkippedElements.length > 0) {
          this.skippedElements.push(...newSkippedElements);
          const newData =
            this.makeNewDataObjectFromSkippedElements(newSkippedElements);
          const data = this.makeDataObject(sender);
          this.callOnActivityResultsCallback(newData, data);
          this.responseIndex++;
        }
      }
    );

    this.survey.onComplete.add(() => {
      if (this.session.options.activityCallbacks?.onActivityLifecycle) {
        this.session.options.activityCallbacks.onActivityLifecycle({
          type: EventType.ActivityEnd,
          target: this,
        });
      }
    });
  }

  private addM2c2kitEventCallbacks() {
    if (this.session.options.activityCallbacks?.onActivityLifecycle) {
      this.session.options.activityCallbacks.onActivityLifecycle({
        type: EventType.ActivityStart,
        target: this,
      });
    }
  }

  private arrayValueChangedToNull(options: ValueChangedOptions) {
    return Array.isArray(options.value) && options.value.length === 0;
  }

  private valueChangedFromNull(options: ValueChangedOptions) {
    return (
      (!Array.isArray(options.value) && options.value !== undefined) ||
      (Array.isArray(options.value) && options.value.length !== 0)
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private makeNewDataFromChangedValue(newResponse: { [x: string]: any }) {
    const newData: ActivityKeyValueData = {
      variables: new Array<SurveyVariable>(),
      response_index: this.responseIndex,
      ...this.makeAutomaticSurveyDataProperties(),
    };

    for (const [key, value] of Object.entries(newResponse)) {
      const response: SurveyVariable = {
        name: key,
        value: value,
      };
      (newData["variables"] as Array<SurveyVariable>).push(response);
    }
    return newData;
  }

  private makeAutomaticSurveyDataProperties(): AutomaticSurveyDataProperties {
    return {
      session_uuid: this.session.uuid,
      activity_uuid: this.uuid,
      activity_id: this.id,
    };
  }

  callOnActivityResultsCallback(
    newData: ActivityKeyValueData,
    data: ActivityKeyValueData
  ) {
    if (this.session.options.activityCallbacks?.onActivityResults) {
      this.session.options.activityCallbacks.onActivityResults({
        type: EventType.ActivityData,
        target: this,
        newData: newData,
        newDataSchema: {},
        data: data,
        dataSchema: {},
        activityConfiguration: {},
        activityConfigurationSchema: {},
      });
    }
  }

  private makeDataObject(
    sender: SurveyReact.SurveyModel
  ): ActivityKeyValueData {
    const automaticSurveyDataProperties =
      this.makeAutomaticSurveyDataProperties();
    return {
      variables: this.createSurveyVariablesArray(
        sender.data,
        this.skippedElements
      ),
      ...automaticSurveyDataProperties,
    };
  }

  private makeNewDataObjectFromSkippedElements(
    newSkippedElements: string[]
  ): ActivityKeyValueData {
    const automaticSurveyDataProperties =
      this.makeAutomaticSurveyDataProperties();
    const newData: ActivityKeyValueData = {
      variables: new Array<SurveyVariable>(),
      response_index: this.responseIndex,
      ...automaticSurveyDataProperties,
    };

    newSkippedElements.forEach((e) => {
      const response: SurveyVariable = {
        name: e,
        value: null,
      };
      (newData["variables"] as Array<SurveyVariable>).push(response);
    });
    return newData;
  }

  private getNewSkippedElements(
    elements: SurveyReact.IElement[]
  ): Array<string> {
    /**
     * Every element will generate "data" if they are
     * skipped. To create elements that are simply informational pages
     * that should not collect data (variables), give them a name that
     * starts with "__" (two underscores). These elements can be skipped
     * and they will not generate m2c2kit events.
     */

    const newSkippedElements = new Array<string>();
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
            newSkippedElements.push(e.name);
          }

          // element might be a checkbox with nothing checked
          if (
            Array.isArray(e.value) &&
            e.value.length === 0 &&
            !this.skippedElementsContainsElementName(e.name)
          ) {
            newSkippedElements.push(e.name);
          }
        }
      });
    return newSkippedElements;
  }

  private shouldShowSkipConfirmation(elements: Array<IElement>): boolean {
    return this.confirmSkipping && this.pageHasSkippedElements(elements);
  }

  private pageHasSkippedElements(elements: Array<IElement>): boolean {
    let hasSkippedElements = false;
    elements
      .map((e) => e as unknown as ISurveyElement & IQuestion)
      .forEach((e) => {
        if (
          typeof e.name === "string" &&
          typeof e.value !== undefined &&
          !e.name.startsWith("__")
        ) {
          if (e.value === undefined) {
            hasSkippedElements = true;
          }

          // element might be a checkbox with nothing checked
          if (Array.isArray(e.value) && e.value.length === 0) {
            hasSkippedElements = true;
          }
        }
      });
    return hasSkippedElements;
  }

  private removeElementNameFromSkippedElements(elementName: string): void {
    this.skippedElements = this.skippedElements.filter(
      (e) => e !== elementName
    );
  }

  private addElementNameToSkippedElements(elementName: string): void {
    if (!this.skippedElements.includes(elementName)) {
      this.skippedElements.push(elementName);
    }
  }

  private skippedElementsContainsElementName(elementName: string): boolean {
    return this.skippedElements.includes(elementName);
  }

  private createSurveyVariablesArray(
    data: ActivityKeyValueData,
    skippedElements: Array<string>
  ): Array<SurveyVariable> {
    const variables: Array<SurveyVariable> = [];

    for (const [key, value] of Object.entries(data)) {
      const response: SurveyVariable = {
        name: key,
        value: value,
      };
      variables.push(response);
    }

    skippedElements.forEach((e) => variables.push({ name: e, value: null }));
    return variables;
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

  private initializeCustomWidgets() {
    // custom widgets need to be separately initialized by widget
    select2($);
    widgets.select2tagbox(SurveyReact, $);
    widgets.sortablejs(SurveyReact);
    widgets.bootstrapdatepicker(SurveyReact, $);
    //widgets.bootstrapslider(SurveyReact);
    initbootstrapsliderm2c2();
    initnouisliderm2c2();
  }

  /**
   * Create SurveyReact.Model in a separate method so that it can be mocked
   * in testing.
   *
   * @param surveyJson
   * @returns
   */
  private createSurveyReactModel(surveyJson?: unknown): SurveyReact.Model {
    return new SurveyReact.Model(surveyJson);
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
