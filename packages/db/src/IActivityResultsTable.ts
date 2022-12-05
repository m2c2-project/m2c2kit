import { ActivityKeyValueData } from "@m2c2kit/core";

export interface IActivityResultsTable {
  id?: number;
  // Store timestamp as unix epoch milliseconds because IndexedDB will index it
  // Likely more efficient to index a number than an ISO string?
  timestamp: number;
  activity_id: string;
  data: ActivityKeyValueData;
}
