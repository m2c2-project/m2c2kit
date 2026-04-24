import { DataCalc } from "./DataCalc";
import { DataValue } from "./DataValue";
import { M2Error } from "./M2Error";

type OpRecord = { name: string; args: any[] };

// Registry for storing op records that include non-serializable values
// such as functions. Entries are referenced by id in the placeholder string
// returned from the `length` accessor so `DataCalc.summarize` can resolve
// and replay the original operations.
const CHAIN_REGISTRY = new Map<string, OpRecord[]>();
// Limit the registry size to avoid memory leaks. 10,000 entries should be
// plenty for typical browser-based assessment data analysis.
const MAX_CHAIN_REGISTRY_SIZE = 10000;
let CHAIN_COUNTER = 0;

export function getChainOps(id: string): OpRecord[] | undefined {
  return CHAIN_REGISTRY.get(id);
}

// Remove a registry entry when it is no longer needed to avoid memory growth.
export function clearChainOps(id: string): void {
  CHAIN_REGISTRY.delete(id);
}

/**
 * A chain function that can be used as a lazy value in `summarize()` and carries
 * a sequence of recorded operations to be applied to a DataCalc instance when invoked.
 */
export type ChainFn = {
  (dataCalc: DataCalc): DataValue | DataValue[] | undefined;
  ops: OpRecord[];
  // chainable method signatures (subset mirrored from DataCalc)
  arrange: (...variables: string[]) => ChainFn;
  slice: (start: number, end?: number) => ChainFn;
  pull: (variable: string) => ChainFn;
  filter: (predicate: (o: any) => boolean) => ChainFn;
  mutate: (mutations: any) => ChainFn;
  select: (...variables: string[]) => ChainFn;
  groupBy: (...groups: string[]) => ChainFn;
  ungroup: () => ChainFn;
  rename: (renames: { [k: string]: string }) => ChainFn;
  distinct: () => ChainFn;
};

function makeChainFn(): ChainFn {
  const fn = ((dataCalc?: DataCalc) => {
    if (!dataCalc) return undefined;

    // Replay ops sequentially on a DataCalc instance
    let current: any = dataCalc;
    for (const op of fn.ops) {
      const method = (current as any)[op.name];
      if (typeof method !== "function") {
        throw new M2Error(
          `chain: method ${op.name} does not exist on DataCalc`,
        );
      }

      const res = method.apply(current, op.args);
      // If result is a DataCalc, continue chaining
      if (res instanceof DataCalc) {
        current = res;
        continue;
      }

      // Terminal value (pull returns DataValue, etc.) — return it
      return res as DataValue | DataValue[] | undefined;
    }

    // If chain completed without a terminal value, return undefined
    return undefined;
  }) as ChainFn;

  fn.ops = [];

  const record = (name: string, args: any[]) => {
    fn.ops.push({ name, args });
    return fn;
  };

  fn.arrange = (...variables: string[]) => record("arrange", variables);
  fn.slice = (start: number, end?: number) => record("slice", [start, end]);
  fn.pull = (variable: string) => record("pull", [variable]);
  fn.filter = (predicate: (o: any) => boolean) => record("filter", [predicate]);
  fn.mutate = (mutations: any) => record("mutate", [mutations]);
  fn.select = (...variables: string[]) => record("select", variables);
  fn.groupBy = (...groups: string[]) => record("groupBy", groups);
  fn.ungroup = () => record("ungroup", []);
  fn.rename = (renames: { [k: string]: string }) => record("rename", [renames]);
  fn.distinct = () => record("distinct", []);

  // Provide a `length` terminal on the chain. Accessing `chain().length` will
  // return a lazy callback function that will be called with a DataCalc during
  // summarize() resolution. We define it as an own property to override the
  // default function `length` property so it can act as a lazy accessor.
  Object.defineProperty(fn, "length", {
    configurable: true,
    get: function () {
      // Instead of returning a function (which would make `filter(...).length`
      // a callable and cause `+` to stringify/concatenate functions when used
      // in expressions), return a stable placeholder string encoding the
      // recorded ops. When the summarize() implementation sees one or more of
      // these concatenated placeholders it will deserialize and evaluate them
      // on the current DataCalc (group-scoped or global) at summarize-time.
      try {
        const id = `c${++CHAIN_COUNTER}`;
        // Store a shallow copy of ops so later mutations to fn.ops don't mutate
        // the registered version.
        CHAIN_REGISTRY.set(
          id,
          (fn.ops || []).map((o) => ({ ...o })),
        );

        // Enforce maximum size of the registry to prevent memory leaks.
        // Since Map preserves insertion order, deleting the first key
        // will remove the oldest entry.
        if (CHAIN_REGISTRY.size > MAX_CHAIN_REGISTRY_SIZE) {
          const firstKey = CHAIN_REGISTRY.keys().next().value;
          if (firstKey) {
            CHAIN_REGISTRY.delete(firstKey);
          }
        }

        return `__CHAIN_EXPR__[${id}]`;
      } catch (err) {
        return undefined;
      }
    },
  });

  return fn;
}

