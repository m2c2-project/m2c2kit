import { DataCalc } from "./DataCalc";
import { getChainOps } from "./ChainBuilder";
import { SummarizeOptions } from "./SummarizeOptions";
import { DataValue } from "./DataValue";
import { SummarizeFunction, LazyValue } from "./SummarizeFunction";

type Operator = "+" | "-" | "*" | "/" | "^";

type Operand = number | SummarizeOperation;

type Token = { t: "operand"; v: Operand } | { t: "op"; v: Operator };

const PRECEDENCE: Record<Operator, number> = {
  "+": 1,
  "-": 1,
  "*": 2,
  "/": 2,
  "^": 3,
};

/**
 * `SummarizeOperation` is a builder for summary expressions.
 *
 * It stores a token stream of operands and operators. Operands can be:
 * - a numeric literal
 * - another `SummarizeOperation` (including leaf reducers like `mean()` or `sum()`)
 *
 * The instance exposes arithmetic methods (`add`, `sub`, `mul`, `div`, `pow`)
 * which append operator + operand tokens and return a new `SummarizeOperation`.
 *
 * When `DataCalc.summarize()` calls the `.summarizeFunction(dc, params, opts)`,
 * the token stream is evaluated with correct operator precedence.
 *
 * A leaf reducer should create a `SummarizeOperation` with a `leafFn`; the token
 * stream for a leaf starts as a single operand referencing the leaf itself.
 */
export class SummarizeOperation {
  // Leaf reducer function (for mean/sum/etc). If present this is evaluated
  // when the operation is reduced to a leaf.
  private leafFn?: SummarizeFunction;

  // optional parameters/options attached to the leaf reducer. Parameters may
  // include `LazyValue` callbacks which are evaluated at summarize-time.
  public parameters?: Array<DataValue | LazyValue> | undefined;
  public options?: SummarizeOptions;

  // token stream representing expression: operand (op operand)*
  private tokens: Token[];

  // Expose summarizeFunction property so DataCalc.summarize detects it.
  // It delegates to evaluate(dc).
  public summarizeFunction: SummarizeFunction;

  constructor(
    leafFn?: SummarizeFunction,
    parameters?: DataValue[] | undefined,
    options?: SummarizeOptions,
    tokens?: Token[],
  ) {
    this.leafFn = leafFn;
    this.parameters = parameters;
    this.options = options;

    if (tokens && tokens.length > 0) {
      // expression builder created externally
      this.tokens = tokens.slice();
    } else if (leafFn) {
      // leaf: start token stream with a single operand referencing this (so
      // when evaluating the operand and it is this leaf, we call leafFn)
      this.tokens = [{ t: "operand", v: this }];
    } else {
      // empty expression (shouldn't normally happen)
      this.tokens = [];
    }

    this.summarizeFunction = (dc: DataCalc) => {
      return this.evaluateAsValue(dc);
    };
  }

  // Factory for creating a leaf SummarizeOperation (use in helpers)
  static leaf(
    leafFn: SummarizeFunction,
    parameters?: DataValue[] | undefined,
    options?: SummarizeOptions,
  ) {
    return new SummarizeOperation(leafFn, parameters, options);
  }

  // clone with new token stream (immutable-ish)
  private cloneWithTokens(newTokens: Token[]) {
    return new SummarizeOperation(undefined, undefined, undefined, newTokens);
  }

  // append operator + operand (operand can be number or SummarizeOperation)
  private appendOp(op: Operator, operand: number | SummarizeOperation) {
    const newTokens = this.tokens.slice();
    newTokens.push({ t: "op", v: op });
    newTokens.push({ t: "operand", v: operand });
    return this.cloneWithTokens(newTokens);
  }

  /**
   * Append addition to this expression.
   *
   * @param x - A numeric literal or another `SummarizeOperation` to add to this expression
   * @returns A new `SummarizeOperation` representing `(this + x)`
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
   *     result: mean("a").add(10),
   *   }).observations
   * );
   * // [ { result: 13.33333 } ]
   * ```
   */
  add(x: number | SummarizeOperation) {
    return this.appendOp("+", x as number | SummarizeOperation);
  }

