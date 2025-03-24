/**
 * A set of key-value pairs conceptually similar to a row in
 * a dataset, where the keys are the variable names and the values are the
 * variable values.
 *
 * @remarks Originally, the types of the values were:
 * `string | number | boolean | object | undefined | null`,
 * but this caused type warnings in the use of filter functions, which would
 * be annoying for users of the library.
 */
export type Observation = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};
