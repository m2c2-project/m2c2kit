import { JsonSchema } from "./JsonSchema";
export interface GameParameters {
  // The key is the game parameter name
  [key: string]: DefaultParameter;
}

export interface DefaultParameter extends JsonSchema {
  // Default value for the parameter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}
