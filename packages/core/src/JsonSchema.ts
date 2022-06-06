export interface JsonSchema {
  // Data type of the value. Note that JSON schema doesn't allow all JS types, such as bigint, function, symbol, or undefined. In addition, we don't support all JSON schema types (e.g., integer, null).
  type?: "number" | "string" | "boolean" | "object" | "array";
  // Intent of the schema
  title?: string;
  // Description of the schema
  description?: string;
  // If the value is an object, the properties in JsonSchema
  properties?: {
    [key: string]: JsonSchema;
  };
  // If the value is an array, the array items in JsonSchema
  items?: JsonSchema;
  // Required properties
  required?: string[];
  // Reference to object definitions
  $ref?: string;
  // Object definitions
  $defs?: object;
}
