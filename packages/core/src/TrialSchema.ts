import { JsonSchema } from "./JsonSchema";

export interface TrialSchema {
  // The key is a single variable or datum produced by each completion of a single trial. The JsonSchema is a simplified subset of JSON Schema
  [key: string]: JsonSchema;
}
