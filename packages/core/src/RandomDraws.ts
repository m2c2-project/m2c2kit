import { M2Error } from "./M2Error";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class RandomDraws {
  /** Number of milliseconds before a warning is logged if sampling takes too long. Tuneable for tests. */
  public static samplingWarnMs = 1000;
  /** Number of milliseconds before sampling times out. Tuneable for tests or legitimate edge use cases. */
  public static samplingTimeoutMs = 5000;
  /** Number of loop iterations between checks. Tuneable for tests. */
  public static samplingCheckInterval = 4096;

  private static randomFunction: () => number = Math.random;
  private static seededPRNG: (() => number) | null = null;

  /**
   * Sets the seed for the pseudo-random number generator (PRNG) and
   * instructs methods within `RandomDraws` to use a seeded PRNG
   * instead of the default `Math.random()`.
   *
   * @remarks The implementation of the seeded PRNG is based on David Bau's
   * `seedrandom` library at https://github.com/davidbau/seedrandom
   *
   * @param seed - The seed string to initialize the PRNG.
   */
  public static setSeed(seed: string) {
    this.seededPRNG = seedrandom(seed);
    this.randomFunction = this.seededPRNG;
  }

  /**
   * Instructs methods within `RandomDraws` to use the default
   * `Math.random()` from the runtime environment as the random number
   * function instead of a seeded PRNG.
   */
  public static useDefaultRandom() {
    this.randomFunction = Math.random;
  }

  /**
   * Instructs methods within `RandomDraws` to use the seeded
   * pseudo-random number generator (PRNG).
   *
   * @remarks This method will throw an error if `setSeed()` has not
   * been called first to initialize the seeded PRNG.
   */
  public static useSeededRandom() {
    if (this.seededPRNG === null) {
      throw new M2Error(
        "Cannot use seeded random function because no seed has been set. Call setSeed() first.",
      );
    }
    this.randomFunction = this.seededPRNG;
  }

  /**
   * Generates a random number in the range [0, 1) using the current
   * random function.
   *
   * @remarks This method will return a number from `Math.random()` in the
   * runtime environment, unless `setSeed()` has been called to initialize
   * a seeded PRNG.
   *
   * @returns A random number in the range [0, 1) using the current random function.
   */
  public static random() {
    return this.randomFunction();
  }

  /**
   * Draws a single random integer from a uniform distribution of integers in
   * the specified range.
   *
   * @param minimumInclusive - Lower bound of range
   * @param maximumInclusive - Upper bound of range
   * @returns A sampled integer
   */
  public static singleFromRange(
    minimumInclusive: number,
    maximumInclusive: number,
  ): number {
    if (
      !Number.isInteger(minimumInclusive) ||
      !Number.isInteger(maximumInclusive)
    ) {
      throw new M2Error("All inputs must be integers");
    }

    if (maximumInclusive < minimumInclusive) {
      throw new M2Error(
        `maximumInclusive (${maximumInclusive}) must be >= minimumInclusive (${minimumInclusive})`,
      );
    }

    const sampledNumber =
      Math.floor(
        this.randomFunction() * (maximumInclusive - minimumInclusive + 1),
      ) + minimumInclusive;
    return sampledNumber;
  }

  /**
   * @deprecated Use `singleFromRange()` instead.
   */
  public static SingleFromRange(
    minimumInclusive: number,
    maximumInclusive: number,
  ): number {
    return this.singleFromRange(minimumInclusive, maximumInclusive);
  }

  /**
   * Draws random integers, without replacement, from a uniform distribution
   * of integers in the specified range.
   *
   * @param n - Number of draws
   * @param minimumInclusive - Lower bound of range
   * @param maximumInclusive - Upper bound of range
   * @returns An array of integers
   */
  public static fromRangeWithoutReplacement(
    n: number,
    minimumInclusive: number,
    maximumInclusive: number,
  ): Array<number> {
    if (
      !Number.isInteger(n) ||
      !Number.isInteger(minimumInclusive) ||
      !Number.isInteger(maximumInclusive)
    ) {
      throw new M2Error("All inputs must be integers");
    }

    const rangeSize = maximumInclusive - minimumInclusive + 1;
    if (n > rangeSize) {
      throw new M2Error(
        `number of requested draws (n = ${n}) is greater than number of integers in range [${minimumInclusive}, ${maximumInclusive}]`,
      );
    }

    const selected = new Set<number>();

    for (let i = rangeSize - n; i < rangeSize; i++) {
      const t = RandomDraws.singleFromRange(
        minimumInclusive,
        minimumInclusive + i,
      );
      if (selected.has(t)) {
        selected.add(minimumInclusive + i);
      } else {
        selected.add(t);
      }
    }

    // Originally, the below was `return Array.from(selected)`. I changed to
    // the below because one of our execution environments (Qualtrics) is using
    // a library that pollutes the global namespace and adds a broken
    // implementation of `Array.from()` that does not work with Sets.
    return [...selected];
  }

  /**
   * @deprecated Use `fromRangeWithoutReplacement()` instead.
   */
  public static FromRangeWithoutReplacement(
    n: number,
    minimumInclusive: number,
    maximumInclusive: number,
  ): Array<number> {
    return this.fromRangeWithoutReplacement(
      n,
      minimumInclusive,
      maximumInclusive,
    );
  }

  /**
   * Draw random grid cell locations, without replacement, from a uniform
   * distribution of all grid cells. Grid cell locations are zero-based,
   * i.e., upper-left is (0,0).
   *
   * @param n - Number of draws
   * @param rows  - Number of rows in grid; must be at least 1
   * @param columns - Number of columns in grid; must be at least 1
   * @param predicate - Optional lambda function that takes a grid row number
   * and grid column number pair and returns a boolean to indicate if the pair
   * should be allowed. For example, if one wanted to constrain the random
   * grid location to be along the diagonal, the predicate would be:
   * (row, column) => row === column
   * @returns Array of grid cells. Each cell is object in form of:
   * &#123 row: number, column: number &#125;. Grid cell locations are zero-based
   */
  public static fromGridWithoutReplacement(
    n: number,
    rows: number,
    columns: number,
    predicate?: (row: number, column: number) => boolean,
  ): Array<{ row: number; column: number }> {
    const result = new Array<{ row: number; column: number }>();
    const maximumInclusive = rows * columns - 1;
    const draws = this.fromRangeWithoutReplacement(n, 0, maximumInclusive);

    // Start a timer and a lightweight throttled check and warn/throw if sampling is
    // taking a long time.
    const start = Date.now();
    let warned = false;
    let loopCounter = 0;

    let i = 0;
    let replacementCell: number;
    while (i < n) {
      const column = draws[i] % columns;
      const row = (draws[i] - column) / columns;
      if (predicate === undefined || predicate(row, column)) {
        result.push({ row, column });
        i++;
      } else {
        do {
          replacementCell = this.fromRangeWithoutReplacement(
            1,
            0,
            maximumInclusive,
          )[0];
        } while (draws.includes(replacementCell));
        draws[i] = replacementCell;
      }

      // check timer periodically to limit overhead; interval is tunable.
      if (++loopCounter % this.samplingCheckInterval === 0) {
        const elapsed = Date.now() - start;
        if (!warned && elapsed > this.samplingWarnMs) {
          console.warn(
            `RandomDraws.fromGridWithoutReplacement(): sampling exceeded ${this.samplingWarnMs} ms; predicate may be impossible or expensive.`,
          );
          warned = true;
        }
        if (elapsed > this.samplingTimeoutMs) {
          throw new M2Error(
            `RandomDraws.fromGridWithoutReplacement(): sampling exceeded timeout of ${this.samplingTimeoutMs} ms; predicate may be impossible or expensive.`,
          );
        }
      }
    }
    return result;
  }

  /**
   * @deprecated Use `fromGridWithoutReplacement()` instead.
   */
  public static FromGridWithoutReplacement(
    n: number,
    rows: number,
    columns: number,
    predicate?: (row: number, column: number) => boolean,
  ): Array<{ row: number; column: number }> {
    return this.fromGridWithoutReplacement(n, rows, columns, predicate);
  }
}

