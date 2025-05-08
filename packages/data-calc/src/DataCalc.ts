import { DataCalcOptions } from "./DataCalcOptions";
import { DataValue } from "./DataValue";
import { M2Error } from "./M2Error";
import { Mutations } from "./Mutations";
import { Observation } from "./Observation";
import { SummarizeOperation } from "./SummarizeOperation";

export class DataCalc {
  private _observations: Array<Observation>;
  private _groups = new Array<string>();

  /**
   * A class for transformation and calculation of m2c2kit data.
   *
   * @remarks The purpose is to provide a simple and intuitive interface for
   * assessments to score and summarize their own data. It is not meant for
   * data analysis or statistical modeling. The idiomatic approach is based on the
   * dplyr R package.
   *
   * @param data - An array of observations, where each observation is a set of
   * key-value pairs of variable names and values.
   * @param options - Options, such as groups to group the data by
   * @example
   * ```js
   * const dc = new DataCalc(gameData.trials);
   * const mean_response_time_correct_trials = dc
   *  .filter((obs) => obs.correct_response_index === obs.user_response_index)
   *  .summarize({ mean_rt: mean("response_time_duration_ms") })
   *  .pull("mean_rt");
   * ```
   */
  constructor(data: Array<Observation>, options?: DataCalcOptions) {
    // Validate that data is an array
    if (!Array.isArray(data)) {
      throw new M2Error(
        "DataCalc constructor expects an array of observations as first argument",
      );
    }

    // Validate that all elements in the array are objects (Observations)
    for (let i = 0; i < data.length; i++) {
      if (
        data[i] === null ||
        typeof data[i] !== "object" ||
        Array.isArray(data[i])
      ) {
        throw new M2Error(
          `DataCalc constructor expects all elements to be objects (observations). Element at index ${i} is ${typeof data[i]}. Element: ${JSON.stringify(data[i])}`,
        );
      }
    }

    this._observations = this.deepCopy(data);

    // Collect all unique variable names across observations
    const allVariables = new Set<string>();
    for (const observation of data) {
      for (const key of Object.keys(observation)) {
        allVariables.add(key);
      }
    }

    // Ensure all observations have all variables, and assign null if missing
    for (const observation of this._observations) {
      for (const variable of allVariables) {
        if (!(variable in observation)) {
          observation[variable] = null;
        }
      }
    }

    if (options?.groups) {
      this._groups = Array.from(options.groups);
    }
  }

  /**
   * Returns the groups in the data.
   */
  get groups() {
    return this._groups;
  }

  /**
   * Returns the observations in the data.
   *
   * @remarks An observation is conceptually similar to a row in a dataset,
   * where the keys are the variable names and the values are the variable values.
   */
  get observations() {
    return this._observations;
  }

  /**
   * Alias for the observations property.
   */
  get rows() {
    return this._observations;
  }

  /**
   * Returns a single variable from the data.
   *
   * @remarks If the variable length is 1, the value is returned. If the
   * variable has length > 1, an array of values is returned.
   *
   * @param variable - Name of variable to pull from the data
   * @returns the value of the variable
   *
   * @example
   * ```js
   * const d = [{ a: 1, b: 2, c: 3 }];
   * const dc = new DataCalc(d);
   * console.log(
   *   dc.pull("c")
   * ); // 3
   * ```
   */
  pull(variable: string): DataValue | DataValue[] {
    if (this._observations.length === 0) {
      // Instead of throwing an error, we return null and log a warning. When
      // filtering datasets, it is common to end up with no observations. Thus,
      // throwing an error would be too disruptive.
      console.warn(
        `DataCalc.pull(): No observations available to pull variable "${variable}" from. Returning null.`,
      );
      return null;
    }
    this.verifyObservationsContainVariable(variable);
    const values = this._observations.map((o) => o[variable]);
    if (values.length === 1) {
      return values[0];
    }
    return values;
  }

  /**
   * Returns the number of observations in the data.
   *
   * @example
   * ```js
   * const d = [
   *   { a: 1, b: 2, c: 3 },
   *   { a: 0, b: 8, c: 3 }
   * ];
   * const dc = new DataCalc(d);
   * console.log(
   *   dc.length
   * ); // 2
   * ```
   */
  get length() {
    return this._observations.length;
  }

  /**
   * Filters observations based on a predicate function.
   *
   * @param predicate - A function that returns true for observations to keep and
   * false for observations to discard
   * @returns A new `DataCalc` object with only the observations that pass the
   * predicate function
   *
   * @example
   * ```js
   * const d = [
   *   { a: 1, b: 2, c: 3 },
   *   { a: 0, b: 8, c: 3 },
   *   { a: 9, b: 4, c: 7 },
   * ];
   * const dc = new DataCalc(d);
   * console.log(dc.filter((obs) => obs.b >= 3).observations);
   * // [ { a: 0, b: 8, c: 3 }, { a: 9, b: 4, c: 7 } ]
   * ```
   */
  filter(predicate: (observation: Observation) => boolean) {
    if (this._groups.length > 0) {
      throw new M2Error(
        `filter() cannot be used on grouped data. The data are currently grouped by ${this._groups.join(
          ", ",
        )}. Ungroup the data first using ungroup().`,
      );
    }

    return new DataCalc(
      this._observations.filter(
        predicate as (observation: Observation) => boolean,
      ),
      { groups: this._groups },
    );
  }

