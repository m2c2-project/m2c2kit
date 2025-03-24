import { DataValue } from "./DataValue";
import { SummarizeFunction } from "./SummarizeFunction";
import { SummarizeOptions } from "./SummarizeOptions";

/**
 * An operation that summarizes data.
 */
export interface SummarizeOperation {
  summarizeFunction: SummarizeFunction;
  parameters: Array<DataValue>;
  options?: SummarizeOptions;
}
