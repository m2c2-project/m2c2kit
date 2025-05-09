/** Data from session are stored as key (string) value pairs. */
export interface SessionKeyValueData {
  [key: string]: string | number | boolean | object | undefined | null;
}

export interface SessionData {
  /** All the data of the specified data type created thus far by the activity. */
  data: SessionKeyValueData;
  /** Type of data. */
  dataType: "Diagnostics";
}
