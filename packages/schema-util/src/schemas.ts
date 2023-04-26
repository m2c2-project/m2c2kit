export interface M2c2Schema {
  [key: string]: JsonSchema;
}

// Note that JSON Schema doesn't allow all JavaScript types, such as bigint, function, symbol, or undefined.
type JsonSchemaDataType =
  | "string"
  | "number"
  | "integer"
  | "object"
  | "array"
  | "boolean"
  | "null";

interface JsonSchema {
  /** Data type of the value or array of acceptable data types. */
  type?: JsonSchemaDataType | JsonSchemaDataType[];
  /** Values the schema can have. */
  enum?: unknown[];
  /** Annotation to indicate the type of string value, e.g., "date-time" or "email". */
  format?: string;
  /** Intent of the schema. */
  title?: string;
  /** Description of the schema. */
  description?: string;
  /** If the value is an object, the properties in JsonSchema. */
  properties?: {
    [key: string]: JsonSchema;
  };
  /** If the value is an array, the array items in JsonSchema. */
  items?: JsonSchema;
  /** Required properties. */
  required?: string[];
  /** Reference to object definitions. */
  $ref?: string;
  /** Object definitions. */
  $defs?: object;
  /** Comment string. */
  $comment?: string;
  /** Dialect of JSON Schema. */
  $schema?: string;
  /** Default value. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default?: any;
}
