import Dexie from "dexie";
import { ActivityResultsEvent, IDataStore } from "@m2c2kit/core";
import { IActivityResultsTable } from "./IActivityResultsTable";
import { IKeyValueStoreTable } from "./IKeyValueStoreTable";

export class LocalDatabase extends Dexie implements IDataStore {
  // Declare implicit table properties.
  // (just to inform Typescript. Instantiated by Dexie in stores() method)
  // string = type of the primary key (document_uuid) in activity results table
  activityResults!: Dexie.Table<IActivityResultsTable, string>;
  // string = type of primary key (key) in key-value store table
  keyValueStore!: Dexie.Table<IKeyValueStoreTable, string>;

  constructor() {
    super("m2c2db");
    this.version(1).stores({
      // keep the below in sync with the IActivityResultsTable interface
      // and the db.version(1).stores() method in data.ts
      activityResults: "document_uuid,timestamp,activity_id",
      // keep the below in sync with the IKeyValueStoreTable interface
      keyValueStore: "key,timestamp,activity_id",
    });
  }

  saveActivityResults(ev: ActivityResultsEvent) {
    const document_uuid = ev.newData["document_uuid"];
    if (typeof document_uuid !== "string") {
      throw new Error(
        "ActivityResultsEvents.newData is missing the document_uuid property"
      );
    }
    return this.activityResults.add({
      document_uuid: document_uuid,
      timestamp: Date.parse(ev.iso8601Timestamp),
      activity_id: ev.target.id,
      data: ev.newData,
    });
  }

  getActivityResultsCount() {
    return this.activityResults.count();
  }

  getAllActivityResults() {
    return this.activityResults.toArray();
  }

  setItem(
    key: string,
    value: string | number | boolean | object | undefined | null,
    activityId: string
  ) {
    const tableValue: IKeyValueStoreTable = {
      timestamp: Date.parse(new Date().toISOString()),
      activity_id: activityId,
      key: key,
      value: value,
    };

    return this.keyValueStore.put(tableValue, key);
  }

  getItem<T>(key: string) {
    return this.keyValueStore.get(key).then((kv) => {
      return <T>kv?.value;
    });
  }

  deleteItem(key: string) {
    return this.keyValueStore.delete(key);
  }

  clearItemsByActivityId(activityId: string) {
    return this.keyValueStore
      .filter((kv) => kv.activity_id === activityId)
      .toArray()
      .then((items) =>
        this.keyValueStore.bulkDelete(items.map((item) => item.key))
      );
  }

  itemsKeysByActivityId(activityId: string) {
    return this.keyValueStore
      .filter((kv) => kv.activity_id === activityId)
      .toArray()
      .then((items) => items.map((item) => item.key));
  }

  itemExists(key: string) {
    return this.keyValueStore.get(key).then((kv) => kv !== undefined);
  }
}
