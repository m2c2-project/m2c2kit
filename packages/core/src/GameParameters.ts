export interface GameParameters {
  // The key is the game parameter name
  [key: string]: DefaultParameter;
}

export interface DefaultParameter {
  // Default value for the parameter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  // Data type of the parameter
  type?: "number" | "string" | "boolean" | "object";
  // Optional description of the parameter
  description?: string;
}
