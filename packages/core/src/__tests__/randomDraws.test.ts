/* eslint-disable @typescript-eslint/ban-ts-comment */
import { RandomDraws } from "..";

describe("test SingleFromRange", () => {
  it("draw is an integer from the range (1000 iterations)", () => {
    const iterations = 1000;
    const minInclusive = 0;
    const maxInclusive = 5;
    const draws = new Array<number>();
    for (let i = 0; i < iterations; i++) {
      const value = RandomDraws.SingleFromRange(minInclusive, maxInclusive);
      draws.push(value);
    }
    expect(
      draws.every(
        (v) => Math.round(v) === v && v >= minInclusive && v <= maxInclusive
      )
    ).toBeTruthy();
  });

  it("draws all numbers within the range at least once (1000 iterations)", () => {
    const iterations = 1000;
    const minInclusive = 0;
    const maxInclusive = 5;
    const draws = new Array<number>();
    for (let i = 0; i < iterations; i++) {
      const value = RandomDraws.SingleFromRange(minInclusive, maxInclusive);
      draws.push(value);
    }
    const numberWasDrawn = new Array<boolean>();
    for (let i = 0; i <= maxInclusive; i++) {
      numberWasDrawn[i] = false;
    }

    draws.forEach((d) => {
      numberWasDrawn[d] = true;
    });
    expect(numberWasDrawn.every((n) => n)).toBeTruthy();
  });

  it("draws are from a uniform distribution (10000 iterations)", () => {
    const iterations = 10000;
    const minInclusive = 0;
    const maxInclusive = 5;
    const draws = new Array<number>();
    for (let i = 0; i < iterations; i++) {
      const value = RandomDraws.SingleFromRange(minInclusive, maxInclusive);
      draws.push(value);
    }
    const average = draws.reduce((a, b) => a + b) / draws.length;

    /**
     * for a uniform distribution with range [0,5],
     * true mean is 2.5
     * true standard deviation is sqrt((5-0)^2 / 12) = 1.443376
     * with 10,000 draws, how likely is it we would observe a
     * mean more than .1 off the true mean?
     * z-score = (.1) / (1.443376 / (sqrt(10000))) = 6.9
     * p-value is 5.200285e-12
     * highly unlikely (less than 1 in a billion),
     * so OK to use this in our test
     */
    expect(Math.abs(average - 2.5)).toBeLessThan(0.1);
  });
});

describe("test FromRangeWithoutReplacement", () => {
  it.each([[0], [1], [2], [3], [4], [5], [6]])(
    "returns an array with expected number of draws",
    (n) => {
      const minInclusive = 0;
      const maxInclusive = 5;
      const draws = RandomDraws.FromRangeWithoutReplacement(
        n,
        minInclusive,
        maxInclusive
      );
      expect(draws.length).toEqual(n);
    }
  );

  it("chooses random numbers without replacement (100 iterations)", () => {
    const iterations = 100;
    const minInclusive = 0;
    const maxInclusive = 5;
    const n = 4;

    const uniqueNumbers = new Array<number>();
    for (let i = 0; i < iterations; i++) {
      const d = RandomDraws.FromRangeWithoutReplacement(
        n,
        minInclusive,
        maxInclusive
      );
      uniqueNumbers.push(new Set(d).size);
    }

    expect(uniqueNumbers.every((u) => u === n)).toBeTruthy();
  });

  it("throws error if number of requested draws is greater than integers available within range", () => {
    const minInclusive = 0;
    const maxInclusive = 5;

    const d = () =>
      RandomDraws.FromRangeWithoutReplacement(
        maxInclusive + 2,
        minInclusive,
        maxInclusive
      );

    expect(d).toThrow(Error);
  });
});

describe("test FromGridWithoutReplacement", () => {
  it.each([[0], [1], [2], [3], [4], [5], [6], [7], [8], [20]])(
    "returns an array with expected number of grid draws",
    (n) => {
      const rows = 4;
      const columns = 5;
      const draws = RandomDraws.FromGridWithoutReplacement(n, rows, columns);
      expect(draws.length).toEqual(n);
    }
  );

  it("draws all grid cells within the range at least once (10000 iterations)", () => {
    const iterations = 10000;
    const rows = 4;
    const columns = 5;

    const draws = new Array<Array<{ row: number; column: number }>>();

    for (let i = 0; i < iterations; i++) {
      const cells = RandomDraws.FromGridWithoutReplacement(1, rows, columns);
      draws.push(cells);
    }

    const cellWasDrawn = new Array<Array<boolean>>(rows);
    for (let i = 0; i < rows; i++) {
      cellWasDrawn[i] = new Array<boolean>(columns);
      for (let j = 0; j < columns; j++) {
        cellWasDrawn[i][j] = false;
      }
    }

    draws.forEach((d) =>
      d.forEach((c) => {
        cellWasDrawn[c.row][c.column] = true;
      })
    );

    expect(cellWasDrawn.flat().every((c) => c)).toBeTruthy();
  });
});
