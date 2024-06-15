export interface IKeyValueStoreTable {
  // Store timestamp as unix epoch milliseconds because IndexedDB will index it
  // Likely more efficient to index a number than an ISO string?
  timestamp: number;
  activity_publish_uuid: string;
  key: string;
  value: string | number | boolean | object | undefined | null;
}
