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

// TODO: this will have to be handled specially for i18n
const CONFIRM_SKIP_TEXT = "Are you sure you want to skip these questions?";

type SurveyVariables = Array<SurveyVariable>;

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
  private confirmSkipping = false;
  private m2c2SurveyData: SurveyVariables = new Array<SurveyVariable>();

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
    // replace the default surveyjs default completion html with blank html
    this.survey.completedHtml = `<html></html>`;
  }

  private renderSurveyJs() {
    const surveyDiv = document.getElementById("m2c2kit-survey-div");
    if (!surveyDiv) {
      throw new Error(
        "renderSurveyJs(): m2c2kit-survey-div not found in DOM. cannot start survey."
      );
    }
    const root = createRoot(surveyDiv);
    root.render(<SurveyReact.Survey model={this.survey} />);
  }

  private addM2c2kitEventCallbacks() {
    if (this.session.options.activityCallbacks?.onActivityLifecycle) {
      this.session.options.activityCallbacks.onActivityLifecycle({
        type: EventType.ActivityStart,
        target: this,
      });
    }
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
     * event when the page is about to change or the survey is about to
     * complete. We look at all the elements on the page, find elements whose
     * values are undefined, and assign null values to them.
     */

    this.survey.onCurrentPageChanging.add(
      (sender: SurveyReact.Model, options: CurrentPageChangingOptions) => {
        if (
          this.shouldShowSkipConfirmation(
            options.oldCurrentPage,
            options.newCurrentPage
          )
        ) {
          {
            if (!this.confirmSkip(options.oldCurrentPage.name)) {
              options.allowChanging = false;
              return;
            }
          }
        }
        this.updateSurveyData(sender);
      }
    );

    this.survey.onValueChanged.add(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (sender: SurveyReact.Model, _options: ValueChangedOptions) => {
        this.updateSurveyData(sender);
      }
    );

    this.survey.onCompleting.add(
      (sender: SurveyReact.Model, options: CompletingOptions) => {
        if (this.shouldShowSkipConfirmation(sender.currentPage, undefined)) {
          {
            if (!this.confirmSkip(sender.currentPage.name)) {
              options.allowComplete = false;
              return;
            }
          }
        }
        this.updateSurveyData(sender);
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

  private confirmSkip(pageName: string): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const surveyJsPagesUntyped = (this._surveyJson as any).pages as Array<any>;
    const currentPage = surveyJsPagesUntyped?.find((p) => p.name === pageName);
    if (currentPage?.confirmSkippingText) {
      return confirm(currentPage.confirmSkippingText);
    }
    return confirm(CONFIRM_SKIP_TEXT);
  }

  private updateSurveyData(sender: SurveyReact.SurveyModel) {
    const previousM2c2SurveyData: SurveyVariables = JSON.parse(
      JSON.stringify(this.m2c2SurveyData)
    );
    const currentM2c2SurveyData = this.makeM2c2SurveyData(sender);
    const changedM2c2SurveyData = this.calculateChangedM2c2SurveyData(
      previousM2c2SurveyData,
      currentM2c2SurveyData
    );

    if (changedM2c2SurveyData.length > 0) {
      const newData = this.makeNewDataObject(changedM2c2SurveyData);
      const data = this.makeDataObject(currentM2c2SurveyData);
      this.callOnActivityResultsCallback(newData, data);
      this.responseIndex++;
      this.m2c2SurveyData = currentM2c2SurveyData;
    }
  }

  private calculateChangedM2c2SurveyData(
    previous: SurveyVariables,
    current: SurveyVariables
  ) {
    const changed: SurveyVariables = new Array<SurveyVariable>();

    current.forEach((cur) => {
      const previousVariable = previous.find((prev) => prev.name === cur.name);
      if (!previousVariable) {
        changed.push(cur);
      }
      if (previousVariable && previousVariable.value !== cur.value) {
        changed.push(cur);
      }
    });
    return changed;
  }

  private makeM2c2SurveyData(survey: SurveyReact.SurveyModel): SurveyVariables {
    const m2c2SurveyData: SurveyVariables = JSON.parse(
      JSON.stringify(this.m2c2SurveyData)
    );
    const surveyJsData = JSON.parse(JSON.stringify(survey.data)) as {
      [elementName: string]: any;
    };
    const pageSkippedElementNames = this.getSkippedElementNamesOnPage(
      survey.currentPage as SurveyReact.PageModel
    );
    pageSkippedElementNames.forEach((elementName) => {
      surveyJsData[elementName] = null;
    });

    for (const [elementName, value] of Object.entries(surveyJsData)) {
      if (this.IsSurveyJsVariableMultipleResponse(elementName)) {
        const dummyVariables =
          this.makeDummiesFromMultipleResponse(elementName);

        dummyVariables.forEach((d) => {
          const variable = m2c2SurveyData.find((v) => v.name === d.name);
          if (variable) {
            variable.value = d.value;
          } else {
            m2c2SurveyData.push(d);
          }
        });
      } else {
        const variable = m2c2SurveyData.find((v) => v.name === elementName);
        if (variable) {
          variable.value = value;
        } else {
          m2c2SurveyData.push({ name: elementName, value: value });
        }
      }
    }
    return m2c2SurveyData;
  }

  private makeNewDataObject(variables: SurveyVariables): ActivityKeyValueData {
    return {
      variables: variables,
      response_index: this.responseIndex,
      ...this.makeAutomaticSurveyDataProperties(),
    };
  }

  private makeDataObject(variables: SurveyVariables): ActivityKeyValueData {
    return {
      variables: variables,
      ...this.makeAutomaticSurveyDataProperties(),
    };
  }

  private getSkippedElementNamesOnPage(
    page: SurveyReact.PageModel
  ): Array<string> {
    /**
     * Every element will generate "data" if they are
     * skipped. To create elements that are simply informational pages
     * that should not collect data (variables), give them a name that
     * starts with "__" (two underscores). These elements can be skipped
     * and they will not generate m2c2kit events.
     */

    const skippedElementNames = new Array<string>();
    const elements = page.elements as Array<IElement>;

    elements
      .map((e) => e as unknown as ISurveyElement & IQuestion)
      .forEach((e) => {
        if (
          typeof e.name === "string" &&
          typeof e.value !== undefined &&
          !e.name.startsWith("__")
        ) {
          if (e.value === undefined) {
            skippedElementNames.push(e.name);
          }

          // element might be a checkbox with nothing checked
          if (Array.isArray(e.value) && e.value.length === 0) {
            skippedElementNames.push(e.name);
          }
        }
      });
    return skippedElementNames;
  }

  private makeDummiesFromMultipleResponse(
    elementName: string
  ): SurveyVariables {
    if (!this.IsSurveyJsVariableMultipleResponse(elementName)) {
      throw new Error(
        `makeDummiesFromMultipleResponse(): surveyJs element ${elementName} is not a multiple response variable.`
      );
    }

    let choices: Array<any>;
    let selectedValues: Array<any> | undefined;
    let noneChoice = {};

    if (this.getSurveyJsElementByName(elementName).getType() === "checkbox") {
      const checkbox = this.getSurveyJsElementByName(
        elementName
      ) as SurveyReact.QuestionCheckboxModel;
      choices = checkbox.choices as Array<any>;
      if (checkbox.hasNone) {
        let noneTextName = this.getCheckboxNoneChoiceName(elementName);
        if (!noneTextName) {
          noneTextName = checkbox.noneText;
        }
        if (!noneTextName) {
          noneTextName = "none";
        }
        noneChoice = {
          value: "none",
          name: noneTextName,
        };
        choices = (checkbox.choices as Array<any>).concat(noneChoice);
      }
      selectedValues = checkbox.value;
    } else {
      throw new Error(
        `makeDummiesFromMultipleResponse(): surveyJs element ${elementName} has unexpected structure.`
      );
    }

    if (!selectedValues || selectedValues.length === 0) {
      return this.makeAllDummiesNull(elementName, choices);
    }

    return this.assignSelectedValuesToChoices(
      elementName,
      selectedValues,
      choices
    );
  }

  private assignSelectedValuesToChoices(
    elementName: string,
    selectedValues: Array<any>,
    choices: Array<any>
  ): SurveyVariables {
    const dummyVariables: SurveyVariables = new Array<SurveyVariable>();
    for (const choice of choices) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let variableValue: any;
      if (selectedValues.includes(choice.value)) {
        variableValue = 1;
      } else {
        variableValue = 0;
      }
      const variableName = this.addChoiceToVariableName(elementName, choice);
      dummyVariables.push({ name: variableName, value: variableValue });
    }
    return dummyVariables;
  }

  private makeAllDummiesNull(
    elementName: string,
    choices: Array<any>
  ): SurveyVariables {
    const dummyVariables: SurveyVariables = new Array<SurveyVariable>();
    for (const choice of choices) {
      const variableName = this.addChoiceToVariableName(elementName, choice);
      dummyVariables.push({
        name: variableName,
        value: null,
      });
    }
    return dummyVariables;
  }

  private addChoiceToVariableName(elementName: string, choice: any): string {
    if (choice.name) {
      return elementName + "_" + choice.name;
    }
    return elementName + "_" + choice.value;
  }

  private IsSurveyJsVariableMultipleResponse(elementName: string): boolean {
    const element = this.getSurveyJsElementByName(elementName);
    return element.getType() === "checkbox";
  }

  private getSurveyJsElementByName(elementName: string): IElement {
    const surveyJsElements = (
      this.survey.pages as SurveyReact.PageModel[]
    ).flatMap((p) => p.elements as SurveyReact.IElement[]);
    const surveyJsElement = surveyJsElements.find(
      (e) => e.name === elementName
    );
    if (!surveyJsElement) {
      throw new Error(
        `getSurveyJsElementByName(): surveyJs element ${elementName} not found.`
      );
    }
    return surveyJsElement;
  }

  private getCheckboxNoneChoiceName(elementName: string): string | undefined {
    const surveyJsElementsUntyped = (
      (this._surveyJson as any)?.pages as Array<any>
    )?.flatMap((p) => p.elements as Array<any>);
    const surveyJsElementUntyped = surveyJsElementsUntyped?.find(
      (e) => e.name === elementName
    );
    if (typeof surveyJsElementUntyped?.noneName === "string") {
      return surveyJsElementUntyped.noneName;
    }
    return undefined;
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

  private shouldShowSkipConfirmation(
    currentPage: SurveyReact.PageModel,
    nextPage?: SurveyReact.PageModel
  ): boolean {
    return (
      this.confirmSkipping &&
      this.pageHasSkippedElements(currentPage) &&
      this.nextPageIsAfterCurrentPage(currentPage, nextPage)
    );
  }

  private nextPageIsAfterCurrentPage(
    currentPage: SurveyReact.PageModel,
    nextPage?: SurveyReact.PageModel
  ): boolean {
    // nextPage is undefined if this was the last page
    if (nextPage === undefined) {
      return true;
    }
    const pages = this._survey?.pages as SurveyReact.PageModel[];
    return pages?.indexOf(nextPage) > pages?.indexOf(currentPage);
  }

  private pageHasSkippedElements(page: SurveyReact.PageModel): boolean {
    const elements = page.elements as Array<IElement>;
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

          // element might be a multiresponse variable with
          // with nothing selected: this is an empty array.
          if (Array.isArray(e.value) && e.value.length === 0) {
            hasSkippedElements = true;
          }
        }
      });
    return hasSkippedElements;
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
    // we use the versions customized for m2c2
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
