import { EntityType } from "@m2c2kit/core";

export interface AppResponse {
  requestUuid: string;
  entityType?: EntityType;
  propertyValue?: string;
  imageAsBase64String?: string;
  error?: AppResponseError;
}

export interface AppResponseError {
  code: AppResponseErrorCode;
  reason: string;
}

export enum AppResponseErrorCode {
  INVALID_REQUEST = 1,
  ENTITY_NOT_FOUND = 2,
  PROPERTY_NOT_FOUND = 3,
  INVALID_QUERY = 4,
  NO_ACTIVE_SCENE = 5,
  COULD_NOT_TAKE_SCREEENSHOT = 6,
}
