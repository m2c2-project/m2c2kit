export interface TrialSchema {
  // The key is a single variable or datum produced by each completion of a single trial. The PropertySchema is similar to what is required of each property in the "properties" object in JSON Schema
  [key: string]: PropertySchema;
}

export interface PropertySchema {
  // Data type of the variable
  type: "number" | "string" | "boolean" | "object";
  // Optional description of the variable
  description?: string;
}
