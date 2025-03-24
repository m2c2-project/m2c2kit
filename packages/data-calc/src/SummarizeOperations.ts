import { DataCalc } from "./DataCalc";
import { DataValue } from "./DataValue";
import { SummarizeOperation } from "./SummarizeOperation";
import { SummarizeFunction } from "./SummarizeFunction";
import { SummarizeOptions } from "./SummarizeOptions";

/**
 * Default options for summarize operations
 */
const DEFAULT_SUMMARIZE_OPTIONS: SummarizeOptions = {
  coerceBooleans: false,
  skipMissing: false,
} as const;
/**
 * Applies default options to user-provided options
 *
 * @param options - User provided options (may be undefined)
 * @returns Options with defaults applied
 */
function applyDefaultOptions(options?: SummarizeOptions): SummarizeOptions {
  return { ...DEFAULT_SUMMARIZE_OPTIONS, ...options };
}
/**
 * Helper function to process numeric values in a variable across observations
 * Handles error checking, type coercion and missing values in a consistent way
 *
 * @param dataCalc - The DataCalc instance to process
 * @param variable - The variable name to process
 * @param options - Summarize options for the operation
 * @param collector - Function that collects values (e.g., sum, max comparison)
 * @param errorPrefix - Prefix for error messages
 * @param initialState - Initial state for the collector function
 * @returns An object containing the processed numeric values and count
 */
function processNumericValues<T>(
  dataCalc: DataCalc,
  variable: string,
  options: SummarizeOptions | undefined,
  collector: (value: number, state: T) => T,
  errorPrefix: string,
  initialState: T,
): { state: T; count: number; containsMissing: boolean } {
  const mergedOptions = applyDefaultOptions(options);

  if (typeof variable !== "string") {
    throw new Error(`${errorPrefix}: variable name is not a string`);
  }

  dataCalc.verifyObservationsContainVariable(variable);

  let count = 0;
  let state = initialState;
  let containsMissing = false;

  dataCalc.observations.forEach((o) => {
    if (dataCalc.isNonMissingNumeric(o[variable])) {
      state = collector(o[variable], state);
      count++;
      return;
    }

    if (typeof o[variable] === "boolean" && mergedOptions.coerceBooleans) {
      state = collector(o[variable] ? 1 : 0, state);
      count++;
      return;
    }

    if (dataCalc.isMissingNumeric(o[variable])) {
      containsMissing = true;
      return;
    }

    // For non-numeric, non-missing values that can't be coerced
    throw new Error(
      `${errorPrefix}: variable ${variable} has non-numeric value ${o[variable]} in this observation: ${JSON.stringify(o)}`,
    );
  });

  return { state, count, containsMissing };
}
const nInternal: SummarizeFunction = (dataCalc: DataCalc): number => {
  return dataCalc.length;
};
/**
 * Calculates the number of observations.
 *
 * @returns summarize operation calculating the number of observations
 *
 * @example
 * ```js
 * const d = [
 *   { a: 1, b: 2, c: 3 },
 *   { a: 0, b: 8, c: 3 },
 *   { a: 9, b: 4, c: 7 },
 * ];
 * const dc = new DataCalc(d);
 * console.log(
 *   dc.summarize({
 *     count: n()
 *   }).observations
 * );
 * // [ { count: 3 } ]
 * ```
 */

