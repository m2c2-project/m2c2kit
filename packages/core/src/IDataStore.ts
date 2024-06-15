import { ActivityResultsEvent } from "./ActivityResultsEvent";

/**
 * An interface for persisting data.
 *
 * @remarks This interface saves activity results as well as saves and
 * retrieves arbitrary key-value items that activities can use.
 *
 * The underlying persistence provider of the store must
 * be previously set in the activity's `Session` before use. The
 * implementation of the store is not provided by the \@m2c2kit/core library.
 *
 * @example
 * ```
 * import { LocalDatabase } from "@m2c2kit/db";
 * ...
 * const db: IDataStore = new LocalDatabase();
 * session.dataStore = db;
 * session.initialize();
 * ```
 */
export interface IDataStore {
  /** Saves activity results in the data store. */
  saveActivityResults(ev: ActivityResultsEvent): Promise<string>;
  /** Sets the value of an item. The key will be saved to the store as provided;
   * if namespacing or other formatting is desired, it must be done before
   * calling this method. activityId can be used by the store for indexing. */
  setItem(
    key: string,
    value: string | number | boolean | object | undefined | null,
    activityPublishUuid: string,
  ): Promise<string>;
  /** Gets the value of an item by its key. */
  getItem<T extends string | number | boolean | object | undefined | null>(
    key: string,
  ): Promise<T>;
  /** Deletes an item by its key. */
  deleteItem(key: string): Promise<void>;
  /** Deletes all items. */
  clearItemsByActivityPublishUuid(activityPublishUuid: string): Promise<void>;
  /** Returns keys of all items. */
  itemsKeysByActivityPublishUuid(
    activityPublishUuid: string,
  ): Promise<string[]>;
  /** Determines if the key exists. */
  itemExists(key: string): Promise<boolean>;
}
