import { Constraints } from "./Constraints";

/**
 * The Layout allows relative positioning via constraints.
 * This is not fully implemented yet: DO NOT USE!
 * We use it internally for instructions.
 */

export interface Layout {
  height?: number;
  width?: number;
  marginStart?: number;
  marginEnd?: number;
  marginTop?: number;
  marginBottom?: number;
  constraints?: Constraints;
}