/**
 * The following code is adapted from David Bau's `seedrandom` library.
 * Changes include removal of unused features, conversion to TypeScript,
 * and formatting changes.
 */

/**
 * Copyright 2019 David Bau.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// The following constants are related to IEEE 754 limits.
const pool: number[] = [];
const width = 256; // each RC4 output is 0 <= x < 256
const chunks = 6; // at least six RC4 outputs for each double
const digits = 52; // there are 52 significant digits in a double
const startDenom = Math.pow(width, chunks);
const significance = Math.pow(2, digits);
const overflow = significance * 2;
const mask = width - 1;

/** The PRNG function type with extra methods attached */
type PRNG = (() => number) & {
  int32(): number;
  quick(): number;
  double(): number;
};

/**
 * Initializes a new pseudo-random number generator (PRNG).
 *
 * @param seed - The seed string to initialize the PRNG.
 * @returns A function that, when called, returns a pseudo-random number in [0, 1).
 */
function seedrandom(seed: string): PRNG {
  const key: number[] = [];

  mixKey(seed, key);

  // Use the seed to initialize an ARC4 generator.
  const arc4 = new ARC4(key);

  // This function returns a random double in [0, 1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value.
  const prng = ((): number => {
    let n = arc4.g(chunks); // Start with a numerator n < 2 ^ 48
    let d = startDenom; // and denominator d = 2 ^ 48.
    let x = 0; // and no 'extra last byte'.

    // Fill up all significant digits
    while (n < significance) {
      n = (n + x) * width;
      d *= width;
      x = arc4.g(1);
    }

    // Avoid rounding up
    while (n >= overflow) {
      n /= 2;
      d /= 2;
      x >>>= 1;
    }
    return (n + x) / d; // Form the number within [0, 1).
  }) as PRNG;

  prng.int32 = () => arc4.g(4) | 0;
  prng.quick = () => arc4.g(4) / 0x100000000;
  prng.double = prng;

  // Mix the randomness into accumulated entropy.
  mixKey(tostring(arc4.S), pool);

  return prng;
}

