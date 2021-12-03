import { Entity } from "./Entity";

export interface Constraints {
  topToTopOf?: Entity | string;
  topToBottomOf?: Entity | string;
  bottomToTopOf?: Entity | string;
  bottomToBottomOf?: Entity | string;
  startToStartOf?: Entity | string;
  startToEndOf?: Entity | string;
  endToEndOf?: Entity | string;
  endToStartOf?: Entity | string;
  horizontalBias?: number;
  verticalBias?: number;
  // the following allows access to properties using a string key
  [key: string]: Entity | string | number | undefined;
}
