import { DataCalc } from "./DataCalc";
import { DataValue } from "./DataValue";
import { Observation } from "./Observation";
import { SummarizeOperation } from "./SummarizeOperation";
import { SummarizeFunction, LazyValue } from "./SummarizeFunction";
import { SummarizeOptions } from "./SummarizeOptions";
import { M2Error } from "./M2Error";
import { getChainOps, clearChainOps } from "./ChainBuilder";

/**
 * Default options for summarize operations
 */
const DEFAULT_SUMMARIZE_OPTIONS: SummarizeOptions = {
  coerceBooleans: true,
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

// Resolve a possible lazy parameter (function) using the provided DataCalc.
function resolveLazy(
  param: DataValue | DataValue[] | LazyValue | undefined,
  dataCalc: DataCalc,
  opName?: string,
): DataValue | DataValue[] | undefined {
  if (typeof param !== "function") {
    return param as DataValue | DataValue[] | undefined;
  }

  // param is a function — call it with the DataCalc and validate the result
  try {
    const res = (param as LazyValue)(dataCalc);

    // disallow returning another function
    if (typeof res === "function") {
      throw new M2Error(
        `${opName || "summarize()"}: lazy callback returned a function; expected a value or array of values.`,
      );
    }

    // disallow returning a DataCalc instance
    if (res instanceof DataCalc) {
      throw new M2Error(
        `${opName || "summarize()"}: lazy callback returned a DataCalc instance; expected a value or array of values.`,
      );
    }

    return res as DataValue | DataValue[] | undefined;
  } catch (err: any) {
    // Wrap any errors thrown by the lazy callback with context
    throw new M2Error(
      `${opName || "summarize()"}: lazy callback threw an error: ${
        err && err.message ? err.message : String(err)
      }`,
    );
  }
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
    throw new M2Error(
      `${errorPrefix}: variable ${variable} has non-numeric value ${o[variable]} in this observation: ${JSON.stringify(o)}`,
    );
  });

  return { state, count, containsMissing };
}

/**
 * Processes an array of numeric values directly rather than through a
 * variable name.
 */
function processDirectValues<T>(
  values: DataValue[],
  options: SummarizeOptions | undefined,
  collector: (value: number, state: T) => T,
  errorPrefix: string,
  initialState: T,
): { state: T; count: number; containsMissing: boolean } {
  const mergedOptions = applyDefaultOptions(options);
  let state = initialState;
  let count = 0;
  let containsMissing = false;

  for (const value of values) {
    if (typeof value === "number" && !isNaN(value) && isFinite(value)) {
      state = collector(value, state);
      count++;
    } else if (typeof value === "boolean" && mergedOptions.coerceBooleans) {
      state = collector(value ? 1 : 0, state);
      count++;
    } else if (
      value === null ||
      value === undefined ||
      (typeof value === "number" && (isNaN(value) || !isFinite(value)))
    ) {
      containsMissing = true;
    } else {
      throw new M2Error(`${errorPrefix}: has non-numeric value ${value}`);
    }
  }

  return { state, count, containsMissing };
}

/**
 * Processes a single value for summarize operations rather than through a
 * variable name.
 */
function processSingleValue(
  value: DataValue,
  options: SummarizeOptions | undefined,
  errorPrefix: string,
): { value: number; isMissing: boolean } {
  const mergedOptions = applyDefaultOptions(options);

  if (typeof value === "number" && !isNaN(value) && isFinite(value)) {
    return { value, isMissing: false };
  } else if (typeof value === "boolean" && mergedOptions.coerceBooleans) {
    return { value: value ? 1 : 0, isMissing: false };
  } else if (
    value === null ||
    value === undefined ||
    (typeof value === "number" && (isNaN(value) || !isFinite(value)))
  ) {
    return { value: 0, isMissing: true };
  } else {
    throw new M2Error(`${errorPrefix}: has non-numeric value ${value}`);
  }
}

