/**
 * A class for for working with numeric values that may be currently unknown,
 * but may be known in the future.
 *
 * @remarks Most m2c2kit actions have a known duration, such as waiting for a
 * given duration or moving a node to a specific position across a specific
 * duration: the duration is explicitly provided when the `Action` is created.
 * However, some actions have a duration that is not known when the `Action` is
 * created, but it will be known in the future. So far, the only action that
 * requires this is the `play` action. In the browser, a sound file cannot be
 * decoded by the `AudioContext` interface (which will calculate the duration)
 * until the user has interacted with the page, which could be after the
 * `Action` has been created. This is a problem because a `sequence` action
 * needs to know the duration of all its children in order to calculate its own
 * duration and when each of the child actions will start. To solve this
 * problem, the `Futurable` class is a simple implementation of the Composite
 * pattern that allows for the creation of a numeric value that may be known in
 * the future. If a value is not known at creation time, it is represented by
 * `Infinity`. The `Futurable` class supports addition and subtraction of
 * another `Futurable` and numbers. When the numeric value of a `Futurable` is
 * requested, it evaluates the expression and returns the numeric value. If any
 * of the terms in the expression is a `Futurable`, it will recursively
 * evaluate them. If any of the terms are unknown (represented by `Infinity`),
 * it will return `Infinity`. If a previous unknown value becomes known, any
 * other `Futurable` that depends on it will also become known.
 */
export class Futurable {
  /** The numbers, operators, and other Futurables that represent a value. */
  private expression = new Array<number | Futurable | Operator>();
  /** Log a warning to console if a expression is this length. */
  private readonly WARNING_EXPRESSION_LENGTH = 32;

  constructor(value?: Futurable | number) {
    if (typeof value === "number") {
      this.pushToExpression(value);
      return;
    }
    /**
     * If the value is undefined, it means we are creating a Futurable with
     * an unknown value. We push Infinity to the expression because it is
     * assumed that the unknown value is sometime in the future.
     */
    if (value === undefined) {
      this.pushToExpression(Infinity);
      return;
    }
    // The value is another Futurable.
    this.pushToExpression(value);
  }

  /**
   * Appends a number or another Futurable to this Futurable's expression.
   *
   * @remarks This method does a simple array push, but checks the length of
   * the expression array and warns if it gets "too long." This may indicate
   * a logic error, unintended recursion, etc. because our use cases will
   * likely not have expressions that are longer than
   * `Futural.WARNING_EXPRESSION_LENGTH` elements.
   *
   * @param value - value to add to the expression.
   */
  private pushToExpression(value: number | Futurable | Operator) {
    if (value === this) {
      throw new Error(
        "Cannot add, subtract, or assign a Futurable with itself.",
      );
    }
    this.expression.push(value);
    if (this.expression.length === this.WARNING_EXPRESSION_LENGTH) {
      console.warn(
        `Expression length is ${this.WARNING_EXPRESSION_LENGTH} elements. Something may be wrong.`,
      );
    }
  }

  /**
   * Assigns a value, either known or Futurable, to this Futurable.
   *
   * @remarks This method clears the current expression.
   *
   * @param value - value to assign to this Futurable.
   */
  assign(value: number | Futurable): void {
    while (this.expression.length > 0) {
      this.expression.pop();
    }
    this.pushToExpression(value);
  }

  /**
   * Performs addition on this Futurable.
   *
   * @remarks This method modifies the Futurable by adding the term(s) to the
   * Futurable's expression.
   *
   * @param terms - terms to add to this Futurable.
   * @returns the modified Futurable.
   */
  add(...terms: Array<Futurable | number>) {
    this.appendOperation(Operator.Add, ...terms);
    return this;
  }

  /**
   * Performs subtraction on this Futurable.
   *
   * @remarks This method modifies the Futurable by subtracting the term(s)
   * from the Futurable's expression.
   *
   * @param terms - terms to subtract from this Futurable.
   * @returns the modified Futurable.
   */
  subtract(...terms: Array<Futurable | number>) {
    this.appendOperation(Operator.Subtract, ...terms);
    return this;
  }

  /**
   * Adds an operation (an operator and term(s)) to the Futurable's
   * expression.
   *
   * @param operator - Add or Subtract.
   * @param terms - terms to add to the expression.
   */
  private appendOperation(
    operator: Operator,
    ...terms: Array<Futurable | number>
  ) {
    terms.forEach((term) => {
      this.pushToExpression(operator);
      this.pushToExpression(term);
    });
  }

  /**
   * Gets the numeric value of this Futurable.
   *
   * @remarks This method evaluates the expression of the Futurable and
   * returns the numeric value. If any of the terms in the expression are
   * Futurables, it will recursively evaluate them. If any of the terms are
   * unknown (represented by Infinity), it will return Infinity.
   *
   * @returns the numeric value of this Futurable.
   */
  get value(): number {
    let result = 0;
    const terms = this.expression.flat(Infinity);
    let sign = 1;
    for (let i = 0; i < terms.length; i++) {
      if (typeof terms[i] === "number") {
        result = result + sign * (terms[i] as unknown as number);
        continue;
      }
      if (terms[i] instanceof Futurable) {
        result = result + sign * (terms[i] as Futurable).value;
        continue;
      }
      if (terms[i] === Operator.Add) {
        sign = 1;
        continue;
      }
      if (terms[i] === Operator.Subtract) {
        sign = -1;
        continue;
      }
    }
    return result;
  }
}

/**
 * Supported Futurable operators.
 */
const Operator = {
  /** Futurable addition operator  */
  Add: "Add",
  /** Futurable subtraction operator  */
  Subtract: "Subtract",
};
type Operator = (typeof Operator)[keyof typeof Operator];
