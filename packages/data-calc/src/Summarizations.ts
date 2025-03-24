import { SummarizeOperation } from "./SummarizeOperation";

/**
 * Key-value pairs where the key is the name of the new variable, and the value
 * is an operation to summarize the data.
 */
export interface Summarizations {
  [newVariable: string]: SummarizeOperation;
}
