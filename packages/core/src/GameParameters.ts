import { JsonSchema } from "./JsonSchema";
/**
 * GameParameters are the configurable options that change how the game runs.
 * They are key-value pairs in which the key is the game parameter name, and
 * the value is JSON Schema that defines the type of the game parameter, with
 * a required parameter named "default" that is the default value for the
 * parameter.
 */
export interface GameParameters {
  /** The key is the game parameter name */
  [key: string]: DefaultParameter;
}

export interface DefaultParameter extends JsonSchema {
  /**  Default value for the game parameter. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: any;
}