export function n(): SummarizeOperation {
  return {
    summarizeFunction: nInternal,
    parameters: [],
  };
}
const sumInternal: SummarizeFunction = (
  dataCalc: DataCalc,
  params: Array<DataValue>,
  options?: SummarizeOptions,
): DataValue => {
  const variable = params[0] as string;
  const mergedOptions = applyDefaultOptions(options);

  const result = processNumericValues(
    dataCalc,
    variable,
    options,
    (value, sum) => sum + value,
    "sum()",
    0,
  );

  // Return null if there are missing values and skipMissing is false
  if (result.containsMissing && !mergedOptions.skipMissing) {
    return null;
  }

  if (result.count === 0) {
    return null; // Return null instead of throwing an error
  }

  return result.state;
};
/**
 * Calculates the sum of a variable.
 *
 * @param variable name of variable to calculate the sum of
 * @param options options for handling missing values and boolean coercion
 * @returns summarize operation calculating the sum
 *
 * @example
 * ```js
 * const d = [
 *   { a: 1, b: 2, c: 3 },
 *   { a: 0, b: 8, c: 3 },
 *   { a: 9, b: 4, c: 7 },
 * ];
 * const dc = new DataCalc(d);
 * console.log(
 *   dc.summarize({
 *     totalB: sum("b")
 *   }).observations
 * );
 * // [ { totalB: 14 } ]
 * ```
 */

export function sum(
  variable: string,
  options?: SummarizeOptions,
): SummarizeOperation {
  return {
    summarizeFunction: sumInternal,
    parameters: [variable],
    options: options,
  };
}
const meanInternal: SummarizeFunction = (
  dataCalc: DataCalc,
  params: Array<DataValue>,
  options?: SummarizeOptions,
): DataValue => {
  const variable = params[0] as string;
  const mergedOptions = applyDefaultOptions(options);

  const result = processNumericValues(
    dataCalc,
    variable,
    options,
    (value, sum) => sum + value,
    "mean()",
    0,
  );

  // Return null if there are missing values and skipMissing is false
  if (result.containsMissing && !mergedOptions.skipMissing) {
    return null;
  }

  if (result.count === 0) {
    return null; // Return null instead of throwing an error
  }

  return result.state / result.count;
};
/**
 * Calculates the mean of a variable.
 *
 * @param variable name of variable to calculate the mean of
 * @param options options for handling missing values and boolean coercion
 * @returns summarize operation calculating the mean
 *
 * @example
 * ```js
 * const d = [
 *   { a: 1, b: 2, c: 3 },
 *   { a: 0, b: 8, c: 3 },
 *   { a: 9, b: 4, c: 7 },
 * ];
 * const dc = new DataCalc(d);
 * console.log(
 *   dc.summarize({
 *     meanA: mean("a")
 *   }).observations
 * );
 * // [ { meanA: 3.3333333333333335 } ]
 * ```
 */

export function mean(
  variable: string,
  options?: SummarizeOptions,
): SummarizeOperation {
  return {
    summarizeFunction: meanInternal,
    parameters: [variable],
    options: options,
  };
}
const varianceInternal: SummarizeFunction = (
  dataCalc: DataCalc,
  params: Array<DataValue>,
  options?: SummarizeOptions,
): DataValue => {
  const variable = params[0] as string;
  const mergedOptions = applyDefaultOptions(options);

  // First pass: mean
  const meanResult = processNumericValues(
    dataCalc,
    variable,
    options,
    (value, sum) => sum + value,
    "variance()",
    0,
  );

  // Return null if there are missing values and skipMissing is false
  if (meanResult.containsMissing && !mergedOptions.skipMissing) {
    return null;
  }

  if (meanResult.count === 0) {
    return null; // Return null instead of throwing an error
  }

  if (meanResult.count <= 1) {
    return null; // Need at least two observations
  }

  const meanValue = meanResult.state / meanResult.count;

  // Second pass: sum of squared deviations
  const varianceResult = processNumericValues(
    dataCalc,
    variable,
    options,
    (value, sum) => {
      const actualValue =
        typeof value === "boolean" && options?.coerceBooleans
          ? value
            ? 1
            : 0
          : value;
      return sum + Math.pow(actualValue - meanValue, 2);
    },
    "variance()",
    0,
  );

  return varianceResult.state / (meanResult.count - 1);
};
/**
 * Calculates the variance of a variable.
 *
 * @param variable name of variable to calculate the variance of
 * @param options options for handling missing values and boolean coercion
 * @returns summarize operation calculating the variance
 *
 * @example
 * ```js
 * const d = [
 *   { a: 1, b: 2, c: 3 },
 *   { a: 0, b: 8, c: 3 },
 *   { a: 9, b: 4, c: 7 },
 *   { a: 5, b: 0, c: 7 },
 * ];
 * const dc = new DataCalc(d);
 * console.log(
 *   dc.summarize({
 *     varA: variance("a")
 *   }).observations
 * );
 * // [ { varA: 16.916666666666668 } ]
 * ```
 */