  /**
   * Groups observations by one or more variables.
   *
   * @remarks This is used with the `summarize()` method to calculate summaries
   * by group.
   *
   * @param groups - variable names to group by
   * @returns A new `DataCalc` object with the observations grouped by one or
   * more variables
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
   * const grouped = dc.groupBy("c");
   * // subsequent summarize operations will be performed separately by
   * // each unique level of c, in this case, 3 and 7
   * ```
   */
  groupBy(...groups: Array<string>): DataCalc {
    groups.forEach((group) => {
      this.verifyObservationsContainVariable(group);
    });
    return new DataCalc(this._observations, { groups });
  }

  /**
   * Ungroups observations.
   *
   * @returns A new DataCalc object with the observations ungrouped
   */
  ungroup(): DataCalc {
    return new DataCalc(this._observations);
  }

  /**
   * Adds new variables to the observations based on the provided mutation options.
   *
   * @param mutations - An object where the keys are the names of the new variables
   * and the values are functions that take an observation and return the value
   * for the new variable.
   * @returns A new DataCalc object with the new variables added to the observations.
   *
   * @example
   * const d = [
   *   { a: 1, b: 2, c: 3 },
   *   { a: 0, b: 8, c: 3 },
   *   { a: 9, b: 4, c: 7 },
   * ];
   * const dc = new DataCalc(d);
   * console.log(
   *   dc.mutate({ doubledA: (obs) => obs.a * 2 }).observations
   * );
   * // [ { a: 1, b: 2, c: 3, doubledA: 2 },
   * //   { a: 0, b: 8, c: 3, doubledA: 0 },
   * //   { a: 9, b: 4, c: 7, doubledA: 18 } ]
   */
  mutate(mutations: Mutations): DataCalc {
    if (this._groups.length > 0) {
      throw new M2Error(
        `mutate() cannot be used on grouped data. The data are currently grouped by ${this._groups.join(
          ", ",
        )}. Ungroup the data first using ungroup().`,
      );
    }
    const newObservations = this._observations.map((observation) => {
      let newObservation = { ...observation };
      for (const [newVariable, transformFunction] of Object.entries(
        mutations,
      )) {
        newObservation = {
          ...newObservation,
          [newVariable]: transformFunction(observation),
        };
      }
      return newObservation;
    });
    return new DataCalc(newObservations, { groups: this._groups });
  }

  /**
   * Calculates summaries of the data.
   *
   * @param summarizations - An object where the keys are the names of the new
   * variables and the values are `DataCalc` summary functions: `sum()`,
   * `mean()`, `median()`, `variance()`, `sd()`, `min()`, `max()`, or `n()`.
   * The summary functions take a variable name as a string, or alternatively,
   * a value or array of values to summarize.
   * @returns A new `DataCalc` object with the new summary variables.
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
   *     meanA: mean("a"),
   *     varA: variance("a"),
   *     totalB: sum("b")
   *   }).observations
   * );
   * // [ { meanA: 3.75, varA: 16.916666666666668, totalB: 14 } ]
   *
   * console.log(
   *   dc.summarize({
   *    filteredTotalC: sum(dc.filter(obs => obs.b > 2).pull("c"))
   *  }).observations
   * );
   * // [ { filteredTotalC: 10 } ]
   * ```
   */
  summarize(summarizations: {
    [newVariable: string]: SummarizeOperation | DataValue;
  }): DataCalc {
    if (this._groups.length === 0) {
      const obs: Observation = {};
      for (const [newVariable, value] of Object.entries(summarizations)) {
        // Check if the value is a SummarizeOperation
        if (
          typeof value === "object" &&
          value !== null &&
          "summarizeFunction" in value
        ) {
          // It's a SummarizeOperation
          const summarizeOperation = value as SummarizeOperation;
          obs[newVariable] = summarizeOperation.summarizeFunction(
            this,
            summarizeOperation.parameters,
            summarizeOperation.options,
          );
        } else {
          // It's a direct value
          obs[newVariable] = value;
        }
      }
      return new DataCalc([obs], { groups: this._groups });
    }

    // Optimized implementation of groupBy summarization
    return this.summarizeByGroups(summarizations);
  }

