export interface RegistryAssessmentPackage {
  /* Name of the assessment package from its `package.json` */
  name: string;
  /** URL of the registry where the assessment package is published (optional) */
  registryUrl?: string;
  /** Latest version of the assessment package available in the registry */
  latest: string;
  /** ISO 8601 timestamp of the latest version of the assessment package available in the registry */
  latestTime: string;
  /** Versions of the assessment package available in the registry */
  versions: string[];
  /** Description of the assessment package, from the latest version's `package.json` */
  description: string;
}