export function variance(
  variable: string,
  options?: SummarizeOptions,
): SummarizeOperation {
  return {
    summarizeFunction: varianceInternal,
    parameters: [variable],
    options: options,
  };
}
const minInternal: SummarizeFunction = (
  dataCalc: DataCalc,
  params: Array<DataValue>,
  options?: SummarizeOptions,
): DataValue => {
  const variable = params[0] as string;
  const mergedOptions = applyDefaultOptions(options);

  const result = processNumericValues(
    dataCalc,
    variable,
    options,
    (value, min) =>
      min === Number.POSITIVE_INFINITY || value < min ? value : min,
    "min()",
    Number.POSITIVE_INFINITY,
  );

  // Return null if there are missing values and skipMissing is false
  if (result.containsMissing && !mergedOptions.skipMissing) {
    return null;
  }

  if (result.count === 0) {
    return null; // Return null instead of throwing an error
  }

  return result.state;
};
/**
 * Calculates the minimum value of a variable.
 *
 * @param variable name of variable to calculate the minimum value of
 * @param options options for handling missing values and boolean coercion
 * @returns summarize operation calculating the minimum
 *
 * @example
 * ```js
 * const d = [
 *   { a: 1, b: 2, c: 3 },
 *   { a: 0, b: 8, c: 3 },
 *   { a: 9, b: 4, c: 7 },
 *   { a: 5, b: 0, c: 7 },
 * ];
 * const dc = new DataCalc(d);
 * console.log(
 *   dc.summarize({
 *     minA: min("a")
 *   }).observations
 * );
 * // [ { minA: 0 } ]
 * ```
 */

export function min(
  variable: string,
  options?: SummarizeOptions,
): SummarizeOperation {
  return {
    summarizeFunction: minInternal,
    parameters: [variable],
    options: options,
  };
}
const maxInternal: SummarizeFunction = (
  dataCalc: DataCalc,
  params: Array<DataValue>,
  options?: SummarizeOptions,
): DataValue => {
  const variable = params[0] as string;
  const mergedOptions = applyDefaultOptions(options);

  const result = processNumericValues(
    dataCalc,
    variable,
    options,
    (value, max) =>
      max === Number.NEGATIVE_INFINITY || value > max ? value : max,
    "max()",
    Number.NEGATIVE_INFINITY,
  );

  // Return null if there are missing values and skipMissing is false
  if (result.containsMissing && !mergedOptions.skipMissing) {
    return null;
  }

  if (result.count === 0) {
    return null; // Return null instead of throwing an error
  }

  return result.state;
};
/**
 * Calculates the maximum value of a variable.
 *
 * @param variable name of variable to calculate the maximum value of
 * @param options options for handling missing values and boolean coercion
 * @returns summarize operation calculating the maximum
 *
 * @example
 * ```js
 * const d = [
 *   { a: 1, b: 2, c: 3 },
 *   { a: 0, b: 8, c: 3 },
 *   { a: 9, b: 4, c: 7 },
 *   { a: 5, b: 0, c: 7 },
 * ];
 * const dc = new DataCalc(d);
 * console.log(
 *   dc.summarize({
 *     maxA: max("a")
 *   }).observations
 * );
 * // [ { maxA: 9 } ]
 * ```
 */

