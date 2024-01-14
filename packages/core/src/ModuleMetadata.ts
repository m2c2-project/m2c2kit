/**
 * Game's module name, version, and dependencies.
 */
export interface ModuleMetadata {
  /** name property from package.json */
  name: string;
  /** version property from package.json */
  version: string;
  /** dependency property from package.json */
  dependencies: {
    [key: string]: string;
  };
}