  private summarizeByGroups(summarizations: {
    [newVariable: string]: SummarizeOperation | DataValue;
  }): DataCalc {
    const groupMap = new Map<string, Array<Observation>>();

    this._observations.forEach((obs) => {
      const groupKey = this._groups
        .map((g) =>
          typeof obs[g] === "object" ? JSON.stringify(obs[g]) : obs[g],
        )
        .join("|");

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, []);
      }
      const groupArray = groupMap.get(groupKey);
      if (groupArray) {
        groupArray.push(obs);
      } else {
        // This should never happen due to the check above, but handles the case safely
        groupMap.set(groupKey, [obs]);
      }
    });

    const summarizedObservations: Array<Observation> = [];
    groupMap.forEach((groupObs, groupKey) => {
      const groupValues = groupKey.split("|");
      // Use first observation to determine original types
      const firstObs = groupObs[0];

      // Create summary object with group identifiers
      const summaryObj: Observation = {};
      this._groups.forEach((group, i) => {
        // Get original value as string
        const valueStr = groupValues[i];
        const originalType = typeof firstObs[group];

        if (originalType === "number") {
          summaryObj[group] = Number(valueStr);
        } else if (originalType === "boolean") {
          summaryObj[group] = valueStr === "true";
        } else if (valueStr.startsWith("{") || valueStr.startsWith("[")) {
          try {
            summaryObj[group] = JSON.parse(valueStr);
          } catch {
            throw new M2Error(
              `Failed to parse group value ${valueStr} as JSON for group ${group}`,
            );
            // alternative approach would be to swallow the error and keep as string
            // summaryObj[group] = valueStr;
          }
        } else {
          // Keep as string
          summaryObj[group] = valueStr;
        }
      });

      // Calculate summaries for this group
      const groupDataCalc = new DataCalc(groupObs);

      for (const [newVariable, value] of Object.entries(summarizations)) {
        // Check if the value is a SummarizeOperation
        if (
          typeof value === "object" &&
          value !== null &&
          "summarizeFunction" in value
        ) {
          // It's a SummarizeOperation
          const summarizeOperation = value as SummarizeOperation;
          summaryObj[newVariable] = summarizeOperation.summarizeFunction(
            groupDataCalc,
            summarizeOperation.parameters,
            summarizeOperation.options,
          );
        } else {
          // It's a direct value
          summaryObj[newVariable] = value;
        }
      }

      summarizedObservations.push(summaryObj);
    });

    return new DataCalc(summarizedObservations, { groups: this._groups });
  }

  /**
   * Selects specific variables to keep in the dataset.
   * Variables prefixed with "-" will be excluded from the result.
   *
   * @param variables - Names of variables to select; prefix with '-' to exclude instead
   * @returns A new DataCalc object with only the selected variables (minus excluded ones)
   *
   * @example
   * ```js
   * const d = [
   *   { a: 1, b: 2, c: 3, d: 4 },
   *   { a: 5, b: 6, c: 7, d: 8 }
   * ];
   * const dc = new DataCalc(d);
   * // Keep a and c
   * console.log(dc.select("a", "c").observations);
   * // [ { a: 1, c: 3 }, { a: 5, c: 7 } ]
   * ```
   */
  select(...variables: string[]): DataCalc {
    const includeVars: string[] = [];
    const excludeVars: string[] = [];

    variables.forEach((variable) => {
      if (variable.startsWith("-")) {
        excludeVars.push(variable.substring(1));
      } else {
        includeVars.push(variable);
      }
    });

    // Check if we have any includes - if not, include all variables except excludes
    const allVars =
      includeVars.length > 0
        ? includeVars
        : Object.keys(this._observations[0] || {});

    [...allVars, ...excludeVars].forEach((variable) => {
      this.verifyObservationsContainVariable(variable);
    });

    const excludeSet = new Set(excludeVars);

    // Apply selections and exclusions
    const newObservations = this._observations.map((observation) => {
      const newObservation: Observation = {};

      // If we specified includes, only include those
      if (includeVars.length > 0) {
        includeVars.forEach((variable) => {
          if (!excludeSet.has(variable)) {
            newObservation[variable] = observation[variable];
          }
        });
      } else {
        // Otherwise include all except excluded vars
        Object.keys(observation).forEach((key) => {
          if (!excludeSet.has(key)) {
            newObservation[key] = observation[key];
          }
        });
      }

      return newObservation;
    });

    return new DataCalc(newObservations, { groups: this._groups });
  }

  /**
   * Arranges (sorts) the observations based on one or more variables.
   *
   * @param variables - Names of variables to sort by, prefixed with '-' for descending order
   * @returns A new DataCalc object with the observations sorted
   *
   * @example
   * ```js
   * const d = [
   *   { a: 5, b: 2 },
   *   { a: 3, b: 7 },
   *   { a: 5, b: 1 }
   * ];
   * const dc = new DataCalc(d);
   * // Sort by a (ascending), then by b (descending)
   * console.log(dc.arrange("a", "-b").observations);
   * // [ { a: 3, b: 7 }, { a: 5, b: 2 }, { a: 5, b: 1 } ]
   * ```
   */
  arrange(...variables: string[]): DataCalc {
    if (this._groups.length > 0) {
      throw new M2Error(
        `arrange() cannot be used on grouped data. The data are currently grouped by ${this._groups.join(
          ", ",
        )}. Ungroup the data first using ungroup().`,
      );
    }

    const sortedObservations = [...this._observations].sort((a, b) => {
      for (const variable of variables) {
        let varName = variable;
        let direction = 1;

        if (variable.startsWith("-")) {
          varName = variable.substring(1);
          direction = -1;
        }

        if (!(varName in a) || !(varName in b)) {
          throw new M2Error(
            `arrange(): variable ${varName} does not exist in all observations`,
          );
        }

        const aVal = a[varName];
        const bVal = b[varName];

        // Handle different types
        if (typeof aVal !== typeof bVal) {
          return direction * (String(aVal) < String(bVal) ? -1 : 1);
        }

        if (aVal < bVal) return -1 * direction;
        if (aVal > bVal) return 1 * direction;
      }
      return 0;
    });

    return new DataCalc(sortedObservations, { groups: this._groups });
  }

  /**
   * Keeps only unique/distinct observations.
   *
   * @returns A new `DataCalc` object with only unique observations
   *
   * @example
   * ```js
   * const d = [
   *   { a: 1, b: 2, c: 3 },
   *   { a: 1, b: 2, c: 3 }, // Duplicate
   *   { a: 2, b: 3, c: 5 },
   *   { a: 1, b: 2, c: { name: "dog" } },
   *   { a: 1, b: 2, c: { name: "dog" } } // Duplicate with nested object
   * ];
   * const dc = new DataCalc(d);
   * console.log(dc.distinct().observations);
   * // [ { a: 1, b: 2, c: 3 }, { a: 2, b: 3, c: 5 }, { a: 1, b: 2, c: { name: "dog" } } ]
   * ```
   */
  distinct(): DataCalc {
    // Consider all variables for uniqueness with stable key generation
    const seen = new Set<string>();
    const uniqueObs = this._observations.filter((obs) => {
      // Create a stable string representation for comparison
      const key = JSON.stringify(this.normalizeForComparison(obs));
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return new DataCalc(uniqueObs, { groups: this._groups });
  }

  /**
   * Renames variables in the observations.
   *
   * @param renames - Object mapping new variable names to old variable names
   * @returns A new DataCalc object with renamed variables
   *
   * @example
   * ```js
   * const d = [
   *   { a: 1, b: 2, c: 3 },
   *   { a: 4, b: 5, c: 6 }
   * ];
   * const dc = new DataCalc(d);
   * console.log(dc.rename({ x: 'a', z: 'c' }).observations);
   * // [ { x: 1, b: 2, z: 3 }, { x: 4, b: 5, z: 6 } ]
   * ```
   */
  rename(renames: { [newName: string]: string }): DataCalc {
    if (this._observations.length === 0) {
      throw new M2Error("Cannot rename variables on an empty dataset");
    }

    Object.values(renames).forEach((oldName) => {
      this.verifyObservationsContainVariable(oldName);
    });

    const newObservations = this._observations.map((observation) => {
      const newObservation: Observation = {};

      // Copy all properties
      for (const [key, value] of Object.entries(observation)) {
        // If this is a property being renamed, use the new name
        const newKey = Object.entries(renames).find(
          ([, old]) => old === key,
        )?.[0];
        if (newKey) {
          newObservation[newKey] = value;
        } else if (!Object.values(renames).includes(key)) {
          // Only copy if not a renamed property
          newObservation[key] = value;
        }
      }

      return newObservation;
    });

    return new DataCalc(newObservations, { groups: this._groups });
  }

  /**
   * Performs an inner join with another DataCalc object.
   * Only rows with matching keys in both datasets are included.
   *
   * @param other - The other DataCalc object to join with
   * @param by - The variables to join on
   * @returns A new DataCalc object with joined observations
   *
   * @example
   * ```js
   * const d1 = [
   *   { id: 1, x: 'a' },
   *   { id: 2, x: 'b' },
   *   { id: 3, x: 'c' }
   * ];
   * const d2 = [
   *   { id: 1, y: 100 },
   *   { id: 2, y: 200 },
   *   { id: 4, y: 400 }
   * ];
   * const dc1 = new DataCalc(d1);
   * const dc2 = new DataCalc(d2);
   * console.log(dc1.innerJoin(dc2, ["id"]).observations);
   * // [ { id: 1, x: 'a', y: 100 }, { id: 2, x: 'b', y: 200 } ]
   * ```
   */
  innerJoin(other: DataCalc, by: string[]): DataCalc {
    if (this._groups.length > 0 || other._groups.length > 0) {
      throw new M2Error(
        `innerJoin() cannot be used on grouped data. Ungroup the data first using ungroup().`,
      );
    }

    by.forEach((key) => {
      this.verifyObservationsContainVariable(key);
      other.verifyObservationsContainVariable(key);
    });

    // Create a hash map for faster joining
    const rightMap = new Map<string, Observation[]>();
    other.observations.forEach((obs) => {
      // Skip observations with null join keys for matching
      if (this.hasNullJoinKeys(obs, by)) {
        return;
      }

      const key = by
        .map((k) => JSON.stringify(this.normalizeForComparison(obs[k])))
        .join("|");

      // Get existing matches or create new array
      const matches = rightMap.get(key) || [];
      matches.push(obs);
      rightMap.set(key, matches);
    });

    const result: Observation[] = [];

    // Process inner join - only include matches
    this._observations.forEach((leftObs) => {
      // Skip observations with null join keys for matching
      if (this.hasNullJoinKeys(leftObs, by)) {
        return;
      }

      const key = by
        .map((k) => JSON.stringify(this.normalizeForComparison(leftObs[k])))
        .join("|");
      const rightMatches = rightMap.get(key) || [];

      if (rightMatches.length > 0) {
        // We have matches, create joined rows
        rightMatches.forEach((rightObs) => {
          const joinedObs: Observation = { ...leftObs };

          // Add right values, but don't overwrite join keys
          Object.entries(rightObs).forEach(([k, v]) => {
            if (!by.includes(k)) {
              joinedObs[k] = v;
            }
          });

          result.push(joinedObs);
        });
      }
    });

    return new DataCalc(result);
  }

  /**
   * Performs a left join with another DataCalc object.
   * All rows from the left dataset are included, along with matching rows from the right.
   *
   * @param other - The other DataCalc object to join with
   * @param by - The variables to join on
   * @returns A new DataCalc object with joined observations
   *
   * @example
   * ```js
   * const d1 = [
   *   { id: 1, x: 'a' },
   *   { id: 2, x: 'b' },
   *   { id: 3, x: 'c' }
   * ];
   * const d2 = [
   *   { id: 1, y: 100 },
   *   { id: 2, y: 200 }
   * ];
   * const dc1 = new DataCalc(d1);
   * const dc2 = new DataCalc(d2);
   * console.log(dc1.leftJoin(dc2, ["id"]).observations);
   * // [ { id: 1, x: 'a', y: 100 }, { id: 2, x: 'b', y: 200 }, { id: 3, x: 'c' } ]
   * ```
   */
  leftJoin(other: DataCalc, by: string[]): DataCalc {
    if (this._groups.length > 0 || other._groups.length > 0) {
      throw new M2Error(
        `leftJoin() cannot be used on grouped data. Ungroup the data first using ungroup().`,
      );
    }

    by.forEach((key) => {
      this.verifyObservationsContainVariable(key);
      other.verifyObservationsContainVariable(key);
    });

    // Create a hash map for faster joining
    const rightMap = new Map<string, Observation[]>();
    other.observations.forEach((obs) => {
      // Skip observations with null join keys for matching
      if (this.hasNullJoinKeys(obs, by)) {
        return;
      }

      const key = by
        .map((k) => JSON.stringify(this.normalizeForComparison(obs[k])))
        .join("|");

      // Get existing matches or create new array
      const matches = rightMap.get(key) || [];
      matches.push(obs);
      rightMap.set(key, matches);
    });

    const result: Observation[] = [];

    // Process left join - include all left rows
    this._observations.forEach((leftObs) => {
      // For left join, we include the left observation even if it has null join keys
      // But it won't match with any right observation
      if (this.hasNullJoinKeys(leftObs, by)) {
        result.push({ ...leftObs });
        return;
      }

      const key = by
        .map((k) => JSON.stringify(this.normalizeForComparison(leftObs[k])))
        .join("|");
      const rightMatches = rightMap.get(key) || [];

      if (rightMatches.length > 0) {
        // We have matches, create joined rows
        rightMatches.forEach((rightObs) => {
          const joinedObs: Observation = { ...leftObs };

          // Add right values, but don't overwrite join keys
          Object.entries(rightObs).forEach(([k, v]) => {
            if (!by.includes(k)) {
              joinedObs[k] = v;
            }
          });

          result.push(joinedObs);
        });
      } else {
        // No matches but include left row anyway for left join
        result.push({ ...leftObs });
      }
    });

    return new DataCalc(result);
  }
  /**
   * Performs a right join with another DataCalc object.
   * All rows from the right dataset are included, along with matching rows from the left.
   *
   * @param other - The other DataCalc object to join with
   * @param by - The variables to join on
   * @returns A new DataCalc object with joined observations
   *
   * @example
   * ```js
   * const d1 = [
   *   { id: 1, x: 'a' },
   *   { id: 2, x: 'b' }
   * ];
   * const d2 = [
   *   { id: 1, y: 100 },
   *   { id: 2, y: 200 },
   *   { id: 4, y: 400 }
   * ];
   * const dc1 = new DataCalc(d1);
   * const dc2 = new DataCalc(d2);
   * console.log(dc1.rightJoin(dc2, ["id"]).observations);
   * // [ { id: 1, x: 'a', y: 100 }, { id: 2, x: 'b', y: 200 }, { id: 4, y: 400 } ]
   * ```
   */
  rightJoin(other: DataCalc, by: string[]): DataCalc {
    if (this._groups.length > 0 || other._groups.length > 0) {
      throw new M2Error(
        `rightJoin() cannot be used on grouped data. Ungroup the data first using ungroup().`,
      );
    }

    by.forEach((key) => {
      this.verifyObservationsContainVariable(key);
      other.verifyObservationsContainVariable(key);
    });

    // Create a hash map for faster joining
    const rightMap = new Map<string, Observation[]>();
    const rightObsWithNullKeys: Observation[] = [];

    other.observations.forEach((obs) => {
      // For right join, track right observations with null keys separately
      if (this.hasNullJoinKeys(obs, by)) {
        rightObsWithNullKeys.push(obs);
        return;
      }

      const key = by
        .map((k) => JSON.stringify(this.normalizeForComparison(obs[k])))
        .join("|");

      // Get existing matches or create new array
      const matches = rightMap.get(key) || [];
      matches.push(obs);
      rightMap.set(key, matches);
    });

    const result: Observation[] = [];
    const processedRightKeys = new Set<string>();

    // Process right join - include matches
    this._observations.forEach((leftObs) => {
      // Skip observations with null join keys for matching
      if (this.hasNullJoinKeys(leftObs, by)) {
        return;
      }

      const key = by
        .map((k) => JSON.stringify(this.normalizeForComparison(leftObs[k])))
        .join("|");
      const rightMatches = rightMap.get(key) || [];

      if (rightMatches.length > 0) {
        // We have matches, create joined rows
        rightMatches.forEach((rightObs) => {
          const joinedObs: Observation = { ...leftObs };

          // Add right values, but don't overwrite join keys
          Object.entries(rightObs).forEach(([k, v]) => {
            if (!by.includes(k)) {
              joinedObs[k] = v;
            }
          });

          result.push(joinedObs);
        });

        // Mark right key as processed
        processedRightKeys.add(key);
      }
    });

    // Add right rows that didn't match or have null keys
    other.observations.forEach((rightObs) => {
      if (this.hasNullJoinKeys(rightObs, by)) {
        // Include right observations with null keys directly
        result.push({ ...rightObs });
        return;
      }

      const key = by
        .map((k) => JSON.stringify(this.normalizeForComparison(rightObs[k])))
        .join("|");

      if (!processedRightKeys.has(key)) {
        result.push({ ...rightObs });
        processedRightKeys.add(key);
      }
    });

    return new DataCalc(result);
  }

  /**
   * Performs a full join with another DataCalc object.
   * All rows from both datasets are included.
   *
   * @param other - The other DataCalc object to join with
   * @param by - The variables to join on
   * @returns A new DataCalc object with joined observations
   *
   * @example
   * ```js
   * const d1 = [
   *   { id: 1, x: 'a' },
   *   { id: 2, x: 'b' },
   *   { id: 3, x: 'c' }
   * ];
   * const d2 = [
   *   { id: 1, y: 100 },
   *   { id: 2, y: 200 },
   *   { id: 4, y: 400 }
   * ];
   * const dc1 = new DataCalc(d1);
   * const dc2 = new DataCalc(d2);
   * console.log(dc1.fullJoin(dc2, ["id"]).observations);
   * // [
   * //   { id: 1, x: 'a', y: 100 },
   * //   { id: 2, x: 'b', y: 200 },
   * //   { id: 3, x: 'c' },
   * //   { id: 4, y: 400 }
   * // ]
   * ```
   */
  fullJoin(other: DataCalc, by: string[]): DataCalc {
    if (this._groups.length > 0 || other._groups.length > 0) {
      throw new M2Error(
        `fullJoin() cannot be used on grouped data. Ungroup the data first using ungroup().`,
      );
    }

    by.forEach((key) => {
      this.verifyObservationsContainVariable(key);
      other.verifyObservationsContainVariable(key);
    });

    // Create a hash map for faster joining
    const rightMap = new Map<string, Observation[]>();
    const rightObsWithNullKeys: Observation[] = [];

    other.observations.forEach((obs) => {
      // For full join, track right observations with null keys separately
      if (this.hasNullJoinKeys(obs, by)) {
        rightObsWithNullKeys.push(obs);
        return;
      }

      const key = by
        .map((k) => JSON.stringify(this.normalizeForComparison(obs[k])))
        .join("|");

      // Get existing matches or create new array
      const matches = rightMap.get(key) || [];
      matches.push(obs);
      rightMap.set(key, matches);
    });

    const result: Observation[] = [];
    const processedRightKeys = new Set<string>();

    // Process full join - include all rows
    this._observations.forEach((leftObs) => {
      // For full join, we include the left observation even if it has null join keys
      // But it won't match with any right observation
      if (this.hasNullJoinKeys(leftObs, by)) {
        result.push({ ...leftObs });
        return;
      }

      const key = by
        .map((k) => JSON.stringify(this.normalizeForComparison(leftObs[k])))
        .join("|");
      const rightMatches = rightMap.get(key) || [];

      if (rightMatches.length > 0) {
        // We have matches, create joined rows
        rightMatches.forEach((rightObs) => {
          const joinedObs: Observation = { ...leftObs };

          // Add right values, but don't overwrite join keys
          Object.entries(rightObs).forEach(([k, v]) => {
            if (!by.includes(k)) {
              joinedObs[k] = v;
            }
          });

          result.push(joinedObs);
        });

        // Mark right key as processed
        processedRightKeys.add(key);
      } else {
        // No matches but include left row anyway for full join
        result.push({ ...leftObs });
      }
    });

    // Add right rows that didn't match or have null keys
    other.observations.forEach((rightObs) => {
      if (this.hasNullJoinKeys(rightObs, by)) {
        // Include right observations with null keys directly
        result.push({ ...rightObs });
        return;
      }

      const key = by
        .map((k) => JSON.stringify(this.normalizeForComparison(rightObs[k])))
        .join("|");

      if (!processedRightKeys.has(key)) {
        result.push({ ...rightObs });
        processedRightKeys.add(key);
      }
    });

    return new DataCalc(result);
  }

  /**
   * Slice observations by position.
   *
   * @param start - Starting position (0-based). Negative values count from
   * the end.
   * @param end - Ending position (exclusive)
   * @returns A new DataCalc object with sliced observations
   *
   * @remarks If `end` is not provided, it will return a single observation at
   * `start` position. If `start` is beyond the length of observations,
   * it will return an empty DataCalc.
   *
   * @example
   * ```js
   * const d = [
   *   { a: 1, b: 2 },
   *   { a: 3, b: 4 },
   *   { a: 5, b: 6 },
   *   { a: 7, b: 8 }
   * ];
   * const dc = new DataCalc(d);
   * console.log(dc.slice(1, 3).observations);
   * // [ { a: 3, b: 4 }, { a: 5, b: 6 } ]
   * console.log(dc.slice(0).observations);
   * // [ { a: 1, b: 2 } ]
   * ```
   */
  slice(start: number, end?: number): DataCalc {
    if (this._groups.length > 0) {
      throw new M2Error(
        `slice() cannot be used on grouped data. Ungroup the data first using ungroup().`,
      );
    }

    let sliced: Observation[];

    if (start >= this._observations.length) {
      // If start is beyond the length of observations, return empty DataCalc
      return new DataCalc([], { groups: this._groups });
    }
    if (end === undefined) {
      // return a single observation at start position
      const index = start < 0 ? this._observations.length + start : start;
      sliced = [this._observations[index]];
    } else {
      sliced = this._observations.slice(start, end);
    }
    return new DataCalc(sliced, { groups: this._groups });
  }

  /**
   * Combines observations from two DataCalc objects by rows.
   *
   * @param other - The other DataCalc object to bind with
   * @returns A new DataCalc object with combined observations
   *
   * @example
   * ```js
   * const d1 = [
   *   { a: 1, b: 2 },
   *   { a: 3, b: 4 }
   * ];
   * const d2 = [
   *   { a: 5, b: 6 },
   *   { a: 7, b: 8 }
   * ];
   * const dc1 = new DataCalc(d1);
   * const dc2 = new DataCalc(d2);
   * console.log(dc1.bindRows(dc2).observations);
   * // [ { a: 1, b: 2 }, { a: 3, b: 4 }, { a: 5, b: 6 }, { a: 7, b: 8 } ]
   * ```
   */
  bindRows(other: DataCalc): DataCalc {
    // Check for type mismatches in common variables
    if (this._observations.length > 0 && other.observations.length > 0) {
      const thisVariables = new Set(Object.keys(this._observations[0]));
      const otherVariables = new Set(Object.keys(other.observations[0]));

      // Find common variables
      const commonVariables = [...thisVariables].filter((variable) =>
        otherVariables.has(variable),
      );

      // For each common variable, check if types match
      commonVariables.forEach((variable) => {
        const thisType = this.getVariableType(variable);
        const otherType = other.getVariableType(variable);

        if (thisType !== otherType) {
          console.warn(
            `Warning: bindRows() is combining datasets with different data types for variable '${variable}'. ` +
              `Left dataset has type '${thisType}' and right dataset has type '${otherType}'.`,
          );
        }
      });
    }

    return new DataCalc([...this._observations, ...other.observations]);
  }

  /**
   * Helper method to determine the primary type of a variable across observations
   * @internal
   *
   * @param variable - The variable name to check
   * @returns The most common type for the variable or 'mixed' if no clear type exists
   */
  private getVariableType(variable: string): string {
    if (this._observations.length === 0) {
      return "unknown";
    }

    // Count occurrences of each type
    const typeCounts: Record<string, number> = {};

    this._observations.forEach((obs) => {
      if (variable in obs) {
        const value = obs[variable];
        const type =
          value === null
            ? "null"
            : Array.isArray(value)
              ? "array"
              : typeof value;

        typeCounts[type] = (typeCounts[type] || 0) + 1;
      }
    });

    // Find the most common type
    let maxCount = 0;
    let dominantType = "unknown";

    for (const [type, count] of Object.entries(typeCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantType = type;
      }
    }

    return dominantType;
  }

  /**
   * Verifies that the variable exists in each observation in the data.
   *
   * @remarks Throws an error if the variable does not exist in each
   * observation. This is not meant to be called by users of the library, but
   * is used internally.
   * @internal
   *
   * @param variable - The variable to check for
   */
  verifyObservationsContainVariable(variable: string): void {
    if (!this._observations.every((observation) => variable in observation)) {
      throw new M2Error(
        `Variable ${variable} does not exist for each item (row) in the data array.`,
      );
    }
  }

  /**
   * Checks if the variable exists for at least one observation in the data.
   *
   * @remarks This is not meant to be called by users of the library, but
   * is used internally.
   * @internal
   *
   * @param variable - The variable to check for
   * @returns true if the variable exists in at least one observation, false
   * otherwise
   */
  variableExists(variable: string): boolean {
    return this._observations.some((observation) => variable in observation);
  }

  /**
   * Checks if a value is a non-missing numeric value.
   *
   * @remarks A non-missing numeric value is a value that is a number and is
   * not NaN or infinite.
   *
   * @param value - The value to check
   * @returns true if the value is a non-missing numeric value, false otherwise
   */
  isNonMissingNumeric(value: DataValue): boolean {
    return typeof value === "number" && !isNaN(value) && isFinite(value);
  }

  /**
   * Checks if a value is a missing numeric value.
   *
   * @remarks A missing numeric value is a number that is NaN or infinite, or any
   * value that is null or undefined. Thus, a null or undefined value is
   * considered to be a missing numeric value.
   *
   * @param value - The value to check
   * @returns true if the value is a missing numeric value, false otherwise
   */
  isMissingNumeric(value: DataValue): boolean {
    return (
      (typeof value === "number" && (isNaN(value) || !isFinite(value))) ||
      value === null ||
      typeof value === "undefined"
    );
  }

  /**
   * Normalizes an object for stable comparison by sorting keys
   * @internal
   *
   * @remarks Normalizing is needed to handle situations where objects have the
   * same properties but in different orders because we are using
   * JSON.stringify() for comparison.
   */
  private normalizeForComparison(obj: Observation): Observation {
    // Handle non-objects
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    // Handle arrays: sort if primitive values, otherwise normalize each item
    if (Array.isArray(obj)) {
      return obj.map((item) => this.normalizeForComparison(item));
    }

    // For objects: create a new object with sorted keys
    return Object.keys(obj)
      .sort()
      .reduce((result: Observation, key) => {
        result[key] = this.normalizeForComparison(obj[key]);
        return result;
      }, {});
  }

  /**
   * Creates a deep copy of an object.
   * @internal
   *
   * @remarks We create a deep copy of the object, in our case an instance
   * of `DataCalc`, to ensure that we are working with a new object
   * without any references to the original object. This is important
   * to avoid unintended side effects when modifying an object.
   *
   * @param source - object to copy
   * @param map - map of objects that have already been copied
   * @returns a deep copy of the object
   */
  private deepCopy<T>(source: T, map = new WeakMap()): T {
    // Handle primitive values and null
    if (source === null || typeof source !== "object") {
      return source;
    }

    // Handle circular references
    if (map.has(source as object)) {
      return map.get(source as object);
    }

    // Create new instance of the same type
    const copy = Array.isArray(source)
      ? []
      : Object.create(Object.getPrototypeOf(source));

    // Add to map before recursing to handle circular references
    map.set(source as object, copy);

    // Copy all properties
    const keys = [
      ...Object.getOwnPropertyNames(source),
      ...Object.getOwnPropertySymbols(source),
    ];

    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(
        source,
        key as keyof T,
      );
      if (descriptor) {
        Object.defineProperty(copy, key, {
          ...descriptor,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          value: this.deepCopy((source as any)[key], map),
        });
      }
    }

    return copy;
  }

  /**
   * Checks if an observation has null or undefined values in any of the join columns.
   * @internal
   *
   * @param obs - The observation to check
   * @param keys - The join columns to check
   * @returns true if any join column has a null or undefined value
   */
  private hasNullJoinKeys(obs: Observation, keys: string[]): boolean {
    return keys.some((key) => obs[key] === null || obs[key] === undefined);
  }
}
