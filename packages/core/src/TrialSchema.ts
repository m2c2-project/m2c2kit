import { JsonSchema } from "./JsonSchema";

/**
 * TrialSchema defines the data that are generated for each trial. They are
 * key-value pairs in which the key is the variable name, and the value is
 * JSON Schema that defines the type of the variable.
 */
export interface TrialSchema {
  // The key is a single variable or datum produced by each completion of a single trial. The JsonSchema is a simplified subset of JSON Schema
  [key: string]: JsonSchema;
}
