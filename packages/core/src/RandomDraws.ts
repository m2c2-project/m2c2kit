export class RandomDraws {
  /**
   * Draws a single random integer from a uniform distribution of integers in
   * the specified range.
   *
   * @param minimumInclusive - Lower bound of range
   * @param maximumInclusive - Upper bound of range
   * @returns A sampled integer
   */
  public static SingleFromRange(
    minimumInclusive: number,
    maximumInclusive: number,
  ): number {
    const sampledNumber =
      Math.floor(Math.random() * (maximumInclusive - minimumInclusive + 1)) +
      minimumInclusive;
    return sampledNumber;
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
  public static FromRangeWithoutReplacement(
    n: number,
    minimumInclusive: number,
    maximumInclusive: number,
  ): Array<number> {
    if (n > maximumInclusive - minimumInclusive + 1) {
      throw new Error(
        `number of requested draws (n = ${n}) is greater than number of integers in range [ ${minimumInclusive}, ${maximumInclusive}]`,
      );
    }
    const result = new Array<number>();
    for (let i = 0; i < n; i++) {
      const sampledNumber = RandomDraws.SingleFromRange(
        minimumInclusive,
        maximumInclusive,
      );
      result.includes(sampledNumber) ? n++ : result.push(sampledNumber);
    }
    return result;
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
  public static FromGridWithoutReplacement(
    n: number,
    rows: number,
    columns: number,
    predicate?: (row: number, column: number) => boolean,
  ): Array<{ row: number; column: number }> {
    const result = new Array<{ row: number; column: number }>();
    const maximumInclusive = rows * columns - 1;
    const draws = this.FromRangeWithoutReplacement(n, 0, maximumInclusive);

    // TODO: add some code to check if we're stuck in infinite loop, such as
    // when impossible predicate or more draws requested than is possible
    let i = 0;
    let replacementCell = NaN;
    while (i < n) {
      const column = draws[i] % columns;
      const row = (draws[i] - column) / columns;
      if (predicate === undefined || predicate(row, column)) {
        result.push({ row, column });
        i++;
      } else {
        do {
          replacementCell = this.FromRangeWithoutReplacement(
            1,
            0,
            maximumInclusive,
          )[0];
        } while (draws.includes(replacementCell));
        draws[i] = replacementCell;
      }
    }
    return result;
  }
}
