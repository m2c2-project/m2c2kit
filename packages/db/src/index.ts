import Dexie from "dexie";
import { ActivityResultsEvent } from "@m2c2kit/core";
import { IActivityResultsTable } from "./IActivityResultsTable";

export class LocalDatabase extends Dexie {
  // Declare implicit table properties.
  // (just to inform Typescript. Instantiated by Dexie in stores() method)
  // number = type of the primkey
  activityResults!: Dexie.Table<IActivityResultsTable, number>;

  constructor() {
    super("m2c2db");
    this.version(1).stores({
      // keep the below in sync with the IActivityResultsTable interface
      // and the db.version(1).stores() method in data.ts
      activityResults: "++id,timestamp,activity_id",
    });
  }

  saveActivityResults(ev: ActivityResultsEvent) {
    return this.activityResults.add({
      timestamp: Date.parse(ev.target.beginIso8601Timestamp),
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
}