export function max(
  variable: string,
  options?: SummarizeOptions,
): SummarizeOperation {
  return {
    summarizeFunction: maxInternal,
    parameters: [variable],
    options: options,
  };
}
const medianInternal: SummarizeFunction = (
  dataCalc: DataCalc,
  params: Array<DataValue>,
  options?: SummarizeOptions,
): DataValue => {
  const variable = params[0] as string;
  const mergedOptions = applyDefaultOptions(options);

  dataCalc.verifyObservationsContainVariable(variable);

  // Collect all valid values into an array
  const values: number[] = [];
  let containsMissing = false;

  dataCalc.observations.forEach((o) => {
    if (dataCalc.isNonMissingNumeric(o[variable])) {
      values.push(o[variable]);
    } else if (
      typeof o[variable] === "boolean" &&
      mergedOptions.coerceBooleans
    ) {
      values.push(o[variable] ? 1 : 0);
    } else if (dataCalc.isMissingNumeric(o[variable])) {
      containsMissing = true;
      if (!mergedOptions.skipMissing) {
        return; // Don't throw, let null be returned later
      }
    } else {
      throw new Error(
        `median(): variable ${variable} has non-numeric value ${o[variable]} in this observation: ${JSON.stringify(o)}`,
      );
    }
  });

  // Return null if there are missing values and skipMissing is false
  if (containsMissing && !mergedOptions.skipMissing) {
    return null;
  }

  if (values.length === 0) {
    return null; // Return null instead of throwing an error
  }

  values.sort((a, b) => a - b);
  const mid = Math.floor(values.length / 2);

  if (values.length % 2 === 0) {
    return (values[mid - 1] + values[mid]) / 2;
  } else {
    return values[mid];
  }
};
/**
 * Calculates the median value of a variable.
 *
 * @param variable name of variable to calculate the median value of
 * @param options options for handling missing values and boolean coercion
 * @returns summarize operation calculating the median
 *
 * @example
 * ```js
 * const d = [
 *   { a: 1, b: 2, c: 3 },
 *   { a: 0, b: 8, c: 3 },
 *   { a: 9, b: 4, c: 7 },
 *   { a: 5, b: 0, c: 7 },
 * ];
 * const dc = new DataCalc(d);
 * console.log(
 *   dc.summarize({
 *     medA: median("a")
 *   }).observations
 * );
 * // [ { medA: 3 } ]
 * ```
 */

export function median(
  variable: string,
  options?: SummarizeOptions,
): SummarizeOperation {
  return {
    summarizeFunction: medianInternal,
    parameters: [variable],
    options: options,
  };
}
const sdInternal: SummarizeFunction = (
  dataCalc: DataCalc,
  params: Array<DataValue>,
  options?: SummarizeOptions,
): DataValue => {
  // Reuse the variance calculation and take the square root
  const varianceValue = varianceInternal(dataCalc, params, options);

  // If variance returned null, sd should also return null
  if (varianceValue === null) {
    return null;
  }

  return Math.sqrt(varianceValue as number);
};
/**
 * Calculates the standard deviation of a variable.
 *
 * @param variable name of variable to calculate the standard deviation of
 * @param options options for handling missing values and boolean coercion
 * @returns summarize operation calculating the standard deviation
 *
 * @example
 * ```js
 * const d = [
 *   { a: 1, b: 2, c: 3 },
 *   { a: 0, b: 8, c: 3 },
 *   { a: 9, b: 4, c: 7 },
 *   { a: 5, b: 0, c: 7 },
 * ];
 * const dc = new DataCalc(d);
 * console.log(
 *   dc.summarize({
 *     sdA: sd("a")
 *   }).observations
 * );
 * // [ { sdA: 4.112987559751022 } ]
 * ```
 */

export function sd(
  variable: string,
  options?: SummarizeOptions,
): SummarizeOperation {
  return {
    summarizeFunction: sdInternal,
    parameters: [variable],
    options: options,
  };
}
