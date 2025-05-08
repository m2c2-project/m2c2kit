/**
 * Custom error class for m2c2kit errors.
 */
export class M2Error extends Error {
  constructor(...params: string[]) {
    super(...params);
    this.name = "M2Error";
    // Set the prototype explicitly to ensure prototype chain is correct.
    Object.setPrototypeOf(this, M2Error.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, M2Error);
    }
  }
}
