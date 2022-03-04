export interface DriverRequest {
  requestUuid: string;
  find: string;
  propertyName?: string;
  screenshot?: boolean;
}
