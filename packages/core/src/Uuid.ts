// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Uuid {
  static generate(): string {
    /**
     * Use try-catch, rather than check for the existence of crypto, e.g.,
     * typeof crypto && typeof crypto.randomUUID, because the latter will
     * always be true for our target build and the compiler will remove
     * the alternate paths. BUT, when we run automated tests in a container,
     * the crypto module may not be present.
     */
    try {
      return crypto.randomUUID();
    } catch {
      // polyfill if randomUUID() or getRandomValues() are not available

      let randomValue: () => number;
      try {
        randomValue = () => crypto.getRandomValues(new Uint8Array(1))[0];
      } catch {
        randomValue = () => Math.floor(Math.random() * 256);
      }

      /**
       * attribution: https://stackoverflow.com/a/2117523
       * license: https://creativecommons.org/licenses/by-sa/4.0/
       * modifications: to work with TypeScript and polyfill
       */
      return ((1e7).toString() + -1e3 + -4e3 + -8e3 + -1e11).replace(
        /[018]/g,
        (c) =>
          (Number(c) ^ (randomValue() & (15 >> (Number(c) / 4)))).toString(16),
      );
    }
  }

  /**
   * Tests if a string is a valid UUID.
   *
   * @remarks Will match UUID versions 1 through 8, plus the nil UUID.
   *
   * @param uuid - the string to test
   * @returns true if the string is a valid UUID
   */
  static isValid(uuid: string | undefined | null): boolean {
    if (!uuid) {
      return false;
    }
    if (uuid === "00000000-0000-0000-0000-000000000000") {
      return true;
    }
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      uuid,
    );
  }
}
