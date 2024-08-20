import { RegistryAssessmentPackage } from "./RegistryAssessmentPackage";

export interface AssessmentsRegistry {
  /** Version of the assessment registry file */
  version: string;
  /** ISO 8601 timestamp of the assessment registry file */
  time: string;
  /** Assessment packages available in the registry */
  assessments: RegistryAssessmentPackage[];
}
