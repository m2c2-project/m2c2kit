import { Session, Uuid, Activity, EventType } from "@m2c2kit/core";
import * as SurveyKO from "survey-knockout";
import widgets from "surveyjs-widgets";

export class Survey implements Activity {
  _session?: Session;
  uuid = Uuid.generate();
  surveyJson: unknown;

  constructor(surveyJson: unknown) {
    this.surveyJson = surveyJson;
  }

  start(): void {
    SurveyKO.StylesManager.applyTheme("modern");
    // nouislider is a custom widget; it needs to be specifically initialized
    widgets.nouislider(SurveyKO);

    const survey = new SurveyKO.Survey(this.surveyJson);
    survey.focusFirstQuestionAutomatic = false;
    survey.completeText = "Next";
    // this hides the default surveyjs default complation html
    survey.completedHtml = `<html></html>`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    survey.onComplete.add((sender: any) => {
      console.log(`Finished survey. Data: ${JSON.stringify(sender.data)} `);
      const surveyDiv = document.getElementById("surveyContainer");
      if (surveyDiv) {
        surveyDiv.hidden = true;
      }
      if (this.session.options.gameCallbacks?.onGameLifecycleChange) {
        this.session.options.gameCallbacks.onGameLifecycleChange({
          eventType: EventType.gameLifecycle,
          ended: true,
          gameUuid: this.uuid,
          gameName: "survey",
        });
      }
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    survey.onValueChanged.add((sender: any, options: any) => {
      console.log(`variable ${options.name} set: ${options.value}`);
    });
    survey.render("surveyContainer");
  }

  stop(): void {
    console.log("stop");
  }

  get session(): Session {
    if (!this._session) {
      throw new Error("session is undefined");
    }
    return this._session;
  }

  set session(session: Session) {
    this._session = session;
  }
}