const nInternal: SummarizeFunction = (
  dataCalc: DataCalc,
  params?: Array<DataValue | LazyValue>,
): number => {
  const rawParam = params ? params[0] : undefined;

  // If a predicate function (obs => boolean) was supplied, detect by
  // applying to the first observation and checking for a boolean result.
  if (typeof rawParam === "function") {
    const firstObs = dataCalc.observations[0];
    if (firstObs !== undefined) {
      try {
        const test = (rawParam as (o: Observation) => any)(firstObs);
        if (typeof test === "boolean") {
          // Treat as predicate
          let count = 0;
          dataCalc.observations.forEach((o) => {
            if ((rawParam as (o: Observation) => boolean)(o)) count++;
          });
          return count;
        }
      } catch {
        // fallthrough: treat as lazy if calling with an observation threw
      }
    }
  }

  // Resolve lazy parameters (DataCalc => value/array) and other scalar forms
  let variableOrValues = resolveLazy(rawParam as any, dataCalc);

  // No parameter: return row count
  if (variableOrValues === undefined) return dataCalc.length;

  // If a string variable name was provided, count non-missing values
  if (typeof variableOrValues === "string") {
    if (!dataCalc.variableExists(variableOrValues)) return 0;
    let count = 0;
    dataCalc.observations.forEach((o) => {
      if (o[variableOrValues] !== null && o[variableOrValues] !== undefined)
        count++;
    });
    return count;
  }

  // If an array of values was provided, count its length
  if (Array.isArray(variableOrValues)) return variableOrValues.length;

  // If a single scalar value was provided, treat non-missing as 1, missing as 0
  if (variableOrValues === null) return 0;
  return 1;
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

export function n(
  variableOrValues?:
    | string
    | DataValue
    | DataValue[]
    | LazyValue
    | ((obs: Observation) => boolean),
): SummarizeOperation {
  return SummarizeOperation.leaf(nInternal, [variableOrValues], undefined);
}

const sumInternal: SummarizeFunction = (
  dataCalc: DataCalc,
  params?: Array<DataValue | LazyValue>,
  options?: SummarizeOptions,
): DataValue => {
  let variableOrValues = params ? params[0] : undefined;
  variableOrValues = resolveLazy(variableOrValues, dataCalc);
  const mergedOptions = applyDefaultOptions(options);

  if (typeof variableOrValues === "string") {
    if (!dataCalc.variableExists(variableOrValues)) {
      return null;
    }
    const variable = variableOrValues;
    const result = processNumericValues(
      dataCalc,
      variable,
      options,
      (value, sum) => sum + value,
      "sum()",
      0,
    );

    if (result.containsMissing && !mergedOptions.skipMissing) {
      return null;
    }

    if (result.count === 0) {
      return null;
    }

    return result.state;
  } else if (Array.isArray(variableOrValues)) {
    const result = processDirectValues(
      variableOrValues,
      options,
      (value, sum) => sum + value,
      "sum()",
      0,
    );

    if (result.containsMissing && !mergedOptions.skipMissing) {
      return null;
    }

    if (result.count === 0) {
      return null;
    }

    return result.state;
  } else {
    const result = processSingleValue(variableOrValues, options, "sum()");

    if (result.isMissing && !mergedOptions.skipMissing) {
      return null;
    }

    return result.isMissing ? null : result.value;
  }
};

/**
 * Calculates the sum of a variable, value, or array of values
 *
 * @param variableOrValues - name of variable, or alternatively, a value or
 * array of values
 * @param options - options for handling missing values and boolean coercion
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
  variableOrValues: string | DataValue | DataValue[] | LazyValue,
  options?: SummarizeOptions,
): SummarizeOperation {
  return SummarizeOperation.leaf(sumInternal, [variableOrValues], options);
}

const meanInternal: SummarizeFunction = (
  dataCalc: DataCalc,
  params?: Array<DataValue | LazyValue>,
  options?: SummarizeOptions,
): DataValue => {
  let variableOrValues = params ? params[0] : undefined;
  variableOrValues = resolveLazy(variableOrValues, dataCalc);
  const mergedOptions = applyDefaultOptions(options);

  if (typeof variableOrValues === "string") {
    if (!dataCalc.variableExists(variableOrValues)) {
      return null;
    }
    const variable = variableOrValues;
    const result = processNumericValues(
      dataCalc,
      variable,
      options,
      (value, sum) => sum + value,
      "mean()",
      0,
    );

    if (result.containsMissing && !mergedOptions.skipMissing) {
      return null;
    }

    if (result.count === 0) {
      return null;
    }

    return result.state / result.count;
  } else if (Array.isArray(variableOrValues)) {
    const result = processDirectValues(
      variableOrValues,
      options,
      (value, sum) => sum + value,
      "mean()",
      0,
    );

    if (result.containsMissing && !mergedOptions.skipMissing) {
      return null;
    }

    if (result.count === 0) {
      return null;
    }

    return result.state / result.count;
  } else {
    const result = processSingleValue(variableOrValues, options, "mean()");
    return result.isMissing && !mergedOptions.skipMissing ? null : result.value;
  }
};
/**
 * Calculates the mean of a variable, value, or array of values
 *
 * @param variableOrValues - name of variable, or alternatively, a value or
 * array of values
 * @param options - options for handling missing values and boolean coercion
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
  variableOrValues: string | DataValue | DataValue[] | LazyValue,
  options?: SummarizeOptions,
): SummarizeOperation {
  return SummarizeOperation.leaf(meanInternal, [variableOrValues], options);
}

const varianceInternal: SummarizeFunction = (
  dataCalc: DataCalc,
  params?: Array<DataValue | LazyValue>,
  options?: SummarizeOptions,
): DataValue => {
  let variableOrValues = params ? params[0] : undefined;
  variableOrValues = resolveLazy(variableOrValues, dataCalc);
  const mergedOptions = applyDefaultOptions(options);

  if (typeof variableOrValues === "string") {
    if (!dataCalc.variableExists(variableOrValues)) {
      return null;
    }
    const variable = variableOrValues;

    // First pass: calculate mean
    const meanResult = processNumericValues(
      dataCalc,
      variable,
      options,
      (value, sum) => sum + value,
      "variance()",
      0,
    );

    if (meanResult.containsMissing && !mergedOptions.skipMissing) {
      return null;
    }

    if (meanResult.count <= 1) {
      return null; // Need at least two values for variance
    }

    const meanValue = meanResult.state / meanResult.count;

    // Second pass: sum of squared deviations
    const varianceResult = processNumericValues(
      dataCalc,
      variable,
      options,
      (value, sum) => {
        const actualValue =
          typeof value === "boolean" && mergedOptions.coerceBooleans
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
  } else if (Array.isArray(variableOrValues)) {
    // First collect valid values
    const validValues: number[] = [];
    let containsMissing = false;

    for (const value of variableOrValues) {
      if (typeof value === "number" && !isNaN(value) && isFinite(value)) {
        validValues.push(value);
      } else if (typeof value === "boolean" && mergedOptions.coerceBooleans) {
        validValues.push(value ? 1 : 0);
      } else if (
        value === null ||
        value === undefined ||
        (typeof value === "number" && (isNaN(value) || !isFinite(value)))
      ) {
        containsMissing = true;
      } else {
        throw new M2Error(`variance(): has non-numeric value ${value}`);
      }
    }

    if (containsMissing && !mergedOptions.skipMissing) {
      return null;
    }

    if (validValues.length <= 1) {
      return null; // Need at least two values for variance
    }

    // Calculate mean
    const sum = validValues.reduce((acc, val) => acc + val, 0);
    const mean = sum / validValues.length;

    // Calculate variance
    const sumSquaredDiffs = validValues.reduce(
      (acc, val) => acc + Math.pow(val - mean, 2),
      0,
    );

    return sumSquaredDiffs / (validValues.length - 1);
  }
  // return null as variance requires at least 2 values
  else {
    return null;
  }
};

/**
 * Calculates the variance of a variable, value, or array of values
 *
 * @param variableOrValues - name of variable, or alternatively, a value or
 * array of values
 * @param options - options for handling missing values and boolean coercion
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
  variableOrValues: string | DataValue | DataValue[] | LazyValue,
  options?: SummarizeOptions,
): SummarizeOperation {
  return SummarizeOperation.leaf(varianceInternal, [variableOrValues], options);
}

const minInternal: SummarizeFunction = (
  dataCalc: DataCalc,
  params?: Array<DataValue | LazyValue>,
  options?: SummarizeOptions,
): DataValue => {
  let variableOrValues = params ? params[0] : undefined;
  variableOrValues = resolveLazy(variableOrValues, dataCalc);
  const mergedOptions = applyDefaultOptions(options);

  if (typeof variableOrValues === "string") {
    if (!dataCalc.variableExists(variableOrValues)) {
      return null;
    }
    const variable = variableOrValues;
    const result = processNumericValues(
      dataCalc,
      variable,
      options,
      (value, min) =>
        min === Number.POSITIVE_INFINITY || value < min ? value : min,
      "min()",
      Number.POSITIVE_INFINITY,
    );

    if (result.containsMissing && !mergedOptions.skipMissing) {
      return null;
    }

    if (result.count === 0) {
      return null;
    }

    return result.state;
  } else if (Array.isArray(variableOrValues)) {
    const result = processDirectValues(
      variableOrValues,
      options,
      (value, min) =>
        min === Number.POSITIVE_INFINITY || value < min ? value : min,
      "min()",
      Number.POSITIVE_INFINITY,
    );

    if (result.containsMissing && !mergedOptions.skipMissing) {
      return null;
    }

    if (result.count === 0) {
      return null;
    }

    return result.state;
  } else {
    const result = processSingleValue(variableOrValues, options, "min()");

    if (result.isMissing && !mergedOptions.skipMissing) {
      return null;
    }

    return result.isMissing ? null : result.value;
  }
};

/**
 * Calculates the minimum value of a variable, value, or array of values
 *
 * @param variableOrValues - name of variable, or alternatively, a value or
 * array of values
 * @param options - options for handling missing values and boolean coercion
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
  variableOrValues: string | DataValue | DataValue[] | LazyValue,
  options?: SummarizeOptions,
): SummarizeOperation {
  return SummarizeOperation.leaf(minInternal, [variableOrValues], options);
}

const maxInternal: SummarizeFunction = (
  dataCalc: DataCalc,
  params?: Array<DataValue | LazyValue>,
  options?: SummarizeOptions,
): DataValue => {
  let variableOrValues = params ? params[0] : undefined;
  variableOrValues = resolveLazy(variableOrValues, dataCalc);
  const mergedOptions = applyDefaultOptions(options);

  if (typeof variableOrValues === "string") {
    if (!dataCalc.variableExists(variableOrValues)) {
      return null;
    }
    const variable = variableOrValues;
    const result = processNumericValues(
      dataCalc,
      variable,
      options,
      (value, max) =>
        max === Number.NEGATIVE_INFINITY || value > max ? value : max,
      "max()",
      Number.NEGATIVE_INFINITY,
    );

    if (result.containsMissing && !mergedOptions.skipMissing) {
      return null;
    }

    if (result.count === 0) {
      return null;
    }

    return result.state;
  } else if (Array.isArray(variableOrValues)) {
    const result = processDirectValues(
      variableOrValues,
      options,
      (value, max) =>
        max === Number.NEGATIVE_INFINITY || value > max ? value : max,
      "max()",
      Number.NEGATIVE_INFINITY,
    );

    if (result.containsMissing && !mergedOptions.skipMissing) {
      return null;
    }

    if (result.count === 0) {
      return null;
    }

    return result.state;
  } else {
    const result = processSingleValue(variableOrValues, options, "max()");

    if (result.isMissing && !mergedOptions.skipMissing) {
      return null;
    }

    return result.isMissing ? null : result.value;
  }
};

/**
 * Calculates the maximum value of a variable, value, or array of values
 *
 * @param variableOrValues - name of variable, or alternatively, a value or
 * array of values
 * @param options - options for handling missing values and boolean coercion
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
  variableOrValues: string | DataValue | DataValue[] | LazyValue,
  options?: SummarizeOptions,
): SummarizeOperation {
  return SummarizeOperation.leaf(maxInternal, [variableOrValues], options);
}

const medianInternal: SummarizeFunction = (
  dataCalc: DataCalc,
  params?: Array<DataValue | LazyValue>,
  options?: SummarizeOptions,
): DataValue => {
  let variableOrValues = params ? params[0] : undefined;
  variableOrValues = resolveLazy(variableOrValues, dataCalc);
  const mergedOptions = applyDefaultOptions(options);

  if (typeof variableOrValues === "string") {
    if (!dataCalc.variableExists(variableOrValues)) {
      return null;
    }
    const variable = variableOrValues;
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
      } else {
        throw new M2Error(
          `median(): variable ${variable} has non-numeric value ${o[variable]} in this observation: ${JSON.stringify(o)}`,
        );
      }
    });

    if (containsMissing && !mergedOptions.skipMissing) {
      return null;
    }

    if (values.length === 0) {
      return null;
    }

    values.sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);

    if (values.length % 2 === 0) {
      return (values[mid - 1] + values[mid]) / 2;
    } else {
      return values[mid];
    }
  } else if (Array.isArray(variableOrValues)) {
    // Collect valid values
    const values: number[] = [];
    let containsMissing = false;

    for (const value of variableOrValues) {
      if (typeof value === "number" && !isNaN(value) && isFinite(value)) {
        values.push(value);
      } else if (typeof value === "boolean" && mergedOptions.coerceBooleans) {
        values.push(value ? 1 : 0);
      } else if (
        value === null ||
        value === undefined ||
        (typeof value === "number" && (isNaN(value) || !isFinite(value)))
      ) {
        containsMissing = true;
      } else {
        throw new M2Error(`median(): has non-numeric value ${value}`);
      }
    }

    if (containsMissing && !mergedOptions.skipMissing) {
      return null;
    }

    if (values.length === 0) {
      return null;
    }

    values.sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);

    if (values.length % 2 === 0) {
      return (values[mid - 1] + values[mid]) / 2;
    } else {
      return values[mid];
    }
  } else {
    const result = processSingleValue(variableOrValues, options, "median()");

    if (result.isMissing && !mergedOptions.skipMissing) {
      return null;
    }

    return result.isMissing ? null : result.value;
  }
};

/**
 * Calculates the median value of a variable, value, or array of values
 *
 * @param variableOrValues - name of variable, or alternatively, a value or
 * array of values
 * @param options - options for handling missing values and boolean coercion
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
  variableOrValues: string | DataValue | DataValue[] | LazyValue,
  options?: SummarizeOptions,
): SummarizeOperation {
  return SummarizeOperation.leaf(medianInternal, [variableOrValues], options);
}

const sdInternal: SummarizeFunction = (
  dataCalc: DataCalc,
  params?: Array<DataValue | LazyValue>,
  options?: SummarizeOptions,
): DataValue => {
  let variableOrValues = params ? params[0] : undefined;
  variableOrValues = resolveLazy(variableOrValues, dataCalc);

  if (typeof variableOrValues === "string") {
    if (!dataCalc.variableExists(variableOrValues)) {
      return null;
    }
    // Reuse the variance calculation and take the square root
    const varianceValue = varianceInternal(dataCalc, params, options);

    // If variance returned null, sd should also return null
    if (varianceValue === null) {
      return null;
    }

    return Math.sqrt(varianceValue as number);
  } else if (Array.isArray(variableOrValues)) {
    // Modify params to pass to varianceInternal
    const newParams = params ? [...params] : [variableOrValues];

    // Reuse the variance calculation and take the square root
    const varianceValue = varianceInternal(dataCalc, newParams, options);

    // If variance returned null, sd should also return null
    if (varianceValue === null) {
      return null;
    }

    return Math.sqrt(varianceValue as number);
  }
  // return null as sd requires at least 2 values
  else {
    return null;
  }
};

/**
 * Calculates the standard deviation of a variable, value, or array of values
 *
 * @param variableOrValues - name of variable, or alternatively, a value or
 * array of values
 * @param options - options for handling missing values and boolean coercion
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
  variableOrValues: string | DataValue | DataValue[] | LazyValue,
  options?: SummarizeOptions,
): SummarizeOperation {
  return SummarizeOperation.leaf(sdInternal, [variableOrValues], options);
}

/**
 * Scalar / identity helper: wrap a numeric (or boolean) literal as a SummarizeOperation
 * so it can participate in expression chaining (e.g. s(10).mul(mean('a')) ).
 */
const scalarInternal: SummarizeFunction = (
  _dataCalc: DataCalc,
  params?: Array<DataValue | LazyValue>,
  options?: SummarizeOptions,
): DataValue => {
  let v = params ? params[0] : undefined;
  // If scalar is provided as a lazy function, evaluate it now.
  if (typeof v === "function") v = (v as LazyValue)(_dataCalc);
  // If scalar is provided as a chain placeholder string like __CHAIN_EXPR__[id],
  // resolve and evaluate the chain against the current DataCalc so scalars can
  // wrap lazy chain terminal values (e.g., filter(...).length).
  if (typeof v === "string") {
    const re = /^__CHAIN_EXPR__\[(.*?)\]$/;
    const m = re.exec(v);
    if (m) {
      const payload = m[1];
      let ops: any[] | undefined = getChainOps(payload as string);
      if (!ops) {
        try {
          ops = JSON.parse(decodeURIComponent(payload));
        } catch {
          ops = undefined;
        }
      }

      if (ops) {
        let current: any = _dataCalc;
        let evaluated: number | boolean | undefined = undefined;
        for (const op of ops) {
          const method = (current as any)[op.name];
          if (typeof method !== "function") {
            evaluated = NaN;
            break;
          }
          const res = method.apply(current, op.args);
          if (res instanceof DataCalc) {
            current = res;
            continue;
          }
          if (Array.isArray(res)) {
            evaluated = res.length;
            break;
          }
          // Preserve boolean results so downstream coercion can consult
          // `options.coerceBooleans` via `processSingleValue` instead of
          // coercing here unconditionally.
          if (typeof res === "boolean") {
            evaluated = res;
            break;
          }
          evaluated = typeof res === "number" ? res : Number(res);
          break;
        }
        if (evaluated === undefined)
          evaluated = current instanceof DataCalc ? current.length : NaN;
        if (!Number.isNaN(evaluated)) v = evaluated;
        else v = null;
        // clean up registry
        try {
          clearChainOps(payload as string);
        } catch {}
      }
    }
  }

  // If the scalar wraps a SummarizeOperation, evaluate it now against this DataCalc
  if (typeof v === "object" && v !== null && "summarizeFunction" in v) {
    try {
      const op = v as unknown as SummarizeOperation;
      const paramsForOp = Array.isArray((op as any).parameters)
        ? (op as any).parameters
        : (op as any).parameters === undefined
          ? undefined
          : [(op as any).parameters];
      const raw = op.summarizeFunction(
        _dataCalc,
        paramsForOp,
        (op as any).options,
      );
      v = raw;
    } catch {
      v = null;
    }
  }

  // Reuse processSingleValue to ensure consistent coercion and missing handling
  const result = processSingleValue(v, options, "scalar()");
  return result.isMissing ? null : result.value;
};

/**
 * Wraps a scalar literal as a `SummarizeOperation` so it can participate in
 * expression chaining with other summarize operations.
 *
 * @remarks Accepted inputs:
 * - number: returned as-is
 * - boolean: coerced to 1 (true) or 0 (false)
 * - null/undefined: treated as a missing value and yields `null` when
 *   evaluated in a summarize context
 *
 * `s` is provided as a shorthand alias for `scalar`.
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
 *     meanA: scalar(10).mul(mean("a")),
 *     meanA2: s(10).mul(mean("a")),
 *   }).observations
 * );
 * // [ { meanA: 33.3333, meanA2: 33.3333 } ]
 * ```
 */
export function scalar(
  value: number | boolean | null | undefined | LazyValue | SummarizeOperation,
): SummarizeOperation {
  return SummarizeOperation.leaf(scalarInternal, [value], undefined);
}

// short alias for convenience
export const s = scalar;

// Re-export parens() from SummarizeOperation.ts. Users can import it from
// the same module as other summarize methods here to improve discoverability
// without moving the implementation and risking circular imports.
export { parens } from "./SummarizeOperation";
