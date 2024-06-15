/**
 * Properties that will always be returned in the data and newData objects.
 */
export interface AutomaticSurveyDataProperties {
  document_uuid: string;
  study_id: string | null;
  study_uuid: string | null;
  session_uuid: string;
  activity_uuid: string;
  activity_id: string;
  activity_publish_uuid: string;
}
