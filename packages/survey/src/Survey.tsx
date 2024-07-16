import {
  Uuid,
  Activity,
  ActivityKeyValueData,
  ActivityEventListener,
  ActivityType,
  M2EventType,
  Timer,
  ActivityLifecycleEvent,
  CallbackOptions,
  ActivityEvent,
  ActivityResultsEvent,
  M2c2KitHelpers,
} from "@m2c2kit/core";
import React from "react";
import Modal from "react-modal";
import * as SurveyReact from "survey-react";
import { createRoot } from "react-dom/client";
import "surveyjs-widgets";
import { initbootstrapsliderm2c2 } from "./bootstrapslider-m2c2";
import { initnouisliderm2c2 } from "./nouislider-m2c2";
import { IElement, ISurveyElement, IQuestion } from "survey-react";
import { ValueChangedOptions } from "./ValueChangedOptions";
import { CurrentPageChangingOptions } from "./CurrentPageChangingOptions";
import { CompletingOptions } from "./CompletingOptions";
import { AutomaticSurveyDataProperties } from "./AutomaticSurveyDataProperties";
import { SurveyVariable } from "./SurveyVariable";
import { ConfirmationSkipModalConfiguration } from "./ConfirmationSkipModalConfiguration";

// TODO: this will have to be handled specially for i18n
let CONFIRM_SKIP_TEXT = "Are you sure you want to skip these questions?";
let CONFIRM_SKIP_AFFIRMATIVE = "Yes";
let CONFIRM_SKIP_NEGATIVE = "No";

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
  sessionUuid = "";
  name = "unnamed survey";
  id = "survey";
  publishUuid = "";
  studyId?: string;
  studyUuid?: string;
  uuid = Uuid.generate();
  private _surveyJson?: unknown;
  beginTimestamp = NaN;
  beginIso8601Timestamp = "";
  private _survey?: SurveyReact.Model;
  private responseIndex = 0;
  private confirmSkipping = false;
  private m2c2SurveyData: SurveyVariables = new Array<SurveyVariable>();
  private confirmationSkipModal: ConfirmationSkipModalConfiguration = {
    // the show function is set in the React component
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    show: () => {},
  };
  private eventListeners = new Array<ActivityEventListener<ActivityEvent>>();

  constructor(surveyJson?: unknown) {
    if (surveyJson) {
      this.setParameters(surveyJson);
    }
  }

  async init(): Promise<void> {
    return this.initialize();
  }

  async initialize() {}

  /**
   * Sets the JSON survey definition, if it was not already set in
   * the constructor.
   *
   * @param surveyJson - The JSON survey definition, following the SurveyJS
   * specifications
   */
  setParameters(surveyJson: unknown): void {
    this._surveyJson = surveyJson;
    const locale: string | undefined = (surveyJson as any)?.locale;
    if (locale === "auto") {
      (surveyJson as any).locale = this.getEnvironmentLocale();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.name = (surveyJson as any)?.name ?? "unnamed survey";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.id = (surveyJson as any)?.id ?? (surveyJson as any)?.name ?? "survey";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((surveyJson as any)?.confirmSkipping !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.confirmSkipping = (surveyJson as any)?.confirmSkipping;
      if ((surveyJson as any)?.confirmSkippingText?.message !== undefined) {
        const message = (surveyJson as any)?.confirmSkippingText?.message;
        if (typeof message === "string") {
          CONFIRM_SKIP_TEXT = message as string;
        } else if (typeof message === "object") {
          if (locale === undefined) {
            CONFIRM_SKIP_TEXT = message["default"] ?? "MISSING DEFAULT TEXT";
          } else {
            CONFIRM_SKIP_TEXT =
              message[locale] ?? message["default"] ?? "MISSING ${locale} TEXT";
          }
        }
      }
      if ((surveyJson as any)?.confirmSkippingText?.affirmative !== undefined) {
        const affirmativeText = (surveyJson as any)?.confirmSkippingText
          ?.affirmative;
        if (typeof affirmativeText === "string") {
          CONFIRM_SKIP_AFFIRMATIVE = affirmativeText as string;
        } else if (typeof affirmativeText === "object") {
          if (locale === undefined) {
            CONFIRM_SKIP_AFFIRMATIVE =
              affirmativeText["default"] ?? "MISSING DEFAULT TEXT";
          } else {
            CONFIRM_SKIP_AFFIRMATIVE =
              affirmativeText[locale] ??
              affirmativeText["default"] ??
              "MISSING ${locale} TEXT";
          }
        }
      }
      if ((surveyJson as any)?.confirmSkippingText?.negative !== undefined) {
        const negativeText = (surveyJson as any)?.confirmSkippingText?.negative;
        if (typeof negativeText === "string") {
          CONFIRM_SKIP_NEGATIVE = negativeText as string;
        } else if (typeof negativeText === "object") {
          if (locale === undefined) {
            CONFIRM_SKIP_NEGATIVE =
              negativeText["default"] ?? "MISSING DEFAULT TEXT";
          } else {
            CONFIRM_SKIP_NEGATIVE =
              negativeText[locale] ??
              negativeText["default"] ??
              "MISSING ${locale} TEXT";
          }
        }
      }
    }
  }

  private getEnvironmentLocale(): string {
    return navigator.languages && navigator.languages.length
      ? navigator.languages[0]
      : navigator.language;
  }

  get additionalParameters(): unknown {
    return this._surveyJson;
  }

  /**
   * Executes a callback when the survey starts.
   *
   * @param callback - function to execute.
   * @param options - options for the callback.
   */
  onStart(
    callback: (activityLifecycleEvent: ActivityLifecycleEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(M2EventType.ActivityStart, callback, options);
  }

  /**
   * Executes a callback when the survey is canceled.
   *
   * @param callback - function to execute.
   * @param options - options for the callback.
   */
  onCancel(
    callback: (activityLifecycleEvent: ActivityLifecycleEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(M2EventType.ActivityCancel, callback, options);
  }

  /**
   * Executes a callback when the survey ends.
   *
   * @param callback - function to execute.
   * @param options - options for the callback.
   */
  onEnd(
    callback: (activityLifecycleEvent: ActivityLifecycleEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(M2EventType.ActivityEnd, callback, options);
  }

  /**
   * Executes a callback when the survey generates data.
   *
   * @param callback - function to execute.
   * @param options - options for the callback.
   */
  onData(
    callback: (activityResultsEvent: ActivityResultsEvent) => void,
    options?: CallbackOptions,
  ): void {
    this.addEventListener(M2EventType.ActivityData, callback, options);
  }

  private addEventListener<T extends ActivityEvent>(
    type: M2EventType,
    callback: (ev: T) => void,
    options?: CallbackOptions,
  ): void {
    const eventListener: ActivityEventListener<T> = {
      type: type,
      activityUuid: this.uuid,
      callback: callback,
      key: options?.key,
    };

    if (options?.replaceExisting) {
      this.eventListeners = this.eventListeners.filter(
        (listener) => !(listener.type === eventListener.type),
      );
    }
    this.eventListeners.push(
      eventListener as ActivityEventListener<ActivityEvent>,
    );
  }

  private raiseEventOnListeners(event: ActivityEvent, extra?: unknown): void {
    if (extra) {
      event = {
        ...event,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(extra as any),
      };
    }
    this.eventListeners
      .filter((listener) => listener.type === event.type)
      .forEach((listener) => {
        listener.callback(event);
      });
  }

  async start() {
    this.beginTimestamp = Timer.now();
    this.beginIso8601Timestamp = new Date().toISOString();
    this.logConfigurationWarnings();

    SurveyReact.StylesManager.applyTheme("defaultV2");
    this.initializeCustomWidgets();
    this.survey = this.createSurveyReactModel(this._surveyJson);

    this.modifyDefaultSurveyJsConfiguration();
    this.addSurveyJsEventCallbacks();
    this.renderSurveyJs();
    const activityStartEvent: ActivityLifecycleEvent = {
      target: this,
      type: M2EventType.ActivityStart,
      ...M2c2KitHelpers.createTimestamps(),
    };
    this.raiseEventOnListeners(activityStartEvent);
  }

  stop(): void {
    this.survey.dispose();
  }

  private logConfigurationWarnings() {
    if (this.name === "unnamed survey") {
      console.warn(
        `Survey json has no name property. Using "unnamed survey" as the name. It is highly recommended to set name property in survey json.`,
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
        "renderSurveyJs(): m2c2kit-survey-div not found in DOM. cannot start survey.",
      );
    }
    Modal.setAppElement("#m2c2kit-survey-div");
    const root = createRoot(surveyDiv);
    root.render(<this.SurveyComponent />);
  }

  ModalDialog = () => {
    const [modalIsOpen, setIsOpen] = React.useState(false);

    this.confirmationSkipModal.show = () => {
      setIsOpen(true);
    };

    function closeModal() {
      setIsOpen(false);
    }

    const yesClicked = () => {
      this.updateSurveyData(this.survey);
      closeModal();
      this.confirmationSkipModal.bypass = true;
      if (this.confirmationSkipModal.newPageIfSkipIsConfirmed) {
        this.survey.currentPage =
          this.confirmationSkipModal.newPageIfSkipIsConfirmed;
      } else {
        this.survey.doComplete();
      }
    };

    function noClicked() {
      closeModal();
    }

    const modalButtonStyle = {
      backgroundColor: "white",
      border: "solid",
      borderRadius: 4,
      color: "darkslategrey",
      textAlign: "center",
      textDecoration: "none",
      display: "inline-block",
      fontSize: 16,
      width: 100,
      margin: "8px 8px",
      paddingTop: "1em",
      paddingBottom: "1em",
      cursor: "pointer",
    } as const;

    return (
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Skip Confirmation Modal"
        style={{
          overlay: {
            zIndex: 1000,
            backgroundColor: "rgba(255, 255, 255, .75)",
          },
          content: {
            position: undefined,
            margin: "10% 10% 10% 10%",
            top: undefined,
            left: undefined,
            right: undefined,
            bottom: undefined,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "white",
            zIndex: 10,
            fontFamily:
              "Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif",
          },
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {this.confirmationSkipModal.paragraphs?.map((line) => <p>{line}</p>)}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <button style={modalButtonStyle} onClick={yesClicked}>
              {CONFIRM_SKIP_AFFIRMATIVE}
            </button>
            <button style={modalButtonStyle} onClick={noClicked}>
              {CONFIRM_SKIP_NEGATIVE}
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  SurveyComponent = () => {
    return (
      <div>
        <SurveyReact.Survey model={this.survey} />
        <this.ModalDialog />
      </div>
    );
  };

  /**
   * Hooks into SurveyJS callbacks based on user interaction.
   *
   * @remarks SurveyJS has many callbacks, so there could be more functionally
   * we could tap into.
   */
  private addSurveyJsEventCallbacks() {
    /**
     * SurveyJS raises a value changed event only when an element receives
     * user interaction. Non-required elements that are skipped will not
     * raise events. Thus, to record skipped elements, we hook into an
     * event when the page is about to change or the survey is about to
     * complete. We look at all the elements on the page, find elements whose
     * values are undefined, and assign null values to them.
     */

    this.survey.onCurrentPageChanging.add(
      (sender: SurveyReact.Model, options: CurrentPageChangingOptions) => {
        if (this.confirmationSkipModal.bypass) {
          this.confirmationSkipModal.bypass = false;
          return;
        }
        if (
          this.shouldShowSkipConfirmation(
            options.oldCurrentPage,
            options.newCurrentPage,
          )
        ) {
          this.confirmationSkipModal.newPageIfSkipIsConfirmed =
            options.newCurrentPage;
          this.confirmationSkipModal.paragraphs = this.getConfirmationSkipText(
            options.oldCurrentPage.name,
          );
          this.confirmationSkipModal.show();
          options.allowChanging = false;
          return;
        }
        this.updateSurveyData(sender);
      },
    );

    this.survey.onValueChanged.add(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (sender: SurveyReact.Model, _options: ValueChangedOptions) => {
        this.updateSurveyData(sender);
      },
    );

    this.survey.onCompleting.add(
      (sender: SurveyReact.Model, options: CompletingOptions) => {
        if (this.confirmationSkipModal.bypass) {
          this.confirmationSkipModal.bypass = false;
          return;
        }
        if (this.shouldShowSkipConfirmation(sender.currentPage, undefined)) {
          {
            this.confirmationSkipModal.newPageIfSkipIsConfirmed = undefined;
            this.confirmationSkipModal.paragraphs =
              this.getConfirmationSkipText(sender.currentPage.name);
            this.confirmationSkipModal.show();
            options.allowComplete = false;
            return;
          }
        }
        this.updateSurveyData(sender);
      },
    );

    this.survey.onComplete.add(() => {
      const activityEndEvent: ActivityLifecycleEvent = {
        target: this,
        type: M2EventType.ActivityEnd,
        ...M2c2KitHelpers.createTimestamps(),
      };
      this.raiseEventOnListeners(activityEndEvent);
    });
  }

  private getConfirmationSkipText(pageName: string): Array<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const surveyJsPagesUntyped = (this._surveyJson as any).pages as Array<any>;
    const currentPage = surveyJsPagesUntyped?.find((p) => p.name === pageName);
    if (currentPage?.confirmSkippingText) {
      const lines = (currentPage.confirmSkippingText as string).split("<br>");
      return lines;
    }
    return [CONFIRM_SKIP_TEXT];
  }

  private updateSurveyData(sender: SurveyReact.SurveyModel) {
    const previousM2c2SurveyData: SurveyVariables = JSON.parse(
      JSON.stringify(this.m2c2SurveyData),
    );
    const currentM2c2SurveyData = this.makeM2c2SurveyData(sender);
    const changedM2c2SurveyData = this.calculateChangedM2c2SurveyData(
      previousM2c2SurveyData,
      currentM2c2SurveyData,
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
    current: SurveyVariables,
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
      JSON.stringify(this.m2c2SurveyData),
    );
    const surveyJsData = JSON.parse(JSON.stringify(survey.data)) as {
      [elementName: string]: any;
    };
    const pageSkippedElementNames = this.getSkippedElementNamesOnPage(
      survey.currentPage as SurveyReact.PageModel,
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
    page: SurveyReact.PageModel,
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
        if (typeof e.name === "string" && !e.name.startsWith("__")) {
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
    elementName: string,
  ): SurveyVariables {
    if (!this.IsSurveyJsVariableMultipleResponse(elementName)) {
      throw new Error(
        `makeDummiesFromMultipleResponse(): surveyJs element ${elementName} is not a multiple response variable.`,
      );
    }

    let choices: Array<any>;
    let selectedValues: Array<any> | undefined;
    let noneChoice = {};

    if (this.getSurveyJsElementByName(elementName).getType() === "checkbox") {
      const checkbox = this.getSurveyJsElementByName(
        elementName,
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
        `makeDummiesFromMultipleResponse(): surveyJs element ${elementName} has unexpected structure.`,
      );
    }

    if (!selectedValues || selectedValues.length === 0) {
      return this.makeAllDummiesNull(elementName, choices);
    }

    return this.assignSelectedValuesToChoices(
      elementName,
      selectedValues,
      choices,
    );
  }

  private assignSelectedValuesToChoices(
    elementName: string,
    selectedValues: Array<any>,
    choices: Array<any>,
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
    choices: Array<any>,
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
      (e) => e.name === elementName,
    );
    if (!surveyJsElement) {
      throw new Error(
        `getSurveyJsElementByName(): surveyJs element ${elementName} not found.`,
      );
    }
    return surveyJsElement;
  }

  private getCheckboxNoneChoiceName(elementName: string): string | undefined {
    const surveyJsElementsUntyped = (
      (this._surveyJson as any)?.pages as Array<any>
    )?.flatMap((p) => p.elements as Array<any>);
    const surveyJsElementUntyped = surveyJsElementsUntyped?.find(
      (e) => e.name === elementName,
    );
    if (typeof surveyJsElementUntyped?.noneName === "string") {
      return surveyJsElementUntyped.noneName;
    }
    return undefined;
  }

  private makeAutomaticSurveyDataProperties(): AutomaticSurveyDataProperties {
    return {
      document_uuid: Uuid.generate(),
      study_id: this.studyId ?? null,
      study_uuid: this.studyUuid ?? null,
      session_uuid: this.sessionUuid,
      activity_uuid: this.uuid,
      activity_id: this.id,
      activity_publish_uuid: this.publishUuid,
    };
  }

  callOnActivityResultsCallback(
    newData: ActivityKeyValueData,
    data: ActivityKeyValueData,
  ) {
    const resultsEvent: ActivityResultsEvent = {
      type: M2EventType.ActivityData,
      target: this,
      newData: newData,
      newDataSchema: {},
      data: data,
      dataSchema: {},
      activityConfiguration: {},
      activityConfigurationSchema: {},
      ...M2c2KitHelpers.createTimestamps(),
    };
    this.raiseEventOnListeners(resultsEvent);
  }

  private shouldShowSkipConfirmation(
    currentPage: SurveyReact.PageModel,
    nextPage?: SurveyReact.PageModel,
  ): boolean {
    return (
      this.confirmSkipping &&
      this.pageHasSkippedElements(currentPage) &&
      this.nextPageIsAfterCurrentPage(currentPage, nextPage)
    );
  }

  private nextPageIsAfterCurrentPage(
    currentPage: SurveyReact.PageModel,
    nextPage?: SurveyReact.PageModel,
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
        if (typeof e.name === "string" && !e.name.startsWith("__")) {
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
    // versions customized for m2c2
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
