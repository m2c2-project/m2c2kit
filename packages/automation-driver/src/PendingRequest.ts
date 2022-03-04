import { DriverRequest } from "./DriverRequest";

export interface PendingRequest {
  request: DriverRequest;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolvePromise?: (value: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rejectPromise?: (reason?: any) => void;
}
