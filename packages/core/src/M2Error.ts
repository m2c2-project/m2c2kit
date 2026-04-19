/**
 * Custom error class for m2c2kit errors.
 */
export class M2Error extends Error {
  /**
   * The underlying cause of the error.
   */
  public cause?: unknown;

  /**
   * @param message - The error message.
   * @param options - Optional object containing an error 'cause' for error chaining.
   */
  constructor(message?: string, options?: { cause?: unknown }) {
    // Only pass message to super to maintain compatibility with ES2017 TS definitions
    super(message);

    // Manually assign cause to support error chaining in all environments
    if (options && "cause" in options) {
      this.cause = options.cause;
    }

    this.name = "M2Error";

    // Using new.target.prototype ensures that if someone extends M2Error,
    // the prototype chain is correctly set to the child class.
    if (new.target) {
      Object.setPrototypeOf(this, new.target.prototype);
    }

    // captureStackTrace is a V8-specific method (Node/Chrome)
    if (
      "captureStackTrace" in Error &&
      typeof Error.captureStackTrace === "function"
    ) {
      Error.captureStackTrace(this, new.target);
    } else {
      // For non-V8 engines (Safari/Firefox), super() usually creates the stack.
      // If missing (rare edge cases), manually grab a stack from a dummy Error.
      if (!this.stack) {
        this.stack = new Error(message).stack;
      }
    }
  }

  /**
   * Structured JSON representation for logging, telemetry, and transport.
   */
  toJSON(): Record<string, unknown> {
    const json: Record<string, unknown> = {
      name: this.name,
      message: this.message,
      stack: this.stack,
    };

    if (this.cause !== undefined) {
      if (this.cause instanceof Error) {
        // If the cause has its own toJSON, use it. Safely typecast to check.
        const causeWithToJSON = this.cause as Error & {
          toJSON?: () => unknown;
        };

        if (typeof causeWithToJSON.toJSON === "function") {
          json.cause = causeWithToJSON.toJSON();
        } else {
          // Manually serialize standard Errors so they don't become {}
          const serialized: Record<string, unknown> = {
            name: this.cause.name,
            message: this.cause.message,
            stack: this.cause.stack,
          };

          // Include own enumerable custom properties only (no prototype pollution)
          const causeRecord = this.cause as unknown as Record<string, unknown>;
          for (const key of Object.keys(causeRecord)) {
            if (!(key in serialized)) {
              serialized[key] = causeRecord[key];
            }
          }

          json.cause = serialized;
        }
      } else {
        json.cause = this.cause;
      }
    }

    // Include own enumerable properties on this error (custom fields)
    const thisRecord = this as unknown as Record<string, unknown>;
    for (const key of Object.keys(thisRecord)) {
      if (!(key in json)) {
        json[key] = thisRecord[key];
      }
    }

    return json;
  }
}
