import { DataCalc } from "./DataCalc";
import { DataValue } from "./DataValue";
import { SummarizeOptions } from "./SummarizeOptions";

/**
 * A function that internally executes the summarize operation.
 */
export type SummarizeFunction = (
  dataCalc: DataCalc,
  params: Array<DataValue>,
  options?: SummarizeOptions,
) => DataValue;
