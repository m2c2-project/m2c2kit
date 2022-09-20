/**
 * Survey element name and its value.
 *
 * @remarks This is not part of SurveyJs; this is to define the objects
 * returned in the variables array in data and newData
 */
export interface SurveyVariable {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}