  /**
   * Append subtraction to this expression.
   *
   * @param x - A numeric literal or another `SummarizeOperation` to subtract from this expression
   * @returns A new `SummarizeOperation` representing `(this - x)`
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
   *     result: mean("a").sub(10),
   *   }).observations
   * );
   * // [ { result: -6.6667 } ]
   * ```
   */
  sub(x: number | SummarizeOperation) {
    return this.appendOp("-", x as number | SummarizeOperation);
  }

  /**
   * Append multiplication to this expression. Multiplication has higher
   * precedence than addition/subtraction.
   *
   * @param x - A numeric literal or another `SummarizeOperation` to multiply with this expression
   * @returns A new `SummarizeOperation` representing `(this * x)`
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
   *     result: mean("a").mul(10),
   *   }).observations
   * );
   * // [ { result: 33.3333 } ]
   * ```
   */
  mul(x: number | SummarizeOperation) {
    return this.appendOp("*", x as number | SummarizeOperation);
  }

  /**
   * Append division to this expression.
   *
   * @param x - A numeric literal or another `SummarizeOperation` to divide this expression by
   * @returns A new `SummarizeOperation` representing `(this / x)`
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
   *     result: mean("a").div(10),
   *   }).observations
   * );
   * // [ { result: .3333 } ]
   * ```
   */
  div(x: number | SummarizeOperation) {
    return this.appendOp("/", x as number | SummarizeOperation);
  }

  /**
   * Append exponentiation (power) to this expression.
   *
   * Note: exponentiation uses right-associative semantics (a ^ b ^ c -> a ^ (b ^ c)).
   *
   * @param x - A numeric literal or another `SummarizeOperation` used as the exponent
   * @returns A new `SummarizeOperation` representing `(this ^ x)`
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
   *     result: mean("a").pow(2),
   *   }).observations
   * );
   * // [ { result: 11.1111 } ]
   * ```
   */
  pow(x: number | SummarizeOperation) {
    return this.appendOp("^", x as number | SummarizeOperation);
  }

  // Evaluate an operand token to a number (returns NaN for non-numeric)
  private evaluateOperandToNumber(opd: any, dc: DataCalc): number {
    // Handle numeric literal
    if (typeof opd === "number") return opd;

    // Handle chain placeholder strings like __CHAIN_EXPR__[id]
    if (typeof opd === "string") {
      const re = /^__CHAIN_EXPR__\[(.*?)\]$/;
      const m = re.exec(opd);
      if (m) {
        const payload = m[1];
        // Try to resolve via registry first
        let ops: any[] | undefined = getChainOps(payload as string);
        if (!ops) {
          // Fallback to legacy encoded JSON payloads
          try {
            ops = JSON.parse(decodeURIComponent(payload));
          } catch {
            ops = undefined;
          }
        }
        if (!ops) return NaN;

        let current: any = dc;
        let evaluated: number | undefined = undefined;
        for (const op of ops) {
          const method = (current as any)[op.name];
          if (typeof method !== "function") return NaN;
          const res = method.apply(current, op.args);
          if (res instanceof DataCalc) {
            current = res;
            continue;
          }
          if (Array.isArray(res)) {
            evaluated = res.length;
            break;
          }
          // If the terminal result is a boolean, consult coerceBooleans
          // from this operation's options (default true) to decide whether
          // to coerce to 1/0 or treat as missing (NaN).
          if (typeof res === "boolean") {
            const coerce =
              this.options && typeof this.options.coerceBooleans === "boolean"
                ? this.options.coerceBooleans
                : true;
            if (coerce) {
              evaluated = res ? 1 : 0;
              break;
            } else {
              return NaN;
            }
          }

          evaluated = typeof res === "number" ? res : Number(res);
          break;
        }
        if (evaluated === undefined)
          evaluated = current instanceof DataCalc ? current.length : NaN;
        return typeof evaluated === "number" && !isNaN(evaluated)
          ? evaluated
          : NaN;
      }
    }
    // opd is SummarizeOperation: if it has a leafFn and only a leaf token referencing itself,
    // calling its leafFn will compute the reducer for the current group (dc)
    const params = Array.isArray(opd.parameters)
      ? opd.parameters
      : opd.parameters === undefined
        ? undefined
        : [opd.parameters];
    const raw = opd.leafFn
      ? opd.leafFn(dc, params, opd.options)
      : opd.evaluateAsValue(dc);
    // If the reducer returned null/undefined, treat as missing (do not coerce to 0)
    if (raw === null || raw === undefined) return NaN;
    const num = Number(raw);
    return typeof num === "number" && !isNaN(num) ? num : NaN;
  }

