export interface SummarizeOptions {
  /** Coerce boolean values to numbers? (false values become 0, true values become 1). Default is false. */
  coerceBooleans?: boolean;
  /** Skip missing values (NaN, infinite, null, or undefined) when calculating the summary? Default is false, and missing values will cause an error. */
  skipMissing?: boolean;
}
