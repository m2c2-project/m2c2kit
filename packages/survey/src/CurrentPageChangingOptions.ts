import * as SurveyReact from "survey-react";

/**
 * Options object that is returned in SurveyJs onCurrentPageChanging event
 */

export interface CurrentPageChangingOptions {
  oldCurrentPage: SurveyReact.PageModel;
  newCurrentPage: SurveyReact.PageModel;
  allowChanging: boolean;
  isNextPage: boolean;
  isPrevPage: boolean;
}
