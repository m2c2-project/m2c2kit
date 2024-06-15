import { ActivityKeyValueData } from "@m2c2kit/core";

export interface IActivityResultsTable {
  document_uuid: string;
  // Store timestamp as unix epoch milliseconds because IndexedDB will index it
  // Likely more efficient to index a number than an ISO string?
  timestamp: number;
  activity_publish_uuid: string;
  data: ActivityKeyValueData;
}
