import * as SurveyReact from "survey-react";

export interface ConfirmationSkipModalConfiguration {
  show: () => void;
  newPageIfSkipIsConfirmed?: SurveyReact.PageModel;
  bypass?: boolean;
  paragraphs?: Array<string>;
}