// Exported below functions mirror DataCalc instance methods and return a chainable function
/**
 * Adds an `arrange` operation to the chain for use in `summarize()`.
 *
 * Sorts the observations based on one or more variables. Variables may be
 * prefixed with `-` for descending order.
 *
 * Mirrors the instance method {@link DataCalc.arrange()}
 *
 * @param variables Names of variables to sort by, prefixed with '-' for descending order
 * @returns A chain function with the arrange operation added
 * @example
 * arrange('a', '-b')
 */
export function arrange(...variables: string[]) {
  return makeChainFn().arrange(...variables);
}

/**
 * Adds a `slice` operation to the chain for use in `summarize()`.
 *
 * Subsets observations by index range.
 * The `start` index is inclusive and `end` is exclusive when provided.
 *
 * Mirrors the instance method {@link DataCalc.slice()}
 *
 * @param start Inclusive start index
 * @param end Optional exclusive end index
 * @returns A chain function with the slice operation added
 * @example
 * slice(0, 10)
 */
export function slice(start: number, end?: number) {
  return makeChainFn().slice(start, end);
}

/**
 * Adds a `pull(variable)` operation to the chain for use in `summarize()`.
 *
 * Extracts a single variable from the data. If the variable length is 1 a
 * scalar is returned, otherwise an array of values is returned.
 *
 * Mirrors the instance method {@link DataCalc.pull()}
 *
 * @param variable Name of the variable to pull
 * @returns A chain function with the pull operation added
 * @example
 * pull('response_time')
 */
export function pull(variable: string) {
  return makeChainFn().pull(variable);
}

/**
 * Adds a `filter(predicate)` operation to the chain for use in `summarize()`.
 *
 * Filters observations based on a predicate function.
 *
 * Mirrors the instance method {@link DataCalc.filter()}
 *
 * @param predicate A function that returns true for observations to keep
 * @returns A chain function with the filter operation added
 * @example
 * filter(obs => obs.correct)
 */
export function filter(predicate: (o: any) => boolean) {
  return makeChainFn().filter(predicate);
}

/**
 * Adds a `mutate(mutations)` operation to the chain for use in `summarize()`.
 *
 * Adds new variables to observations based on the provided mutation options.
 * `mutations` is an object where keys are the names of the new variables and
 * values are functions that take an observation and return the value for the
 * new variable.
 *
 * Mirrors the instance method {@link DataCalc.mutate()}
 *
 * @param mutations Object mapping new variable names to transform functions
 * @returns A chain function with the mutate operation added
 * @example
 * mutate({ doubledA: obs => obs.a * 2 })
 */
export function mutate(mutations: any) {
  return makeChainFn().mutate(mutations);
}

/**
 * Adds a `select(...variables)` operation to the chain for use in `summarize()`.
 *
 * Selects specific variables to keep in the dataset. Variables prefixed with
 * `-` will be excluded from the result.
 *
 * Mirrors the instance method {@link DataCalc.select()}
 *
 * @param variables Names of variables to select; prefix with '-' to exclude
 * @returns A chain function with the select operation added
 * @example
 * select('a', 'c')
 */
export function select(...variables: string[]) {
  return makeChainFn().select(...variables);
}

/**
 * Adds a `groupBy(...groups)` operation to the chain for use in `summarize()`.
 *
 * Groups observations by one or more variables. This is used with
 * `summarize()` to calculate summaries by group. Grouping variables must be
 * primitive values (string, number, boolean).
 *
 * Mirrors the instance method {@link DataCalc.groupBy()}
 *
 * @param groups Variable names to group by
 * @returns A chain function with the groupBy operation added
 * @example
 * groupBy('condition')
 */
export function groupBy(...groups: string[]) {
  return makeChainFn().groupBy(...groups);
}

/**
 * Adds an `ungroup()` operation to the chain for use in `summarize()`.
 *
 * Ungroups observations so subsequent operations are applied globally.
 *
 * Mirrors the instance method {@link DataCalc.ungroup()}
 *
 * @returns A chain function with the ungroup operation added
 */
export function ungroup() {
  return makeChainFn().ungroup();
}

/**
 * Adds a `rename(renames)` operation to the chain for use in `summarize()`.
 *
 * Renames variables in the observations. `renames` should be an object
 * mapping new variable names to old variable names.
 *
 * Mirrors the instance method {@link DataCalc.rename()}
 *
 * @param renames Object mapping new variable names to old variable names
 * @returns A chain function with the rename operation added
 * @example
 * rename({ x: 'a', z: 'c' })
 */
export function rename(renames: { [k: string]: string }) {
  return makeChainFn().rename(renames);
}

/**
 * Adds a `distinct()` operation to the chain for use in `summarize()`.
 *
 * Keeps only unique observations.
 *
 * Mirrors the instance method {@link DataCalc.distinct()}
 *
 * @returns A chain function with the distinct operation added
 */
export function distinct() {
  return makeChainFn().distinct();
}