/**
 * ARC4
 *
 * An ARC4 implementation.  The constructor takes a key in the form of
 * an array of at most (width) integers that should be 0 <= x < (width).
 *
 * The g(count) method returns a pseudorandom integer that concatenates
 * the next (count) outputs from ARC4.  Its return value is a number x
 * that is in the range 0 <= x < (width ^ count).
 */
class ARC4 {
  public i = 0;
  public j = 0;
  public S: number[] = [];

  constructor(key: number[]) {
    let t: number;
    let keylen = key.length;
    const s = this.S;

    // The empty key [] is treated as [0].
    if (!keylen) key = [keylen++];

    // Set up S using the standard key scheduling algorithm.
    for (let i = 0; i < width; i++) s[i] = i;
    for (let i = 0, j = 0; i < width; i++) {
      t = s[i];
      j = mask & (j + key[i % keylen] + t);
      s[i] = s[j];
      s[j] = t;
    }

    // RC4-drop[256]
    this.g(width);
  }

  /** Returns the next `count` outputs concatenated as a single number. */
  g(count: number): number {
    let r = 0;
    let i = this.i;
    let j = this.j;
    const s = this.S;

    while (count--) {
      const t = s[(i = mask & (i + 1))];
      const u = s[(j = mask & (j + t))];
      s[i] = u;
      s[j] = t;
      r = r * width + s[mask & (u + t)];
    }

    this.i = i;
    this.j = j;
    return r;
  }
}

/**
 * Mixes a string seed into a key that is an array of integers, and
 * returns a shortened string seed that is equivalent to the result key.
 *
 * @param seed - The seed string
 * @param key - The key array to be mixed into
 * @returns The mixed seed string
 */
function mixKey(seed: string, key: number[]): string {
  let hash = 0;
  let j = 0;
  while (j < seed.length) {
    // Mix the character code into the key using bitwise operations.
    key[mask & j] = mask & ((hash ^= key[mask & j] * 19) + seed.charCodeAt(j));
    j++;
  }
  return tostring(key);
}

/**
 * Converts an array of char codes to a string.
 *
 * @param a - An array-like object containing character codes
 * @returns The corresponding string
 */
function tostring(a: ArrayLike<number>): string {
  // Convert typed arrays to a plain array for `apply`.
  const arr: number[] = Array.prototype.slice.call(a, 0);
  return String.fromCharCode.apply(null, arr as unknown as number[]);
}
