import * as SurveyReact from "survey-react";

/**
 * Options object that is returned in SurveyJs onValueChanged event
 */

export interface ValueChangedOptions {
  name: string;
  question: SurveyReact.Question;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}
