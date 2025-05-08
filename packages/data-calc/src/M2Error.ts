/**
 * Custom error class for m2c2kit errors.
 *
 * @remarks This is the same class as in the m2c2kit core package. This simple
 * code is copied from that package to avoid taking a dependency on it.
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