  // Evaluate a flat token stream (no nested handling required here; nested SummarizeOperation
  // operands will evaluate themselves recursively)
  private evaluateFlatTokens(tokens: Token[], dc: DataCalc): number {
    // Build operands[] and ops[] arrays
    const operands: Operand[] = [];
    const ops: Operator[] = [];

    for (const tk of tokens) {
      if (tk.t === "operand") operands.push(tk.v);
      else ops.push(tk.v);
    }

    if (operands.length === 0) return NaN;

    // reduce by precedence: find highest precedence op and reduce it, repeat
    while (ops.length > 0) {
      let bestIdx = 0;
      let bestPrec = PRECEDENCE[ops[0]] ?? 0;
      for (let i = 1; i < ops.length; i++) {
        const p = PRECEDENCE[ops[i]] ?? 0;
        // right-associative for ^ (power)
        if (p > bestPrec || (p === bestPrec && ops[i] === "^")) {
          bestPrec = p;
          bestIdx = i;
        }
      }

      const op = ops.splice(bestIdx, 1)[0];
      // operands at bestIdx and bestIdx+1
      const left = operands.splice(bestIdx, 1)[0] as Operand;
      const right = operands.splice(bestIdx, 1)[0] as Operand;

      const a = this.evaluateOperandToNumber(left, dc);
      const b = this.evaluateOperandToNumber(right, dc);

      let res = NaN;
      if (op === "+") res = a + b;
      else if (op === "-") res = a - b;
      else if (op === "*") res = a * b;
      else if (op === "/") res = b === 0 ? NaN : a / b;
      else if (op === "^") res = Math.pow(a, b);

      operands.splice(bestIdx, 0, res);
    }

    const final = operands[0];
    if (typeof final === "number") {
      return final;
    }
    // If it's still a SummarizeOperation (unlikely), evaluate it
    const res = this.evaluateOperandToNumber(final as Operand, dc);
    return res;
  }

  /**
   * Instance helper: return a grouped version of this operation so it becomes
   * a single operand in outer expressions. Equivalent to parens(this).
   */
  parens(): SummarizeOperation {
    return parens(this);
  }

  // Top-level evaluation: handles the case where this instance is a leaf (leafFn present)
  // or an expression token stream.
  private evaluateAsValue(dc: DataCalc): DataValue {
    // If this is a leaf reducer (leafFn present) and tokens is the single self-operand,
    // call the leafFn. Otherwise evaluate the token stream with precedence.
    if (this.leafFn) {
      // leaf reducer
      const params = Array.isArray(this.parameters)
        ? this.parameters
        : this.parameters === undefined
          ? undefined
          : [this.parameters];
      const res = this.leafFn(dc, params, this.options);
      // Normalize numeric NaN to null for consistency with other reducers
      if (typeof res === "number" && Number.isNaN(res)) return null;
      return res;
    }

    // Non-leaf expression: evaluate tokens. Nested SummarizeOperation operands are evaluated recursively.
    if (!this.tokens || this.tokens.length === 0) return NaN;
    const val = this.evaluateFlatTokens(this.tokens, dc);
    // Convert NaN to null so summarize outputs don't contain NaN
    if (typeof val === "number" && Number.isNaN(val)) return null;
    return val;
  }
}

/**
 * Wraps an existing `SummarizeOperation` as a single grouped operand.
 *
 * @remarks Permits explicit parentheses in complex expressions.
 *
 * @param op - The `SummarizeOperation` to wrap
 * @returns A new `SummarizeOperation` with the wrapped operand
 *
 * @example
 * ```js
 * const d = [
 *   { a: 1 },
 *   { a: 0 },
 *   { a: 9 },
 * ];
 * const dc = new DataCalc(d);
 * console.log(
 *   dc.summarize({
 * // (mean a + min a) * 10
 *     val: parens(mean("a").add(min("a"))).mul(10),
 *   }).observations
 * );
 * // [ { val: 33.33333333333333 } ]
 * ```
 */
export function parens(op: SummarizeOperation): SummarizeOperation {
  // Create a new SummarizeOperation whose token stream is a single operand referencing the provided op.
  // This forces the inner expression to be treated as a single operand in surrounding expressions.
  const tokens: Token[] = [{ t: "operand", v: op }];
  return new SummarizeOperation(undefined, undefined, undefined, tokens);
}
