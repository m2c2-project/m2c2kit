/**
 * Key-value pairs where the key is the name of the new variable, and the value
 * is a function that mutates the data.
 */
export interface Mutations {
  /**
   * We use "any" here because we do not know the type of the value of the
   * key-value pair.
   */
  [newVariable: string]: (observation: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }) => string | number | boolean | object | undefined | null;
}
